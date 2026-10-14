import type { Metadata } from 'next';
import { SiteHeader } from '@/components/public/site-header';
import { SiteFooter } from '@/components/public/site-footer';
import { ContactForm } from '@/components/public/contact-form';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with the Bliss Media editorial team.',
};

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <section className="container-article py-16">
        <div className="flex items-center gap-3 mb-6">
          <span className="h-px w-8 bg-gold" />
          <span className="category-label">Contact</span>
        </div>
        <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight">
          Get in Touch
        </h1>
        <p className="mt-4 text-lg text-muted-foreground font-sans leading-relaxed max-w-2xl">
          Have a story tip, feedback, or partnership inquiry? We would love to
          hear from you. Use the form below or reach us at the email address
          listed here.
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-1 space-y-8">
            <div>
              <h3 className="font-sans text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2">
                Editorial
              </h3>
              <p className="font-sans text-sm text-foreground">
                editorial@blissmedia.example
              </p>
              <p className="font-sans text-xs text-muted-foreground mt-1">
                [Placeholder — replace with your editorial email]
              </p>
            </div>
            <div>
              <h3 className="font-sans text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2">
                General Inquiries
              </h3>
              <p className="font-sans text-sm text-foreground">
                hello@blissmedia.example
              </p>
              <p className="font-sans text-xs text-muted-foreground mt-1">
                [Placeholder — replace with your contact email]
              </p>
            </div>
            <div>
              <h3 className="font-sans text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2">
                Address
              </h3>
              <p className="font-sans text-sm text-foreground">
                [Street address placeholder]
                <br />
                [City, Country placeholder]
              </p>
            </div>
          </div>

          <div className="md:col-span-2">
            <ContactForm />
          </div>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
