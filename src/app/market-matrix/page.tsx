'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  projects,
  segments,
  layers,
  formatFunding,
  aiTypes,
  AI_TYPE_LABELS,
  AI_TYPE_COLORS,
} from '@/lib/data';
import { AIType, Project } from '@/types';
import { ArrowLeft, Grid3X3, X, Building2, DollarSign } from 'lucide-react';

export default function MarketMatrixPage() {
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [selectedSegments, setSelectedSegments] = useState<Set<string>>(new Set());
  const [selectedLayers, setSelectedLayers] = useState<Set<string>>(new Set());
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const [selectedAiTypes, setSelectedAiTypes] = useState<Set<AIType>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter projects by selected AI types
  const filteredProjects = useMemo(() => {
    if (selectedAiTypes.size === 0) return projects;
    return projects.filter(p => p.ai_type && selectedAiTypes.has(p.ai_type));
  }, [selectedAiTypes]);

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

  // AI Type stats (always from full project list for sidebar)
  const aiTypeStats = useMemo(() => {
    const stats: Record<string, { count: number; funding: number }> = {};
    projects.forEach(p => {
      const type = p.ai_type || 'unknown';
      if (!stats[type]) stats[type] = { count: 0, funding: 0 };
      stats[type].count++;
      stats[type].funding += p.funding || 0;
    });
    return stats;
  }, []);

  // Calculate displayed stats based on selection
  const displayedStats = useMemo(() => {
    // If a specific cell is selected
    if (selectedCell && cellData[selectedCell]) {
      const cell = cellData[selectedCell];
      return {
        count: cell.companies.length,
        funding: cell.totalFunding,
        label: `${segments.find(s => s.slug === cell.segment)?.name} × ${layers.find(l => l.slug === cell.layer)?.name}`,
      };
    }

    // If segments and/or layers are selected
    if (selectedSegments.size > 0 || selectedLayers.size > 0) {
      const selectedCompanies = new Set<string>();
      let funding = 0;

      // Determine which segments and layers to consider
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
        label = Array.from(selectedSegments).map(s => segments.find(seg => seg.slug === s)?.name).join(', ');
      } else {
        label = Array.from(selectedLayers).map(l => layers.find(lay => lay.slug === l)?.name).join(', ');
      }

      return {
        count: selectedCompanies.size,
        funding,
        label,
      };
    }

    // Default: show all filtered projects
    let label = 'All Companies';
    if (selectedAiTypes.size > 0) {
      if (selectedAiTypes.size === 1) {
        label = AI_TYPE_LABELS[Array.from(selectedAiTypes)[0]];
      } else {
        label = `${selectedAiTypes.size} AI Types`;
      }
    }

    return {
      count: filteredProjects.length,
      funding: filteredProjects.reduce((sum, p) => sum + (p.funding || 0), 0),
      label,
    };
  }, [selectedCell, selectedSegments, selectedLayers, cellData, filteredProjects, selectedAiTypes]);

  const getIntensity = (count: number) => count === 0 ? 0 : Math.pow(count / maxCount, 0.6);

  // Handle segment header click (toggle)
  const handleSegmentClick = (segmentSlug: string) => {
    setSelectedCell(null);
    setSelectedSegments(prev => {
      const next = new Set(prev);
      if (next.has(segmentSlug)) {
        next.delete(segmentSlug);
      } else {
        next.add(segmentSlug);
      }
      return next;
    });
  };

  // Handle layer header click (toggle)
  const handleLayerClick = (layerSlug: string) => {
    setSelectedCell(null);
    setSelectedLayers(prev => {
      const next = new Set(prev);
      if (next.has(layerSlug)) {
        next.delete(layerSlug);
      } else {
        next.add(layerSlug);
      }
      return next;
    });
  };

  // Handle AI type click (toggle)
  const handleAiTypeClick = (aiType: AIType) => {
    setSelectedAiTypes(prev => {
      const next = new Set(prev);
      if (next.has(aiType)) {
        next.delete(aiType);
      } else {
        next.add(aiType);
      }
      return next;
    });
  };

  // Handle cell click
  const handleCellClick = (key: string, count: number) => {
    if (count === 0) return;
    setSelectedSegments(new Set());
    setSelectedLayers(new Set());
    setSelectedCell(selectedCell === key ? null : key);
  };

  // Clear all selections
  const clearSelection = () => {
    setSelectedCell(null);
    setSelectedSegments(new Set());
    setSelectedLayers(new Set());
    setSelectedAiTypes(new Set());
  };

  const hasSelection = selectedCell || selectedSegments.size > 0 || selectedLayers.size > 0 || selectedAiTypes.size > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/directory"
                className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Directory</span>
              </Link>
              <div className="w-px h-5 bg-border" />
              <h1 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <Grid3X3 className="w-5 h-5 text-accent" />
                Market Matrix
              </h1>
            </div>

            {/* Prominent Stats Display */}
            <div className="flex items-center gap-6">
              {/* Selection Label */}
              <div className="flex flex-col items-end">
                <span className="text-xs text-text-muted uppercase tracking-wider">
                  {hasSelection ? 'Selection' : 'Total'}
                </span>
                <span className="text-sm font-medium text-text-secondary max-w-[200px] truncate">
                  {displayedStats.label}
                </span>
              </div>

              {/* Companies Stat */}
              <div className="flex items-center gap-3 px-4 py-2 bg-surface-2/50 rounded-lg border border-border/50">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-accent" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-text-primary">{displayedStats.count}</span>
                  <span className="text-xs text-text-muted">companies</span>
                </div>
              </div>

              {/* Funding Stat */}
              <div className="flex items-center gap-3 px-4 py-2 bg-surface-2/50 rounded-lg border border-border/50">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-green-400">{formatFunding(displayedStats.funding)}</span>
                  <span className="text-xs text-text-muted">raised</span>
                </div>
              </div>

              {/* Clear Selection Button */}
              {hasSelection && (
                <button
                  onClick={clearSelection}
                  className="flex items-center gap-1.5 px-3 py-2 text-text-muted hover:text-text-primary hover:bg-surface-2 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span className="text-sm">Clear</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Matrix */}
          <div className="xl:col-span-3 bg-surface border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border/50">
              <h2 className="text-base font-semibold text-text-primary">
                Segment × Layer
                {selectedAiTypes.size > 0 && (
                  <span className="ml-2 text-sm font-normal text-text-muted">
                    filtered by {selectedAiTypes.size === 1 ? AI_TYPE_LABELS[Array.from(selectedAiTypes)[0]] : `${selectedAiTypes.size} types`}
                  </span>
                )}
              </h2>
              <p className="text-xs text-text-muted mt-1">
                Click headers to select rows/columns (multi-select enabled)
              </p>
            </div>

            <div className="p-4 md:p-5 overflow-x-auto">
              <div
                className="grid gap-1.5"
                style={{
                  gridTemplateColumns: `100px repeat(${segments.length}, minmax(75px, 1fr))`,
                  gridTemplateRows: `36px repeat(${layers.length}, 60px)`,
                  minWidth: '650px',
                }}
              >
                {/* Corner cell */}
                <div />

                {/* Segment headers (clickable for column selection) */}
                {segments.map((segment, i) => {
                  const isSelected = selectedSegments.has(segment.slug);
                  return (
                    <button
                      key={segment.slug}
                      onClick={() => handleSegmentClick(segment.slug)}
                      className={`flex items-center justify-center rounded-lg transition-all duration-200 cursor-pointer ${
                        isSelected ? 'ring-2 ring-offset-1 ring-offset-background' : 'hover:bg-surface-2/50'
                      }`}
                      style={{
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? 'translateY(0)' : 'translateY(-8px)',
                        transition: `all 0.3s ease-out ${i * 30}ms`,
                        backgroundColor: isSelected ? `${segment.color}30` : 'transparent',
                        ringColor: segment.color,
                      }}
                    >
                      <span
                        className="text-xs font-semibold text-center"
                        style={{ color: segment.color }}
                      >
                        {segment.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}

                {/* Rows */}
                {layers.map((layer, layerIdx) => {
                  const isLayerSelected = selectedLayers.has(layer.slug);
                  return (
                    <React.Fragment key={layer.slug}>
                      {/* Layer header (clickable for row selection) */}
                      <button
                        onClick={() => handleLayerClick(layer.slug)}
                        className={`flex items-center justify-end pr-3 rounded-lg transition-all duration-200 cursor-pointer ${
                          isLayerSelected ? 'ring-2 ring-offset-1 ring-offset-background' : 'hover:bg-surface-2/50'
                        }`}
                        style={{
                          opacity: mounted ? 1 : 0,
                          transform: mounted ? 'translateX(0)' : 'translateX(-8px)',
                          transition: `all 0.3s ease-out ${layerIdx * 30}ms`,
                          backgroundColor: isLayerSelected ? `${layer.color}30` : 'transparent',
                          ringColor: layer.color,
                        }}
                      >
                        <span
                          className="text-xs font-semibold text-right"
                          style={{ color: layer.color }}
                        >
                          {layer.name}
                        </span>
                      </button>

                      {/* Cells */}
                      {segments.map((segment, segIdx) => {
                        const key = `${segment.slug}-${layer.slug}`;
                        const cell = cellData[key];
                        const count = cell.companies.length;
                        const isSelected = selectedCell === key;
                        const isHovered = hoveredCell === key;
                        const isInSelectedColumn = selectedSegments.has(segment.slug);
                        const isInSelectedRow = selectedLayers.has(layer.slug);
                        const isHighlighted = isInSelectedColumn || isInSelectedRow;
                        const isCrossHighlight = isInSelectedColumn && isInSelectedRow;
                        const intensity = getIntensity(count);
                        const animDelay = (segIdx + layerIdx) * 20;

                        return (
                          <button
                            key={key}
                            onClick={() => handleCellClick(key, count)}
                            onMouseEnter={() => setHoveredCell(key)}
                            onMouseLeave={() => setHoveredCell(null)}
                            disabled={count === 0}
                            className={`rounded-lg transition-all duration-200 flex items-center justify-center ${
                              count === 0 ? 'cursor-default' : 'cursor-pointer'
                            } ${isSelected ? 'ring-2 ring-accent ring-offset-2 ring-offset-background z-10' : ''}`}
                            style={{
                              opacity: mounted ? 1 : 0,
                              transform: mounted
                                ? isHovered && count > 0 ? 'scale(1.05)' : 'scale(1)'
                                : 'scale(0.9)',
                              transition: `all 0.25s ease-out ${animDelay}ms`,
                              background: count === 0
                                ? 'rgba(0,0,0,0.15)'
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
                                    ? '1px solid rgba(59, 130, 246, 0.5)'
                                    : isHighlighted
                                      ? '1px solid rgba(59, 130, 246, 0.3)'
                                      : `1px solid rgba(13, 148, 136, ${0.1 + intensity * 0.3})`,
                              boxShadow: isHovered && count > 0
                                ? '0 8px 25px -8px rgba(13, 148, 136, 0.4)'
                                : isCrossHighlight && count > 0
                                  ? '0 4px 20px -4px rgba(59, 130, 246, 0.4)'
                                  : isHighlighted && count > 0
                                    ? '0 4px 15px -4px rgba(59, 130, 246, 0.3)'
                                    : 'none',
                            }}
                          >
                            {count > 0 && (
                              <span className={`text-lg font-bold ${isSelected || isHighlighted ? 'text-white' : 'text-text-primary'}`}>
                                {count}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Selected Cell Detail */}
            {selectedCell && cellData[selectedCell] && (
              <CellDetail
                cellKey={selectedCell}
                cell={cellData[selectedCell]}
                segments={segments}
                layers={layers}
                onClose={() => setSelectedCell(null)}
              />
            )}
          </div>

          {/* AI Technology Filter */}
          <div className="xl:col-span-1">
            <div className="bg-surface border border-border rounded-xl overflow-hidden sticky top-20">
              <div className="px-4 py-3 border-b border-border/50">
                <h3 className="text-sm font-semibold text-text-primary">Filter by AI Type</h3>
                <p className="text-xs text-text-muted mt-0.5">Click to toggle (multi-select)</p>
              </div>
              <div className="p-3 space-y-2">
                {/* All Types button */}
                <button
                  onClick={() => setSelectedAiTypes(new Set())}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    selectedAiTypes.size === 0
                      ? 'bg-accent text-white'
                      : 'bg-surface-2/50 text-text-secondary hover:bg-surface-2'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">All Types</span>
                    <span className={`text-sm font-semibold ${selectedAiTypes.size === 0 ? 'text-white' : 'text-text-primary'}`}>
                      {projects.length}
                    </span>
                  </div>
                </button>

                {/* AI Type buttons */}
                {aiTypes
                  .map(type => ({
                    type,
                    count: aiTypeStats[type]?.count || 0,
                    funding: aiTypeStats[type]?.funding || 0,
                  }))
                  .sort((a, b) => b.count - a.count)
                  .map(({ type, count, funding }, i) => {
                    const percentage = (count / projects.length) * 100;
                    const color = AI_TYPE_COLORS[type];
                    const isActive = selectedAiTypes.has(type);

                    return (
                      <button
                        key={type}
                        onClick={() => handleAiTypeClick(type)}
                        className={`w-full text-left rounded-lg transition-all duration-200 overflow-hidden ${
                          isActive ? 'ring-2 ring-offset-1 ring-offset-surface' : ''
                        }`}
                        style={{
                          opacity: mounted ? 1 : 0,
                          transform: mounted ? 'translateX(0)' : 'translateX(15px)',
                          transition: `all 0.3s ease-out ${i * 40}ms`,
                          backgroundColor: isActive ? `${color}25` : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${isActive ? color : 'transparent'}`,
                          ringColor: color,
                        }}
                      >
                        <div className="px-3 py-2.5">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-3 h-3 rounded flex items-center justify-center text-[8px] font-bold ${isActive ? 'text-white' : ''}`}
                                style={{ backgroundColor: color }}
                              >
                                {isActive && '✓'}
                              </span>
                              <span
                                className="text-sm font-medium"
                                style={{ color: isActive ? color : '#d4d4d8' }}
                              >
                                {AI_TYPE_LABELS[type]}
                              </span>
                            </div>
                            <span
                              className="text-sm font-semibold"
                              style={{ color: isActive ? color : '#fafafa' }}
                            >
                              {count}
                            </span>
                          </div>
                          {/* Progress bar */}
                          <div className="relative h-1 bg-black/20 rounded-full overflow-hidden">
                            <div
                              className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: color,
                                opacity: isActive ? 1 : 0.6,
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[10px] text-text-muted">
                              {percentage.toFixed(0)}%
                            </span>
                            <span className="text-[10px] text-text-muted">
                              {formatFunding(funding)}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Cell Detail Component
function CellDetail({
  cellKey,
  cell,
  segments,
  layers,
  onClose,
}: {
  cellKey: string;
  cell: {
    segment: string;
    layer: string;
    companies: Project[];
    totalFunding: number;
  };
  segments: typeof import('@/lib/data').segments;
  layers: typeof import('@/lib/data').layers;
  onClose: () => void;
}) {
  const segment = segments.find(s => s.slug === cell.segment);
  const layer = layers.find(l => l.slug === cell.layer);

  return (
    <div className="border-t border-border/50 p-5 bg-surface-2/30 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span
            className="px-2.5 py-1 rounded-lg text-sm font-semibold"
            style={{
              backgroundColor: `${segment?.color}20`,
              color: segment?.color,
            }}
          >
            {segment?.name}
          </span>
          <span className="text-text-muted">×</span>
          <span
            className="px-2.5 py-1 rounded-lg text-sm font-semibold"
            style={{
              backgroundColor: `${layer?.color}20`,
              color: layer?.color,
            }}
          >
            {layer?.name}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-text-muted">{cell.companies.length} companies</span>
          <span className="text-sm font-semibold text-green-400">{formatFunding(cell.totalFunding)}</span>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-1 rounded hover:bg-surface-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {cell.companies
          .sort((a, b) => (b.funding || 0) - (a.funding || 0))
          .map(project => (
            <Link
              key={project.slug}
              href={`/p/${project.slug}`}
              className="group flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded-lg hover:border-accent/50 transition-all"
            >
              {project.ai_type && (
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: AI_TYPE_COLORS[project.ai_type] }}
                />
              )}
              <span className="text-sm text-text-secondary group-hover:text-accent transition-colors">
                {project.name}
              </span>
              {project.funding && project.funding > 0 && (
                <span className="text-xs text-text-muted">{formatFunding(project.funding)}</span>
              )}
            </Link>
          ))}
      </div>
    </div>
  );
}
