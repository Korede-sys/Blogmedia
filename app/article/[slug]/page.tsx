import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  getArticleBySlug,
  getRelatedArticles,
  getApprovedComments,
  incrementViewCount,
} from '@/lib/queries';
import { SiteHeader } from '@/components/public/site-header';
import { SiteFooter } from '@/components/public/site-footer';
import { ArticleRenderer } from '@/components/public/article-renderer';
import { ArticleCard } from '@/components/public/article-card';
import { NewsletterForm } from '@/components/public/newsletter-form';
import { ReadingProgress } from '@/components/public/reading-progress';
import { SocialShare } from '@/components/public/social-share';
import { CommentSection } from '@/components/public/comment-section';
import { formatDate } from '@/lib/utils';
import { Clock, Calendar, ArrowLeft, User } from 'lucide-react';

export const revalidate = 300;

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);
  if (!article) {
    return { title: 'Article Not Found' };
  }
  return {
    title: article.seo_title || article.title,
    description: article.meta_description || article.excerpt,
    openGraph: {
      title: article.seo_title || article.title,
      description: article.meta_description || article.excerpt,
      images: article.cover_image
        ? [{ url: article.cover_image }]
        : undefined,
      type: 'article',
      publishedTime: article.published_at ?? undefined,
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const article = await getArticleBySlug(params.slug);
  if (!article) notFound();

  // Increment view count (non-blocking)
  incrementViewCount(article.id).catch(() => {});

  const [related, comments] = await Promise.all([
    getRelatedArticles(article, 3),
    getApprovedComments(article.id),
  ]);

  const authorName = article.author?.full_name || 'Staff Writer';
  const authorBio = article.author?.bio || '';
  const authorId = article.author?.id;

  return (
    <>
      <ReadingProgress />
      <SiteHeader />

      <article className="pb-16">
        {/* Breadcrumb */}
        <div className="container-editorial pt-6">
          <Link
            href={`/${article.category?.slug ? `category/${article.category.slug}` : ''}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors font-sans"
          >
            <ArrowLeft className="w-4 h-4" />
            {article.category?.name || 'Home'}
          </Link>
        </div>

        {/* Article header */}
        <header className="container-article mt-8">
          {article.category && (
            <Link href={`/category/${article.category.slug}`}>
              <span className="category-label mb-4 block">
                {article.category.name}
              </span>
            </Link>
          )}
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
            {article.title}
          </h1>
          {article.excerpt && (
            <p className="mt-6 text-xl text-muted-foreground font-sans leading-relaxed">
              {article.excerpt}
            </p>
          )}

          {/* Meta line */}
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 pb-8 border-b border-border">
            {authorId ? (
              <Link
                href={`/author/${authorId}`}
                className="flex items-center gap-2 text-sm font-sans text-foreground hover:text-gold transition-colors"
              >
                <User className="w-4 h-4 text-muted-foreground" />
                {authorName}
              </Link>
            ) : (
              <span className="flex items-center gap-2 text-sm font-sans text-foreground">
                <User className="w-4 h-4 text-muted-foreground" />
                {authorName}
              </span>
            )}
            {article.published_at && (
              <span className="flex items-center gap-2 text-sm font-sans text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {formatDate(article.published_at)}
              </span>
            )}
            {article.reading_time > 0 && (
              <span className="flex items-center gap-2 text-sm font-sans text-muted-foreground">
                <Clock className="w-4 h-4" />
                {article.reading_time} min read
              </span>
            )}
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="px-3 py-1 text-xs font-sans bg-muted text-muted-foreground rounded-sm"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Cover image */}
        {article.cover_image && (
          <div className="container-editorial mt-10">
            <div className="relative aspect-[21/9] overflow-hidden rounded-sm">
              <Image
                src={article.cover_image}
                alt={article.cover_alt || article.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 1280px"
                priority
              />
            </div>
          </div>
        )}

        {/* Article body */}
        <div className="container-article mt-12">
          <ArticleRenderer blocks={article.body} />

          {/* Social share */}
          <div className="mt-12 pt-8 border-t border-border">
            <SocialShare
              title={article.title}
              slug={article.slug}
            />
          </div>

          {/* Author bio */}
          {authorName !== 'Staff Writer' && (
            <div className="mt-12 p-8 bg-card rounded-sm border border-border">
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <span className="font-serif text-lg font-bold text-gold">
                    {authorName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-sans mb-1">
                    Written by
                  </p>
                  {authorId ? (
                    <Link
                      href={`/author/${authorId}`}
                      className="font-serif text-xl font-bold hover:text-gold transition-colors"
                    >
                      {authorName}
                    </Link>
                  ) : (
                    <h3 className="font-serif text-xl font-bold">
                      {authorName}
                    </h3>
                  )}
                  {authorBio && (
                    <p className="mt-2 text-sm text-muted-foreground font-sans leading-relaxed">
                      {authorBio}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Comments */}
          <CommentSection
            articleId={article.id}
            comments={comments}
          />

          {/* Newsletter prompt */}
          <div className="mt-16 p-8 bg-foreground text-background rounded-sm text-center">
            <p className="category-label text-gold mb-3">Newsletter</p>
            <h3 className="font-serif text-2xl font-bold">
              Enjoyed this story?
            </h3>
            <p className="mt-2 text-background/70 font-sans">
              Get the best of Bliss Media delivered weekly.
            </p>
            <div className="mt-6 flex justify-center">
              <NewsletterForm variant="compact" />
            </div>
          </div>
        </div>
      </article>

      {/* Related articles */}
      {related.length > 0 && (
        <section className="container-editorial mt-16 pb-20">
          <div className="flex items-center gap-3 mb-8">
            <span className="h-px w-8 bg-gold" />
            <h2 className="font-serif text-2xl md:text-3xl font-bold">
              Related Stories
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {related.map((rel) => (
              <ArticleCard key={rel.id} article={rel} variant="compact" />
            ))}
          </div>
        </section>
      )}

      <SiteFooter />
    </>
  );
}
