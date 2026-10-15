import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const body = await req.json();
    const { ebookId, isFree } = body;

    if (!ebookId) {
      return new Response(
        JSON.stringify({ error: "Missing ebookId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: ebook, error: ebookError } = await adminClient
      .from("ebooks")
      .select("*")
      .eq("id", ebookId)
      .maybeSingle();

    if (ebookError || !ebook) {
      return new Response(
        JSON.stringify({ error: "E-book not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (ebook.status !== "published") {
      return new Response(
        JSON.stringify({ error: "E-book not available" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Free ebook: create purchase record and return download URL
    if (isFree || ebook.is_free || ebook.price_cents === 0) {
      const { error: purchaseError } = await adminClient
        .from("ebook_purchases")
        .insert({
          ebook_id: ebook.id,
          email: "",
          price_paid_cents: 0,
          status: "paid",
        });

      if (purchaseError) {
        console.error("Failed to create free purchase record:", purchaseError);
      }

      await adminClient
        .from("ebooks")
        .update({ download_count: (ebook.download_count || 0) + 1 })
        .eq("id", ebook.id);

      return new Response(
        JSON.stringify({ downloadUrl: ebook.file_url }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Paid ebook: create Stripe Checkout Session
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      return new Response(
        JSON.stringify({ error: "Payment system is not configured. Please contact support." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const origin = req.headers.get("origin") || "https://bliss.media";
    const successUrl = `${origin}/ebooks/${ebook.slug}?status=success`;
    const cancelUrl = `${origin}/ebooks/${ebook.slug}?status=cancelled`;

    const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        "mode": "payment",
        "payment_method_types[0]": "card",
        "line_items[0][price_data][currency]": "usd",
        "line_items[0][price_data][unit_amount]": String(ebook.price_cents),
        "line_items[0][price_data][product_data][name]": ebook.title,
        "line_items[0][quantity]": "1",
        "success_url": successUrl,
        "cancel_url": cancelUrl,
        "metadata[ebook_id]": ebook.id,
        "metadata[ebook_title]": ebook.title,
      }),
    });

    if (!stripeResponse.ok) {
      const errText = await stripeResponse.text();
      console.error("Stripe error:", errText);
      return new Response(
        JSON.stringify({ error: "Failed to create checkout session" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const session = await stripeResponse.json();

    await adminClient
      .from("ebook_purchases")
      .insert({
        ebook_id: ebook.id,
        email: session.customer_details?.email || "",
        price_paid_cents: ebook.price_cents,
        stripe_session_id: session.id,
        status: "pending",
      });

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Ebook checkout error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
