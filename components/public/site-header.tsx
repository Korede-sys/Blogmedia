'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Search, Menu, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    window.addEventListener('scroll', onScroll);
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
            ? 'bg-background/95 backdrop-blur-sm border-b border-border shadow-sm'
            : 'bg-background border-b border-border/50'
        )}
      >
        {/* Top bar */}
        <div className="border-b border-border/40 hidden md:block">
          <div className="container-editorial flex items-center justify-between py-2">
            <p className="text-xs text-muted-foreground font-sans tracking-wide">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="text-xs text-muted-foreground hover:text-gold transition-colors font-sans"
              >
                Dashboard
              </Link>
              <Link
                href="/auth/sign-in"
                className="text-xs text-muted-foreground hover:text-gold transition-colors font-sans"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Main header */}
        <div className="container-editorial">
          <div className="flex items-center justify-between py-4 md:py-6">
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 -ml-2 text-foreground"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex-1 text-center md:flex-none">
              <span className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                BLISS<span className="text-gold">.</span>
              </span>
              <span className="block text-[0.625rem] md:text-xs tracking-[0.3em] uppercase text-muted-foreground font-sans mt-0.5">
                Media
              </span>
            </Link>

            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-foreground hover:text-gold transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile search */}
            <button
              className="md:hidden p-2 -mr-2 text-foreground"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:block border-t border-border/60">
          <div className="container-editorial">
            <ul className="flex items-center justify-center gap-8 py-3">
              {CATEGORIES.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-sans font-medium text-foreground/80 hover:text-gold transition-colors link-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {STATIC_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-sans font-medium text-foreground/80 hover:text-gold transition-colors link-gold"
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
          <div className="border-t border-border bg-background animate-fade-in">
            <div className="container-editorial py-4">
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
                  className="p-1 text-muted-foreground hover:text-foreground"
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
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-background shadow-xl animate-slide-in-right overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="font-serif text-xl font-bold">
                BLISS<span className="text-gold">.</span>
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 text-foreground"
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
                      className="block py-3 px-3 text-foreground hover:bg-muted rounded-sm font-sans font-medium transition-colors"
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
                      className="block py-3 px-3 text-foreground hover:bg-muted rounded-sm font-sans font-medium transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li className="border-t border-border my-3" />
                <li>
                  <Link
                    href="/admin"
                    className="block py-3 px-3 text-muted-foreground hover:bg-muted rounded-sm font-sans text-sm transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auth/sign-in"
                    className="block py-3 px-3 text-muted-foreground hover:bg-muted rounded-sm font-sans text-sm transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    Sign In
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
