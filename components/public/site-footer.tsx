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
    <footer className="bg-foreground text-background mt-24">
      <div className="container-editorial py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block">
              <span className="font-serif text-2xl font-bold tracking-tight">
                BLISS<span className="text-gold">.</span>
              </span>
              <span className="block text-[0.6875rem] tracking-[0.32em] uppercase text-background/50 font-sans mt-1">
                Media
              </span>
            </Link>
            <p className="mt-5 text-sm text-background/65 font-sans leading-relaxed max-w-xs">
              Stories. Perspectives. Culture. A premium digital magazine for the
              curious reader.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[Twitter, Facebook, Instagram, Linkedin, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full bg-background/10 flex items-center justify-center text-background/55 hover:bg-gold hover:text-foreground transition-all duration-200"
                  aria-label="Social media"
                >
                  <Icon className="w-[15px] h-[15px]" />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-sans text-[0.6875rem] uppercase tracking-[0.2em] text-background/45 mb-5 font-bold">
              Categories
            </h4>
            <ul className="space-y-3">
              {categories.map((cat) => (
                <li key={cat.href}>
                  <Link
                    href={cat.href}
                    className="text-sm text-background/75 hover:text-gold transition-colors font-sans"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Pages */}
          <div>
            <h4 className="font-sans text-[0.6875rem] uppercase tracking-[0.2em] text-background/45 mb-5 font-bold">
              Company
            </h4>
            <ul className="space-y-3">
              {pages.map((page) => (
                <li key={page.href}>
                  <Link
                    href={page.href}
                    className="text-sm text-background/75 hover:text-gold transition-colors font-sans"
                  >
                    {page.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter teaser */}
          <div>
            <h4 className="font-sans text-[0.6875rem] uppercase tracking-[0.2em] text-background/45 mb-5 font-bold">
              Newsletter
            </h4>
            <p className="text-sm text-background/65 font-sans mb-5 leading-relaxed">
              The best of Bliss Media, delivered weekly.
            </p>
            <Link
              href="/#newsletter"
              className="inline-flex items-center justify-center px-5 py-2.5 bg-gold text-foreground text-sm font-sans font-semibold hover:bg-gold/90 transition-all rounded-md"
            >
              Subscribe
            </Link>
          </div>
        </div>

        <div className="border-t border-background/10 mt-14 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-background/45 font-sans">
            © {new Date().getFullYear()} Bliss Media. All rights reserved.
          </p>
          <p className="text-xs text-background/45 font-sans tracking-wider uppercase">
            Stories. Perspectives. Culture.
          </p>
        </div>
      </div>
    </footer>
  );
}