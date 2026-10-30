'use client';

import { useEffect, useState, useCallback, Fragment } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase-client';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import {
  Plus,
  Trash2,
  FolderTree,
  Loader2,
  X,
  Pencil,
  ChevronDown,
  ChevronRight,
  FileText,
  Tag as TagIcon,
  Check,
} from 'lucide-react';
import type { Category } from '@/lib/types';
import { slugify, formatDateShort, cn } from '@/lib/utils';

const EMPTY_FORM = {
  name: '',
  slug: '',
  description: '',
  sort_order: 0,
};

interface CategoryArticle {
  id: string;
  title: string;
  status: string;
  updated_at: string;
}

interface CategoryTag {
  id: string;
  name: string;
  slug: string;
  count: number;
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-blue-100 text-blue-700',
  in_review: 'bg-amber-100 text-amber-700',
  changes_requested: 'bg-orange-100 text-orange-700',
  approved: 'bg-green-100 text-green-700',
  scheduled: 'bg-purple-100 text-purple-700',
  published: 'bg-emerald-100 text-emerald-700',
  archived: 'bg-gray-100 text-gray-700',
};

export default function AdminCategoriesPage() {
  const { hasRole } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [articlesByCategory, setArticlesByCategory] = useState<
    Record<string, CategoryArticle[] | 'loading'>
  >({});
  const [tagsByCategory, setTagsByCategory] = useState<
    Record<string, CategoryTag[] | 'loading'>
  >({});
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingTagName, setEditingTagName] = useState('');

  const loadCategories = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) {
      toast.error('Failed to load categories');
    } else {
      setCategories((data || []) as Category[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (hasRole(['editor', 'admin'])) loadCategories();
  }, [hasRole, loadCategories]);

  if (!hasRole(['editor', 'admin'])) {
    return (
      <div className="text-center py-20">
        <FolderTree className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground font-sans">
          You need editor or admin access to manage categories.
        </p>
      </div>
    );
  }

  const startCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      sort_order: cat.sort_order ?? 0,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name,
      slug: form.slug || slugify(form.name),
      description: form.description,
      sort_order: Number(form.sort_order) || 0,
    };
    const { error } = editingId
      ? await supabase.from('categories').update(payload).eq('id', editingId)
      : await supabase.from('categories').insert(payload);
    if (error) {
      toast.error('Failed to save: ' + error.message);
    } else {
      toast.success(editingId ? 'Category updated' : 'Category created');
      setForm(EMPTY_FORM);
      setShowForm(false);
      setEditingId(null);
      loadCategories();
    }
    setSaving(false);
  };
  const handleDelete = async (id: string) => {
    if (!hasRole('admin')) return;
    const { count, error: countError } = await supabase
      .from('articles')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', id);
    if (countError) {
      toast.error('Could not check for articles using this category: ' + countError.message);
      return;
    }
    if (count && count > 0) {
      toast.error(
        `Can't delete: ${count} article${count === 1 ? '' : 's'} ${count === 1 ? 'is' : 'are'} still in this category. Reassign ${count === 1 ? 'it' : 'them'} to another category first.`
      );
      return;
    }
    if (!confirm('Delete this category? This cannot be undone.')) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      toast.error('Delete failed: ' + error.message);
    } else {
      toast.success('Category deleted');
      loadCategories();
    }
  };

  const loadArticlesForCategory = async (categoryId: string) => {
    setArticlesByCategory((prev) => ({ ...prev, [categoryId]: 'loading' }));
    const { data, error } = await supabase
      .from('articles')
      .select('id, title, status, updated_at')
      .eq('category_id', categoryId)
      .order('updated_at', { ascending: false });
    if (error) {
      toast.error('Failed to load articles for this category');
      setArticlesByCategory((prev) => ({ ...prev, [categoryId]: [] }));
      return;
    }
    setArticlesByCategory((prev) => ({
      ...prev,
      [categoryId]: (data || []) as CategoryArticle[],
    }));
  };

  const loadTagsForCategory = async (categoryId: string) => {
    setTagsByCategory((prev) => ({ ...prev, [categoryId]: 'loading' }));
    const { data, error } = await supabase
      .from('article_tags')
      .select('tag_id, tags(id, name, slug), articles!inner(category_id)')
      .eq('articles.category_id', categoryId);
    if (error) {
      toast.error('Failed to load tags for this category');
      setTagsByCategory((prev) => ({ ...prev, [categoryId]: [] }));
      return;
    }
    const counts = new Map<string, CategoryTag>();
    for (const row of (data || []) as unknown as {
      tag_id: string;
      tags: { id: string; name: string; slug: string } | { id: string; name: string; slug: string }[] | null;
    }[]) {
      const tag = Array.isArray(row.tags) ? row.tags[0] : row.tags;
      if (!tag) continue;
      const existing = counts.get(tag.id);
      if (existing) {
        existing.count += 1;
      } else {
        counts.set(tag.id, { id: tag.id, name: tag.name, slug: tag.slug, count: 1 });
      }
    }
    const list = Array.from(counts.values()).sort((a, b) => a.name.localeCompare(b.name));
    setTagsByCategory((prev) => ({ ...prev, [categoryId]: list }));
  };

  const toggleExpand = (categoryId: string) => {
    if (expandedId === categoryId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(categoryId);
    if (!articlesByCategory[categoryId]) {
      loadArticlesForCategory(categoryId);
    }
    if (!tagsByCategory[categoryId]) {
      loadTagsForCategory(categoryId);
    }
  };

  const handleDeleteArticle = async (categoryId: string, articleId: string, title: string) => {
    if (!hasRole('admin')) {
      toast.error('Only administrators can delete articles');
      return;
    }
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const { error } = await supabase.from('articles').delete().eq('id', articleId);
    if (error) {
      toast.error('Failed to delete article: ' + error.message);
    } else {
      toast.success('Article deleted');
      loadArticlesForCategory(categoryId);
    }
  };

  const startEditTag = (tag: CategoryTag) => {
    setEditingTagId(tag.id);
    setEditingTagName(tag.name);
  };

  const handleRenameTag = async (categoryId: string, tagId: string) => {
    if (!editingTagName.trim()) return;
    const { error } = await supabase
      .from('tags')
      .update({ name: editingTagName.trim(), slug: slugify(editingTagName.trim()) })
      .eq('id', tagId);
    if (error) {
      toast.error('Failed to rename tag: ' + error.message);
    } else {
      toast.success('Tag renamed');
      setEditingTagId(null);
      loadTagsForCategory(categoryId);
    }
  };

  const handleDeleteTag = async (categoryId: string, tagId: string, name: string, count: number) => {
    if (!hasRole('admin')) {
      toast.error('Only administrators can delete tags');
      return;
    }
    const warning =
      count > 0
        ? `Delete "${name}"? It's used on ${count} article${count === 1 ? '' : 's'} in this section — they'll no longer show it. This cannot be undone.`
        : `Delete "${name}"? This cannot be undone.`;
    if (!confirm(warning)) return;
    const { error } = await supabase.from('tags').delete().eq('id', tagId);
    if (error) {
      toast.error('Failed to delete tag: ' + error.message);
    } else {
      toast.success('Tag deleted');
      loadTagsForCategory(categoryId);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground font-sans text-sm mt-1">
            {categories.length} total categories — click a section to see and manage its articles and tags
          </p>
        </div>
        <button
          onClick={showForm ? () => setShowForm(false) : startCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-foreground text-background text-sm font-sans font-semibold rounded-sm hover:bg-foreground/90 transition-colors"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'New Category'}
        </button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-sm p-6 mb-8 space-y-5 max-w-xl">
          <div>
            <label className="block text-sm font-sans font-medium mb-2">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Technology"
              className="w-full px-4 py-2.5 bg-background border border-border rounded-sm text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>

          <div>
            <label className="block text-sm font-sans font-medium mb-2">Slug</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="auto-generated from name if left blank"
              className="w-full px-4 py-2.5 bg-background border border-border rounded-sm text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>

          <div>
            <label className="block text-sm font-sans font-medium mb-2">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Shown under the category title on the public page"
              className="w-full px-4 py-2.5 bg-background border border-border rounded-sm text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold resize-y"
            />
          </div>

          <div>
            <label className="block text-sm font-sans font-medium mb-2">
              Sort Order
            </label>
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) =>
                setForm({ ...form, sort_order: Number(e.target.value) })
              }
              className="w-full px-4 py-2.5 bg-background border border-border rounded-sm text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold text-foreground text-sm font-sans font-semibold rounded-sm hover:bg-gold/90 transition-colors disabled:opacity-50"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {editingId ? 'Save Changes' : 'Create Category'}
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gold" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-sm">
          <FolderTree className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground font-sans">
            No categories yet. Create your first one.
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-xs font-sans uppercase tracking-wider text-muted-foreground">
                  Name
                </th>
                <th className="text-left px-4 py-3 text-xs font-sans uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                  Slug
                </th>
                <th className="text-left px-4 py-3 text-xs font-sans uppercase tracking-wider text-muted-foreground hidden lg:table-cell">
                  Description
                </th>
                <th className="text-left px-4 py-3 text-xs font-sans uppercase tracking-wider text-muted-foreground">
                  Order
                </th>
                <th className="text-right px-4 py-3 text-xs font-sans uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((cat) => {
                const isExpanded = expandedId === cat.id;
                const articles = articlesByCategory[cat.id];
                const tags = tagsByCategory[cat.id];
                return (
                  <Fragment key={cat.id}>
                    <tr className="hover:bg-muted/20">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleExpand(cat.id)}
                          className="flex items-center gap-1.5 font-sans text-sm font-medium hover:text-gold transition-colors text-left"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                          )}
                          {cat.name}
                        </button>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-sm font-sans text-muted-foreground">
                          /{cat.slug}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-sm font-sans text-muted-foreground truncate block max-w-xs">
                          {cat.description || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-sans text-muted-foreground">
                          {cat.sort_order}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => startEdit(cat)}
                            className="p-1.5 text-muted-foreground hover:text-gold transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          {hasRole('admin') && (
                            <button
                              onClick={() => handleDelete(cat.id)}
                              className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${cat.id}-articles`}>
                        <td colSpan={5} className="bg-muted/10 px-4 py-4 space-y-6">
                          <div>
                            <h3 className="text-xs font-sans uppercase tracking-wider text-muted-foreground mb-2">
                              Articles
                            </h3>
                            {articles === 'loading' || !articles ? (
                              <div className="flex items-center gap-2 text-sm font-sans text-muted-foreground py-4">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Loading articles…
                              </div>
                            ) : articles.length === 0 ? (
                              <p className="text-sm font-sans text-muted-foreground italic py-2">
                                No articles in this section yet.
                              </p>
                            ) : (
                              <div className="space-y-1">
                                {articles.map((article) => (
                                  <div
                                    key={article.id}
                                    className="flex items-center justify-between gap-3 bg-card border border-border rounded-sm px-3 py-2"
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                      <Link
                                        href={`/admin/articles/${article.id}`}
                                        className="text-sm font-sans font-medium truncate hover:text-gold transition-colors"
                                      >
                                        {article.title}
                                      </Link>
                                      <span
                                        className={cn(
                                          'px-2 py-0.5 text-xs font-sans rounded-sm flex-shrink-0',
                                          STATUS_COLORS[article.status] || 'bg-gray-100 text-gray-700'
                                        )}
                                      >
                                        {article.status}
                                      </span>
                                      <span className="text-xs font-sans text-muted-foreground hidden sm:inline flex-shrink-0">
                                        Updated {formatDateShort(article.updated_at)}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                      <Link
                                        href={`/admin/articles/${article.id}`}
                                        className="p-1.5 text-muted-foreground hover:text-gold transition-colors"
                                        title="Edit"
                                      >
                                        <Pencil className="w-3.5 h-3.5" />
                                      </Link>
                                      {hasRole('admin') && (
                                        <button
                                          onClick={() =>
                                            handleDeleteArticle(cat.id, article.id, article.title)
                                          }
                                          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                                          title="Delete"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div>
                            <h3 className="text-xs font-sans uppercase tracking-wider text-muted-foreground mb-2">
                              Tags used in this section
                            </h3>
                            {tags === 'loading' || !tags ? (
                              <div className="flex items-center gap-2 text-sm font-sans text-muted-foreground py-4">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Loading tags…
                              </div>
                            ) : tags.length === 0 ? (
                              <p className="text-sm font-sans text-muted-foreground italic py-2">
                                No tags used here yet.
                              </p>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {tags.map((tag) => (
                                  <div
                                    key={tag.id}
                                    className="flex items-center gap-2 bg-card border border-border rounded-sm px-3 py-2"
                                  >
                                    {editingTagId === tag.id ? (
                                      <>
                                        <input
                                          type="text"
                                          value={editingTagName}
                                          onChange={(e) => setEditingTagName(e.target.value)}
                                          onKeyDown={(e) =>
                                            e.key === 'Enter' && handleRenameTag(cat.id, tag.id)
                                          }
                                          autoFocus
                                          className="w-32 px-2 py-1 bg-background border border-border rounded-sm text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold"
                                        />
                                        <button
                                          onClick={() => handleRenameTag(cat.id, tag.id)}
                                          className="text-emerald-600 hover:text-emerald-700"
                                          title="Save"
                                        >
                                          <Check className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => setEditingTagId(null)}
                                          className="text-muted-foreground hover:text-foreground"
                                          title="Cancel"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        <TagIcon className="w-3.5 h-3.5 text-muted-foreground" />
                                        <span className="text-sm font-sans">{tag.name}</span>
                                        <span className="text-xs font-sans text-muted-foreground bg-muted/50 rounded-full px-1.5 py-0.5">
                                          {tag.count}
                                        </span>
                                        <button
                                          onClick={() => startEditTag(tag)}
                                          className="text-muted-foreground hover:text-gold transition-colors"
                                          title="Rename"
                                        >
                                          <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                        {hasRole('admin') && (
                                          <button
                                            onClick={() =>
                                              handleDeleteTag(cat.id, tag.id, tag.name, tag.count)
                                            }
                                            className="text-muted-foreground hover:text-destructive transition-colors"
                                            title="Delete"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                      </>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
