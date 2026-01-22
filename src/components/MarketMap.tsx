'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Project, Segment, Layer } from '@/types';
import { X } from 'lucide-react';
import Link from 'next/link';

interface TooltipProps {
  title: string;
  description: string;
  count?: number;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

function Tooltip({ title, description, count, children, position = 'bottom' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setShouldRender(true);
      requestAnimationFrame(() => setIsVisible(true));
    }, 200);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
    timeoutRef.current = setTimeout(() => setShouldRender(false), 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-3',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-3',
    left: 'right-full top-1/2 -translate-y-1/2 mr-3',
    right: 'left-full top-1/2 -translate-y-1/2 ml-3',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      {shouldRender && (
        <div
          className={`absolute z-50 ${positionClasses[position]} pointer-events-none transition-all duration-150 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
          style={{
            transformOrigin: position === 'bottom' ? 'top center' :
                            position === 'top' ? 'bottom center' :
                            position === 'left' ? 'right center' : 'left center'
          }}
        >
          <div className="bg-[#1a1a1d] border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[180px] max-w-[240px]">
            {/* Header */}
            <div className="px-3.5 py-2.5 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13px] font-medium text-text-primary">{title}</span>
                {count !== undefined && (
                  <span className="text-[11px] font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                    {count}
                  </span>
                )}
              </div>
            </div>
            {/* Description */}
            <div className="px-3.5 py-2.5">
              <p className="text-[12px] leading-relaxed text-text-muted">
                {description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type CryptoFilter = 'all' | 'crypto' | 'traditional';

interface MarketMapProps {
  projects: Project[];
  segments: Segment[];
  layers: Layer[];
  onCellClick?: (segmentSlug: string | null, layerSlug: string | null) => void;
  activeSegment?: string | null;
  activeLayer?: string | null;
  cryptoFilter?: CryptoFilter;
  onCryptoFilterChange?: (filter: CryptoFilter) => void;
}

export default function MarketMap({
  projects,
  segments,
  layers,
  onCellClick,
  activeSegment,
  activeLayer,
  cryptoFilter = 'all',
  onCryptoFilterChange,
}: MarketMapProps) {
  const [expandedCell, setExpandedCell] = useState<string | null>(null);

  const getProjectsInCell = (segmentSlug: string, layerSlug: string) => {
    return projects.filter((p) => {
      const inSegment = p.segment === segmentSlug || p.segments?.includes(segmentSlug);
      const inLayer = p.layer === layerSlug || p.layers?.includes(layerSlug);
      return inSegment && inLayer;
    });
  };

  const getCellKey = (segmentSlug: string, layerSlug: string) =>
    `${segmentSlug}-${layerSlug}`;

  const handleCellClick = (segmentSlug: string, layerSlug: string) => {
    const key = getCellKey(segmentSlug, layerSlug);
    const cellProjects = getProjectsInCell(segmentSlug, layerSlug);

    if (cellProjects.length === 0) return;

    if (expandedCell === key) {
      setExpandedCell(null);
      onCellClick?.(null, null);
    } else {
      setExpandedCell(key);
      onCellClick?.(segmentSlug, layerSlug);
    }
  };

  // Calculate min (non-zero) and max counts for relative scaling
  const { minCount, maxCount } = useMemo(() => {
    const counts = segments.flatMap((s) =>
      layers.map((l) => getProjectsInCell(s.slug, l.slug).length)
    ).filter(c => c > 0);

    return {
      minCount: Math.min(...counts, 1),
      maxCount: Math.max(...counts, 1)
    };
  }, [segments, layers, projects]);

  // Get normalized intensity (0-1) based on count relative to min/max
  const getIntensity = (count: number): number => {
    if (count === 0) return 0;
    if (maxCount === minCount) return 0.5;
    return (count - minCount) / (maxCount - minCount);
  };

  // Get background color based on intensity (dark to accent teal)
  // Accent color is #0d9488 = rgb(13, 148, 136)
  const getCellColor = (intensity: number): string => {
    // Interpolate from dark (#1a1a1d) to accent (#0d9488)
    const r = Math.round(26 + (13 - 26) * intensity);
    const g = Math.round(26 + (148 - 26) * intensity);
    const b = Math.round(29 + (136 - 29) * intensity);
    return `rgb(${r}, ${g}, ${b})`;
  };

  // Get text color based on intensity (always light text since bg is dark-ish)
  const getTextColor = (intensity: number): string => {
    // For low intensity, use muted text; for high intensity, use bright white
    const value = Math.round(160 + intensity * 95);
    return `rgb(${value}, ${value}, ${value})`;
  };

  // Get hover background color (brighter version)
  const getHoverColor = (intensity: number): string => {
    // Slightly brighter/more saturated version
    const boost = 0.15;
    const adjusted = Math.min(1, intensity + boost);
    const r = Math.round(26 + (20 - 26) * adjusted);
    const g = Math.round(26 + (184 - 26) * adjusted);
    const b = Math.round(29 + (166 - 29) * adjusted);
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <div className="bg-surface border border-border rounded-xl">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-baseline gap-4">
          <h2 className="headline-sub">Market Map</h2>
          <span className="meta-text">{projects.length} companies</span>
        </div>
        <div className="flex items-center gap-4">
          {/* Crypto Toggle */}
          {onCryptoFilterChange && (
            <div className="flex items-center bg-surface-2/50 rounded-lg p-0.5">
              <button
                onClick={() => onCryptoFilterChange('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                  cryptoFilter === 'all'
                    ? 'bg-surface text-text-primary shadow-sm'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                All
              </button>
              <button
                onClick={() => onCryptoFilterChange('crypto')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                  cryptoFilter === 'crypto'
                    ? 'bg-surface text-text-primary shadow-sm'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                Crypto
              </button>
              <button
                onClick={() => onCryptoFilterChange('traditional')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                  cryptoFilter === 'traditional'
                    ? 'bg-surface text-text-primary shadow-sm'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                Traditional
              </button>
            </div>
          )}
          {expandedCell && (
            <button
              onClick={() => {
                setExpandedCell(null);
                onCellClick?.(null, null);
              }}
              className="text-sm text-text-muted hover:text-text-primary flex items-center gap-2 transition-colors"
            >
              <X className="w-4 h-4" />
              Clear selection
            </button>
          )}
        </div>
      </div>

      {/* Map Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px] p-4">
          {/* CSS Grid Layout */}
          <div
            className="grid gap-x-1 gap-y-1"
            style={{
              gridTemplateColumns: `120px repeat(${segments.length}, 1fr)`,
              gridTemplateRows: `auto repeat(${layers.length}, 40px)`,
            }}
          >
            {/* Empty top-left cell */}
            <div />

            {/* Column Headers (Segments) */}
            {segments.map((segment) => {
              const segmentCount = projects.filter(p => p.segment === segment.slug).length;
              return (
                <div key={segment.slug} className="flex items-center justify-center">
                  <Tooltip
                    title={segment.name}
                    description={segment.description}
                    count={segmentCount}
                    position="bottom"
                  >
                    <button
                      onClick={() => {
                        if (activeSegment === segment.slug && !activeLayer) {
                          onCellClick?.(null, null);
                        } else {
                          onCellClick?.(segment.slug, null);
                        }
                      }}
                      className={`label-refined px-2 py-1.5 rounded-lg transition-all duration-200 ${
                        activeSegment === segment.slug
                          ? 'text-accent bg-accent/5'
                          : 'text-text-muted hover:text-text-secondary hover:bg-surface-2/50'
                      }`}
                    >
                      {segment.name.length > 10 ? segment.name.split(' ')[0] : segment.name}
                    </button>
                  </Tooltip>
                </div>
              );
            })}

            {/* Rows (Layers) with their cells */}
            {layers.map((layer) => {
              const layerCount = projects.filter(p => p.layer === layer.slug).length;
              return (
                <>
                  {/* Row Header */}
                  <div key={`${layer.slug}-header`} className="flex items-center justify-end pr-3">
                    <Tooltip
                      title={layer.name}
                      description={layer.description}
                      count={layerCount}
                      position="right"
                    >
                      <button
                        onClick={() => {
                          if (activeLayer === layer.slug && !activeSegment) {
                            onCellClick?.(null, null);
                          } else {
                            onCellClick?.(null, layer.slug);
                          }
                        }}
                        className={`label-refined text-right py-1.5 rounded-lg transition-all duration-200 ${
                          activeLayer === layer.slug
                            ? 'text-accent'
                            : 'text-text-muted hover:text-text-secondary'
                        }`}
                      >
                        {layer.name}
                      </button>
                    </Tooltip>
                  </div>

                  {/* Cells for this row */}
                  {segments.map((segment) => {
                    const cellProjects = getProjectsInCell(segment.slug, layer.slug);
                    const count = cellProjects.length;
                    const key = getCellKey(segment.slug, layer.slug);
                    const isExpanded = expandedCell === key;
                    const isActive =
                      (activeSegment === segment.slug && activeLayer === layer.slug) ||
                      (activeSegment === segment.slug && !activeLayer) ||
                      (activeLayer === layer.slug && !activeSegment);

                    const intensity = getIntensity(count);
                    const bgColor = getCellColor(intensity);
                    const textColor = getTextColor(intensity);
                    const hoverColor = getHoverColor(intensity);

                    return (
                      <div key={key} className="flex items-center justify-center">
                        <button
                          onClick={() => handleCellClick(segment.slug, layer.slug)}
                          disabled={count === 0}
                          className={`w-full h-9 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.02]
                            ${count === 0
                              ? 'bg-black/40 cursor-default'
                              : isExpanded || isActive
                                ? 'bg-accent text-white shadow-glow'
                                : ''
                            }`}
                          style={count > 0 && !isExpanded && !isActive ? {
                            backgroundColor: bgColor,
                            color: textColor,
                          } as React.CSSProperties : undefined}
                          onMouseEnter={(e) => {
                            if (count > 0 && !isExpanded && !isActive) {
                              e.currentTarget.style.backgroundColor = hoverColor;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (count > 0 && !isExpanded && !isActive) {
                              e.currentTarget.style.backgroundColor = bgColor;
                            }
                          }}
                          title={`${segment.name} × ${layer.name}: ${count} project${count !== 1 ? 's' : ''}`}
                        >
                          {count > 0 ? count : ''}
                        </button>
                      </div>
                    );
                  })}
                </>
              );
            })}
          </div>
        </div>
      </div>

      {/* Expanded Cell Detail */}
      {expandedCell && (
        <div className="border-t border-border/50 p-6 bg-surface-2/30 animate-fade-in">
          {(() => {
            const [segSlug, laySlug] = expandedCell.split('-');
            const segment = segments.find(s => s.slug === segSlug);
            const layer = layers.find(l => l.slug === laySlug);
            const cellProjects = getProjectsInCell(segSlug, laySlug);

            return (
              <div>
                <div className="flex items-baseline gap-4 mb-5">
                  <span className="label-refined text-text-secondary">
                    {segment?.name}
                  </span>
                  <span className="text-text-faint text-lg font-light">/</span>
                  <span className="label-refined text-text-secondary">
                    {layer?.name}
                  </span>
                  <span className="meta-text ml-auto">
                    {cellProjects.length} {cellProjects.length === 1 ? 'company' : 'companies'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {cellProjects.map((project) => (
                    <Link
                      key={project.slug}
                      href={`/p/${project.slug}`}
                      className="text-sm px-4 py-2 bg-surface border border-border rounded-lg text-text-secondary hover:border-accent/50 hover:text-accent transition-all duration-200"
                    >
                      {project.name}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
