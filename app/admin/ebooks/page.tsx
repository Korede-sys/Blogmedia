'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase-client';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  BookOpen,
  Loader2,
  Trash2,
  Pencil,
  ExternalLink,
} from 'lucide-react';
import type { Ebook } from '@/lib/types';
import { formatDateShort, cn, slugify } from '@/lib/utils';

export default function AdminEbooksPage() {
  const { hasRole } = useAuth();
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadEbooks = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('ebooks')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast.error('Failed to load e-books');
    } else {
      setEbooks((data || []) as unknown as Ebook[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (hasRole(['editor', 'admin'])) {
      loadEbooks();
    }
  }, [hasRole, loadEbooks]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this e-book? This cannot be undone.')) return;
    const { error } = await supabase.from('ebooks').delete().eq('id', id);
    if (error) {
      toast.error('Delete failed: ' + error.message);
    } else {
      toast.success('E-book deleted');
      loadEbooks();
    }
  };

  if (!hasRole(['editor', 'admin'])) {
    return (
      <div className="text-center py-20">
        <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground font-sans">
          You need editor or admin access to manage e-books.
        </p>
      </div>
    );
  }

  const filtered = ebooks.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.author_name.toLowerCase().includes(search.toLowerCase())
  );

  const statusColors: Record<string, string> = {
    draft: 'bg-blue-100 text-blue-700',
    published: 'bg-emerald-100 text-emerald-700',
    archived: 'bg-gray-100 text-gray-700',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold">E-books</h1>
          <p className="text-muted-foreground font-sans text-sm mt-1">
            {ebooks.length} total e-books
          </p>
        </div>
        <Link
          href="/admin/ebooks/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-foreground text-background text-sm font-sans font-semibold rounded-sm hover:bg-foreground/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New E-book
        </Link>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or author…"
          className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-sm text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gold" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-sm">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground font-sans">
            No e-books yet. Create your first e-book.
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-xs font-sans uppercase tracking-wider text-muted-foreground">
                  Title
                </th>
                <th className="text-left px-4 py-3 text-xs font-sans uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                  Author
                </th>
                <th className="text-left px-4 py-3 text-xs font-sans uppercase tracking-wider text-muted-foreground hidden sm:table-cell">
                  Price
                </th>
                <th className="text-left px-4 py-3 text-xs font-sans uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-sans uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                  Downloads
                </th>
                <th className="text-left px-4 py-3 text-xs font-sans uppercase tracking-wider text-muted-foreground hidden lg:table-cell">
                  Created
                </th>
                <th className="text-right px-4 py-3 text-xs font-sans uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((ebook) => (
                <tr key={ebook.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {ebook.cover_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={ebook.cover_image}
                          alt={ebook.cover_alt || ebook.title}
                          className="w-10 h-14 object-cover rounded-sm flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-14 bg-muted rounded-sm flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-sans text-sm font-medium truncate">
                          {ebook.title}
                        </p>
                        {ebook.featured && (
                          <span className="text-xs text-gold font-sans">Featured</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm font-sans text-muted-foreground">
                      {ebook.author_name || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-sm font-sans font-medium">
                      {ebook.is_free ? (
                        <span className="text-emerald-600">Free</span>
                      ) : (
                        `$${(ebook.price_cents / 100).toFixed(2)}`
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'px-2.5 py-1 text-xs font-sans rounded-sm capitalize',
                        statusColors[ebook.status]
                      )}
                    >
                      {ebook.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm font-sans text-muted-foreground">
                      {ebook.download_count}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-sm font-sans text-muted-foreground">
                      {formatDateShort(ebook.created_at)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {ebook.status === 'published' && (
                        <Link
                          href={`/ebooks/${ebook.slug}`}
                          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                          title="View"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      )}
                      <Link
                        href={`/admin/ebooks/${ebook.id}`}
                        className="p-1.5 text-muted-foreground hover:text-gold transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      {hasRole('admin') && (
                        <button
                          onClick={() => handleDelete(ebook.id)}
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
