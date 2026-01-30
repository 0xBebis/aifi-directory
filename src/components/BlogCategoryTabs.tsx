'use client';

import { useRouter, usePathname } from 'next/navigation';
import { BlogCategory, BLOG_CATEGORY_LABELS, BLOG_CATEGORY_COLORS } from '@/types';

interface BlogCategoryTabsProps {
  activeCategory?: BlogCategory;
  counts?: Record<string, number>;
}

export default function BlogCategoryTabs({ activeCategory, counts }: BlogCategoryTabsProps) {
  const router = useRouter();
  const pathname = usePathname();

  const categories = Object.entries(BLOG_CATEGORY_LABELS) as [BlogCategory, string][];

  const isAll = !activeCategory && (pathname === '/blog' || pathname === '/blog/');

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* All tab */}
      <button
        onClick={() => router.push('/blog')}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
          isAll
            ? 'bg-accent/15 text-accent border border-accent/30'
            : 'bg-surface-2 text-text-muted border border-transparent hover:text-text-primary hover:bg-surface-3'
        }`}
      >
        All
      </button>

      {categories.map(([cat, label]) => {
        const color = BLOG_CATEGORY_COLORS[cat];
        const isActive = activeCategory === cat;
        const count = counts?.[cat];

        return (
          <button
            key={cat}
            onClick={() => router.push(`/blog/category/${cat}`)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
              isActive
                ? 'border'
                : 'bg-surface-2 text-text-muted border border-transparent hover:text-text-primary hover:bg-surface-3'
            }`}
            style={isActive ? {
              backgroundColor: `${color}15`,
              color: color,
              borderColor: `${color}30`,
            } : undefined}
          >
            {label}
            {count !== undefined && count > 0 && (
              <span className="ml-1.5 text-xs opacity-60">{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
