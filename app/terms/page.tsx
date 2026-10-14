import type { Metadata } from 'next';
import { SiteHeader } from '@/components/public/site-header';
import { SiteFooter } from '@/components/public/site-footer';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Terms of Use for Bliss Media.',
};

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <article className="container-article py-16">
        <div className="flex items-center gap-3 mb-6">
          <span className="h-px w-8 bg-gold" />
          <span className="category-label">Legal</span>
        </div>
        <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight">
          Terms of Use
        </h1>
        <p className="mt-4 text-sm text-muted-foreground font-sans">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="mt-8 article-body">
          <p>
            These Terms of Use govern your access to and use of the Bliss Media
            website and services. By using our site, you agree to these terms.
          </p>

          <h2>Use of Content</h2>
          <p>
            All content published on Bliss Media is protected by copyright. You
            may not reproduce, distribute, or otherwise use our content without
            prior written permission, except as permitted by fair use.
          </p>

          <h2>User-Generated Content</h2>
          <p>
            When you submit comments or other content to Bliss Media, you grant
            us a non-exclusive, royalty-free license to use, reproduce, and
            display that content on our site. You are responsible for ensuring
            that your submissions do not violate the rights of any third party.
          </p>
          <p>
            We reserve the right to remove or edit user-generated content at our
            discretion, including content that is defamatory, offensive,
            misleading, or otherwise inappropriate.
          </p>

          <h2>Account Responsibilities</h2>
          <p>
            If you create an account, you are responsible for maintaining the
            security of your account credentials and for all activities that
            occur under your account. You must be at least 13 years old to
            create an account.
          </p>

          <h2>Prohibited Conduct</h2>
          <ul>
            <li>Using the site for any unlawful purpose</li>
            <li>Submitting false or misleading information</li>
            <li>Harassing, abusing, or threatening other users</li>
            <li>Attempting to gain unauthorized access to our systems</li>
            <li>Using automated tools to scrape or copy our content</li>
          </ul>

          <h2>Disclaimer of Warranties</h2>
          <p>
            Bliss Media is provided "as is" without warranties of any kind. We
            do not guarantee the accuracy, completeness, or timeliness of
            information on our site.
          </p>

          <h2>Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, Bliss Media shall not be
            liable for any indirect, incidental, or consequential damages
            arising from your use of our site or services.
          </p>

          <h2>Changes to These Terms</h2>
          <p>
            We may update these Terms of Use from time to time. Continued use of
            our site after changes are posted constitutes acceptance of the
            updated terms.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about these terms? Visit our <a href="/contact">contact page</a>.
          </p>
        </div>
      </article>
      <SiteFooter />
    </>
  );
}
