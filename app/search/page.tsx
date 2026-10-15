import type { Metadata } from 'next';
import { searchArticles } from '@/lib/queries';
import { SiteHeader } from '@/components/public/site-header';
import { SiteFooter } from '@/components/public/site-footer';
import { ArticleCard } from '@/components/public/article-card';
import { SearchBar } from '@/components/public/search-bar';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: { q?: string; page?: string };
}

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search articles across Bliss Media.',
};

const ARTICLES_PER_PAGE = 9;

export default async function SearchPage({ searchParams }: PageProps) {
  const query = searchParams.q || '';
  const page = parseInt(searchParams.page || '1', 10);

  let articles: Awaited<ReturnType<typeof searchArticles>>['articles'] = [];
  let total = 0;

  if (query.trim()) {
    try {
      const result = await searchArticles(query, {
        limit: ARTICLES_PER_PAGE,
        offset: (page - 1) * ARTICLES_PER_PAGE,
      });
      articles = result.articles;
      total = result.total;
    } catch (e) {
      console.error('Search error:', e);
    }
  }

  const totalPages = Math.ceil(total / ARTICLES_PER_PAGE);

  return (
    <>
      <SiteHeader />

      <section className="container-editorial pt-12 pb-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-px w-8 bg-gold" />
            <span className="category-label">Search</span>
            <span className="h-px w-8 bg-gold" />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight mb-8">
            Find Your Story
          </h1>
          <SearchBar initialQuery={query} />
        </div>
      </section>

      <section className="container-editorial mt-8">
        {query.trim() && (
          <p className="text-sm text-muted-foreground font-sans mb-8">
            {total > 0
              ? `${total} result${total !== 1 ? 's' : ''} for "${query}"`
              : `No results for "${query}"`}
          </p>
        )}

        {!query.trim() && (
          <p className="text-center text-muted-foreground font-sans py-12">
            Start typing to search across all published articles.
          </p>
        )}

        {query.trim() && articles.length === 0 && (
          <div className="text-center py-20">
            <h2 className="font-serif text-2xl text-muted-foreground mb-2">
              No articles found
            </h2>
            <p className="text-muted-foreground font-sans">
              Try different keywords or browse by category.
            </p>
          </div>
        )}

        {articles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {articles.map((article) => (
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-16 flex items-center justify-center gap-2">
            {page > 1 && (
              <a
                href={`/search?q=${encodeURIComponent(query)}&page=${page - 1}`}
                className="px-4 py-2 text-sm font-sans border border-border rounded-sm hover:bg-muted transition-colors"
              >
                Previous
              </a>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <a
                key={p}
                href={`/search?q=${encodeURIComponent(query)}&page=${p}`}
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
                href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`}
                className="px-4 py-2 text-sm font-sans border border-border rounded-sm hover:bg-muted transition-colors"
              >
                Next
              </a>
            )}
          </div>
        )}
      </section>

      <div className="mt-20" />
      <SiteFooter />
    </>
  );
}
