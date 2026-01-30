'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Fuse from 'fuse.js';
import { Search, Building2, Layers, Grid3X3, Cpu, FileText, ArrowRight } from 'lucide-react';

interface SearchableItem {
  name: string;
  description: string;
  href: string;
  category: 'Company' | 'Segment' | 'Layer' | 'AI Type' | 'Page';
}

interface GlobalSearchProps {
  items: SearchableItem[];
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'Company': Building2,
  'Segment': Grid3X3,
  'Layer': Layers,
  'AI Type': Cpu,
  'Page': FileText,
};

export default function GlobalSearch({ items }: GlobalSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fuse = useMemo(
    () => new Fuse(items, {
      keys: ['name', 'description'],
      threshold: 0.3,
    }),
    [items]
  );

  const results = useMemo(() => {
    if (query.length === 0) return [];
    return fuse.search(query).slice(0, 8).map(r => r.item);
  }, [fuse, query]);

  // Group by category for display, build flat list for keyboard navigation
  const { grouped, renderOrder } = useMemo(() => {
    const g = new Map<string, SearchableItem[]>();
    for (const item of results) {
      const group = g.get(item.category) || [];
      group.push(item);
      g.set(item.category, group);
    }
    const order: SearchableItem[] = [];
    Array.from(g.values()).forEach(categoryItems => {
      order.push(...categoryItems);
    });
    return { grouped: g, renderOrder: order };
  }, [results]);

  const openSearch = useCallback(() => {
    setOpen(true);
    setQuery('');
    setSelectedIndex(0);
  }, []);

  const closeSearch = useCallback(() => {
    // Blur input to dismiss mobile keyboard
    inputRef.current?.blur();

    // Force mobile browsers to reset zoom level after input focus.
    // Temporarily constrain maximum-scale, then restore to keep pinch-to-zoom.
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      const original = viewport.getAttribute('content') || '';
      viewport.setAttribute('content', original + ', maximum-scale=1');
      setTimeout(() => viewport.setAttribute('content', original), 100);
    }

    setOpen(false);
    setQuery('');
    setSelectedIndex(0);
  }, []);

  const navigate = useCallback((href: string) => {
    closeSearch();
    router.push(href);
  }, [closeSearch, router]);

  // Cmd+K / Ctrl+K toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (open) closeSearch();
        else openSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, openSearch, closeSearch]);

  // Custom event from other components (hero search bar, nav button)
  useEffect(() => {
    const handler = () => openSearch();
    window.addEventListener('open-search', handler);
    return () => window.removeEventListener('open-search', handler);
  }, [openSearch]);

  // Auto-focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Arrow key navigation + Enter + Escape
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeSearch();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, renderOrder.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && renderOrder[selectedIndex]) {
        e.preventDefault();
        navigate(renderOrder[selectedIndex].href);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, renderOrder, selectedIndex, navigate, closeSearch]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll selected result into view
  useEffect(() => {
    if (resultsRef.current) {
      const el = resultsRef.current.querySelector('[data-selected="true"]');
      el?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!open) return null;

  let globalIdx = -1;

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="Search">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={closeSearch} />

      {/* Modal */}
      <div className="relative z-10 max-w-xl mx-auto mt-[15vh] px-4">
        <div className="bg-surface border border-border rounded-xl shadow-2xl overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 border-b border-border">
            <Search className="w-5 h-5 text-text-muted shrink-0" aria-hidden="true" />
            <label htmlFor="global-search" className="sr-only">Search companies, segments, and pages</label>
            <input
              id="global-search"
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search companies, segments, pages..."
              className="flex-1 bg-transparent py-3.5 text-sm text-text-primary placeholder:text-text-faint outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-2xs text-text-faint bg-surface-2 border border-border rounded font-mono">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div ref={resultsRef} className="max-h-[50vh] overflow-y-auto">
            {query.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-text-muted">Start typing to search across the AIFI Map directory</p>
              </div>
            ) : renderOrder.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-text-muted">No results for &quot;{query}&quot;</p>
              </div>
            ) : (
              Array.from(grouped.entries()).map(([category, categoryItems]) => (
                <div key={category}>
                  <div className="px-4 pt-3 pb-1">
                    <span className="text-2xs font-semibold uppercase tracking-wider text-text-faint">{category}</span>
                  </div>
                  {categoryItems.map((item) => {
                    globalIdx++;
                    const currentIdx = globalIdx;
                    const isSelected = currentIdx === selectedIndex;
                    const Icon = CATEGORY_ICONS[item.category] || FileText;
                    return (
                      <button
                        key={item.href}
                        data-selected={isSelected}
                        onClick={() => navigate(item.href)}
                        onMouseEnter={() => setSelectedIndex(currentIdx)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                          isSelected ? 'bg-accent/10' : 'hover:bg-surface-2'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-accent' : 'text-text-muted'}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${isSelected ? 'text-accent' : 'text-text-primary'}`}>
                            {item.name}
                          </p>
                          <p className="text-xs text-text-muted truncate">{item.description}</p>
                        </div>
                        {isSelected && <ArrowRight className="w-3.5 h-3.5 text-accent shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer keyboard hints */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-border text-2xs text-text-faint">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-surface-2 border border-border rounded font-mono">&uarr;</kbd>
                <kbd className="px-1 py-0.5 bg-surface-2 border border-border rounded font-mono">&darr;</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-surface-2 border border-border rounded font-mono">&crarr;</kbd>
                Open
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-surface-2 border border-border rounded font-mono">Ctrl</kbd>
              <kbd className="px-1 py-0.5 bg-surface-2 border border-border rounded font-mono">K</kbd>
              Toggle
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
