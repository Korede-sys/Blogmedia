import type { Metadata } from 'next';
import { SiteHeader } from '@/components/public/site-header';
import { SiteFooter } from '@/components/public/site-footer';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Bliss Media.',
};

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <article className="container-article py-16">
        <div className="flex items-center gap-3 mb-6">
          <span className="h-px w-8 bg-gold" />
          <span className="category-label">Legal</span>
        </div>
        <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight">
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm text-muted-foreground font-sans">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="mt-8 article-body">
          <p>
            This Privacy Policy describes how Bliss Media collects, uses, and
            shares information about you when you use our website and services.
          </p>

          <h2>Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as when you
            create an account, subscribe to our newsletter, or submit a comment.
            This may include your name, email address, and any content you submit.
          </p>
          <p>
            We also collect information automatically when you visit our site,
            including your IP address, browser type, device information, and
            pages visited. This information is used for analytics and site
            improvement.
          </p>

          <h2>How We Use Information</h2>
          <ul>
            <li>To provide, maintain, and improve our services</li>
            <li>To send you our newsletter, if you subscribe</li>
            <li>To respond to your comments, questions, and inquiries</li>
            <li>To monitor and analyze trends, usage, and activities</li>
            <li>To detect, prevent, and address technical issues and fraud</li>
          </ul>

          <h2>Cookies</h2>
          <p>
            We use cookies and similar technologies to provide and improve our
            services. You can control cookies through your browser settings.
          </p>

          <h2>Third-Party Services</h2>
          <p>
            We use third-party services for analytics, email delivery, and
            content hosting. These providers may collect information governed by
            their own privacy policies.
          </p>

          <h2>Data Retention</h2>
          <p>
            We retain your information for as long as your account is active or
            as needed to provide our services. You may request deletion of your
            account and associated data at any time.
          </p>

          <h2>Your Rights</h2>
          <p>
            You have the right to access, correct, or delete your personal
            information. To exercise these rights, please contact us at the
            email address listed on our contact page.
          </p>

          <h2>Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify
            you of significant changes by posting the updated policy on this
            page.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us
            through our <a href="/contact">contact page</a>.
          </p>
        </div>
      </article>
      <SiteFooter />
    </>
  );
}
