// Bliss Media — Article seeding edge function
import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SeedArticleData {
  title: string;
  slug: string;
  excerpt: string;
  body: unknown[];
  cover_image: string;
  cover_alt: string;
  category_slug: string;
  tag_slugs: string[];
  featured: boolean;
  is_pinned: boolean;
  published_at: string;
  seo_title: string;
  meta_description: string;
  reading_time: number;
  view_count: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get the first admin user to assign as author
    const { data: adminProfile, error: adminError } = await adminClient
      .from("profiles")
      .select("id, full_name")
      .eq("role", "admin")
      .limit(1)
      .maybeSingle();

    if (adminError || !adminProfile) {
      return new Response(
        JSON.stringify({ error: "No admin user found. Please set up an administrator first." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if articles already exist
    const { data: existingArticles, error: checkError } = await adminClient
      .from("articles")
      .select("id")
      .limit(1);

    if (checkError) {
      return new Response(
        JSON.stringify({ error: "Failed to check existing articles" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (existingArticles && existingArticles.length > 0) {
      return new Response(
        JSON.stringify({ message: "Articles already exist. Skipping seed." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get categories and tags
    const { data: categories } = await adminClient.from("categories").select("*");
    const { data: tags } = await adminClient.from("tags").select("*");

    const categoryMap = new Map((categories || []).map((c) => [c.slug, c.id]));
    const tagMap = new Map((tags || []).map((t) => [t.slug, t.id]));

    // The seed articles are sent in the request body
    const body = await req.json();
    const articles: SeedArticleData[] = body.articles || [];

    if (articles.length === 0) {
      return new Response(
        JSON.stringify({ error: "No articles provided in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let insertedCount = 0;
    let skippedCount = 0;

    for (const article of articles) {
      const categoryId = categoryMap.get(article.category_slug);
      if (!categoryId) {
        console.warn(`Category not found: ${article.category_slug}`);
        skippedCount++;
        continue;
      }

      // Check if this slug already exists
      const { data: existing } = await adminClient
        .from("articles")
        .select("id")
        .eq("slug", article.slug)
        .maybeSingle();

      if (existing) {
        skippedCount++;
        continue;
      }

      const { data: inserted, error } = await adminClient
        .from("articles")
        .insert({
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          body: article.body,
          cover_image: article.cover_image,
          cover_alt: article.cover_alt,
          category_id: categoryId,
          author_id: adminProfile.id,
          status: "published",
          featured: article.featured,
          is_pinned: article.is_pinned,
          published_at: article.published_at,
          seo_title: article.seo_title,
          meta_description: article.meta_description,
          reading_time: article.reading_time,
          view_count: article.view_count,
        })
        .select("id")
        .single();

      if (error) {
        console.error(`Error inserting "${article.title}":`, error.message);
        skippedCount++;
        continue;
      }

      // Insert tag associations
      if (inserted && article.tag_slugs.length > 0) {
        const tagRows = article.tag_slugs
          .map((slug) => tagMap.get(slug))
          .filter(Boolean)
          .map((tagId) => ({
            article_id: inserted.id,
            tag_id: tagId,
          }));

        if (tagRows.length > 0) {
          await adminClient.from("article_tags").insert(tagRows);
        }
      }

      insertedCount++;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Seeded ${insertedCount} articles (${skippedCount} skipped)`,
        inserted: insertedCount,
        skipped: skippedCount,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
