import { cn } from '@/lib/utils';

export function TrendingNumber({ number }: { number: number }) {
  return (
    <span
      className={cn(
        'font-serif text-3xl font-bold leading-none flex-shrink-0 w-8',
        number === 1 ? 'text-gold' : 'text-muted-foreground/40'
      )}
    >
      {number}
    </span>
  );
}
