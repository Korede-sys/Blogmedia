'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Search, Menu, X, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/public/theme-toggle';

interface NavLink {
  label: string;
  href: string;
}

const CATEGORIES: NavLink[] = [
  { label: 'Technology', href: '/category/technology' },
  { label: 'Entertainment', href: '/category/entertainment' },
  { label: 'Lifestyle', href: '/category/lifestyle' },
  { label: 'Business', href: '/category/business' },
  { label: 'News', href: '/category/news' },
];

const STATIC_LINKS: NavLink[] = [
  { label: 'Ebooks', href: '/ebooks' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 w-full transition-all duration-300',
          scrolled
            ? 'bg-background/80 backdrop-blur-xl border-b border-border/60 shadow-sm'
            : 'bg-background/95 backdrop-blur-sm border-b border-border/40'
        )}
      >
        {/* Top bar */}
        <div className="border-b border-border/30 hidden md:block">
          <div className="container-editorial flex items-center justify-between py-2">
            <p className="text-[0.6875rem] text-muted-foreground font-sans tracking-wide">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <div className="flex items-center gap-4">
              <p className="text-[0.6875rem] text-muted-foreground font-sans tracking-wide">
                Stories. Perspectives. Culture.
              </p>
              <Link
                href="/auth/sign-in"
                className="flex items-center gap-1.5 text-[0.6875rem] font-sans font-medium text-foreground/70 hover:text-gold transition-colors"
              >
                <LogIn className="w-3 h-3" />
                Admin Login
              </Link>
            </div>
          </div>
        </div>

        {/* Main header */}
        <div className="container-editorial">
          <div className="flex items-center justify-between py-5 md:py-7">
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 -ml-2 text-foreground hover:text-gold transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex-1 flex justify-center md:flex-none md:justify-start md:mr-auto">
              <img
                src="/logo-dark.png"
                alt="Bliss Media"
                className="h-8 md:h-9 w-auto dark:hidden"
              />
              <img
                src="/logo-white.png"
                alt="Bliss Media"
                className="h-8 md:h-9 w-auto hidden dark:block"
              />
            </Link>

            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-1.5 md:ml-auto">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-foreground/80 hover:text-foreground hover:bg-secondary transition-all duration-200"
                aria-label="Search"
              >
                <Search className="w-[18px] h-[18px]" />
              </button>
              <ThemeToggle />
            </div>

            {/* Mobile search + theme */}
            <div className="md:hidden flex items-center gap-1">
              <button
                className="p-2 text-foreground hover:text-gold transition-colors"
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:block border-t border-border/40">
          <div className="container-editorial">
            <ul className="flex items-center justify-center gap-10 py-3.5">
              {CATEGORIES.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[0.8125rem] font-sans font-medium text-foreground/75 hover:text-gold transition-colors duration-200 link-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <span className="w-px h-3.5 bg-border/60" />
              {STATIC_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[0.8125rem] font-sans font-medium text-foreground/75 hover:text-gold transition-colors duration-200 link-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Search bar expand */}
        {searchOpen && (
          <div className="border-t border-border bg-background/95 backdrop-blur-sm animate-fade-in">
            <div className="container-editorial py-5">
              <form onSubmit={handleSearch} className="flex items-center gap-3">
                <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles, topics, authors…"
                  className="flex-1 bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground font-sans text-lg"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        )}
      </header>

      {/* Mobile menu drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-foreground/30 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-background shadow-xl overflow-y-auto" style={{ animation: 'slideInRight 0.3s ease-out' }}>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <img src="/logo-dark.png" alt="Bliss Media" className="h-7 w-auto dark:hidden" />
              <img src="/logo-white.png" alt="Bliss Media" className="h-7 w-auto hidden dark:block" />
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 text-foreground hover:bg-secondary rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-4">
              <ul className="space-y-1">
                {CATEGORIES.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="block py-3 px-3 text-foreground hover:bg-secondary rounded-md font-sans font-medium transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li className="border-t border-border my-3" />
                {STATIC_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="block py-3 px-3 text-foreground hover:bg-secondary rounded-md font-sans font-medium transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li className="border-t border-border my-3" />
                <li>
                  <Link
                    href="/auth/sign-in"
                    className="flex items-center gap-2 py-3 px-3 text-foreground hover:bg-secondary rounded-md font-sans font-medium transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    <LogIn className="w-4 h-4" />
                    Admin Login
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
