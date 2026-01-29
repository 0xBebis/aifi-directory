'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BreakdownItem, AITypeBreakdownItem } from './types';

interface MarketBreakdownProps {
  segments: BreakdownItem[];
  layers: BreakdownItem[];
  aiTypes: AITypeBreakdownItem[];
}

type Tab = 'segments' | 'layers' | 'aiTypes';

export default function MarketBreakdown({ segments, layers, aiTypes }: MarketBreakdownProps) {
  const [activeTab, setActiveTab] = useState<Tab>('segments');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMounted(false);
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'segments', label: 'Segments' },
    { key: 'layers', label: 'Layers' },
    { key: 'aiTypes', label: 'AI Technologies' },
  ];

  const activeData = activeTab === 'segments' ? segments : activeTab === 'layers' ? layers : aiTypes;
  const maxCount = Math.max(...activeData.map(d => d.count));

  return (
    <div className="bg-surface border border-border/30 rounded-xl overflow-hidden">
      {/* Tab Bar */}
      <div className="flex gap-2 px-6 pt-5 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeTab === tab.key
                ? 'bg-accent/15 text-accent border border-accent/30'
                : 'text-text-muted hover:text-text-primary hover:bg-surface-2/50 border border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Rows */}
      <div className="px-6 pb-6 space-y-1">
        {activeData.map((item, i) => (
          <div
            key={item.slug}
            className={`flex items-center gap-3 py-2.5 px-3 -mx-3 rounded-lg hover:bg-surface-2/30 transition-all duration-300 ${
              mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
            }`}
            style={{ transitionDelay: `${i * 40}ms` }}
          >
            {/* Color dot */}
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />

            {/* Name */}
            <span className="w-36 shrink-0 text-sm font-medium text-text-secondary truncate">
              {item.name}
            </span>

            {/* Count bar */}
            <div className="flex-1 h-3 rounded-full bg-surface-3/50 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: mounted ? `${(item.count / maxCount) * 100}%` : '0%',
                  backgroundColor: item.color,
                  boxShadow: `0 0 8px ${item.color}40`,
                }}
              />
            </div>

            {/* Count + percentage */}
            <span className="text-sm font-semibold text-text-primary tabular-nums shrink-0 text-right w-8">
              {item.count}
            </span>
            <span className="text-xs text-text-faint tabular-nums shrink-0 text-right w-10">
              {item.pctOfTotal}%
            </span>
            <span className="hidden sm:block text-xs text-text-muted tabular-nums shrink-0 text-right w-16">
              {item.fundingFormatted}
            </span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mx-6 mb-6 pt-4 border-t border-border/20">
        <Link
          href="/directory"
          className="group text-sm text-accent hover:text-accent-hover font-semibold transition-colors inline-flex items-center gap-1.5"
        >
          Browse the Full Directory
          <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
        </Link>
      </div>
    </div>
  );
}
