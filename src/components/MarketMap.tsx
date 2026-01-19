'use client';

import { useState } from 'react';
import { Project, Segment, Layer } from '@/types';
import { ChevronDown, X } from 'lucide-react';
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

  const maxCount = Math.max(
    ...segments.flatMap((s) =>
      layers.map((l) => getProjectsInCell(s.slug, l.slug).length)
    )
  );

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-semibold">Market Map</h2>
        {expandedCell && (
          <button
            onClick={() => {
              setExpandedCell(null);
              onCellClick?.(null, null);
            }}
            className="text-xs text-text-muted hover:text-text-primary flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Clear selection
          </button>
        )}
      </div>

      {/* Map Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px] p-4">
          {/* Column Headers (Segments) */}
          <div className="flex">
            <div className="w-24 shrink-0" />
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
                  className={`text-[10px] font-medium truncate w-full px-1 py-1 rounded transition-colors ${
                    activeSegment === segment.slug
                      ? 'bg-accent/20 text-accent'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                  title={segment.name}
                >
                  {segment.name.split(' ')[0]}
                </button>
              </div>
            ))}
          </div>

          {/* Rows (Layers) */}
          {layers.map((layer) => (
            <div key={layer.slug} className="flex mt-1">
              {/* Row Header */}
              <div className="w-24 shrink-0 pr-2">
                <button
                  onClick={() => {
                    if (activeLayer === layer.slug && !activeSegment) {
                      onCellClick?.(null, null);
                    } else {
                      onCellClick?.(null, layer.slug);
                    }
                  }}
                  className={`text-[10px] font-medium text-right w-full truncate px-1 py-1 rounded transition-colors ${
                    activeLayer === layer.slug
                      ? 'bg-accent/20 text-accent'
                      : 'text-text-muted hover:text-text-primary'
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

                // Calculate opacity based on count
                const opacity = count > 0 ? Math.max(0.2, count / maxCount) : 0;

                return (
                  <div key={key} className="flex-1 px-0.5">
                    <button
                      onClick={() => handleCellClick(segment.slug, layer.slug)}
                      disabled={count === 0}
                      className={`w-full h-7 rounded text-[10px] font-medium transition-all ${
                        count === 0
                          ? 'bg-surface-2/30 cursor-default'
                          : isExpanded || isActive
                          ? 'bg-accent text-white'
                          : 'bg-surface-2 hover:bg-border text-text-muted hover:text-text-primary'
                      }`}
                      style={
                        count > 0 && !isExpanded && !isActive
                          ? { backgroundColor: `rgba(59, 130, 246, ${opacity * 0.3})` }
                          : undefined
                      }
                      title={`${segment.name} × ${layer.name}: ${count} projects`}
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
        <div className="border-t border-border p-4 bg-background">
          {(() => {
            const [segSlug, laySlug] = expandedCell.split('-');
            const segment = segments.find(s => s.slug === segSlug);
            const layer = layers.find(l => l.slug === laySlug);
            const cellProjects = getProjectsInCell(segSlug, laySlug);

            return (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${segment?.color}20`, color: segment?.color }}
                  >
                    {segment?.name}
                  </span>
                  <span className="text-text-muted">×</span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${layer?.color}20`, color: layer?.color }}
                  >
                    {layer?.name}
                  </span>
                  <span className="text-xs text-text-muted ml-auto">
                    {cellProjects.length} project{cellProjects.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {cellProjects.map((project) => (
                    <Link
                      key={project.slug}
                      href={`/p/${project.slug}`}
                      className="text-xs px-2 py-1 bg-surface border border-border rounded hover:border-accent hover:text-accent transition-colors"
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
