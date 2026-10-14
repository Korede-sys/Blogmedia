import { SiteHeader } from '@/components/public/site-header';
import { SiteFooter } from '@/components/public/site-footer';
import { ArticleCard } from '@/components/public/article-card';
import { NewsletterForm } from '@/components/public/newsletter-form';
import { SectionHeading } from '@/components/public/section-heading';
import { TrendingNumber } from '@/components/public/trending-number';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  getPublishedArticles,
  getFeaturedArticle,
  getTrendingArticles,
  getEditorsPicks,
  getCategories,
  getArticlesByCategory,
} from '@/lib/queries';
import { formatRelativeTime } from '@/lib/utils';

export const revalidate = 300;

async function getHomepageData() {
  try {
    const [featured, trending, editorsPicks, categories] = await Promise.all([
      getFeaturedArticle(),
      getTrendingArticles(5),
      getEditorsPicks(3),
      getCategories(),
    ]);

    const categoryData = await Promise.all(
      categories.slice(0, 5).map(async (cat) => ({
        category: cat,
        articles: await getArticlesByCategory(cat.id, 4),
      }))
    );

    const { articles: latest } = await getPublishedArticles({ limit: 6 });

    return {
      featured,
      trending,
      editorsPicks,
      categories,
      categoryData,
      latest,
    };
  } catch (error) {
    console.error('Error loading homepage data:', error);
    return {
      featured: null,
      trending: [],
      editorsPicks: [],
      categories: [],
      categoryData: [],
      latest: [],
    };
  }
}

export default async function HomePage() {
  const data = await getHomepageData();
  const { featured, trending, editorsPicks, categoryData, latest } = data;

  return (
    <>
      <SiteHeader />

      {/* Hero / Featured story */}
      <section className="container-editorial pt-8 md:pt-12">
        <div className="flex items-center gap-3 mb-6">
          <span className="h-px w-8 bg-gold" />
          <span className="category-label">Featured Story</span>
        </div>
        {featured ? (
          <ArticleCard
            article={featured}
            variant="featured"
            showExcerpt
          />
        ) : (
          <div className="text-center py-20">
            <h2 className="font-serif text-2xl text-muted-foreground">
              Welcome to Bliss Media
            </h2>
            <p className="mt-2 text-muted-foreground font-sans">
              Featured stories will appear here once published.
            </p>
          </div>
        )}
      </section>

      {/* Trending + Latest grid */}
      {trending.length > 0 && (
        <section className="container-editorial mt-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Trending sidebar */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <SectionHeading title="Trending" subtitle="Most read this week" />
              <div className="space-y-6">
                {trending.map((article, i) => (
                  <div key={article.id} className="flex gap-4">
                    <TrendingNumber number={i + 1} />
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/article/${article.slug}`}
                        className="group"
                      >
                        <h3 className="text-base font-serif font-semibold leading-snug group-hover:text-gold transition-colors line-clamp-3">
                          {article.title}
                        </h3>
                      </Link>
                      <p className="mt-2 text-xs text-muted-foreground font-sans">
                        {article.category?.name} ·{' '}
                        {formatRelativeTime(article.published_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Latest articles */}
            <div className="lg:col-span-2 order-1 lg:order-2">
              <SectionHeading
                title="Latest Stories"
                subtitle="Fresh from the newsroom"
                href="/search"
                hrefLabel="View all"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
                {latest.slice(0, 4).map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    variant="compact"
                    showExcerpt
                    showReadingTime
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Category sections */}
      {categoryData.map(({ category, articles }, idx) => {
        if (articles.length === 0) return null;
        const lead = articles[0];
        const rest = articles.slice(1, 4);

        return (
          <section
            key={category.id}
            className={`container-editorial mt-20 ${idx % 2 === 1 ? 'bg-card/30 -mx-4 px-4 py-12 rounded-sm' : ''}`}
          >
            <SectionHeading
              title={category.name}
              subtitle={category.description}
              href={`/category/${category.slug}`}
              hrefLabel={`More in ${category.name}`}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Lead story */}
              <ArticleCard
                article={lead}
                variant="default"
                showExcerpt
                showReadingTime
              />

              {/* Secondary stories */}
              <div className="space-y-6">
                {rest.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    variant="horizontal"
                    showExcerpt={false}
                  />
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* Editor's Picks */}
      {editorsPicks.length > 0 && (
        <section className="container-editorial mt-20">
          <SectionHeading
            title="Editor's Picks"
            subtitle="Hand-selected by our editorial team"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {editorsPicks.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                variant="compact"
                showExcerpt
                showAuthor
                showReadingTime
              />
            ))}
          </div>
        </section>
      )}

      {/* Newsletter section */}
      <section
        id="newsletter"
        className="mt-24 bg-foreground text-background py-20"
      >
        <div className="container-editorial text-center max-w-2xl mx-auto">
          <p className="category-label text-gold mb-4">Newsletter</p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold leading-tight">
            The best of Bliss Media, in your inbox
          </h2>
          <p className="mt-4 text-background/70 font-sans text-lg leading-relaxed">
            Join thousands of readers for a weekly curated digest of our
            finest stories across technology, culture, business, and beyond.
          </p>
          <div className="mt-8 flex justify-center">
            <NewsletterForm />
          </div>
          <p className="mt-4 text-xs text-background/50 font-sans">
            No spam. Unsubscribe at any time.
          </p>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
