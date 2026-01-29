'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CompanyLogo from '@/components/CompanyLogo';
import { TopFundedItem, FundingStageChip } from './types';

interface FundingLandscapeProps {
  topFunded: TopFundedItem[];
  stageChips: FundingStageChip[];
}

export default function FundingLandscape({ topFunded, stageChips }: FundingLandscapeProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const maxFunding = topFunded.length > 0 ? topFunded[0].funding : 1;

  return (
    <div className="space-y-8">
      {/* Top 10 Most Funded */}
      <div className="bg-surface border border-border/30 rounded-xl px-6 py-5">
        <div className="space-y-1">
          {topFunded.slice(0, 10).map((item, i) => (
            <Link
              key={item.slug}
              href={`/p/${item.slug}`}
              className={`group flex items-center gap-4 py-3 px-4 -mx-4 rounded-xl hover:bg-surface-2/40 transition-all duration-300 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              }`}
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              {/* Rank */}
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 tabular-nums ${
                i < 3
                  ? 'bg-accent/15 text-accent border border-accent/20'
                  : 'text-text-faint'
              }`}>
                {i + 1}
              </span>

              {/* Logo */}
              <CompanyLogo
                project={{ name: item.name, logo: item.logo } as any}
                size="sm"
              />

              {/* Name */}
              <span className="w-28 sm:w-40 shrink-0 text-sm font-semibold text-text-primary group-hover:text-accent transition-colors truncate">
                {item.name}
              </span>

              {/* Segment badge */}
              <span
                className="hidden sm:inline-flex text-2xs px-2.5 py-0.5 rounded-full font-semibold shrink-0"
                style={{
                  backgroundColor: `${item.segmentColor}15`,
                  color: item.segmentColor,
                  border: `1px solid ${item.segmentColor}20`,
                }}
              >
                {item.segmentName}
              </span>

              {/* Funding bar */}
              <div className="flex-1 h-2.5 rounded-full bg-surface-3/50 overflow-hidden mx-2">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: mounted ? `${(item.funding / maxFunding) * 100}%` : '0%',
                    background: 'linear-gradient(90deg, rgba(13, 148, 136, 0.8), rgba(20, 184, 166, 0.9))',
                  }}
                />
              </div>

              {/* Amount */}
              <span className="text-sm font-bold text-text-primary tabular-nums shrink-0 w-20 text-right">
                {item.fundingFormatted}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Funding Stage Chips */}
      <div>
        <h3 className="label-refined mb-4">By Funding Stage</h3>
        <div className="flex flex-wrap gap-3">
          {stageChips.map(chip => (
            <div
              key={chip.stage}
              className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-surface border border-border/40 rounded-xl card-hover-glow"
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: chip.color }}
              />
              <span className="text-sm text-text-secondary font-semibold">{chip.label}</span>
              <span className="text-sm text-text-faint tabular-nums font-medium">{chip.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
