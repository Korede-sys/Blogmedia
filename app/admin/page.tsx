'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase-client';
import { useAuth } from '@/lib/auth-context';
import {
  FileText,
  CheckCircle2,
  Clock,
  MessageSquare,
  TrendingUp,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { formatDate, formatRelativeTime } from '@/lib/utils';

interface DashboardStats {
  published: number;
  drafts: number;
  inReview: number;
  scheduled: number;
  pendingComments: number;
  totalViews: number;
}

interface RecentArticle {
  id: string;
  title: string;
  status: string;
  updated_at: string;
  author?: { full_name: string };
}

export default function AdminOverview() {
  const { profile, hasRole } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<RecentArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [pubRes, draftRes, reviewRes, schedRes, commRes] = await Promise.all([
          supabase.from('articles').select('id', { count: 'exact', head: true }).eq('status', 'published'),
          supabase.from('articles').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
          supabase.from('articles').select('id', { count: 'exact', head: true }).eq('status', 'in_review'),
          supabase.from('articles').select('id', { count: 'exact', head: true }).eq('status', 'scheduled'),
          supabase.from('comments').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        ]);

        const { data: viewsData } = await supabase
          .from('articles')
          .select('view_count')
          .eq('status', 'published');

        const totalViews = (viewsData || []).reduce((sum, a) => sum + (a.view_count || 0), 0);

        setStats({
          published: pubRes.count || 0,
          drafts: draftRes.count || 0,
          inReview: reviewRes.count || 0,
          scheduled: schedRes.count || 0,
          pendingComments: commRes.count || 0,
          totalViews,
        });

        // Recent articles
        let recentQuery = supabase
          .from('articles')
          .select('id, title, status, updated_at, author:profiles(full_name)')
          .order('updated_at', { ascending: false })
          .limit(8);

        if (!hasRole(['editor', 'admin'])) {
          recentQuery = recentQuery.eq('author_id', profile?.id);
        }

        const { data: recentData } = await recentQuery;
        setRecent((recentData || []) as unknown as RecentArticle[]);
      } catch (e) {
        console.error('Failed to load stats:', e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [profile, hasRole]);

  const statCards = [
    { label: 'Published', value: stats?.published ?? '—', icon: CheckCircle2, color: 'text-green-600' },
    { label: 'Drafts', value: stats?.drafts ?? '—', icon: FileText, color: 'text-blue-600' },
    { label: 'In Review', value: stats?.inReview ?? '—', icon: Clock, color: 'text-amber-600' },
    { label: 'Scheduled', value: stats?.scheduled ?? '—', icon: Clock, color: 'text-purple-600' },
    { label: 'Pending Comments', value: stats?.pendingComments ?? '—', icon: MessageSquare, color: 'text-orange-600' },
    { label: 'Total Views', value: stats?.totalViews?.toLocaleString() ?? '—', icon: TrendingUp, color: 'text-gold' },
  ];

  const statusColors: Record<string, string> = {
    draft: 'bg-blue-100 text-blue-700',
    in_review: 'bg-amber-100 text-amber-700',
    changes_requested: 'bg-orange-100 text-orange-700',
    approved: 'bg-green-100 text-green-700',
    scheduled: 'bg-purple-100 text-purple-700',
    published: 'bg-emerald-100 text-emerald-700',
    archived: 'bg-gray-100 text-gray-700',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold">Overview</h1>
          <p className="text-muted-foreground font-sans text-sm mt-1">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'Editor'}
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

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-card border border-border rounded-sm p-5"
            >
              <Icon className={`w-5 h-5 mb-3 ${card.color}`} />
              <p className="text-2xl font-serif font-bold">
                {loading ? '…' : card.value}
              </p>
              <p className="text-xs text-muted-foreground font-sans mt-1">
                {card.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Recent activity */}
      <div className="bg-card border border-border rounded-sm">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-sans font-semibold">Recent Articles</h2>
          <Link
            href="/admin/articles"
            className="text-sm text-gold hover:text-gold/80 font-sans flex items-center gap-1"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="divide-y divide-border">
          {recent.length === 0 ? (
            <p className="px-6 py-12 text-center text-muted-foreground font-sans text-sm">
              No articles yet. Create your first article.
            </p>
          ) : (
            recent.map((article) => (
              <Link
                key={article.id}
                href={`/admin/articles/${article.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-sans text-sm font-medium truncate">
                    {article.title}
                  </p>
                  <p className="text-xs text-muted-foreground font-sans mt-0.5">
                    {article.author?.full_name || 'Unknown'} ·{' '}
                    {formatRelativeTime(article.updated_at)}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 text-xs font-sans rounded-sm capitalize flex-shrink-0 ml-4 ${
                    statusColors[article.status] || 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {article.status.replace('_', ' ')}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
