import type { Metadata } from 'next';
import { SiteHeader } from '@/components/public/site-header';
import { SiteFooter } from '@/components/public/site-footer';
import { SectionHeading } from '@/components/public/section-heading';
import { EbookCard } from '@/components/public/ebook-card';
import { getPublishedEbooks, getFeaturedEbooks } from '@/lib/queries';
import { BookOpen } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'E-books — Bliss Media',
  description: 'Download premium e-books from Bliss Media.',
};

export default async function EbooksPage() {
  const [ebooks, featured] = await Promise.all([
    getPublishedEbooks(),
    getFeaturedEbooks(3),
  ]);

  return (
    <>
      <SiteHeader />

      <section className="container-editorial pt-12 pb-8">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-8 bg-gold" />
            <span className="category-label">E-books</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight">
            Premium E-books
          </h1>
          <p className="mt-4 text-lg text-muted-foreground font-sans leading-relaxed">
            Download in-depth guides, essays, and collections from the Bliss Media
            editorial team. Available for instant download after purchase.
          </p>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="container-editorial mb-16">
          <SectionHeading
            title="Featured E-books"
            subtitle="Editor's top picks"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {featured.map((ebook) => (
              <EbookCard key={ebook.id} ebook={ebook} variant="featured" />
            ))}
          </div>
        </section>
      )}

      <section className="container-editorial mb-20">
        <SectionHeading
          title="All E-books"
          subtitle="Browse our full catalog"
        />
        {ebooks.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-serif text-2xl text-muted-foreground">
              No e-books available yet
            </h2>
            <p className="mt-2 text-muted-foreground font-sans">
              Check back soon for new releases.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {ebooks.map((ebook) => (
              <EbookCard key={ebook.id} ebook={ebook} />
            ))}
          </div>
        )}
      </section>

      <SiteFooter />
    </>
  );
}
