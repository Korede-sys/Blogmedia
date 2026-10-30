'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase-client';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { Plus, Trash2, Tag as TagIcon, Loader2, X, Pencil, Check } from 'lucide-react';
import type { Tag, Category } from '@/lib/types';
import { slugify } from '@/lib/utils';

interface TagUsage {
  tag: Tag;
  count: number;
}

interface CategoryGroup {
  category: Category;
  items: TagUsage[];
}

export default function AdminTagsPage() {
  const { hasRole } = useAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [groups, setGroups] = useState<CategoryGroup[]>([]);
  const [uncategorized, setUncategorized] = useState<TagUsage[]>([]);
  const [unused, setUnused] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const loadTags = useCallback(async () => {
    setLoading(true);

    const [{ data: categoriesData, error: catError }, { data: tagsData, error: tagError }, { data: linkData, error: linkError }] =
      await Promise.all([
        supabase.from('categories').select('*').order('sort_order', { ascending: true }),
        supabase.from('tags').select('*').order('name', { ascending: true }),
        supabase.from('article_tags').select('tag_id, articles(category_id)'),
      ]);

    if (catError || tagError || linkError) {
      toast.error('Failed to load tags');
      setLoading(false);
      return;
    }

    const categories = (categoriesData || []) as Category[];
    const allTags = (tagsData || []) as Tag[];
    const tagsById = new Map(allTags.map((t) => [t.id, t]));

    // counts[tagId][categoryId | 'none'] = number of articles
    const counts = new Map<string, Map<string, number>>();
    for (const row of (linkData || []) as unknown as {
      tag_id: string;
      articles: { category_id: string | null } | { category_id: string | null }[] | null;
    }[]) {
      const articleRel = Array.isArray(row.articles) ? row.articles[0] : row.articles;
      const catKey = articleRel?.category_id ?? 'none';
      if (!counts.has(row.tag_id)) counts.set(row.tag_id, new Map());
      const perCat = counts.get(row.tag_id)!;
      perCat.set(catKey, (perCat.get(catKey) || 0) + 1);
    }

    const newGroups: CategoryGroup[] = categories.map((category) => {
      const items: TagUsage[] = [];
      for (const [tagId, perCat] of counts.entries()) {
        const count = perCat.get(category.id);
        if (count && tagsById.has(tagId)) {
          items.push({ tag: tagsById.get(tagId)!, count });
        }
      }
      items.sort((a, b) => a.tag.name.localeCompare(b.tag.name));
      return { category, items };
    });

    const uncategorizedItems: TagUsage[] = [];
    for (const [tagId, perCat] of counts.entries()) {
      const count = perCat.get('none');
      if (count && tagsById.has(tagId)) {
        uncategorizedItems.push({ tag: tagsById.get(tagId)!, count });
      }
    }
    uncategorizedItems.sort((a, b) => a.tag.name.localeCompare(b.tag.name));

    const usedTagIds = new Set(counts.keys());
    const unusedTags = allTags.filter((t) => !usedTagIds.has(t.id));

    setTags(allTags);
    setGroups(newGroups);
    setUncategorized(uncategorizedItems);
    setUnused(unusedTags);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (hasRole(['editor', 'admin'])) loadTags();
  }, [hasRole, loadTags]);

  if (!hasRole(['editor', 'admin'])) {
    return (
      <div className="text-center py-20">
        <TagIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground font-sans">
          You need editor or admin access to manage tags.
        </p>
      </div>
    );
  }

  const handleCreate = async () => {
    if (!newName.trim()) {
      toast.error('Tag name is required');
      return;
    }
    setCreating(true);
    const { error } = await supabase.from('tags').insert({
      name: newName.trim(),
      slug: slugify(newName.trim()),
    });
    if (error) {
      toast.error('Failed to create tag: ' + error.message);
    } else {
      toast.success('Tag created');
      setNewName('');
      loadTags();
    }
    setCreating(false);
  };

  const startEdit = (tag: Tag) => {
    setEditingId(tag.id);
    setEditingName(tag.name);
  };

  const handleRename = async (id: string) => {
    if (!editingName.trim()) return;
    const { error } = await supabase
      .from('tags')
      .update({ name: editingName.trim(), slug: slugify(editingName.trim()) })
      .eq('id', id);
    if (error) {
      toast.error('Failed to rename: ' + error.message);
    } else {
      toast.success('Tag renamed');
      setEditingId(null);
      loadTags();
    }
  };

  const handleDelete = async (id: string, count: number) => {
    if (!hasRole('admin')) return;
    const warning =
      count > 0
        ? `Delete this tag? It's used on ${count} article${count === 1 ? '' : 's'} across the site — they'll no longer show it. This cannot be undone.`
        : 'Delete this tag? This cannot be undone.';
    if (!confirm(warning)) return;
    const { error } = await supabase.from('tags').delete().eq('id', id);
    if (error) {
      toast.error('Delete failed: ' + error.message);
    } else {
      toast.success('Tag deleted');
      loadTags();
    }
  };

  const renderChip = (tag: Tag, count?: number) => (
    <div
      key={tag.id}
      className="flex items-center gap-2 bg-card border border-border rounded-sm px-3 py-2"
    >
      {editingId === tag.id ? (
        <>
          <input
            type="text"
            value={editingName}
            onChange={(e) => setEditingName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRename(tag.id)}
            autoFocus
            className="w-32 px-2 py-1 bg-background border border-border rounded-sm text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold"
          />
          <button
            onClick={() => handleRename(tag.id)}
            className="text-emerald-600 hover:text-emerald-700"
            title="Save"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={() => setEditingId(null)}
            className="text-muted-foreground hover:text-foreground"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </>
      ) : (
        <>
          <span className="text-sm font-sans">{tag.name}</span>
          {typeof count === 'number' && (
            <span className="text-xs font-sans text-muted-foreground bg-muted/50 rounded-full px-1.5 py-0.5">
              {count}
            </span>
          )}
          <button
            onClick={() => startEdit(tag)}
            className="text-muted-foreground hover:text-gold transition-colors"
            title="Rename"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          {hasRole('admin') && (
            <button
              onClick={() => handleDelete(tag.id, count ?? 0)}
              className="text-muted-foreground hover:text-destructive transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </>
      )}
    </div>
  );

  const hasAnyTags = tags.length > 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold">Tags</h1>
          <p className="text-muted-foreground font-sans text-sm mt-1">
            {tags.length} total tags, grouped by the section their articles are in
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-sm p-4 mb-8 flex items-center gap-2 max-w-md">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          placeholder="New tag name…"
          className="flex-1 px-4 py-2.5 bg-background border border-border rounded-sm text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold"
        />
        <button
          onClick={handleCreate}
          disabled={creating}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-foreground text-background text-sm font-sans font-semibold rounded-sm hover:bg-foreground/90 transition-colors disabled:opacity-50"
        >
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Add
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gold" />
        </div>
      ) : !hasAnyTags ? (
        <div className="text-center py-20 bg-card border border-border rounded-sm">
          <TagIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground font-sans">No tags yet. Add your first one.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {groups.map(({ category, items }) => (
            <div key={category.id}>
              <h2 className="font-serif text-lg font-bold mb-1">{category.name}</h2>
              <p className="text-xs font-sans text-muted-foreground mb-3">
                Tags used on articles in this section
              </p>
              {items.length === 0 ? (
                <p className="text-sm font-sans text-muted-foreground italic">
                  No tags used here yet.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {items.map(({ tag, count }) => renderChip(tag, count))}
                </div>
              )}
            </div>
          ))}

          {uncategorized.length > 0 && (
            <div>
              <h2 className="font-serif text-lg font-bold mb-1">Uncategorized</h2>
              <p className="text-xs font-sans text-muted-foreground mb-3">
                Tags used on articles that aren&apos;t assigned to a section
              </p>
              <div className="flex flex-wrap gap-2">
                {uncategorized.map(({ tag, count }) => renderChip(tag, count))}
              </div>
            </div>
          )}

          <div>
            <h2 className="font-serif text-lg font-bold mb-1">Unused Tags</h2>
            <p className="text-xs font-sans text-muted-foreground mb-3">
              Not currently used on any article — safe to delete if you don&apos;t need them
            </p>
            {unused.length === 0 ? (
              <p className="text-sm font-sans text-muted-foreground italic">
                Every tag is in use.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {unused.map((tag) => renderChip(tag))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
