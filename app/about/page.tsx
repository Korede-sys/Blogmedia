import type { Metadata } from 'next';
import { SiteHeader } from '@/components/public/site-header';
import { SiteFooter } from '@/components/public/site-footer';

export const metadata: Metadata = {
  title: 'About Bliss Media',
  description:
    'Bliss Media is a premium digital magazine publishing stories across technology, entertainment, lifestyle, business, and news.',
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <article className="container-article py-16">
        <div className="flex items-center gap-3 mb-6">
          <span className="h-px w-8 bg-gold" />
          <span className="category-label">About Us</span>
        </div>
        <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight">
          About Bliss Media
        </h1>

        <div className="mt-8 article-body">
          <p>
            Bliss Media is a premium digital magazine dedicated to publishing
            stories that matter. We cover technology, entertainment, lifestyle,
            business, and news — with an emphasis on depth, clarity, and
            editorial integrity.
          </p>

          <h2>Our Mission</h2>
          <p>
            We believe that in an age of infinite content, quality is the
            scarcest resource. Our mission is to publish stories that inform,
            provoke, and endure — pieces that are worth reading not just today,
            but months and years from now.
          </p>

          <h2>What We Cover</h2>
          <p>
            Our editorial scope spans five core categories: Technology,
            Entertainment, Lifestyle, Business, and News. Within each, we look
            for stories that go beyond the surface — that explain not just what
            happened, but why it matters and what comes next.
          </p>

          <h2>Our Team</h2>
          <p>
            Bliss Media is written and edited by a team of journalists,
            essayists, and industry observers. [Team biographies will appear
            here as they are added.]
          </p>

          <h2>Editorial Standards</h2>
          <p>
            Every article published in Bliss Media goes through a multi-stage
            editorial process. Authors submit drafts, editors review and
            request revisions, and only approved articles are published. We
            maintain a revision history for every piece, and we are committed
            to correcting errors promptly and transparently.
          </p>

          <h2>Contact</h2>
          <p>
            For editorial inquiries, partnership opportunities, or general
            feedback, please visit our <a href="/contact">contact page</a>.
          </p>
        </div>
      </article>
      <SiteFooter />
    </>
  );
}
