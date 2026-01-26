'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  segments,
  layers,
  formatFunding,
  aiTypes,
  AI_TYPE_LABELS,
  AI_TYPE_COLORS,
} from '@/lib/data';
import { AIType, Project } from '@/types';
import { X } from 'lucide-react';

interface MarketMatrixProps {
  projects: Project[];
  onFilterChange?: (segments: string[], layers: string[], aiTypes: AIType[]) => void;
  activeSegments?: string[];
  activeLayers?: string[];
  activeAiTypes?: AIType[];
}

export default function MarketMatrix({
  projects,
  onFilterChange,
  activeSegments = [],
  activeLayers = [],
  activeAiTypes = [],
}: MarketMatrixProps) {
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Derive selection sets from props (single source of truth: parent state)
  const selectedSegments = useMemo(() => new Set(activeSegments), [activeSegments]);
  const selectedLayers = useMemo(() => new Set(activeLayers), [activeLayers]);
  const selectedAiTypes = useMemo(() => new Set(activeAiTypes), [activeAiTypes]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter projects by selected AI types
  const filteredProjects = useMemo(() => {
    if (selectedAiTypes.size === 0) return projects;
    return projects.filter(p => p.ai_type && selectedAiTypes.has(p.ai_type));
  }, [selectedAiTypes, projects]);

  // Calculate cell data based on filtered projects
  const cellData = useMemo(() => {
    const data: Record<string, {
      segment: string;
      layer: string;
      companies: Project[];
      totalFunding: number;
    }> = {};

    segments.forEach(segment => {
      layers.forEach(layer => {
        const key = `${segment.slug}-${layer.slug}`;
        const cellCompanies = filteredProjects.filter(p => {
          const inSegment = p.segment === segment.slug || p.segments?.includes(segment.slug);
          const inLayer = p.layer === layer.slug || p.layers?.includes(layer.slug);
          return inSegment && inLayer;
        });

        data[key] = {
          segment: segment.slug,
          layer: layer.slug,
          companies: cellCompanies,
          totalFunding: cellCompanies.reduce((sum, p) => sum + (p.funding || 0), 0),
        };
      });
    });

    return data;
  }, [filteredProjects]);

  // Calculate max count for scaling
  const maxCount = Math.max(...Object.values(cellData).map(c => c.companies.length), 1);

  // AI Type stats
  const aiTypeStats = useMemo(() => {
    const stats: Record<string, { count: number; funding: number }> = {};
    projects.forEach(p => {
      const type = p.ai_type || 'unknown';
      if (!stats[type]) stats[type] = { count: 0, funding: 0 };
      stats[type].count++;
      stats[type].funding += p.funding || 0;
    });
    return stats;
  }, [projects]);

  // Calculate displayed stats based on selection
  const displayedStats = useMemo(() => {
    if (selectedCell && cellData[selectedCell]) {
      const cell = cellData[selectedCell];
      const segName = segments.find(s => s.slug === cell.segment)?.name?.split(' ')[0];
      const layName = layers.find(l => l.slug === cell.layer)?.name;
      return {
        count: cell.companies.length,
        funding: cell.totalFunding,
        label: `${segName} × ${layName}`,
      };
    }

    if (selectedSegments.size > 0 || selectedLayers.size > 0) {
      const selectedCompanies = new Set<string>();
      let funding = 0;
      const segsToCheck = selectedSegments.size > 0 ? Array.from(selectedSegments) : segments.map(s => s.slug);
      const layersToCheck = selectedLayers.size > 0 ? Array.from(selectedLayers) : layers.map(l => l.slug);

      segsToCheck.forEach(segSlug => {
        layersToCheck.forEach(layerSlug => {
          const key = `${segSlug}-${layerSlug}`;
          const cell = cellData[key];
          if (cell) {
            cell.companies.forEach(c => {
              if (!selectedCompanies.has(c.slug)) {
                selectedCompanies.add(c.slug);
                funding += c.funding || 0;
              }
            });
          }
        });
      });

      // Build label
      let label = '';
      if (selectedSegments.size > 0 && selectedLayers.size > 0) {
        const segNames = Array.from(selectedSegments).map(s => segments.find(seg => seg.slug === s)?.name?.split(' ')[0]).join(', ');
        const layerNames = Array.from(selectedLayers).map(l => layers.find(lay => lay.slug === l)?.name).join(', ');
        label = `${segNames} × ${layerNames}`;
      } else if (selectedSegments.size > 0) {
        label = Array.from(selectedSegments).map(s => segments.find(seg => seg.slug === s)?.name?.split(' ')[0]).join(', ');
      } else {
        label = Array.from(selectedLayers).map(l => layers.find(lay => lay.slug === l)?.name).join(', ');
      }

      return { count: selectedCompanies.size, funding, label };
    }

    // Default
    let label = 'All';
    if (selectedAiTypes.size === 1) {
      label = AI_TYPE_LABELS[Array.from(selectedAiTypes)[0]];
    } else if (selectedAiTypes.size > 1) {
      label = `${selectedAiTypes.size} AI Types`;
    }

    return {
      count: filteredProjects.length,
      funding: filteredProjects.reduce((sum, p) => sum + (p.funding || 0), 0),
      label,
    };
  }, [selectedCell, selectedSegments, selectedLayers, cellData, filteredProjects, selectedAiTypes]);

  const getIntensity = (count: number) => count === 0 ? 0 : Math.pow(count / maxCount, 0.6);

  const handleSegmentClick = (segmentSlug: string) => {
    setSelectedCell(null);
    const next = new Set(selectedSegments);
    if (next.has(segmentSlug)) {
      next.delete(segmentSlug);
    } else {
      next.add(segmentSlug);
    }
    onFilterChange?.(Array.from(next), Array.from(selectedLayers), Array.from(selectedAiTypes));
  };

  const handleLayerClick = (layerSlug: string) => {
    setSelectedCell(null);
    const next = new Set(selectedLayers);
    if (next.has(layerSlug)) {
      next.delete(layerSlug);
    } else {
      next.add(layerSlug);
    }
    onFilterChange?.(Array.from(selectedSegments), Array.from(next), Array.from(selectedAiTypes));
  };

  const handleAiTypeClick = (aiType: AIType) => {
    const next = new Set(selectedAiTypes);
    if (next.has(aiType)) {
      next.delete(aiType);
    } else {
      next.add(aiType);
    }
    onFilterChange?.(Array.from(selectedSegments), Array.from(selectedLayers), Array.from(next));
  };

  const handleCellClick = (key: string, count: number) => {
    if (count === 0) return;
    const [segSlug, laySlug] = key.split('-');
    if (selectedCell === key) {
      setSelectedCell(null);
      onFilterChange?.([], [], Array.from(selectedAiTypes));
    } else {
      setSelectedCell(key);
      onFilterChange?.([segSlug], [laySlug], Array.from(selectedAiTypes));
    }
  };

  const clearSelection = () => {
    setSelectedCell(null);
    onFilterChange?.([], [], []);
  };

  const hasSelection = selectedCell || selectedSegments.size > 0 || selectedLayers.size > 0 || selectedAiTypes.size > 0;

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      {/* Header with Stats */}
      <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-text-primary">Market Matrix</h2>
          {hasSelection && (
            <span className="text-xs text-text-muted px-2 py-0.5 bg-surface-2/50 rounded">
              {displayedStats.label}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold text-text-primary tracking-tight">{displayedStats.count}</span>
            <span className="text-sm text-text-muted font-medium">companies</span>
          </div>
          <div className="w-px h-6 bg-border/50" />
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold text-green-400 tracking-tight">{formatFunding(displayedStats.funding)}</span>
            <span className="text-sm text-text-muted font-medium">raised</span>
          </div>
          {hasSelection && (
            <button
              onClick={clearSelection}
              className="flex items-center gap-1 px-2 py-1.5 text-xs text-text-muted hover:text-text-primary hover:bg-surface-2 rounded-lg transition-colors"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="flex">
        {/* Matrix Grid */}
        <div className="flex-1 p-3 overflow-x-auto">
          <div
            className="grid gap-1"
            style={{
              gridTemplateColumns: `80px repeat(${segments.length}, minmax(55px, 1fr))`,
              gridTemplateRows: `28px repeat(${layers.length}, 40px)`,
              minWidth: '550px',
            }}
          >
            {/* Corner cell */}
            <div />

            {/* Segment headers */}
            {segments.map((segment, i) => {
              const isSelected = selectedSegments.has(segment.slug);
              return (
                <button
                  key={segment.slug}
                  onClick={() => handleSegmentClick(segment.slug)}
                  className={`flex items-center justify-center rounded-md transition-all duration-200 cursor-pointer text-[10px] font-semibold ${
                    isSelected ? 'ring-1 ring-offset-1 ring-offset-background' : 'hover:bg-surface-2/50'
                  }`}
                  style={{
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateY(0)' : 'translateY(-6px)',
                    backgroundColor: isSelected ? `${segment.color}25` : 'transparent',
                    color: segment.color,
                    ['--tw-ring-color' as string]: segment.color,
                    transition: `all 0.25s ease-out ${i * 25}ms`,
                  }}
                >
                  {segment.name.split(' ')[0]}
                </button>
              );
            })}

            {/* Rows */}
            {layers.map((layer, layerIdx) => {
              const isLayerSelected = selectedLayers.has(layer.slug);
              return (
                <React.Fragment key={layer.slug}>
                  <button
                    onClick={() => handleLayerClick(layer.slug)}
                    className={`flex items-center justify-end pr-2 rounded-md transition-all duration-200 cursor-pointer text-[10px] font-semibold ${
                      isLayerSelected ? 'ring-1 ring-offset-1 ring-offset-background' : 'hover:bg-surface-2/50'
                    }`}
                    style={{
                      opacity: mounted ? 1 : 0,
                      transform: mounted ? 'translateX(0)' : 'translateX(-6px)',
                      backgroundColor: isLayerSelected ? `${layer.color}25` : 'transparent',
                      color: layer.color,
                      ['--tw-ring-color' as string]: layer.color,
                      transition: `all 0.25s ease-out ${layerIdx * 25}ms`,
                    }}
                  >
                    {layer.name}
                  </button>

                  {segments.map((segment, segIdx) => {
                    const key = `${segment.slug}-${layer.slug}`;
                    const cell = cellData[key];
                    const count = cell.companies.length;
                    const isSelected = selectedCell === key;
                    const isHovered = hoveredCell === key;
                    // Only show row/column highlighting when no cell is selected (i.e., user clicked on headers)
                    const isInSelectedColumn = !selectedCell && selectedSegments.has(segment.slug);
                    const isInSelectedRow = !selectedCell && selectedLayers.has(layer.slug);
                    const isHighlighted = isInSelectedColumn || isInSelectedRow;
                    const isCrossHighlight = isInSelectedColumn && isInSelectedRow;
                    const intensity = getIntensity(count);
                    const animDelay = (segIdx + layerIdx) * 12;

                    return (
                      <button
                        key={key}
                        onClick={() => handleCellClick(key, count)}
                        onMouseEnter={() => setHoveredCell(key)}
                        onMouseLeave={() => setHoveredCell(null)}
                        disabled={count === 0}
                        className={`rounded-md transition-all duration-200 flex items-center justify-center text-sm font-bold ${
                          count === 0 ? 'cursor-default' : 'cursor-pointer'
                        } ${isSelected ? 'ring-2 ring-accent ring-offset-1 ring-offset-background z-10' : ''}`}
                        style={{
                          opacity: mounted ? 1 : 0,
                          transform: mounted
                            ? isHovered && count > 0 ? 'scale(1.05)' : 'scale(1)'
                            : 'scale(0.92)',
                          transition: `all 0.2s ease-out ${animDelay}ms`,
                          background: count === 0
                            ? 'rgba(0,0,0,0.2)'
                            : isSelected
                              ? `linear-gradient(135deg, rgba(59, 130, 246, 0.5) 0%, rgba(59, 130, 246, 0.3) 100%)`
                              : isCrossHighlight
                                ? `linear-gradient(135deg, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0.25) 100%)`
                                : isHighlighted
                                  ? `linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(59, 130, 246, 0.15) 100%)`
                                  : `linear-gradient(135deg, rgba(${13 + intensity * 25}, ${26 + intensity * 100}, ${29 + intensity * 85}, 0.9) 0%, rgba(${13 + intensity * 15}, ${26 + intensity * 75}, ${29 + intensity * 65}, 0.95) 100%)`,
                          border: count === 0
                            ? '1px solid rgba(255,255,255,0.02)'
                            : isSelected
                              ? '1px solid rgba(59, 130, 246, 0.5)'
                              : isCrossHighlight
                                ? '1px solid rgba(59, 130, 246, 0.4)'
                                : isHighlighted
                                  ? '1px solid rgba(59, 130, 246, 0.25)'
                                  : `1px solid rgba(13, 148, 136, ${0.1 + intensity * 0.3})`,
                          boxShadow: isHovered && count > 0
                            ? '0 6px 20px -6px rgba(13, 148, 136, 0.4)'
                            : isCrossHighlight && count > 0
                              ? '0 4px 16px -4px rgba(59, 130, 246, 0.35)'
                              : isHighlighted && count > 0
                                ? '0 3px 12px -3px rgba(59, 130, 246, 0.25)'
                                : 'none',
                          color: isSelected || isHighlighted ? '#fff' : '#fafafa',
                        }}
                      >
                        {count > 0 && count}
                      </button>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </div>

          {/* Cell Detail - below the matrix grid */}
          {selectedCell && cellData[selectedCell] && (
            <CellDetail
              cell={cellData[selectedCell]}
              onClose={() => {
                setSelectedCell(null);
                onFilterChange?.([], [], Array.from(selectedAiTypes));
              }}
            />
          )}
        </div>

        {/* AI Type Filter Sidebar */}
        <div className="w-40 border-l border-border/50 p-2 space-y-1 bg-surface-2/20">
          <div className="px-2 py-1.5 mb-1">
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">AI Type</span>
          </div>

          <button
            onClick={() => {
              onFilterChange?.(Array.from(selectedSegments), Array.from(selectedLayers), []);
            }}
            className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              selectedAiTypes.size === 0
                ? 'bg-accent text-white'
                : 'text-text-muted hover:text-text-primary hover:bg-surface-2'
            }`}
          >
            All ({projects.length})
          </button>

          {aiTypes
            .map(type => ({
              type,
              count: aiTypeStats[type]?.count || 0,
              funding: aiTypeStats[type]?.funding || 0,
            }))
            .sort((a, b) => b.count - a.count)
            .map(({ type, count, funding }, i) => {
              const color = AI_TYPE_COLORS[type];
              const isActive = selectedAiTypes.has(type);
              const pct = (count / projects.length) * 100;

              return (
                <button
                  key={type}
                  onClick={() => handleAiTypeClick(type)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-all relative overflow-hidden ${
                    isActive ? 'ring-1 ring-offset-1 ring-offset-surface' : 'hover:bg-surface-2/50'
                  }`}
                  style={{
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateX(0)' : 'translateX(10px)',
                    transition: `all 0.25s ease-out ${i * 30}ms`,
                    backgroundColor: isActive ? `${color}20` : 'transparent',
                    border: `1px solid ${isActive ? color : 'transparent'}`,
                    ['--tw-ring-color' as string]: color,
                  }}
                >
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2.5 h-2.5 rounded-sm flex items-center justify-center text-[7px] font-bold ${isActive ? 'text-white' : ''}`}
                        style={{ backgroundColor: color }}
                      >
                        {isActive && '✓'}
                      </span>
                      <span style={{ color: isActive ? color : '#a1a1aa' }}>
                        {AI_TYPE_LABELS[type]}
                      </span>
                    </div>
                    <span style={{ color: isActive ? color : '#fafafa' }} className="font-semibold">
                      {count}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/10">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: color,
                        opacity: isActive ? 0.9 : 0.4,
                      }}
                    />
                  </div>
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
}

function CellDetail({
  cell,
  onClose,
}: {
  cell: {
    segment: string;
    layer: string;
    companies: Project[];
    totalFunding: number;
  };
  onClose: () => void;
}) {
  const segment = segments.find(s => s.slug === cell.segment);
  const layer = layers.find(l => l.slug === cell.layer);

  return (
    <div className="border-t border-border/50 p-3 bg-surface-2/30 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="px-2 py-1 rounded-md text-xs font-semibold"
            style={{ backgroundColor: `${segment?.color}20`, color: segment?.color }}
          >
            {segment?.name}
          </span>
          <span className="text-text-muted text-sm">×</span>
          <span
            className="px-2 py-1 rounded-md text-xs font-semibold"
            style={{ backgroundColor: `${layer?.color}20`, color: layer?.color }}
          >
            {layer?.name}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-muted">{cell.companies.length} companies</span>
          <span className="text-xs font-semibold text-green-400">{formatFunding(cell.totalFunding)}</span>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary p-1 rounded hover:bg-surface-2 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {cell.companies
          .sort((a, b) => (b.funding || 0) - (a.funding || 0))
          .map(project => (
            <Link
              key={project.slug}
              href={`/p/${project.slug}`}
              className="group flex items-center gap-1.5 px-2 py-1 bg-surface border border-border rounded text-xs hover:border-accent/50 transition-all"
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: project.defunct ? '#ef4444' : '#22c55e' }}
                title={project.defunct ? 'Defunct' : 'Active'}
              />
              <span className="text-text-secondary group-hover:text-accent transition-colors">
                {project.name}
              </span>
              {project.funding && project.funding > 0 && (
                <span className="text-text-muted">{formatFunding(project.funding)}</span>
              )}
            </Link>
          ))}
      </div>
    </div>
  );
}
