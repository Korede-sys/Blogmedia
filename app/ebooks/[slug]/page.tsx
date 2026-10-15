import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/public/site-header';
import { SiteFooter } from '@/components/public/site-footer';
import { EbookPurchaseButton } from '@/components/public/ebook-purchase-button';
import { getEbookBySlug, getPublishedEbooks } from '@/lib/queries';
import { EbookCard } from '@/components/public/ebook-card';
import { BookOpen, Download, FileText, ArrowLeft, Check } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { slug: string };
  searchParams: { status?: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const ebook = await getEbookBySlug(params.slug);
  if (!ebook) return { title: 'E-book Not Found' };
  return {
    title: `${ebook.title} — Bliss Media E-books`,
    description: ebook.subtitle || ebook.description,
  };
}

export default async function EbookDetailPage({ params, searchParams }: PageProps) {
  const ebook = await getEbookBySlug(params.slug);
  if (!ebook) notFound();

  const allEbooks = await getPublishedEbooks();
  const related = allEbooks.filter((e) => e.id !== ebook.id).slice(0, 3);

  const showSuccess = searchParams.status === 'success';
  const showCancelled = searchParams.status === 'cancelled';

  return (
    <>
      <SiteHeader />

      <div className="container-editorial pt-6">
        <Link
          href="/ebooks"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors font-sans"
        >
          <ArrowLeft className="w-4 h-4" />
          All E-books
        </Link>
      </div>

      {showSuccess && (
        <div className="container-editorial mt-6">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-sm p-4 text-sm font-sans flex items-center gap-3">
            <Check className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Payment successful!</p>
              <p className="text-emerald-700">Thank you for your purchase. Your download link is below.</p>
            </div>
          </div>
        </div>
      )}

      {showCancelled && (
        <div className="container-editorial mt-6">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-sm p-4 text-sm font-sans">
            Payment was cancelled. You can try again anytime.
          </div>
        </div>
      )}

      <section className="container-editorial mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          {/* Cover */}
          <div className="relative">
            <div className="relative aspect-[3/4] overflow-hidden rounded-sm border border-border bg-muted shadow-lg">
              {ebook.cover_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={ebook.cover_image}
                  alt={ebook.cover_alt || ebook.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-gold" />
              <span className="category-label">E-book</span>
            </div>

            <h1 className="font-serif text-3xl md:text-4xl font-bold leading-tight tracking-tight">
              {ebook.title}
            </h1>

            {ebook.subtitle && (
              <p className="mt-4 text-lg text-muted-foreground font-sans leading-relaxed">
                {ebook.subtitle}
              </p>
            )}

            {ebook.author_name && (
              <p className="mt-3 text-sm font-sans text-muted-foreground">
                By {ebook.author_name}
              </p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-5 mt-6 text-sm text-muted-foreground font-sans">
              {ebook.page_count > 0 && (
                <span className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  {ebook.page_count} pages
                </span>
              )}
              {ebook.file_size_mb > 0 && (
                <span className="flex items-center gap-1.5">
                  <Download className="w-4 h-4" />
                  {ebook.file_size_mb} MB
                </span>
              )}
              {ebook.download_count > 0 && (
                <span>{ebook.download_count} downloads</span>
              )}
            </div>

            {/* Tags */}
            {ebook.tags && ebook.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {ebook.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs font-sans bg-muted text-muted-foreground rounded-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Price + Buy */}
            <div className="mt-8 p-6 bg-card border border-border rounded-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  {ebook.is_free ? (
                    <span className="font-serif text-3xl font-bold text-emerald-600">
                      Free
                    </span>
                  ) : (
                    <span className="font-serif text-3xl font-bold">
                      ${(ebook.price_cents / 100).toFixed(2)}
                    </span>
                  )}
                  {!ebook.is_free && (
                    <p className="text-xs text-muted-foreground font-sans mt-1">
                      Instant download after payment
                    </p>
                  )}
                </div>
                <EbookPurchaseButton ebook={ebook} variant="full" />
              </div>
            </div>

            {/* Description */}
            {ebook.description && (
              <div className="mt-8">
                <h2 className="font-serif text-xl font-bold mb-4">About this book</h2>
                <div className="prose prose-sm max-w-none text-muted-foreground font-sans leading-relaxed whitespace-pre-line">
                  {ebook.description}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="container-editorial mt-20 mb-20">
          <div className="flex items-center gap-3 mb-8">
            <span className="h-px w-8 bg-gold" />
            <h2 className="font-serif text-2xl font-bold">More E-books</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {related.map((rel) => (
              <EbookCard key={rel.id} ebook={rel} />
            ))}
          </div>
        </section>
      )}

      <SiteFooter />
    </>
  );
}
