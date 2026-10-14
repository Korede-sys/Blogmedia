import Link from 'next/link';
import Image from 'next/image';
import type { Article } from '@/lib/types';
import { formatDateShort } from '@/lib/utils';
import { Clock } from 'lucide-react';

interface ArticleCardProps {
  article: Article;
  variant?: 'default' | 'featured' | 'compact' | 'horizontal' | 'minimal';
  showImage?: boolean;
  showExcerpt?: boolean;
  showCategory?: boolean;
  showAuthor?: boolean;
  showDate?: boolean;
  showReadingTime?: boolean;
  className?: string;
}

export function ArticleCard({
  article,
  variant = 'default',
  showImage = true,
  showExcerpt = false,
  showCategory = true,
  showAuthor = true,
  showDate = true,
  showReadingTime = true,
  className = '',
}: ArticleCardProps) {
  const href = `/article/${article.slug}`;
  const categoryName = article.category?.name ?? '';
  const categoryHref = article.category
    ? `/category/${article.category.slug}`
    : '';
  const authorName = article.author?.full_name || 'Staff Writer';
  const dateLabel = formatDateShort(article.published_at);

  if (variant === 'featured') {
    return (
      <article className={`group relative ${className}`}>
        <Link href={href} className="block">
          {showImage && article.cover_image && (
            <div className="relative aspect-[16/9] overflow-hidden rounded-xl mb-8 shadow-md">
              <Image
                src={article.cover_image}
                alt={article.cover_alt || article.title}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 1200px"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          )}
          {showCategory && categoryName && (
            <span className="category-label mb-4 block">{categoryName}</span>
          )}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold leading-[1.1] group-hover:text-gold transition-colors duration-300">
            {article.title}
          </h2>
          {showExcerpt && article.excerpt && (
            <p className="mt-5 text-lg text-muted-foreground font-sans leading-relaxed line-clamp-2">
              {article.excerpt}
            </p>
          )}
          <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground font-sans">
            {showAuthor && <span>By {authorName}</span>}
            {showDate && dateLabel && (
              <>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                <span>{dateLabel}</span>
              </>
            )}
            {showReadingTime && article.reading_time > 0 && (
              <>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {article.reading_time} min
                </span>
              </>
            )}
          </div>
        </Link>
      </article>
    );
  }

  if (variant === 'horizontal') {
    return (
      <article className={`group flex gap-5 ${className}`}>
        {showImage && article.cover_image && (
          <Link href={href} className="flex-shrink-0">
            <div className="relative w-28 h-20 sm:w-36 sm:h-24 overflow-hidden rounded-lg shadow-sm">
              <Image
                src={article.cover_image}
                alt={article.cover_alt || article.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="160px"
              />
            </div>
          </Link>
        )}
        <div className="flex-1 min-w-0">
          {showCategory && categoryName && (
            <Link href={categoryHref}>
              <span className="category-label mb-1.5 block">{categoryName}</span>
            </Link>
          )}
          <Link href={href}>
            <h3 className="text-base sm:text-lg font-serif font-semibold leading-snug group-hover:text-gold transition-colors duration-200 line-clamp-2">
              {article.title}
            </h3>
          </Link>
          <div className="mt-2.5 flex items-center gap-2.5 text-xs text-muted-foreground font-sans">
            {showDate && dateLabel && <span>{dateLabel}</span>}
            {showReadingTime && article.reading_time > 0 && (
              <>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {article.reading_time} min
                </span>
              </>
            )}
          </div>
        </div>
      </article>
    );
  }

  if (variant === 'minimal') {
    return (
      <article className={`group ${className}`}>
        {showCategory && categoryName && (
          <Link href={categoryHref}>
            <span className="category-label mb-2 block">{categoryName}</span>
          </Link>
        )}
        <Link href={href}>
          <h3 className="text-base font-serif font-semibold leading-snug group-hover:text-gold transition-colors duration-200 line-clamp-3">
            {article.title}
          </h3>
        </Link>
        {showDate && dateLabel && (
          <p className="mt-2.5 text-xs text-muted-foreground font-sans">
            {dateLabel}
          </p>
        )}
      </article>
    );
  }

  if (variant === 'compact') {
    return (
      <article className={`group ${className}`}>
        {showImage && article.cover_image && (
          <Link href={href} className="block">
            <div className="relative aspect-[16/10] overflow-hidden rounded-lg mb-5 shadow-sm">
              <Image
                src={article.cover_image}
                alt={article.cover_alt || article.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>
          </Link>
        )}
        {showCategory && categoryName && (
          <Link href={categoryHref}>
            <span className="category-label mb-2.5 block">{categoryName}</span>
          </Link>
        )}
        <Link href={href}>
          <h3 className="text-lg font-serif font-semibold leading-snug group-hover:text-gold transition-colors duration-200 line-clamp-3">
            {article.title}
          </h3>
        </Link>
        {showExcerpt && article.excerpt && (
          <p className="mt-2.5 text-sm text-muted-foreground font-sans line-clamp-2 leading-relaxed">
            {article.excerpt}
          </p>
        )}
        <div className="mt-3.5 flex items-center gap-2.5 text-xs text-muted-foreground font-sans">
          {showAuthor && <span>By {authorName}</span>}
          {showDate && dateLabel && (
            <>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
              <span>{dateLabel}</span>
            </>
          )}
        </div>
      </article>
    );
  }

  // Default
  return (
    <article className={`group ${className}`}>
      {showImage && article.cover_image && (
        <Link href={href} className="block">
          <div className="relative aspect-[16/10] overflow-hidden rounded-xl mb-6 shadow-sm">
            <Image
              src={article.cover_image}
              alt={article.cover_alt || article.title}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 600px"
            />
          </div>
        </Link>
      )}
      {showCategory && categoryName && (
        <Link href={categoryHref}>
          <span className="category-label mb-3 block">{categoryName}</span>
        </Link>
      )}
      <Link href={href}>
        <h3 className="text-xl md:text-2xl font-serif font-bold leading-tight group-hover:text-gold transition-colors duration-300 line-clamp-3">
          {article.title}
        </h3>
      </Link>
      {showExcerpt && article.excerpt && (
        <p className="mt-3 text-base text-muted-foreground font-sans leading-relaxed line-clamp-2">
          {article.excerpt}
        </p>
      )}
      <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground font-sans">
        {showAuthor && <span>By {authorName}</span>}
        {showDate && dateLabel && (
          <>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
            <span>{dateLabel}</span>
          </>
        )}
        {showReadingTime && article.reading_time > 0 && (
          <>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {article.reading_time} min
            </span>
          </>
        )}
      </div>
    </article>
  );
}