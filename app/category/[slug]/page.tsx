import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getCategoryBySlug,
  getPublishedArticles,
  getTags,
} from '@/lib/queries';
import { SiteHeader } from '@/components/public/site-header';
import { SiteFooter } from '@/components/public/site-footer';
import { ArticleCard } from '@/components/public/article-card';
import { SectionHeading } from '@/components/public/section-heading';
import { CategoryFilter } from '@/components/public/category-filter';
import { NewsletterForm } from '@/components/public/newsletter-form';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { slug: string };
  searchParams: { page?: string; sort?: string; tag?: string };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const category = await getCategoryBySlug(params.slug);
  if (!category) return { title: 'Category Not Found' };
  return {
    title: `${category.name} — Bliss Media`,
    description: category.description,
  };
}

const ARTICLES_PER_PAGE = 9;

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps) {
  const category = await getCategoryBySlug(params.slug);
  if (!category) notFound();

  const page = parseInt(searchParams.page || '1', 10);
  const sort = (searchParams.sort as 'newest' | 'oldest') || 'newest';
  const tagSlug = searchParams.tag || undefined;

  const tags = await getTags();

  const { articles, total } = await getPublishedArticles({
    categoryId: category.id,
    limit: ARTICLES_PER_PAGE,
    offset: (page - 1) * ARTICLES_PER_PAGE,
    sort,
    tagSlug,
  });

  const totalPages = Math.ceil(total / ARTICLES_PER_PAGE);
  const featuredArticle = articles[0];
  const restArticles = articles.slice(1);

  return (
    <>
      <SiteHeader />

      {/* Category hero */}
      <section className="container-editorial pt-12 pb-8">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-8 bg-gold" />
            <span className="category-label">Category</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight">
            {category.name}
          </h1>
          {category.description && (
            <p className="mt-4 text-lg text-muted-foreground font-sans leading-relaxed">
              {category.description}
            </p>
          )}
        </div>
      </section>

      {/* Featured article */}
      {featuredArticle && page === 1 && !tagSlug && (
        <section className="container-editorial mb-12">
          <ArticleCard article={featuredArticle} variant="featured" showExcerpt />
        </section>
      )}

      {/* Filters + sort */}
      <section className="container-editorial mb-8">
        <CategoryFilter
          tags={tags}
          currentTag={tagSlug}
          currentSort={sort}
          basePath={`/category/${category.slug}`}
        />
      </section>

      {/* Article grid */}
      <section className="container-editorial">
        {articles.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="font-serif text-2xl text-muted-foreground">
              No articles found
            </h2>
            <p className="mt-2 text-muted-foreground font-sans">
              {tagSlug
                ? 'Try removing the tag filter or check back later.'
                : 'Check back soon for new stories in this category.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {(page > 1 || tagSlug ? articles : restArticles).map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                variant="compact"
                showExcerpt
                showReadingTime
              />
            ))}
          </div>
        )}
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <section className="container-editorial mt-16 flex items-center justify-center">
          <div className="flex items-center gap-2">
            {page > 1 && (
              <a
                href={`/category/${category.slug}?page=${page - 1}${sort !== 'newest' ? `&sort=${sort}` : ''}${tagSlug ? `&tag=${tagSlug}` : ''}`}
                className="px-4 py-2 text-sm font-sans border border-border rounded-sm hover:bg-muted transition-colors"
              >
                Previous
              </a>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <a
                key={p}
                href={`/category/${category.slug}?page=${p}${sort !== 'newest' ? `&sort=${sort}` : ''}${tagSlug ? `&tag=${tagSlug}` : ''}`}
                className={`w-9 h-9 flex items-center justify-center text-sm font-sans rounded-sm transition-colors ${
                  p === page
                    ? 'bg-foreground text-background'
                    : 'border border-border hover:bg-muted'
                }`}
              >
                {p}
              </a>
            ))}
            {page < totalPages && (
              <a
                href={`/category/${category.slug}?page=${page + 1}${sort !== 'newest' ? `&sort=${sort}` : ''}${tagSlug ? `&tag=${tagSlug}` : ''}`}
                className="px-4 py-2 text-sm font-sans border border-border rounded-sm hover:bg-muted transition-colors"
              >
                Next
              </a>
            )}
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="container-editorial mt-20 mb-20">
        <div className="bg-muted/50 rounded-sm p-12 text-center">
          <p className="category-label mb-3">Newsletter</p>
          <h2 className="font-serif text-2xl font-bold">
            Never miss a {category.name} story
          </h2>
          <p className="mt-2 text-muted-foreground font-sans">
            Get the latest from Bliss Media delivered weekly.
          </p>
          <div className="mt-6 flex justify-center">
            <NewsletterForm variant="compact" />
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
