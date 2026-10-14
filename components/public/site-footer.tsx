import Link from 'next/link';
import { Twitter, Facebook, Instagram, Linkedin, Mail } from 'lucide-react';

export function SiteFooter() {
  const categories = [
    { label: 'Technology', href: '/category/technology' },
    { label: 'Entertainment', href: '/category/entertainment' },
    { label: 'Lifestyle', href: '/category/lifestyle' },
    { label: 'Business', href: '/category/business' },
    { label: 'News', href: '/category/news' },
  ];

  const pages = [
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Use', href: '/terms' },
  ];

  return (
    <footer className="bg-foreground text-background mt-20">
      <div className="container-editorial py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block">
              <span className="font-serif text-2xl font-bold tracking-tight">
                BLISS<span className="text-gold">.</span>
              </span>
              <span className="block text-xs tracking-[0.3em] uppercase text-background/60 font-sans mt-1">
                Media
              </span>
            </Link>
            <p className="mt-4 text-sm text-background/70 font-sans leading-relaxed max-w-xs">
              Stories. Perspectives. Culture. A premium digital magazine for the
              curious reader.
            </p>
            <div className="flex items-center gap-4 mt-6">
              {[Twitter, Facebook, Instagram, Linkedin, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="text-background/60 hover:text-gold transition-colors"
                  aria-label="Social media"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-sans text-xs uppercase tracking-[0.2em] text-background/50 mb-4">
              Categories
            </h4>
            <ul className="space-y-3">
              {categories.map((cat) => (
                <li key={cat.href}>
                  <Link
                    href={cat.href}
                    className="text-sm text-background/80 hover:text-gold transition-colors font-sans"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Pages */}
          <div>
            <h4 className="font-sans text-xs uppercase tracking-[0.2em] text-background/50 mb-4">
              Company
            </h4>
            <ul className="space-y-3">
              {pages.map((page) => (
                <li key={page.href}>
                  <Link
                    href={page.href}
                    className="text-sm text-background/80 hover:text-gold transition-colors font-sans"
                  >
                    {page.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter teaser */}
          <div>
            <h4 className="font-sans text-xs uppercase tracking-[0.2em] text-background/50 mb-4">
              Newsletter
            </h4>
            <p className="text-sm text-background/70 font-sans mb-4">
              The best of Bliss Media, delivered weekly.
            </p>
            <Link
              href="/#newsletter"
              className="inline-flex items-center justify-center px-5 py-2.5 bg-gold text-foreground text-sm font-sans font-semibold hover:bg-gold/90 transition-colors rounded-sm"
            >
              Subscribe
            </Link>
          </div>
        </div>

        <div className="border-t border-background/15 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-background/50 font-sans">
            © {new Date().getFullYear()} Bliss Media. All rights reserved.
          </p>
          <p className="text-xs text-background/50 font-sans">
            Stories. Perspectives. Culture.
          </p>
        </div>
      </div>
    </footer>
  );
}
