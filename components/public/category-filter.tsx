'use client';

import { useRouter } from 'next/navigation';
import type { Tag } from '@/lib/types';
import { cn } from '@/lib/utils';

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

  const filterClass = (active: boolean) =>
    cn(
      'px-3.5 py-1.5 text-xs font-sans rounded-md transition-all duration-200 font-medium',
      active
        ? 'bg-foreground text-background'
        : 'bg-secondary text-muted-foreground hover:bg-secondary/70 hover:text-foreground'
    );

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 pb-8 border-b border-border">
      {/* Tag filters */}
      <div className="flex flex-wrap items-center gap-2">
        <a href={basePath} className={filterClass(!currentTag)}>
          All
        </a>
        {tags.map((tag) => (
          <a
            key={tag.id}
            href={buildUrl({ tag: tag.slug, sort: currentSort })}
            className={filterClass(currentTag === tag.slug)}
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
          className={filterClass(currentSort === 'newest')}
        >
          Newest
        </button>
        <button
          onClick={() => router.push(buildUrl({ tag: currentTag, sort: 'oldest' }))}
          className={filterClass(currentSort === 'oldest')}
        >
          Oldest
        </button>
      </div>
    </div>
  );
}