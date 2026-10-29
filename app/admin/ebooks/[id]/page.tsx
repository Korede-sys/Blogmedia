'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase-client';
import { useAuth } from '@/lib/auth-context';
import { ImageUpload } from '@/components/admin/image-upload';
import { PdfUpload } from '@/components/admin/pdf-upload';
import { toast } from 'sonner';
import {
  Save,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  Archive,
} from 'lucide-react';
import type { Ebook } from '@/lib/types';
import { slugify, cn } from '@/lib/utils';

export default function EbookEditorPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const isNew = id === 'new';
  const router = useRouter();
  const { hasRole } = useAuth();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [priceCents, setPriceCents] = useState(499);
  const [isFree, setIsFree] = useState(false);
  const [coverImage, setCoverImage] = useState('');
  const [coverAlt, setCoverAlt] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileSizeMb, setFileSizeMb] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [isbn, setIsbn] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [status, setStatus] = useState('draft');
  const [featured, setFeatured] = useState(false);
  const [publishedAt, setPublishedAt] = useState('');
  const [ebookId, setEbookId] = useState<string | null>(isNew ? null : id);
  const [loading, setLoading] = useState(isNew ? false : true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isNew) {
      loadEbook(id);
    }
  }, [id, isNew]);

  const loadEbook = async (ebookId: string) => {
    const { data, error } = await supabase
      .from('ebooks')
      .select('*')
      .eq('id', ebookId)
      .maybeSingle();
    if (error || !data) {
      toast.error('E-book not found');
      router.push('/admin/ebooks');
      return;
    }
    const ebook = data as unknown as Ebook;
    setTitle(ebook.title);
    setSlug(ebook.slug);
    setSubtitle(ebook.subtitle);
    setDescription(ebook.description);
    setAuthorName(ebook.author_name);
    setPriceCents(ebook.price_cents);
    setIsFree(ebook.is_free);
    setCoverImage(ebook.cover_image);
    setCoverAlt(ebook.cover_alt);
    setFileUrl(ebook.file_url);
    setFileSizeMb(ebook.file_size_mb);
    setPageCount(ebook.page_count);
    setIsbn(ebook.isbn);
    setTagsInput(ebook.tags.join(', '));
    setStatus(ebook.status);
    setFeatured(ebook.featured);
    setEbookId(ebook.id);
    if (ebook.published_at) {
      setPublishedAt(new Date(ebook.published_at).toISOString().slice(0, 16));
    }
    setLoading(false);
  };

  const buildData = useCallback(() => {
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    return {
      title,
      slug: slug || slugify(title),
      subtitle,
      description,
      author_name: authorName,
      price_cents: isFree ? 0 : priceCents,
      is_free: isFree,
      cover_image: coverImage,
      cover_alt: coverAlt,
      file_url: fileUrl,
      file_size_mb: fileSizeMb,
      page_count: pageCount,
      isbn,
      tags,
      status,
      featured,
      published_at:
        status === 'published'
          ? publishedAt
            ? new Date(publishedAt).toISOString()
            : new Date().toISOString()
          : null,
    };
  }, [
    title, slug, subtitle, description, authorName, priceCents, isFree,
    coverImage, coverAlt, fileUrl, fileSizeMb, pageCount, isbn, tagsInput,
    status, featured, publishedAt,
  ]);

  const handleSave = async () => {
    setSaving(true);
    const data = buildData();

    if (ebookId) {
      const { error } = await supabase
        .from('ebooks')
        .update(data)
        .eq('id', ebookId);
      if (error) {
        toast.error('Save failed: ' + error.message);
      } else {
        toast.success('E-book saved');
      }
    } else {
      const { data: created, error } = await supabase
        .from('ebooks')
        .insert(data)
        .select('id')
        .single();
      if (error) {
        toast.error('Failed to create: ' + error.message);
      } else if (created) {
        setEbookId(created.id);
        toast.success('E-book created');
        router.push(`/admin/ebooks/${created.id}`);
      }
    }
    setSaving(false);
  };

  const handlePublish = async () => {
    if (!ebookId) return;
    setSaving(true);
    const pubDate = publishedAt
      ? new Date(publishedAt).toISOString()
      : new Date().toISOString();
    const { error } = await supabase
      .from('ebooks')
      .update({ status: 'published', published_at: pubDate })
      .eq('id', ebookId);
    if (error) {
      toast.error('Failed to publish');
    } else {
      toast.success('E-book published');
      setStatus('published');
    }
    setSaving(false);
  };

  const handleUnpublish = async () => {
    if (!ebookId) return;
    setSaving(true);
    const { error } = await supabase
      .from('ebooks')
      .update({ status: 'archived' })
      .eq('id', ebookId);
    if (error) {
      toast.error('Failed to unpublish');
    } else {
      toast.success('E-book unpublished');
      setStatus('archived');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gold" />
      </div>
    );
  }

  if (!hasRole(['editor', 'admin'])) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground font-sans">
          You need editor or admin access.
        </p>
      </div>
    );
  }

  const inputClass =
    'w-full px-4 py-2.5 bg-card border border-border rounded-sm text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold';

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/ebooks"
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-serif text-2xl font-bold">
            {isNew ? 'New E-book' : 'Edit E-book'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 border border-border text-sm font-sans font-medium rounded-sm hover:bg-muted transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </button>
          {status !== 'published' && (
            <button
              onClick={handlePublish}
              disabled={saving || !ebookId}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gold text-foreground text-sm font-sans font-semibold rounded-sm hover:bg-gold/90 transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              Publish
            </button>
          )}
          {status === 'published' && (
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <label className="block text-xs font-sans uppercase tracking-wider text-muted-foreground mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!slug || slug === slugify(title)) {
                  setSlug(slugify(e.target.value));
                }
              }}
              placeholder="E-book title…"
              className={cn(inputClass, 'text-xl font-serif font-bold')}
            />
          </div>

          <div>
            <label className="block text-xs font-sans uppercase tracking-wider text-muted-foreground mb-2">
              Slug
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="url-friendly-slug"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-sans uppercase tracking-wider text-muted-foreground mb-2">
              Subtitle
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Short tagline…"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-sans uppercase tracking-wider text-muted-foreground mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Full description of the e-book…"
              rows={6}
              className={cn(inputClass, 'resize-y')}
            />
          </div>

          <div>
            <label className="block text-xs font-sans uppercase tracking-wider text-muted-foreground mb-2">
              Cover Image
            </label>
            <ImageUpload
              value={coverImage}
              onChange={setCoverImage}
              alt={coverAlt}
              aspectRatio="aspect-[3/4]"
            />
            <input
              type="text"
              value={coverAlt}
              onChange={(e) => setCoverAlt(e.target.value)}
              placeholder="Alt text for cover image…"
              className={cn(inputClass, 'mt-2')}
            />
          </div>

          <div>
            <label className="block text-xs font-sans uppercase tracking-wider text-muted-foreground mb-2">
              Download File URL
            </label>
            <PdfUpload value={fileUrl} onChange={setFileUrl} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <div className="bg-card border border-border rounded-sm p-4">
            <h3 className="font-sans text-sm font-semibold mb-3">Status</h3>
            <span
              className={cn(
                'inline-block px-3 py-1 text-xs font-sans rounded-sm capitalize',
                status === 'published' && 'bg-emerald-100 text-emerald-700',
                status === 'draft' && 'bg-blue-100 text-blue-700',
                status === 'archived' && 'bg-gray-100 text-gray-700'
              )}
            >
              {status}
            </span>
            <div className="mt-3">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={inputClass}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-card border border-border rounded-sm p-4 space-y-3">
            <h3 className="font-sans text-sm font-semibold">Pricing</h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
                className="w-4 h-4 accent-emerald-600"
              />
              <span className="text-sm font-sans">Free download</span>
            </label>
            {!isFree && (
              <div>
                <label className="block text-xs text-muted-foreground font-sans mb-1">
                  Price (in cents, e.g. 499 = $4.99)
                </label>
                <input
                  type="number"
                  value={priceCents}
                  onChange={(e) => setPriceCents(parseInt(e.target.value) || 0)}
                  className={inputClass}
                />
                <p className="mt-1 text-xs text-muted-foreground font-sans">
                  = ${(priceCents / 100).toFixed(2)}
                </p>
              </div>
            )}
          </div>

          {/* Author */}
          <div className="bg-card border border-border rounded-sm p-4">
            <h3 className="font-sans text-sm font-semibold mb-3">Author</h3>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Author name…"
              className={inputClass}
            />
          </div>

          {/* Book details */}
          <div className="bg-card border border-border rounded-sm p-4 space-y-3">
            <h3 className="font-sans text-sm font-semibold">Book Details</h3>
            <div>
              <label className="block text-xs text-muted-foreground font-sans mb-1">
                Page count
              </label>
              <input
                type="number"
                value={pageCount}
                onChange={(e) => setPageCount(parseInt(e.target.value) || 0)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground font-sans mb-1">
                File size (MB)
              </label>
              <input
                type="number"
                step="0.1"
                value={fileSizeMb}
                onChange={(e) => setFileSizeMb(parseFloat(e.target.value) || 0)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground font-sans mb-1">
                ISBN
              </label>
              <input
                type="text"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                placeholder="ISBN…"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground font-sans mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="technology, culture…"
                className={inputClass}
              />
            </div>
          </div>

          {/* Featured */}
          <div className="bg-card border border-border rounded-sm p-4">
            <h3 className="font-sans text-sm font-semibold mb-3">Display Options</h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 accent-gold"
              />
              <span className="text-sm font-sans">Featured e-book</span>
            </label>
          </div>

          {/* Published at */}
          <div className="bg-card border border-border rounded-sm p-4">
            <h3 className="font-sans text-sm font-semibold mb-3">Publishing</h3>
            <label className="block text-xs text-muted-foreground font-sans mb-1">
              Published at
            </label>
            <input
              type="datetime-local"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
