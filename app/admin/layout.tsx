'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard,
  FileText,
  Image as ImageIcon,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Database,
  BookOpen,
  Megaphone,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/public/theme-toggle';

const NAV_ITEMS = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Articles', href: '/admin/articles', icon: FileText },
  { label: 'Ebooks', href: '/admin/ebooks', icon: BookOpen },
  { label: 'Media', href: '/admin/media', icon: ImageIcon },
  { label: 'Ads', href: '/admin/ads', icon: Megaphone, adminOnly: true },
  { label: 'Users', href: '/admin/users', icon: Users, adminOnly: true },
  { label: 'Settings', href: '/admin/settings', icon: Settings, adminOnly: true },
  { label: 'Seed Content', href: '/admin/seed', icon: Database, adminOnly: true },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading, signOut, hasRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/sign-in');
      } else if (!profile) {
        // Profile not loaded yet, wait
      } else if (!hasRole(['author', 'editor', 'admin'])) {
        router.push('/');
      } else {
        setAuthChecked(true);
      }
    }
  }, [user, profile, loading, router, hasRole]);

  if (loading || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-sm text-muted-foreground font-sans">
            Loading dashboard…
          </p>
        </div>
      </div>
    );
  }

  const filteredNav = NAV_ITEMS.filter(
    (item) => !item.adminOnly || hasRole('admin')
  );

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-foreground text-background fixed inset-y-0 left-0 z-30">
        <div className="p-6 border-b border-background/10">
          <Link href="/admin" className="block">
            <span className="font-serif text-xl font-bold">
              BLISS<span className="text-gold">.</span>
            </span>
            <span className="block text-[0.6875rem] tracking-[0.2em] uppercase text-background/50 font-sans mt-0.5">
              Dashboard
            </span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-sans transition-all duration-200',
                  active
                    ? 'bg-gold text-foreground font-semibold shadow-sm'
                    : 'text-background/70 hover:text-background hover:bg-background/10'
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-background/10 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-sans text-background/70 hover:text-background hover:bg-background/10 transition-all duration-200"
          >
            <ExternalLink className="w-4 h-4" />
            View Site
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-sans text-background/70 hover:text-background hover:bg-background/10 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-foreground text-background">
            <div className="p-6 border-b border-background/10 flex items-center justify-between">
              <span className="font-serif text-xl font-bold">
                BLISS<span className="text-gold">.</span>
              </span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-background/70 hover:text-background"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              {filteredNav.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-sans transition-all duration-200',
                      active
                        ? 'bg-gold text-foreground font-semibold'
                        : 'text-background/70 hover:text-background hover:bg-background/10'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href="/"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-sans text-background/70 hover:text-background hover:bg-background/10"
              >
                <ExternalLink className="w-4 h-4" />
                View Site
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-sans text-background/70 hover:text-background hover:bg-background/10"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </nav>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 md:ml-64 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border px-4 md:px-8 py-4 flex items-center justify-between">
          <button
            className="md:hidden p-2 -ml-2 text-foreground hover:bg-secondary rounded-md transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <ThemeToggle />
            <div className="w-px h-6 bg-border" />
            <div className="text-right hidden sm:block">
              <p className="text-sm font-sans font-medium text-foreground">
                {profile?.full_name || 'User'}
              </p>
              <p className="text-xs text-muted-foreground font-sans capitalize">
                {profile?.role}
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center">
              <span className="font-serif text-sm font-bold text-gold">
                {(profile?.full_name || '?').charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
