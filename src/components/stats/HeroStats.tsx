'use client';

import { useState, useEffect } from 'react';
import AnimatedCounter from './AnimatedCounter';
import { InsightCard } from './types';

interface HeroStatsProps {
  stats: {
    totalCompanies: number;
    totalFunding: number;
    totalFundingFormatted: string;
    countryCount: number;
    agentCount: number;
  };
  insights: InsightCard[];
}

export default function HeroStats({ stats, insights }: HeroStatsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const secondaryStats = [
    { label: 'Companies', value: stats.totalCompanies },
    { label: 'Countries', value: stats.countryCount },
    { label: 'AI Agents', value: stats.agentCount },
  ];

  return (
    <div className="space-y-6">
      {/* Hero funding card — full width, dramatic */}
      <div
        className={`relative overflow-hidden bg-surface border border-border/50 rounded-2xl p-8 sm:p-10 card-hover-glow transition-all duration-700 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="absolute inset-0 bg-glow-center opacity-40" />
        <div className="relative z-10">
          <div className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
            Total Capital Tracked
          </div>
          <div className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tighter text-gradient">
            {stats.totalFundingFormatted}
          </div>
          <div className="text-sm text-text-muted mt-2">
            across {stats.totalCompanies.toLocaleString()} companies
          </div>
        </div>
      </div>

      {/* Secondary stat cards — 3 columns */}
      <div className="grid grid-cols-3 gap-4">
        {secondaryStats.map((item, i) => (
          <div
            key={item.label}
            className={`relative overflow-hidden bg-surface border border-border/50 rounded-xl p-6 card-hover-glow transition-all duration-500 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            }`}
            style={{ transitionDelay: `${200 + i * 100}ms` }}
          >
            <div className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
              <AnimatedCounter value={item.value} />
            </div>
            <div className="text-xs text-text-muted mt-2 font-semibold uppercase tracking-widest">
              {item.label}
            </div>
            <div className="absolute bottom-0 left-6 right-6 h-[2px] rounded-full bg-accent/20" />
          </div>
        ))}
      </div>

      {/* Insight callouts — 4 narrative cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {insights.map((card, i) => (
          <div
            key={i}
            className={`bg-surface border border-border/30 rounded-xl px-5 py-4 card-hover-glow transition-all duration-500 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
            style={{ transitionDelay: `${500 + i * 80}ms` }}
          >
            <div className="text-2xl font-bold text-gradient tabular-nums mb-1">{card.value}</div>
            <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">{card.label}</div>
            <p className="text-xs text-text-faint leading-relaxed">{card.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
