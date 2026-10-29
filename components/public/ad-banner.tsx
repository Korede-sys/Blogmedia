'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import type { AdSlot, AdPlacement } from '@/lib/types';

interface AdBannerProps {
  placement: AdPlacement;
  className?: string;
}

export function AdBanner({ placement, className }: AdBannerProps) {
  const [ad, setAd] = useState<AdSlot | null>(null);

  useEffect(() => {
    let active = true;
    supabase
      .from('ad_slots')
      .select('*')
      .eq('placement', placement)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setAd(data as AdSlot | null);
      });
    return () => {
      active = false;
    };
  }, [placement]);

  if (!ad) return null;

  return (
    <div className={`container-editorial py-4 ${className || ''}`}>
      <a
        href={ad.link_url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="block"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ad.image_url}
          alt={ad.alt_text || 'Advertisement'}
          className="w-full h-auto rounded-sm border border-border/40 mx-auto"
        />
      </a>
      <p className="text-center text-[0.625rem] uppercase tracking-widest text-muted-foreground/60 font-sans mt-1.5">
        Advertisement
      </p>
    </div>
  );
}
