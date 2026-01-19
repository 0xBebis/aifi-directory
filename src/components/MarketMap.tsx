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

  const maxCount = useMemo(() => Math.max(
    1,
    ...segments.flatMap((s) =>
      layers.map((l) => getProjectsInCell(s.slug, l.slug).length)
    )
  ), [segments, layers, projects]);

  return (
    <div className="bg-surface border border-border rounded-lg">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-text-primary">Market Map</h2>
          <span className="text-xs text-text-faint">{projects.length} companies</span>
        </div>
        {expandedCell && (
          <button
            onClick={() => {
              setExpandedCell(null);
              onCellClick?.(null, null);
            }}
            className="text-xs text-text-muted hover:text-text-primary flex items-center gap-1.5 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Clear selection
          </button>
        )}
      </div>

      {/* Map Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px] p-5">
          {/* Column Headers (Segments) */}
          <div className="flex mb-3">
            <div className="w-28 shrink-0" />
            {segments.map((segment) => (
              <div
                key={segment.slug}
                className="flex-1 px-0.5 text-center"
              >
                <button
                  onClick={() => {
                    if (activeSegment === segment.slug && !activeLayer) {
                      onCellClick?.(null, null);
                    } else {
                      onCellClick?.(segment.slug, null);
                    }
                  }}
                  className={`text-2xs font-medium uppercase tracking-wider w-full px-1 py-2 rounded transition-colors ${
                    activeSegment === segment.slug
                      ? 'text-accent'
                      : 'text-text-muted hover:text-text-secondary'
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
              <div className="w-28 shrink-0 pr-4">
                <button
                  onClick={() => {
                    if (activeLayer === layer.slug && !activeSegment) {
                      onCellClick?.(null, null);
                    } else {
                      onCellClick?.(null, layer.slug);
                    }
                  }}
                  className={`text-2xs font-medium uppercase tracking-wider text-right w-full py-2 rounded transition-colors ${
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

                // Calculate intensity tier for stepped contrast
                const tier = count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : count <= 6 ? 3 : 4;

                return (
                  <div key={key} className="flex-1 p-0.5">
                    <button
                      onClick={() => handleCellClick(segment.slug, layer.slug)}
                      disabled={count === 0}
                      className={`w-full h-9 rounded text-xs font-medium transition-all duration-150
                        ${count === 0
                          ? 'bg-surface-2/50 cursor-default'
                          : isExpanded || isActive
                            ? 'bg-accent text-white shadow-glow'
                            : tier === 1
                              ? 'bg-surface-2 text-text-muted hover:bg-surface-3 hover:text-text-secondary'
                              : tier === 2
                                ? 'bg-surface-3 text-text-secondary hover:bg-border hover:text-text-primary'
                                : tier === 3
                                  ? 'bg-zinc-700/60 text-text-primary hover:bg-zinc-600/60'
                                  : 'bg-zinc-600/70 text-text-primary hover:bg-zinc-500/70'
                        }`}
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
        <div className="border-t border-border p-5 bg-surface-2/50 animate-fade-in">
          {(() => {
            const [segSlug, laySlug] = expandedCell.split('-');
            const segment = segments.find(s => s.slug === segSlug);
            const layer = layers.find(l => l.slug === laySlug);
            const cellProjects = getProjectsInCell(segSlug, laySlug);

            return (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                    {segment?.name}
                  </span>
                  <span className="text-text-faint">×</span>
                  <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                    {layer?.name}
                  </span>
                  <span className="text-xs text-text-faint ml-auto">
                    {cellProjects.length} {cellProjects.length === 1 ? 'company' : 'companies'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {cellProjects.map((project) => (
                    <Link
                      key={project.slug}
                      href={`/p/${project.slug}`}
                      className="text-sm px-3 py-1.5 bg-surface border border-border rounded-md text-text-secondary hover:border-accent hover:text-accent transition-colors"
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
