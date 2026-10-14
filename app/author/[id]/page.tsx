import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProfileWithArticles } from '@/lib/queries';
import { SiteHeader } from '@/components/public/site-header';
import { SiteFooter } from '@/components/public/site-footer';
import { ArticleCard } from '@/components/public/article-card';

export const revalidate = 300;

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { profile } = await getProfileWithArticles(params.id);
  if (!profile) return { title: 'Author Not Found' };
  return {
    title: `${profile.full_name} — Bliss Media`,
    description: profile.bio || `Articles by ${profile.full_name}`,
  };
}

export default async function AuthorPage({ params }: PageProps) {
  const { profile, articles } = await getProfileWithArticles(params.id);
  if (!profile) notFound();

  const displayName = profile.full_name || 'Author';

  return (
    <>
      <SiteHeader />

      {/* Author header */}
      <section className="container-editorial pt-12 pb-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <span className="font-serif text-3xl font-bold text-gold">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
          <p className="category-label mb-3">Author</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight">
            {displayName}
          </h1>
          {profile.bio && (
            <p className="mt-6 text-lg text-muted-foreground font-sans leading-relaxed max-w-2xl mx-auto">
              {profile.bio}
            </p>
          )}
          <p className="mt-4 text-sm text-muted-foreground font-sans">
            {articles.length} published {articles.length === 1 ? 'article' : 'articles'}
          </p>
        </div>
      </section>

      {/* Articles by author */}
      <section className="container-editorial mt-8 pb-20">
        {articles.length === 0 ? (
          <p className="text-center text-muted-foreground font-sans italic py-12">
            No published articles yet.
          </p>
        ) : (
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
      </section>

      <SiteFooter />
    </>
  );
}
