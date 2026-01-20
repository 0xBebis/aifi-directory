'use client';

import { useState, useMemo } from 'react';
import { Project, Segment, Layer } from '@/types';
import { X } from 'lucide-react';
import Link from 'next/link';

interface MarketMapProps {
  projects: Project[];
  segments: Segment[];
  layers: Layer[];
  onCellClick?: (segmentSlug: string | null, layerSlug: string | null) => void;
  activeSegment?: string | null;
  activeLayer?: string | null;
}

export default function MarketMap({
  projects,
  segments,
  layers,
  onCellClick,
  activeSegment,
  activeLayer,
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

  // Get background color based on intensity (black to white)
  const getCellColor = (intensity: number): string => {
    const value = Math.round(intensity * 255);
    return `rgb(${value}, ${value}, ${value})`;
  };

  // Get text color based on intensity (white for dark bg, black for light bg)
  const getTextColor = (intensity: number): string => {
    return intensity > 0.45 ? 'rgb(0, 0, 0)' : 'rgb(200, 200, 200)';
  };

  // Get hover background color (slightly lighter/darker)
  const getHoverColor = (intensity: number): string => {
    const adjusted = intensity > 0.5 ? intensity - 0.1 : intensity + 0.15;
    const value = Math.round(Math.min(1, Math.max(0, adjusted)) * 255);
    return `rgb(${value}, ${value}, ${value})`;
  };

  return (
    <div className="bg-surface border border-border rounded-xl">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-baseline gap-4">
          <h2 className="headline-sub">Market Map</h2>
          <span className="meta-text">{projects.length} companies</span>
        </div>
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

      {/* Map Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px] p-4">
          {/* Column Headers (Segments) */}
          <div className="flex mb-2">
            <div className="w-32 shrink-0" />
            {segments.map((segment) => (
              <div
                key={segment.slug}
                className="flex-1 px-1 text-center"
              >
                <button
                  onClick={() => {
                    if (activeSegment === segment.slug && !activeLayer) {
                      onCellClick?.(null, null);
                    } else {
                      onCellClick?.(segment.slug, null);
                    }
                  }}
                  className={`label-refined w-full px-1 py-1.5 rounded-lg transition-all duration-200 ${
                    activeSegment === segment.slug
                      ? 'text-accent bg-accent/5'
                      : 'text-text-muted hover:text-text-secondary hover:bg-surface-2/50'
                  }`}
                  title={segment.name}
                >
                  {segment.name.length > 10 ? segment.name.split(' ')[0] : segment.name}
                </button>
              </div>
            ))}
          </div>

          {/* Rows (Layers) */}
          {layers.map((layer, layerIndex) => (
            <div key={layer.slug} className="flex items-center">
              {/* Row Header */}
              <div className="w-32 shrink-0 pr-4">
                <button
                  onClick={() => {
                    if (activeLayer === layer.slug && !activeSegment) {
                      onCellClick?.(null, null);
                    } else {
                      onCellClick?.(null, layer.slug);
                    }
                  }}
                  className={`label-refined text-right w-full py-1.5 rounded-lg transition-all duration-200 ${
                    activeLayer === layer.slug
                      ? 'text-accent'
                      : 'text-text-muted hover:text-text-secondary'
                  }`}
                  title={layer.name}
                >
                  {layer.name}
                </button>
              </div>

              {/* Cells */}
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
                  <div key={key} className="flex-1 px-1 py-0.5">
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
                        '--hover-bg': hoverColor,
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
            </div>
          ))}
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
