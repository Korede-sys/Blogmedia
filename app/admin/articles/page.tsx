'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase-client';
import { useAuth } from '@/lib/auth-context';
import { Plus, Search, Trash2, Eye, Pencil } from 'lucide-react';
import { formatDateShort, cn } from '@/lib/utils';
import type { Article } from '@/lib/types';
import { toast } from 'sonner';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-blue-100 text-blue-700',
  in_review: 'bg-amber-100 text-amber-700',
  changes_requested: 'bg-orange-100 text-orange-700',
  approved: 'bg-green-100 text-green-700',
  scheduled: 'bg-purple-100 text-purple-700',
  published: 'bg-emerald-100 text-emerald-700',
  archived: 'bg-gray-100 text-gray-700',
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  in_review: 'In Review',
  changes_requested: 'Changes Requested',
  approved: 'Approved',
  scheduled: 'Scheduled',
  published: 'Published',
  archived: 'Archived',
};

export default function AdminArticlesPage() {
  const { profile, hasRole } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  const loadArticles = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('articles')
      .select('*, category:categories(name), author:profiles(full_name)', {
        count: 'exact',
      });

    if (!hasRole(['editor', 'admin'])) {
      query = query.eq('author_id', profile?.id);
    }

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    query = query
      .order('updated_at', { ascending: false })
      .range(page * pageSize, page * pageSize + pageSize - 1);

    const { data, count, error } = await query;
    if (error) {
      toast.error('Failed to load articles');
      console.error(error);
    } else {
      setArticles(data as unknown as Article[]);
      setTotal(count || 0);
    }
    setLoading(false);
  }, [profile, hasRole, search, statusFilter, page]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    if (!hasRole('admin')) {
      toast.error('Only administrators can delete articles');
      return;
    }
    const { error } = await supabase.from('articles').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete article');
    } else {
      toast.success('Article deleted');
      loadArticles();
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold">Articles</h1>
          <p className="text-muted-foreground font-sans text-sm mt-1">
            {total} total {total === 1 ? 'article' : 'articles'}
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-foreground text-background text-sm font-sans font-semibold rounded-sm hover:bg-foreground/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Article
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search by title…"
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-sm text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(0);
          }}
          className="px-4 py-2.5 bg-card border border-border rounded-sm text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold"
        >
          <option value="all">All Statuses</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-xs font-sans uppercase tracking-wider text-muted-foreground">
                Title
              </th>
              <th className="text-left px-4 py-3 text-xs font-sans uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                Category
              </th>
              <th className="text-left px-4 py-3 text-xs font-sans uppercase tracking-wider text-muted-foreground hidden lg:table-cell">
                Author
              </th>
              <th className="text-left px-4 py-3 text-xs font-sans uppercase tracking-wider text-muted-foreground">
                Status
              </th>
              <th className="text-left px-4 py-3 text-xs font-sans uppercase tracking-wider text-muted-foreground hidden sm:table-cell">
                Updated
              </th>
              <th className="text-right px-4 py-3 text-xs font-sans uppercase tracking-wider text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground font-sans text-sm">
                  Loading…
                </td>
              </tr>
            ) : articles.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground font-sans">
                  No articles found. Create one to get started.
                </td>
              </tr>
            ) : (
              articles.map((article) => (
                <tr key={article.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/articles/${article.id}`}
                      className="font-sans text-sm font-medium hover:text-gold transition-colors"
                    >
                      {article.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm font-sans text-muted-foreground">
                      {article.category?.name || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-sm font-sans text-muted-foreground">
                      {article.author?.full_name || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'px-2.5 py-1 text-xs font-sans rounded-sm',
                        STATUS_COLORS[article.status] || 'bg-gray-100 text-gray-700'
                      )}
                    >
                      {STATUS_LABELS[article.status] || article.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-sm font-sans text-muted-foreground">
                      {formatDateShort(article.updated_at)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {article.status === 'published' && (
                        <Link
                          href={`/article/${article.slug}`}
                          className="p-1.5 text-muted-foreground hover:text-gold transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      )}
                      <Link
                        href={`/admin/articles/${article.id}`}
                        className="p-1.5 text-muted-foreground hover:text-gold transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      {hasRole('admin') && (
                        <button
                          onClick={() => handleDelete(article.id, article.title)}
                          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-4 py-2 text-sm font-sans border border-border rounded-sm hover:bg-muted transition-colors disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm font-sans text-muted-foreground px-2">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="px-4 py-2 text-sm font-sans border border-border rounded-sm hover:bg-muted transition-colors disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
