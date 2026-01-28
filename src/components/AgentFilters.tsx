'use client';

import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import {
  Agent, FinanceCategory, AgentProtocol,
  FINANCE_CATEGORY_LABELS, FINANCE_CATEGORY_COLORS,
  PROTOCOL_LABELS, PROTOCOL_COLORS,
} from '@/types';
import AgentCard from './AgentCard';

interface AgentFiltersProps {
  agents: Agent[];
}

type SortKey = 'name' | 'reputation' | 'recent' | 'newest';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'reputation', label: 'Reputation' },
  { key: 'recent', label: 'Recently Active' },
  { key: 'newest', label: 'Newest' },
  { key: 'name', label: 'Name (A-Z)' },
];

const fuse = (agents: Agent[]) =>
  new Fuse(agents, {
    keys: ['name', 'description', 'mcpTools', 'a2aSkills', 'oasfSkills'],
    threshold: 0.35,
    ignoreLocation: true,
  });

export default function AgentFilters({ agents }: AgentFiltersProps) {
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<FinanceCategory>>(new Set());
  const [selectedProtocols, setSelectedProtocols] = useState<Set<AgentProtocol>>(new Set());
  const [activeOnly, setActiveOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>('reputation');

  // Categories and protocols with counts
  const categoryStats = useMemo(() => {
    const counts: Partial<Record<FinanceCategory, number>> = {};
    agents.forEach(a => {
      counts[a.financeCategory] = (counts[a.financeCategory] || 0) + 1;
    });
    return (Object.entries(counts) as [FinanceCategory, number][])
      .sort((a, b) => b[1] - a[1]);
  }, [agents]);

  const protocolStats = useMemo(() => {
    const counts: Partial<Record<AgentProtocol, number>> = {};
    agents.forEach(a => {
      a.protocols.forEach(p => {
        counts[p] = (counts[p] || 0) + 1;
      });
    });
    return (Object.entries(counts) as [AgentProtocol, number][])
      .sort((a, b) => b[1] - a[1]);
  }, [agents]);

  // Filter + search + sort
  const filtered = useMemo(() => {
    let result = agents;

    // Category filter
    if (selectedCategories.size > 0) {
      result = result.filter(a => selectedCategories.has(a.financeCategory));
    }

    // Protocol filter
    if (selectedProtocols.size > 0) {
      result = result.filter(a =>
        a.protocols.some(p => selectedProtocols.has(p))
      );
    }

    // Active only
    if (activeOnly) {
      result = result.filter(a => a.active);
    }

    // Search
    if (search.trim()) {
      const f = fuse(result);
      result = f.search(search.trim()).map(r => r.item);
    } else {
      // Sort (only when not searching — search has its own relevance sort)
      result = [...result].sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'reputation':
            if (a.reputationScore !== null && b.reputationScore !== null) {
              return b.reputationScore - a.reputationScore;
            }
            if (a.reputationScore !== null) return -1;
            if (b.reputationScore !== null) return 1;
            return b.lastActivity - a.lastActivity;
          case 'recent':
            return b.lastActivity - a.lastActivity;
          case 'newest':
            return b.createdAt - a.createdAt;
          default:
            return 0;
        }
      });
    }

    return result;
  }, [agents, search, selectedCategories, selectedProtocols, activeOnly, sortBy]);

  const hasFilters = search || selectedCategories.size > 0 || selectedProtocols.size > 0 || activeOnly;

  function clearFilters() {
    setSearch('');
    setSelectedCategories(new Set());
    setSelectedProtocols(new Set());
    setActiveOnly(false);
  }

  function toggleCategory(cat: FinanceCategory) {
    setSelectedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  function toggleProtocol(proto: AgentProtocol) {
    setSelectedProtocols(prev => {
      const next = new Set(prev);
      if (next.has(proto)) next.delete(proto);
      else next.add(proto);
      return next;
    });
  }

  return (
    <div>
      {/* Filter bar */}
      <div className="bg-surface border border-border rounded-xl p-4 mb-6">
        {/* Search + Sort row */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" aria-hidden="true" />
            <label htmlFor="agent-search" className="sr-only">Search agents</label>
            <input
              id="agent-search"
              type="text"
              placeholder="Search agents, tools, skills..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-surface-2/50 border border-border/50 rounded-lg text-sm text-text-primary placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-faint hover:text-text-muted"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-text-faint" aria-hidden="true" />
            <label htmlFor="agent-sort" className="sr-only">Sort agents by</label>
            <select
              id="agent-sort"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortKey)}
              className="bg-surface-2/50 border border-border/50 rounded-lg px-3 py-2.5 text-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent/20 cursor-pointer"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.key} value={opt.key}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category pills */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className="text-[10px] uppercase tracking-wider text-text-faint font-medium mr-1">Category</span>
          {categoryStats.map(([cat, count]) => {
            const isActive = selectedCategories.has(cat);
            const color = FINANCE_CATEGORY_COLORS[cat];
            return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                aria-pressed={isActive}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all ${
                  isActive ? 'ring-1 ring-offset-1 ring-offset-surface' : 'hover:scale-105'
                }`}
                style={{
                  backgroundColor: isActive ? `${color}25` : `${color}10`,
                  color: color,
                  border: `1px solid ${isActive ? color : `${color}20`}`,
                  ['--tw-ring-color' as string]: isActive ? color : undefined,
                }}
              >
                {FINANCE_CATEGORY_LABELS[cat]}
                <span className="opacity-60">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Protocol pills + Active toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] uppercase tracking-wider text-text-faint font-medium mr-1">Protocol</span>
          {protocolStats.map(([proto, count]) => {
            const isActive = selectedProtocols.has(proto);
            const color = PROTOCOL_COLORS[proto];
            return (
              <button
                key={proto}
                onClick={() => toggleProtocol(proto)}
                aria-pressed={isActive}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all ${
                  isActive ? 'ring-1 ring-offset-1 ring-offset-surface' : 'hover:scale-105'
                }`}
                style={{
                  backgroundColor: isActive ? `${color}25` : `${color}10`,
                  color: color,
                  border: `1px solid ${isActive ? color : `${color}20`}`,
                  ['--tw-ring-color' as string]: isActive ? color : undefined,
                }}
              >
                {PROTOCOL_LABELS[proto]}
                <span className="opacity-60">{count}</span>
              </button>
            );
          })}
          <span className="text-border mx-1">|</span>
          <button
            onClick={() => setActiveOnly(!activeOnly)}
            aria-pressed={activeOnly}
            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all border ${
              activeOnly
                ? 'bg-positive/15 text-positive border-positive/40'
                : 'bg-surface-2/50 text-text-faint border-border/50 hover:text-text-muted'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${activeOnly ? 'bg-positive' : 'bg-text-faint'}`} />
            Active Only
          </button>
          {hasFilters && (
            <>
              <span className="text-border mx-1">|</span>
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-text-faint hover:text-text-muted transition-colors"
              >
                <X size={12} />
                Clear
              </button>
            </>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-4" aria-live="polite" aria-atomic="true">
        <p className="text-sm text-text-faint">
          {filtered.length === agents.length
            ? `${agents.length} agents`
            : `${filtered.length} of ${agents.length} agents`
          }
        </p>
      </div>

      {/* Agent grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((agent, i) => (
            <AgentCard key={agent.id} agent={agent} index={i} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-surface border border-border rounded-xl">
          <p className="text-text-muted text-sm mb-2">No agents match your filters</p>
          <button
            onClick={clearFilters}
            className="text-accent text-sm hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
