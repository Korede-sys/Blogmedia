'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, Download, Lock } from 'lucide-react';
import type { Ebook } from '@/lib/types';
import { cn } from '@/lib/utils';

interface EbookPurchaseButtonProps {
  ebook: Ebook;
  className?: string;
  variant?: 'compact' | 'full';
}

export function EbookPurchaseButton({
  ebook,
  className,
  variant = 'compact',
}: EbookPurchaseButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async () => {
    setLoading(true);
    setError(null);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/ebook-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ebookId: ebook.id,
          title: ebook.title,
          priceCents: ebook.price_cents,
          isFree: ebook.is_free,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Checkout failed' }));
        setError(err.error);
        return;
      }

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else if (data.downloadUrl) {
        window.location.href = data.downloadUrl;
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          onClick={handlePurchase}
          disabled={loading}
          className={cn(
            'inline-flex items-center gap-1.5 px-4 py-2 bg-foreground text-background text-sm font-sans font-semibold rounded-sm hover:bg-foreground/90 transition-colors disabled:opacity-50',
            className
          )}
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
          Try Again
        </button>
        <span className="text-xs text-destructive font-sans">{error}</span>
      </div>
    );
  }

  if (ebook.is_free) {
    return (
      <button
        onClick={handlePurchase}
        disabled={loading}
        className={cn(
          'inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-sans font-semibold rounded-sm hover:bg-emerald-700 transition-colors disabled:opacity-50',
          className
        )}
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
        {variant === 'full' ? 'Download Free' : 'Download'}
      </button>
    );
  }

  return (
    <button
      onClick={handlePurchase}
      disabled={loading}
      className={cn(
        'inline-flex items-center gap-1.5 px-4 py-2 bg-foreground text-background text-sm font-sans font-semibold rounded-sm hover:bg-foreground/90 transition-colors disabled:opacity-50',
        className
      )}
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
      {variant === 'full' ? 'Buy & Download' : 'Buy Now'}
    </button>
  );
}
