'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import CompanyLogo from '@/components/CompanyLogo';

export interface FilteredCompanyItem {
  slug: string;
  name: string;
  tagline: string;
  logo?: string;
  funding: number;
  fundingFormatted: string;
  aiTypes: string[];
}

export interface FilterChip {
  id: string;
  label: string;
  color: string;
  count: number;
}

interface FilteredCompanyGridProps<T extends FilteredCompanyItem = FilteredCompanyItem> {
  companies: T[];
  filterChips: FilterChip[];
  filterLabel: string;
  filterHeading: string;
  directoryParam: string;
  directoryValue: string;
  totalCount: number;
  matchFn: (company: T, chipId: string) => boolean;
}

export default function FilteredCompanyGrid<T extends FilteredCompanyItem>({
  companies,
  filterChips,
  filterLabel,
  filterHeading,
  directoryParam,
  directoryValue,
  totalCount,
  matchFn,
}: FilteredCompanyGridProps<T>) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filtered = activeFilter
    ? companies.filter(c => matchFn(c, activeFilter))
    : companies;

  const fundedFiltered = filtered.filter(c => c.funding > 0);
  // When filtering, show all matching companies; default view shows funded only
  const display = activeFilter
    ? filtered
    : (fundedFiltered.length > 0 ? fundedFiltered : filtered);
  const displayCompanies = display.slice(0, 18);

  const activeLabel = activeFilter
    ? filterChips.find(chip => chip.id === activeFilter)?.label
    : null;

  return (
    <>
      {/* Filter Chips */}
      {filterChips.length > 0 && (
        <section className="mb-10">
          <div className="mb-5">
            <p className="label-refined text-accent mb-2">{filterLabel}</p>
            <div className="flex items-center gap-6">
              <h2 className="headline-sub whitespace-nowrap">{filterHeading}</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-border/50 to-transparent" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {filterChips.map(chip => {
              const isActive = activeFilter === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => setActiveFilter(isActive ? null : chip.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all text-sm ${
                    isActive
                      ? 'border-accent/30 bg-accent/10'
                      : 'bg-surface border-border/40 card-hover-glow hover:bg-surface-2/50'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: chip.color }} />
                  <span className={`font-medium ${isActive ? 'text-accent' : 'text-text-secondary'}`}>
                    {chip.label}
                  </span>
                  <span className={`font-medium tabular-nums ${isActive ? 'text-accent' : 'text-text-faint'}`}>
                    {chip.count}
                  </span>
                </button>
              );
            })}
            {activeFilter && (
              <button
                onClick={() => setActiveFilter(null)}
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
              href={`/directory?${directoryParam}=${directoryValue}`}
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
              href={`/directory?${directoryParam}=${directoryValue}`}
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
