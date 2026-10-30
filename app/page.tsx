import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Clock } from 'lucide-react';
import {
  getFeaturedArticle,
  getLatestArticles,
  getFeaturedEbooks,
} from '@/lib/queries';
import { formatDateShort } from '@/lib/utils';
import { SiteHeader } from '@/components/public/site-header';
import { SiteFooter } from '@/components/public/site-footer';
import { ArticleCard } from '@/components/public/article-card';
import { SectionHeading } from '@/components/public/section-heading';
import { EbookPurchaseButton } from '@/components/public/ebook-purchase-button';
import { NewsletterForm } from '@/components/public/newsletter-form';
import { AdBanner } from '@/components/public/ad-banner';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Bliss Media — Stories. Perspectives. Culture.',
  description:
    'Bliss Media is a premium digital magazine — original articles across technology, business, lifestyle and culture, plus a curated store of e-books and guides.',
};

export default async function HomePage() {
  const [featured, latestRaw, ebooks] = await Promise.all([
    getFeaturedArticle(),
    getLatestArticles(7),
    getFeaturedEbooks(2),
  ]);

  const heroArticle = featured ?? latestRaw[0] ?? null;
  const restArticles = (
    heroArticle
      ? latestRaw.filter((article) => article.id !== heroArticle.id)
      : latestRaw
  ).slice(0, 6);

  const authorName = heroArticle?.author?.full_name || 'Staff Writer';
  const authorInitials = authorName
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <>
      <SiteHeader />
      <AdBanner placement="header" />

      {heroArticle ? (
        <section className="container-editorial pt-10 pb-14 md:pt-14 md:pb-16 border-b border-border/60">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="md:col-span-7 flex flex-col gap-6">
              {heroArticle.category && (
                <Link
                  href={`/category/${heroArticle.category.slug}`}
                  className="inline-flex self-start items-center gap-2 text-[0.6875rem] font-sans font-bold uppercase tracking-widest text-gold border border-gold/50 rounded-full px-3.5 py-1.5 hover:bg-gold/10 transition-colors"
                >
                  {featured ? 'Featured' : 'Latest'} &middot; {heroArticle.category.name}
                </Link>
              )}
              <Link href={`/article/${heroArticle.slug}`}>
                <h1 className="font-serif text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight hover:text-gold transition-colors duration-300">
                  {heroArticle.title}
                </h1>
              </Link>
              {heroArticle.excerpt && (
                <p className="text-lg text-muted-foreground font-sans leading-relaxed max-w-xl">
                  {heroArticle.excerpt}
                </p>
              )}
              <div className="flex items-center gap-3 text-sm text-muted-foreground font-sans">
                <span className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-xs font-sans font-bold text-secondary-foreground">
                  {authorInitials || 'BM'}
                </span>
                <span>By {authorName}</span>
                {heroArticle.published_at && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                    <span>{formatDateShort(heroArticle.published_at)}</span>
                  </>
                )}
                {heroArticle.reading_time > 0 && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {heroArticle.reading_time} min
                    </span>
                  </>
                )}
              </div>
              <Link
                href={`/article/${heroArticle.slug}`}
                className="group inline-flex items-center gap-2 w-fit text-sm font-sans font-semibold border-b-2 border-gold pb-0.5 hover:text-gold transition-colors"
              >
                Read the full story
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="md:col-span-5">
              <Link href={`/article/${heroArticle.slug}`} className="block">
                <div className="relative aspect-[4/5] rounded-md overflow-hidden bg-muted shadow-lg">
                  {heroArticle.cover_image ? (
                    <Image
                      src={heroArticle.cover_image}
                      alt={heroArticle.cover_alt || heroArticle.title}
                      fill
                      priority
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 500px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs uppercase tracking-wider text-muted-foreground">
                      Bliss Media
                    </div>
                  )}
                </div>
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="container-editorial pt-16 pb-16 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight">
            Stories. Perspectives. Culture.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground font-sans max-w-xl mx-auto">
            New articles are on their way — check back soon, or browse the e-book store below.
          </p>
        </section>
      )}

      {restArticles.length > 0 && (
        <section className="container-editorial py-14 md:py-16">
          <SectionHeading
            title="Latest Stories"
            href="/search"
            hrefLabel="View all articles"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {restArticles.map((article) => (
              <ArticleCard key={article.id} article={article} showExcerpt />
            ))}
          </div>
        </section>
      )}

      {ebooks.length > 0 && (
        <section className="container-editorial pb-16 md:pb-20">
          <div className="bg-foreground text-background rounded-xl px-6 py-12 md:px-12 md:py-14">
            <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
              <div>
                <span className="text-[0.6875rem] font-sans font-bold uppercase tracking-widest text-gold">
                  Digital Bookstore
                </span>
                <h2 className="mt-2 font-serif text-2xl md:text-3xl font-bold">
                  E-Books &amp; Premium Resources
                </h2>
              </div>
              <Link
                href="/ebooks"
                className="group flex items-center gap-1.5 text-sm font-sans font-semibold border-b-2 border-gold pb-0.5 whitespace-nowrap"
              >
                Browse the full store
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {ebooks.map((ebook) => (
                <div
                  key={ebook.id}
                  className="flex gap-5 bg-background/5 border border-background/15 rounded-lg p-5"
                >
                  <Link href={`/ebooks/${ebook.slug}`} className="flex-shrink-0">
                    <div className="relative w-24 aspect-[3/4] rounded-sm overflow-hidden bg-background/10">
                      {ebook.cover_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={ebook.cover_image}
                          alt={ebook.cover_alt || ebook.title}
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0 flex flex-col gap-2">
                    {ebook.subtitle && (
                      <span className="text-[0.625rem] font-sans font-bold uppercase tracking-wider text-gold">
                        {ebook.subtitle}
                      </span>
                    )}
                    <Link href={`/ebooks/${ebook.slug}`}>
                      <h3 className="font-serif text-lg font-bold leading-snug hover:text-gold transition-colors">
                        {ebook.title}
                      </h3>
                    </Link>
                    <div className="flex items-center justify-between mt-auto pt-2">
                      <span className="font-serif text-xl font-bold text-gold">
                        {ebook.is_free ? 'Free' : `$${(ebook.price_cents / 100).toFixed(2)}`}
                      </span>
                      <EbookPurchaseButton ebook={ebook} variant="compact" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="newsletter" className="container-editorial pb-20">
        <div className="bg-foreground text-background rounded-xl px-6 py-12 md:px-12 md:py-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="max-w-md">
            <h2 className="font-serif text-2xl font-bold">
              Join the Bliss Media digest
            </h2>
            <p className="mt-2.5 text-sm text-background/70 font-sans leading-relaxed">
              One email a week — our best stories and new e-book releases, nothing else.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
