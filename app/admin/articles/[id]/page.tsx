'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase-client';
import { useAuth } from '@/lib/auth-context';
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import { toast } from 'sonner';
import {
  Save,
  Send,
  CheckCircle2,
  Eye,
  ArrowLeft,
  Loader2,
  Image as ImageIcon,
  Clock,
  Archive,
  RotateCcw,
} from 'lucide-react';
import type { ArticleBlock, Category, Tag, Article } from '@/lib/types';
import { slugify, calculateReadingTime, cn } from '@/lib/utils';
import { blocksToPlainText } from '@/lib/article-render';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'in_review', label: 'Submit for Review' },
  { value: 'changes_requested', label: 'Changes Requested' },
  { value: 'approved', label: 'Approved' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

export default function ArticleEditorPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const isNew = id === 'new';
  const router = useRouter();
  const { profile, hasRole } = useAuth();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [body, setBody] = useState<ArticleBlock[]>([]);
  const [coverImage, setCoverImage] = useState('');
  const [coverAlt, setCoverAlt] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [status, setStatus] = useState('draft');
  const [editorialNotes, setEditorialNotes] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [socialImage, setSocialImage] = useState('');
  const [publishedAt, setPublishedAt] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [featured, setFeatured] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(isNew ? false : true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'saving'>('idle');
  const [articleId, setArticleId] = useState<string | null>(isNew ? null : id);
  const [showPreview, setShowPreview] = useState(false);
  const autosaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function loadMeta() {
      const [{ data: cats }, { data: tagList }] = await Promise.all([
        supabase.from('categories').select('*').order('sort_order'),
        supabase.from('tags').select('*').order('name'),
      ]);
      setCategories(cats as Category[] || []);
      setTags(tagList as Tag[] || []);
    }
    loadMeta();
  }, []);

  useEffect(() => {
    if (!isNew) {
      loadArticle(id);
    }
  }, [id, isNew]);

  const loadArticle = async (articleId: string) => {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', articleId)
      .maybeSingle();

    if (error || !data) {
      toast.error('Article not found');
      router.push('/admin/articles');
      return;
    }

    const article = data as unknown as Article;
    setTitle(article.title);
    setSlug(article.slug);
    setExcerpt(article.excerpt);
    setBody(article.body || []);
    setCoverImage(article.cover_image);
    setCoverAlt(article.cover_alt);
    setCategoryId(article.category_id || '');
    setStatus(article.status);
    setEditorialNotes(article.editorial_notes);
    setSeoTitle(article.seo_title);
    setMetaDescription(article.meta_description);
    setSocialImage(article.social_image);
    setFeatured(article.featured);
    setIsPinned(article.is_pinned);
    setArticleId(article.id);

    if (article.published_at) {
      setPublishedAt(new Date(article.published_at).toISOString().slice(0, 16));
    }
    if (article.scheduled_for) {
      setScheduledFor(new Date(article.scheduled_for).toISOString().slice(0, 16));
    }

    // Load tags
    const { data: articleTags } = await supabase
      .from('article_tags')
      .select('tag_id')
      .eq('article_id', articleId);
    setSelectedTags((articleTags || []).map((t) => t.tag_id as string));

    setLoading(false);
  };

  // Autosave
  const scheduleAutosave = useCallback(() => {
    if (autosaveRef.current) clearTimeout(autosaveRef.current);
    if (!articleId) return;
    setSaveStatus('saving');
    autosaveRef.current = setTimeout(async () => {
      await doSave(articleId, false);
      setSaveStatus('saved');
    }, 2000);
  }, [articleId]);

  useEffect(() => {
    if (articleId && !loading) {
      scheduleAutosave();
    }
  }, [title, excerpt, body, coverImage, coverAlt, categoryId, selectedTags, seoTitle, metaDescription, articleId, loading]);

  const doSave = async (targetId: string, showFeedback: boolean) => {
    const plainText = blocksToPlainText(body);
    const readingTime = calculateReadingTime(plainText);
    const canPublish = hasRole(['editor', 'admin']);

    const updateData: Record<string, unknown> = {
      title,
      slug: slug || slugify(title),
      excerpt,
      body,
      cover_image: coverImage,
      cover_alt: coverAlt,
      category_id: categoryId || null,
      seo_title: seoTitle,
      meta_description: metaDescription,
      social_image: socialImage,
      reading_time: readingTime,
      editorial_notes: editorialNotes,
      featured,
      is_pinned: isPinned,
      status,
    };

    if (status === 'published' && canPublish) {
      updateData.published_at = publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString();
    }
    if (status === 'scheduled' && scheduledFor) {
      updateData.scheduled_for = new Date(scheduledFor).toISOString();
    }

    const { error } = await supabase
      .from('articles')
      .update(updateData)
      .eq('id', targetId);

    if (error) {
      if (showFeedback) toast.error('Save failed: ' + error.message);
      return false;
    }

    // Update tags
    await supabase.from('article_tags').delete().eq('article_id', targetId);
    if (selectedTags.length > 0) {
      await supabase
        .from('article_tags')
        .insert(selectedTags.map((tagId) => ({ article_id: targetId, tag_id: tagId })));
    }

    if (showFeedback) toast.success('Article saved');
    return true;
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    if (articleId) {
      await doSave(articleId, true);
    } else {
      // Create new
      const plainText = blocksToPlainText(body);
      const readingTime = calculateReadingTime(plainText);
      const newSlug = slug || slugify(title);
      const { data, error } = await supabase
        .from('articles')
        .insert({
          title,
          slug: newSlug,
          excerpt,
          body,
          cover_image: coverImage,
          cover_alt: coverAlt,
          category_id: categoryId || null,
          author_id: profile?.id,
          status: 'draft',
          seo_title: seoTitle,
          meta_description: metaDescription,
          social_image: socialImage,
          reading_time: readingTime,
          editorial_notes: editorialNotes,
        })
        .select('id')
        .single();

      if (error) {
        toast.error('Failed to create: ' + error.message);
      } else if (data) {
        setArticleId(data.id);
        if (selectedTags.length > 0) {
          await supabase
            .from('article_tags')
            .insert(selectedTags.map((tagId) => ({ article_id: data.id, tag_id: tagId })));
        }
        toast.success('Draft created');
        router.push(`/admin/articles/${data.id}`);
      }
    }
    setSaving(false);
  };

  const handleSubmitReview = async () => {
    if (!articleId) {
      await handleSaveDraft();
      if (!articleId) return;
    }
    setSaving(true);
    setStatus('in_review');
    const { error } = await supabase
      .from('articles')
      .update({ status: 'in_review' })
      .eq('id', articleId!);
    if (error) {
      toast.error('Failed to submit for review');
    } else {
      toast.success('Submitted for editorial review');
    }
    setSaving(false);
  };

  const handlePublish = async () => {
    if (!articleId) return;
    if (!hasRole(['editor', 'admin'])) {
      toast.error('Only editors and admins can publish');
      return;
    }
    setSaving(true);
    const pubDate = publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString();
    const { error } = await supabase
      .from('articles')
      .update({
        status: 'published',
        published_at: pubDate,
      })
      .eq('id', articleId);
    if (error) {
      toast.error('Failed to publish');
    } else {
      toast.success('Article published');
      setStatus('published');
    }
    setSaving(false);
  };

  const handleUnpublish = async () => {
    if (!articleId) return;
    setSaving(true);
    const { error } = await supabase
      .from('articles')
      .update({ status: 'archived' })
      .eq('id', articleId);
    if (error) {
      toast.error('Failed to unpublish');
    } else {
      toast.success('Article unpublished');
      setStatus('archived');
    }
    setSaving(false);
  };

  const handleToggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gold" />
      </div>
    );
  }

  const canPublish = hasRole(['editor', 'admin']);
  const isPublished = status === 'published';

  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/articles"
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-bold">
              {isNew ? 'New Article' : 'Edit Article'}
            </h1>
            <p className="text-xs text-muted-foreground font-sans">
              {saveStatus === 'saving' && 'Saving…'}
              {saveStatus === 'saved' && 'All changes saved'}
              {saveStatus === 'idle' && ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-border text-sm font-sans rounded-sm hover:bg-muted transition-colors"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 border border-border text-sm font-sans font-medium rounded-sm hover:bg-muted transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Draft
          </button>
          {!isPublished && !canPublish && (
            <button
              onClick={handleSubmitReview}
              disabled={saving || !articleId}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm font-sans font-medium rounded-sm hover:bg-amber-700 transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              Submit for Review
            </button>
          )}
          {canPublish && !isPublished && (
            <button
              onClick={handlePublish}
              disabled={saving || !articleId}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gold text-foreground text-sm font-sans font-semibold rounded-sm hover:bg-gold/90 transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              Publish
            </button>
          )}
          {isPublished && (
            <button
              onClick={handleUnpublish}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 border border-border text-sm font-sans font-medium rounded-sm hover:bg-muted transition-colors"
            >
              <Archive className="w-4 h-4" />
              Unpublish
            </button>
          )}
        </div>
      </div>

      {showPreview ? (
        <PreviewView
          title={title}
          excerpt={excerpt}
          body={body}
          coverImage={coverImage}
          coverAlt={coverAlt}
          authorName={profile?.full_name || 'Author'}
          categoryName={categories.find((c) => c.id === categoryId)?.name}
          onClose={() => setShowPreview(false)}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-4">
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!slug || slug === slugify(title)) {
                  setSlug(slugify(e.target.value));
                }
              }}
              placeholder="Article title…"
              className="w-full px-4 py-3 bg-card border border-border rounded-sm text-2xl font-serif font-bold focus:outline-none focus:ring-1 focus:ring-gold"
            />

            <div>
              <label className="block text-xs font-sans uppercase tracking-wider text-muted-foreground mb-2">
                Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="url-friendly-slug"
                className="w-full px-4 py-2.5 bg-card border border-border rounded-sm text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-sans uppercase tracking-wider text-muted-foreground mb-2">
                Excerpt
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Brief summary that appears in article cards and search results…"
                rows={3}
                className="w-full px-4 py-2.5 bg-card border border-border rounded-sm text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold resize-y"
              />
            </div>

            <div>
              <label className="block text-xs font-sans uppercase tracking-wider text-muted-foreground mb-2">
                Cover Image URL
              </label>
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://…"
                className="w-full px-4 py-2.5 bg-card border border-border rounded-sm text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold"
              />
              {coverImage && (
                <div className="mt-3 relative aspect-[21/9] overflow-hidden rounded-sm border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coverImage} alt={coverAlt} className="w-full h-full object-cover" />
                </div>
              )}
              <input
                type="text"
                value={coverAlt}
                onChange={(e) => setCoverAlt(e.target.value)}
                placeholder="Alt text for the cover image (for accessibility)…"
                className="w-full mt-2 px-4 py-2 bg-card border border-border rounded-sm text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-sans uppercase tracking-wider text-muted-foreground mb-2">
                Body
              </label>
              <RichTextEditor value={body} onChange={setBody} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Status */}
            <div className="bg-card border border-border rounded-sm p-4">
              <h3 className="font-sans text-sm font-semibold mb-3">Status</h3>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'px-3 py-1 text-xs font-sans rounded-sm capitalize',
                    status === 'published' && 'bg-emerald-100 text-emerald-700',
                    status === 'draft' && 'bg-blue-100 text-blue-700',
                    status === 'in_review' && 'bg-amber-100 text-amber-700',
                    status === 'changes_requested' && 'bg-orange-100 text-orange-700',
                    status === 'approved' && 'bg-green-100 text-green-700',
                    status === 'scheduled' && 'bg-purple-100 text-purple-700',
                    status === 'archived' && 'bg-gray-100 text-gray-700',
                  )}
                >
                  {status.replace('_', ' ')}
                </span>
              </div>

              {canPublish && (
                <div className="mt-3 space-y-2">
                  <label className="block text-xs text-muted-foreground font-sans">
                    Change status:
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Category */}
            <div className="bg-card border border-border rounded-sm p-4">
              <h3 className="font-sans text-sm font-semibold mb-3">Category</h3>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold"
              >
                <option value="">Select category…</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="bg-card border border-border rounded-sm p-4">
              <h3 className="font-sans text-sm font-semibold mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleToggleTag(tag.id)}
                    className={cn(
                      'px-3 py-1 text-xs font-sans rounded-sm transition-colors',
                      selectedTags.includes(tag.id)
                        ? 'bg-foreground text-background'
                        : 'bg-muted text-muted-foreground hover:bg-muted/70'
                    )}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Featured + Pinned */}
            {canPublish && (
              <div className="bg-card border border-border rounded-sm p-4 space-y-3">
                <h3 className="font-sans text-sm font-semibold">Editorial Options</h3>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 accent-gold"
                  />
                  <span className="text-sm font-sans">Featured story</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="w-4 h-4 accent-gold"
                  />
                  <span className="text-sm font-sans">Editor's Pick</span>
                </label>
              </div>
            )}

            {/* Publishing */}
            <div className="bg-card border border-border rounded-sm p-4 space-y-3">
              <h3 className="font-sans text-sm font-semibold">Publishing</h3>
              <div>
                <label className="block text-xs text-muted-foreground font-sans mb-1">
                  Published at
                </label>
                <input
                  type="datetime-local"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold"
                />
              </div>
              {canPublish && (
                <div>
                  <label className="block text-xs text-muted-foreground font-sans mb-1">
                    Schedule for
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledFor}
                    onChange={(e) => setScheduledFor(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                </div>
              )}
            </div>

            {/* Editorial notes */}
            {canPublish && (
              <div className="bg-card border border-border rounded-sm p-4">
                <h3 className="font-sans text-sm font-semibold mb-3">Editorial Notes</h3>
                <textarea
                  value={editorialNotes}
                  onChange={(e) => setEditorialNotes(e.target.value)}
                  placeholder="Notes for the author…"
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold resize-y"
                />
              </div>
            )}

            {/* SEO */}
            <div className="bg-card border border-border rounded-sm p-4 space-y-3">
              <h3 className="font-sans text-sm font-semibold">SEO</h3>
              <div>
                <label className="block text-xs text-muted-foreground font-sans mb-1">
                  SEO Title
                </label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Custom title for search engines…"
                  className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground font-sans mb-1">
                  Meta Description
                </label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Description for search engines…"
                  rows={2}
                  className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold resize-y"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground font-sans mb-1">
                  Social Image URL
                </label>
                <input
                  type="text"
                  value={socialImage}
                  onChange={(e) => setSocialImage(e.target.value)}
                  placeholder="https://…"
                  className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PreviewView({
  title,
  excerpt,
  body,
  coverImage,
  coverAlt,
  authorName,
  categoryName,
  onClose,
}: {
  title: string;
  excerpt: string;
  body: ArticleBlock[];
  coverImage: string;
  coverAlt: string;
  authorName: string;
  categoryName?: string;
  onClose: () => void;
}) {
  const { ArticleRenderer } = require('@/components/public/article-renderer');
  return (
    <div>
      <div className="mb-6">
        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 px-4 py-2 border border-border text-sm font-sans rounded-sm hover:bg-muted"
        >
          <ArrowLeft className="w-4 h-4" /> Back to editor
        </button>
      </div>
      <div className="max-w-3xl mx-auto bg-card border border-border rounded-sm p-8 md:p-12">
        {categoryName && (
          <span className="category-label mb-4 block">{categoryName}</span>
        )}
        <h1 className="font-serif text-3xl md:text-4xl font-bold">{title}</h1>
        {excerpt && (
          <p className="mt-4 text-lg text-muted-foreground font-sans">{excerpt}</p>
        )}
        <div className="mt-6 pb-6 border-b border-border text-sm text-muted-foreground font-sans">
          By {authorName}
        </div>
        {coverImage && (
          <div className="mt-8 -mx-8 md:-mx-12">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverImage} alt={coverAlt} className="w-full" />
          </div>
        )}
        <div className="mt-8">
          <ArticleRenderer blocks={body} />
        </div>
      </div>
    </div>
  );
}
