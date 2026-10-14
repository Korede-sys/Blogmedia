import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  href?: string;
  hrefLabel?: string;
  className?: string;
}

export function SectionHeading({
  title,
  subtitle,
  href,
  hrefLabel = 'View all',
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn('mb-8', className)}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="h-px w-6 bg-gold" />
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="text-sm text-muted-foreground font-sans ml-9">
              {subtitle}
            </p>
          )}
        </div>
        {href && (
          <Link
            href={href}
            className="group flex items-center gap-1.5 text-sm font-sans font-medium text-gold hover:text-gold/80 transition-colors whitespace-nowrap"
          >
            {hrefLabel}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
