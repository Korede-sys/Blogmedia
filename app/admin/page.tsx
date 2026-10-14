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
import { cn } from '@/lib/utils';

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
    { label: 'Published', value: stats?.published ?? '—', icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Drafts', value: stats?.drafts ?? '—', icon: FileText, color: 'text-info', bg: 'bg-info/10' },
    { label: 'In Review', value: stats?.inReview ?? '—', icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Scheduled', value: stats?.scheduled ?? '—', icon: Clock, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Pending Comments', value: stats?.pendingComments ?? '—', icon: MessageSquare, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Total Views', value: stats?.totalViews?.toLocaleString() ?? '—', icon: TrendingUp, color: 'text-gold', bg: 'bg-gold/10' },
  ];

  const statusColors: Record<string, string> = {
    draft: 'bg-info/15 text-info',
    in_review: 'bg-warning/15 text-warning',
    changes_requested: 'bg-destructive/15 text-destructive',
    approved: 'bg-success/15 text-success',
    scheduled: 'bg-accent/15 text-accent',
    published: 'bg-success/15 text-success',
    archived: 'bg-muted text-muted-foreground',
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
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-foreground text-background text-sm font-sans font-semibold rounded-md hover:bg-foreground/90 transition-colors"
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
              className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center mb-3', card.bg)}>
                <Icon className={cn('w-[18px] h-[18px]', card.color)} />
              </div>
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
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-sans font-semibold text-base">Recent Articles</h2>
          <Link
            href="/admin/articles"
            className="text-sm text-gold hover:text-gold/80 font-sans flex items-center gap-1 font-medium"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
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
                className="flex items-center justify-between px-6 py-4 hover:bg-secondary/40 transition-colors"
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
                  className={cn(
                    'px-2.5 py-1 text-xs font-sans rounded-md capitalize flex-shrink-0 ml-4 font-medium',
                    statusColors[article.status] || 'bg-muted text-muted-foreground'
                  )}
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