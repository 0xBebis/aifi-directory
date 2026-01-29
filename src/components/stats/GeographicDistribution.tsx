'use client';

import { useState, useEffect } from 'react';
import { CountryItem, RegionSummaryItem, CompanyTypeItem } from './types';

interface GeographicDistributionProps {
  countries: CountryItem[];
  regions: RegionSummaryItem[];
  companyTypes: CompanyTypeItem[];
  activeCount: number;
  defunctCount: number;
}

export default function GeographicDistribution({
  countries,
  regions,
  companyTypes,
  activeCount,
  defunctCount,
}: GeographicDistributionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const top8 = countries.slice(0, 8);
  const maxCount = top8.length > 0 ? top8[0].count : 1;

  return (
    <div className="bg-surface border border-border/30 rounded-xl p-6 space-y-8">
      {/* Two-column: countries + regions */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
        {/* Left — Top 8 Countries */}
        <div>
          <h3 className="label-refined mb-5">Top Countries</h3>
          <div className="space-y-1.5">
            {top8.map((country, i) => (
              <div
                key={country.code}
                className={`flex items-center gap-3 py-2 px-3 -mx-3 rounded-lg hover:bg-surface-2/30 transition-all duration-300 ${
                  mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
                }`}
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                <span className="text-lg w-7 text-center shrink-0">{country.flag}</span>
                <span className="w-32 shrink-0 text-sm font-medium text-text-secondary truncate">
                  {country.name}
                </span>
                <div className="flex-1 h-2.5 rounded-full bg-surface-3/50 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-accent transition-all duration-700 ease-out"
                    style={{
                      width: mounted ? `${(country.count / maxCount) * 100}%` : '0%',
                      boxShadow: '0 0 8px rgba(13, 148, 136, 0.3)',
                    }}
                  />
                </div>
                <span className="text-sm font-semibold text-text-primary tabular-nums w-8 text-right shrink-0">
                  {country.count}
                </span>
                <span className="text-xs text-text-faint tabular-nums w-10 text-right shrink-0">
                  {country.pctOfTotal}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Region Summary */}
        <div>
          <h3 className="label-refined mb-5">By Region</h3>
          <div className="space-y-3">
            {regions.map((region, i) => (
              <div
                key={region.region}
                className={`bg-surface-2/30 border border-border/40 rounded-xl p-5 card-hover-glow transition-all duration-500 ${
                  mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                }`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="label-refined mb-2">
                  {region.label}
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-bold text-text-primary tabular-nums">
                    {region.count}
                  </span>
                  <span className="text-sm text-accent font-medium">
                    {region.fundingFormatted}
                  </span>
                </div>
                <div className="text-xs text-text-faint mt-1">
                  {region.pctOfTotal}% of directory
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Company profile row — type pills + status */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-4 border-t border-border/20">
        <div className="flex flex-wrap items-center gap-2.5">
          {companyTypes.map(type => (
            <span
              key={type.type}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-surface border border-border/40 rounded-lg text-sm card-hover-glow"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: type.color }}
              />
              <span className="text-text-secondary font-medium">{type.label}</span>
              <span className="text-text-faint tabular-nums font-medium">{type.count}</span>
            </span>
          ))}
        </div>

        <span className="hidden sm:block w-px h-5 bg-border/40" />

        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-positive" />
            <span className="text-text-secondary font-medium">{activeCount} active</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-negative" />
            <span className="text-text-secondary font-medium">{defunctCount} defunct</span>
          </span>
        </div>
      </div>
    </div>
  );
}
