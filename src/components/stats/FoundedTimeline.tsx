'use client';

import { useState, useEffect } from 'react';
import { YearItem, PairingItem } from './types';

interface FoundedTimelineProps {
  years: YearItem[];
  pairings: PairingItem[];
}

export default function FoundedTimeline({ years, pairings }: FoundedTimelineProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const maxFunding = Math.max(...years.map(y => y.funding));
  const top5 = pairings.slice(0, 5);

  // Index of the peak year
  const peakIndex = years.reduce((maxI, y, i, arr) => y.funding > arr[maxI].funding ? i : maxI, 0);

  // Compute nice round tick values for the X-axis
  const niceAxisMax = (max: number): { ceiling: number; ticks: number[] } => {
    if (max <= 0) return { ceiling: 1, ticks: [0] };
    const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
    const normalized = max / magnitude;
    let ceil: number;
    if (normalized <= 1) ceil = 1;
    else if (normalized <= 2) ceil = 2;
    else if (normalized <= 5) ceil = 5;
    else ceil = 10;
    const ceiling = ceil * magnitude;
    const step = ceiling / 4;
    const ticks = [0, step, step * 2, step * 3, ceiling];
    return { ceiling, ticks };
  };

  const { ceiling, ticks } = niceAxisMax(maxFunding);

  const formatAxis = (value: number): string => {
    if (value === 0) return '$0';
    if (value >= 1e9) return `$${+(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${+(value / 1e6).toFixed(0)}M`;
    return `$${value}`;
  };

  return (
    <div className="space-y-8">
      {/* Funding by year — horizontal bar chart */}
      <div className="bg-surface border border-border/30 rounded-xl p-6">
        <h3 className="label-refined mb-5">Funding By Year</h3>
        <div className="space-y-1.5">
          {years.map((item, i) => {
            const isPeak = i === peakIndex;
            return (
              <div key={i} className="flex items-center gap-3 group">
                {/* Y-axis: year label */}
                <span className={`w-10 shrink-0 text-xs font-semibold tabular-nums text-right ${
                  isPeak ? 'text-accent' : 'text-text-secondary'
                }`}>
                  {item.label}
                </span>
                {/* Bar area */}
                <div className="flex-1 relative h-7">
                  {/* Gridlines — rendered once on first row */}
                  {i === 0 && ticks.map((tick, ti) => (
                    <div
                      key={ti}
                      className="absolute top-0 h-full border-l border-border/20"
                      style={{ left: `${(tick / ceiling) * 100}%` }}
                    />
                  ))}
                  <div
                    className={`absolute inset-y-0.5 left-0 rounded-r transition-all duration-700 ease-out ${
                      isPeak
                        ? 'bg-gradient-to-r from-accent to-teal-400'
                        : 'bg-accent/60 group-hover:bg-accent/80'
                    }`}
                    style={{
                      width: mounted ? `${ceiling > 0 ? (item.funding / ceiling) * 100 : 0}%` : '0%',
                      transitionDelay: `${i * 40}ms`,
                      boxShadow: isPeak ? '0 0 12px rgba(13, 148, 136, 0.4)' : undefined,
                    }}
                  />
                </div>
                {/* Funding label */}
                <span className={`w-16 shrink-0 text-xs tabular-nums text-right ${
                  isPeak ? 'font-bold text-accent' : 'font-bold text-text-primary'
                }`}>
                  {item.fundingFormatted}
                </span>
              </div>
            );
          })}
        </div>
        {/* X-axis tick labels */}
        <div className="flex items-center gap-3 mt-1">
          <span className="w-10 shrink-0" />
          <div className="flex-1 relative h-5 border-t border-border/30">
            {ticks.map((tick, i) => (
              <span
                key={i}
                className="absolute top-1 text-2xs font-medium text-text-faint tabular-nums -translate-x-1/2"
                style={{ left: `${(tick / ceiling) * 100}%` }}
              >
                {formatAxis(tick)}
              </span>
            ))}
          </div>
          <span className="w-16 shrink-0" />
        </div>
      </div>

      {/* Top 5 segment + AI pairings */}
      <div>
        <h3 className="label-refined mb-4">Top Segment + AI Combinations</h3>
        <div className="flex flex-wrap gap-3">
          {top5.map((item, i) => (
            <div
              key={i}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface border border-border/40 rounded-xl card-hover-glow"
            >
              <span
                className="text-xs px-2 py-0.5 rounded-md font-semibold"
                style={{
                  backgroundColor: `${item.segmentColor}15`,
                  color: item.segmentColor,
                }}
              >
                {item.segmentName}
              </span>
              <span className="text-text-faint text-xs">+</span>
              <span
                className="text-xs px-2 py-0.5 rounded-md font-semibold"
                style={{
                  backgroundColor: `${item.aiTypeColor}15`,
                  color: item.aiTypeColor,
                }}
              >
                {item.aiTypeLabel}
              </span>
              <span className="text-sm font-bold text-text-primary tabular-nums ml-1">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
