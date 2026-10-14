'use client';

import { useRouter } from 'next/navigation';
import type { Tag } from '@/lib/types';

interface CategoryFilterProps {
  tags: Tag[];
  currentTag?: string;
  currentSort: 'newest' | 'oldest';
  basePath: string;
}

export function CategoryFilter({
  tags,
  currentTag,
  currentSort,
  basePath,
}: CategoryFilterProps) {
  const router = useRouter();

  const buildUrl = (params: { tag?: string; sort?: string }) => {
    const sp = new URLSearchParams();
    if (params.tag) sp.set('tag', params.tag);
    if (params.sort && params.sort !== 'newest') sp.set('sort', params.sort);
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-border">
      {/* Tag filters */}
      <div className="flex flex-wrap items-center gap-2">
        <a
          href={basePath}
          className={`px-3 py-1.5 text-xs font-sans rounded-sm transition-colors ${
            !currentTag
              ? 'bg-foreground text-background'
              : 'bg-muted text-muted-foreground hover:bg-muted/70'
          }`}
        >
          All
        </a>
        {tags.map((tag) => (
          <a
            key={tag.id}
            href={buildUrl({ tag: tag.slug, sort: currentSort })}
            className={`px-3 py-1.5 text-xs font-sans rounded-sm transition-colors ${
              currentTag === tag.slug
                ? 'bg-foreground text-background'
                : 'bg-muted text-muted-foreground hover:bg-muted/70'
            }`}
          >
            {tag.name}
          </a>
        ))}
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-sans text-muted-foreground">Sort:</span>
        <button
          onClick={() => router.push(buildUrl({ tag: currentTag, sort: 'newest' }))}
          className={`px-3 py-1.5 text-xs font-sans rounded-sm transition-colors ${
            currentSort === 'newest'
              ? 'bg-foreground text-background'
              : 'bg-muted text-muted-foreground hover:bg-muted/70'
          }`}
        >
          Newest
        </button>
        <button
          onClick={() => router.push(buildUrl({ tag: currentTag, sort: 'oldest' }))}
          className={`px-3 py-1.5 text-xs font-sans rounded-sm transition-colors ${
            currentSort === 'oldest'
              ? 'bg-foreground text-background'
              : 'bg-muted text-muted-foreground hover:bg-muted/70'
          }`}
        >
          Oldest
        </button>
      </div>
    </div>
  );
}
