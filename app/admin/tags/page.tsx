'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase-client';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { Plus, Trash2, Tag as TagIcon, Loader2, X, Pencil, Check } from 'lucide-react';
import type { Tag } from '@/lib/types';
import { slugify } from '@/lib/utils';

export default function AdminTagsPage() {
  const { hasRole } = useAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const loadTags = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name', { ascending: true });
    if (error) {
      toast.error('Failed to load tags');
    } else {
      setTags((data || []) as Tag[]);
    }
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

  const handleDelete = async (id: string) => {
    if (!hasRole('admin')) return;
    if (
      !confirm(
        'Delete this tag? Articles tagged with it will no longer show it. This cannot be undone.'
      )
    )
      return;
    const { error } = await supabase.from('tags').delete().eq('id', id);
    if (error) {
      toast.error('Delete failed: ' + error.message);
    } else {
      toast.success('Tag deleted');
      loadTags();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold">Tags</h1>
          <p className="text-muted-foreground font-sans text-sm mt-1">
            {tags.length} total tags
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
      ) : tags.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-sm">
          <TagIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground font-sans">No tags yet. Add your first one.</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
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
                  <button
                    onClick={() => startEdit(tag)}
                    className="text-muted-foreground hover:text-gold transition-colors"
                    title="Rename"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  {hasRole('admin') && (
                    <button
                      onClick={() => handleDelete(tag.id)}
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
  );
}
