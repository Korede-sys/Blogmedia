import Link from 'next/link';
import { SiteHeader } from '@/components/public/site-header';
import { SiteFooter } from '@/components/public/site-footer';
import { ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <section className="container-editorial py-24 text-center">
        <div className="max-w-lg mx-auto">
          <p className="font-serif text-8xl md:text-9xl font-bold text-gold leading-none">
            404
          </p>
          <h1 className="mt-6 font-serif text-3xl md:text-4xl font-bold">
            Page Not Found
          </h1>
          <p className="mt-4 text-muted-foreground font-sans text-lg leading-relaxed">
            The page you are looking for may have been moved, deleted, or never
            existed. Let us help you find your way back.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background text-sm font-sans font-semibold rounded-sm hover:bg-foreground/90 transition-colors"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-6 py-3 border border-border text-sm font-sans font-semibold rounded-sm hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Search Articles
            </Link>
          </div>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
