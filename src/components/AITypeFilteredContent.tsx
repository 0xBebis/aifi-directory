'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import CompanyLogo from '@/components/CompanyLogo';

export interface CompanyItem {
  slug: string;
  name: string;
  tagline: string;
  logo?: string;
  funding: number;
  fundingFormatted: string;
  aiTypes: string[];
  segment: string;
  segments: string[];
}

export interface SegmentChip {
  slug: string;
  name: string;
  color: string;
  count: number;
}

interface AITypeFilteredContentProps {
  companies: CompanyItem[];
  segmentCounts: SegmentChip[];
  aiTypeSlug: string;
  totalCount: number;
}

export default function AITypeFilteredContent({
  companies,
  segmentCounts,
  aiTypeSlug,
  totalCount,
}: AITypeFilteredContentProps) {
  const [activeSegment, setActiveSegment] = useState<string | null>(null);

  const filtered = activeSegment
    ? companies.filter(c => c.segment === activeSegment || c.segments.includes(activeSegment))
    : companies;

  const fundedFiltered = filtered.filter(c => c.funding > 0);
  // When filtering by segment, show all matching companies; default view shows funded only
  const display = activeSegment
    ? filtered
    : (fundedFiltered.length > 0 ? fundedFiltered : filtered);
  const displayCompanies = display.slice(0, 18);

  const activeLabel = activeSegment
    ? segmentCounts.find(s => s.slug === activeSegment)?.name
    : null;

  return (
    <>
      {/* Segment Filter */}
      {segmentCounts.length > 0 && (
        <section className="mb-10">
          <div className="mb-5">
            <p className="label-refined text-accent mb-2">Segments</p>
            <div className="flex items-center gap-6">
              <h2 className="headline-sub whitespace-nowrap">Market Segments</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-border/50 to-transparent" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {segmentCounts.map(s => {
              const isActive = activeSegment === s.slug;
              return (
                <button
                  key={s.slug}
                  onClick={() => setActiveSegment(isActive ? null : s.slug)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all text-sm ${
                    isActive
                      ? 'border-accent/30 bg-accent/10'
                      : 'bg-surface border-border/40 card-hover-glow hover:bg-surface-2/50'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                  <span className={`font-medium ${isActive ? 'text-accent' : 'text-text-secondary'}`}>
                    {s.name}
                  </span>
                  <span className={`font-medium tabular-nums ${isActive ? 'text-accent' : 'text-text-faint'}`}>
                    {s.count}
                  </span>
                </button>
              );
            })}
            {activeSegment && (
              <button
                onClick={() => setActiveSegment(null)}
                className="inline-flex items-center px-3 py-2 rounded-xl text-sm text-text-muted hover:text-text-primary transition-colors"
              >
                Clear filter
              </button>
            )}
          </div>
        </section>
      )}

      {/* Companies */}
      <section className="mb-10">
        <div className="mb-5">
          <p className="label-refined text-accent mb-2">Directory</p>
          <div className="flex items-center gap-6">
            <h2 className="headline-sub whitespace-nowrap">
              {activeLabel
                ? `${activeLabel} Companies`
                : fundedFiltered.length > 0 ? 'Top Companies by Funding' : 'All Companies'}
            </h2>
            <span className="text-sm text-text-faint tabular-nums">{filtered.length}</span>
            <div className="flex-1 h-px bg-gradient-to-r from-border/50 to-transparent" />
            <Link
              href={`/directory?aiType=${aiTypeSlug}`}
              className="group text-sm text-accent hover:text-accent-hover font-semibold transition-colors inline-flex items-center gap-1 shrink-0"
            >
              View in directory
              <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayCompanies.map(p => (
            <Link
              key={p.slug}
              href={`/p/${p.slug}`}
              className="group bg-surface border border-border/40 rounded-xl p-4 card-hover-glow transition-all"
            >
              <div className="flex items-start gap-3">
                <CompanyLogo project={{ name: p.name, logo: p.logo, ai_types: p.aiTypes } as any} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-text-primary group-hover:text-accent transition-colors truncate">{p.name}</p>
                  <p className="text-xs text-text-muted mt-0.5 line-clamp-2 leading-relaxed">{p.tagline}</p>
                </div>
              </div>
              {p.funding > 0 && (
                <div className="mt-3 text-xs font-medium text-text-faint tabular-nums">{p.fundingFormatted} raised</div>
              )}
            </Link>
          ))}
        </div>
        {filtered.length > 18 && (
          <div className="mt-5 text-center">
            <Link
              href={`/directory?aiType=${aiTypeSlug}`}
              className="group text-sm text-accent hover:text-accent-hover font-semibold transition-colors inline-flex items-center gap-1"
            >
              View all {filtered.length} companies
              <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
