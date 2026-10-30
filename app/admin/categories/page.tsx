'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase-client';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { Plus, Trash2, FolderTree, Loader2, X, Pencil } from 'lucide-react';
import type { Category } from '@/lib/types';
import { slugify } from '@/lib/utils';

const EMPTY_FORM = {
  name: '',
  slug: '',
  description: '',
  sort_order: 0,
};

export default function AdminCategoriesPage() {
  const { hasRole } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

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

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground font-sans text-sm mt-1">
            {categories.length} total categories
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
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <span className="font-sans text-sm font-medium">{cat.name}</span>
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
