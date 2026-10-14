import { supabase } from './supabase-client';
import type {
  Article,
  Category,
  Tag,
  Profile,
  Comment,
  SiteSettings,
  ArticleRevision,
} from './types';

// ============================================================
// CATEGORIES
// ============================================================

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data as Category[];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data as Category | null;
}

// ============================================================
// TAGS
// ============================================================

export async function getTags(): Promise<Tag[]> {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name', { ascending: true });
  if (error) throw error;
  return data as Tag[];
}

// ============================================================
// ARTICLES
// ============================================================

const ARTICLE_SELECT = `
  *,
  category:categories(*),
  author:profiles(*),
  tags:article_tags(tag:tags(*))
`;

function mapArticle(row: Record<string, unknown>): Article {
  const tags = (row.tags as { tag: Tag }[] | undefined)?.map((t) => t.tag) ?? [];
  return {
    ...(row as unknown as Article),
    category: row.category as Category | null,
    author: row.author as Profile | null,
    tags,
  };
}

export async function getPublishedArticles(opts?: {
  limit?: number;
  offset?: number;
  categoryId?: string;
  tagSlug?: string;
  search?: string;
  sort?: 'newest' | 'oldest';
}): Promise<{ articles: Article[]; total: number }> {
  let query = supabase
    .from('articles')
    .select(ARTICLE_SELECT, { count: 'exact' })
    .eq('status', 'published')
    .not('published_at', 'is', null);

  if (opts?.categoryId) {
    query = query.eq('category_id', opts.categoryId);
  }

  if (opts?.tagSlug) {
    // Filter by tag slug — we'll need to post-filter since Supabase doesn't support
    // filtering on nested relations directly. Instead, get tag id first.
    const { data: tagData } = await supabase
      .from('tags')
      .select('id')
      .eq('slug', opts.tagSlug)
      .maybeSingle();
    if (tagData) {
      const articleIds = await getArticleIdsByTag(tagData.id);
      if (articleIds.length === 0) return { articles: [], total: 0 };
      query = query.in('id', articleIds);
    }
  }

  if (opts?.search) {
    query = query.or(
      `title.ilike.%${opts.search}%,excerpt.ilike.%${opts.search}%`
    );
  }

  const sort = opts?.sort ?? 'newest';
  query = query.order('published_at', {
    ascending: sort === 'oldest',
  });

  if (opts?.limit) {
    query = query.limit(opts.limit);
    if (opts?.offset) {
      query = query.range(opts.offset, opts.offset + opts.limit - 1);
    }
  }

  const { data, error, count } = await query;
  if (error) throw error;

  const articles = (data || []).map((row) =>
    mapArticle(row as unknown as Record<string, unknown>)
  );
  return { articles, total: count ?? 0 };
}

async function getArticleIdsByTag(tagId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('article_tags')
    .select('article_id')
    .eq('tag_id', tagId);
  if (error) throw error;
  return (data || []).map((r) => r.article_id as string);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_SELECT)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return mapArticle(data as unknown as Record<string, unknown>);
}

export async function getArticleById(id: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_SELECT)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return mapArticle(data as unknown as Record<string, unknown>);
}

export async function getFeaturedArticle(): Promise<Article | null> {
  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_SELECT)
    .eq('status', 'published')
    .eq('featured', true)
    .order('published_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return mapArticle(data as unknown as Record<string, unknown>);
}

export async function getTrendingArticles(limit = 5): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_SELECT)
    .eq('status', 'published')
    .order('view_count', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []).map((row) =>
    mapArticle(row as unknown as Record<string, unknown>)
  );
}

export async function getLatestArticles(limit = 10): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_SELECT)
    .eq('status', 'published')
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []).map((row) =>
    mapArticle(row as unknown as Record<string, unknown>)
  );
}

export async function getEditorsPicks(limit = 3): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_SELECT)
    .eq('status', 'published')
    .eq('is_pinned', true)
    .order('published_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []).map((row) =>
    mapArticle(row as unknown as Record<string, unknown>)
  );
}

export async function getArticlesByCategory(
  categoryId: string,
  limit = 5
): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_SELECT)
    .eq('status', 'published')
    .eq('category_id', categoryId)
    .order('published_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []).map((row) =>
    mapArticle(row as unknown as Record<string, unknown>)
  );
}

export async function getRelatedArticles(
  article: Article,
  limit = 3
): Promise<Article[]> {
  let query = supabase
    .from('articles')
    .select(ARTICLE_SELECT)
    .eq('status', 'published')
    .neq('id', article.id)
    .limit(limit);

  if (article.category_id) {
    query = query.eq('category_id', article.category_id);
  } else {
    query = query.order('published_at', { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map((row) =>
    mapArticle(row as unknown as Record<string, unknown>)
  );
}

export async function searchArticles(
  query: string,
  opts?: { limit?: number; offset?: number }
): Promise<{ articles: Article[]; total: number }> {
  return getPublishedArticles({
    search: query,
    limit: opts?.limit ?? 10,
    offset: opts?.offset ?? 0,
  });
}

// ============================================================
// COMMENTS
// ============================================================

export async function getApprovedComments(articleId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('article_id', articleId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as unknown as Comment[];
}

export async function submitComment(
  articleId: string,
  authorName: string,
  authorEmail: string,
  body: string,
  parentId?: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('comments').insert({
    article_id: articleId,
    author_name: authorName,
    author_email: authorEmail,
    body,
    parent_id: parentId ?? null,
    status: 'pending',
  });
  return { error: error?.message ?? null };
}

// ============================================================
// NEWSLETTER
// ============================================================

export async function subscribeToNewsletter(
  email: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('newsletter_subscribers')
    .upsert({ email, is_active: true }, { onConflict: 'email' });
  return { error: error?.message ?? null };
}

export async function unsubscribeFromNewsletter(
  email: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('newsletter_subscribers')
    .update({ is_active: false })
    .eq('email', email);
  return { error: error?.message ?? null };
}

// ============================================================
// PROFILES
// ============================================================

export async function getProfileById(id: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function getProfileWithArticles(
  id: string
): Promise<{ profile: Profile | null; articles: Article[] }> {
  const profile = await getProfileById(id);
  if (!profile) return { profile: null, articles: [] };

  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_SELECT)
    .eq('author_id', id)
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  if (error) throw error;

  const articles = (data || []).map((row) =>
    mapArticle(row as unknown as Record<string, unknown>)
  );
  return { profile, articles };
}

// ============================================================
// SITE SETTINGS
// ============================================================

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle();
  if (error) throw error;
  return data as SiteSettings | null;
}

// ============================================================
// REVISIONS
// ============================================================

export async function getArticleRevisions(articleId: string): Promise<ArticleRevision[]> {
  const { data, error } = await supabase
    .from('article_revisions')
    .select('*, editor:profiles!edited_by(*)')
    .eq('article_id', articleId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as unknown as ArticleRevision[];
}

// ============================================================
// INCREMENT VIEW COUNT
// ============================================================

export async function incrementViewCount(articleId: string): Promise<void> {
  const { error } = await supabase.rpc('increment_view_count', {
    article_id: articleId,
  });
  if (error) {
    // Non-critical, don't throw
    console.warn('Failed to increment view count:', error);
  }
}
