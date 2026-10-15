import Link from 'next/link';
import { BookOpen, Download, Star } from 'lucide-react';
import type { Ebook } from '@/lib/types';
import { EbookPurchaseButton } from '@/components/public/ebook-purchase-button';
import { cn } from '@/lib/utils';

interface EbookCardProps {
  ebook: Ebook;
  variant?: 'default' | 'featured';
}

export function EbookCard({ ebook, variant = 'default' }: EbookCardProps) {
  const isFeatured = variant === 'featured';

  return (
    <div
      className={cn(
        'group bg-card border border-border rounded-sm overflow-hidden transition-all duration-300 hover:shadow-lg',
        isFeatured && 'shadow-sm'
      )}
    >
      {/* Cover image */}
      <Link href={`/ebooks/${ebook.slug}`} className="block">
        <div className={cn(
          'relative overflow-hidden bg-muted',
          isFeatured ? 'aspect-[3/4]' : 'aspect-[3/4]'
        )}>
          {ebook.cover_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={ebook.cover_image}
              alt={ebook.cover_alt || ebook.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-muted-foreground" />
            </div>
          )}
          {ebook.featured && (
            <span className="absolute top-3 left-3 px-2.5 py-1 bg-gold text-foreground text-[0.625rem] font-sans font-bold uppercase tracking-wider rounded-sm">
              Featured
            </span>
          )}
          {ebook.is_free && (
            <span className="absolute top-3 right-3 px-2.5 py-1 bg-emerald-600 text-white text-[0.625rem] font-sans font-bold uppercase tracking-wider rounded-sm">
              Free
            </span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-5">
        {ebook.tags && ebook.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {ebook.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-[0.625rem] font-sans uppercase tracking-wider text-muted-foreground bg-muted rounded-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <Link href={`/ebooks/${ebook.slug}`}>
          <h3 className={cn(
            'font-serif font-bold leading-tight group-hover:text-gold transition-colors duration-200',
            isFeatured ? 'text-xl' : 'text-lg'
          )}>
            {ebook.title}
          </h3>
        </Link>

        {ebook.subtitle && (
          <p className="mt-1.5 text-sm text-muted-foreground font-sans line-clamp-2">
            {ebook.subtitle}
          </p>
        )}

        {ebook.author_name && (
          <p className="mt-2 text-xs text-muted-foreground font-sans">
            By {ebook.author_name}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground font-sans">
          {ebook.page_count > 0 && (
            <span>{ebook.page_count} pages</span>
          )}
          {ebook.file_size_mb > 0 && (
            <span>{ebook.file_size_mb} MB</span>
          )}
          {ebook.download_count > 0 && (
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              {ebook.download_count}
            </span>
          )}
        </div>

        {/* Price + CTA */}
        <div className="mt-5 flex items-center justify-between">
          <div>
            {ebook.is_free ? (
              <span className="font-serif text-xl font-bold text-emerald-600">
                Free
              </span>
            ) : (
              <span className="font-serif text-xl font-bold">
                ${(ebook.price_cents / 100).toFixed(2)}
              </span>
            )}
          </div>
          <EbookPurchaseButton ebook={ebook} />
        </div>
      </div>
    </div>
  );
}
