'use client';

import { useState, useMemo, ReactNode } from 'react';
import Link from 'next/link';
import { Project, Segment, Layer, Stage, STAGE_LABELS } from '@/types';
import { formatFunding, formatStage } from '@/lib/data';
import {
  Search,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  ArrowUpDown,
  X,
} from 'lucide-react';
import Fuse from 'fuse.js';

// Tooltip component for showing additional categories
function Tooltip({ children, content }: { children: ReactNode; content: ReactNode }) {
  return (
    <span className="relative group/tooltip inline-flex items-center">
      {children}
      <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 hidden group-hover/tooltip:flex flex-col gap-1.5 px-3 py-2 bg-surface-3 border border-border rounded-md shadow-medium text-xs whitespace-nowrap animate-fade-in">
        {content}
      </span>
    </span>
  );
}

interface ProjectTableProps {
  projects: Project[];
  segments: Segment[];
  layers: Layer[];
  segmentFilter?: string | null;
  layerFilter?: string | null;
  onFilterChange?: (segment: string | null, layer: string | null) => void;
}

type SortKey = 'name' | 'segment' | 'layer' | 'stage' | 'funding' | 'founded';
type SortDir = 'asc' | 'desc';

const stages: Stage[] = [
  'pre_seed',
  'seed',
  'series_a',
  'series_b',
  'series_c_plus',
  'growth',
  'public',
  'acquired',
  'bootstrapped',
];

export default function ProjectTable({
  projects,
  segments,
  layers,
  segmentFilter,
  layerFilter,
  onFilterChange,
}: ProjectTableProps) {
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const fuse = useMemo(
    () =>
      new Fuse(projects, {
        keys: ['name', 'tagline', 'description'],
        threshold: 0.3,
      }),
    [projects]
  );

  const segmentMap = useMemo(
    () => Object.fromEntries(segments.map((s) => [s.slug, s])),
    [segments]
  );

  const layerMap = useMemo(
    () => Object.fromEntries(layers.map((l) => [l.slug, l])),
    [layers]
  );

  const filteredProjects = useMemo(() => {
    let result = projects;

    if (search) {
      result = fuse.search(search).map((r) => r.item);
    }

    if (segmentFilter) {
      result = result.filter(
        (p) => p.segment === segmentFilter || p.segments?.includes(segmentFilter)
      );
    }

    if (layerFilter) {
      result = result.filter(
        (p) => p.layer === layerFilter || p.layers?.includes(layerFilter)
      );
    }

    if (stageFilter) {
      result = result.filter((p) => p.stage === stageFilter);
    }

    result = [...result].sort((a, b) => {
      let comparison = 0;

      switch (sortKey) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'segment':
          comparison = a.segment.localeCompare(b.segment);
          break;
        case 'layer':
          const aPos = layerMap[a.layer]?.position || 0;
          const bPos = layerMap[b.layer]?.position || 0;
          comparison = bPos - aPos;
          break;
        case 'stage':
          const aStage = stages.indexOf(a.stage as Stage);
          const bStage = stages.indexOf(b.stage as Stage);
          comparison = aStage - bStage;
          break;
        case 'funding':
          comparison = (b.funding || 0) - (a.funding || 0);
          break;
        case 'founded':
          comparison = (b.founded || 0) - (a.founded || 0);
          break;
      }

      return sortDir === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [projects, search, segmentFilter, layerFilter, stageFilter, sortKey, sortDir, fuse, layerMap]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) {
      return <ArrowUpDown className="w-3 h-3 text-text-faint" />;
    }
    return sortDir === 'asc' ? (
      <ChevronUp className="w-3 h-3 text-accent" />
    ) : (
      <ChevronDown className="w-3 h-3 text-accent" />
    );
  };

  const clearFilters = () => {
    setSearch('');
    setStageFilter(null);
    onFilterChange?.(null, null);
  };

  const hasFilters = search || segmentFilter || layerFilter || stageFilter;

  const selectStyles = "px-3 py-2 bg-surface-2 border border-border rounded-md text-sm text-text-secondary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors cursor-pointer hover:border-border";

  return (
    <div className="bg-surface border border-border rounded-lg">
      {/* Toolbar */}
      <div className="p-4 border-b border-border">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-faint" />
            <input
              type="text"
              placeholder="Search companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-2 border border-border rounded-md text-sm text-text-primary placeholder:text-text-faint focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
            />
          </div>

          {/* Filters */}
          <select
            value={segmentFilter || ''}
            onChange={(e) => onFilterChange?.(e.target.value || null, layerFilter || null)}
            className={selectStyles}
          >
            <option value="">All Segments</option>
            {segments.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={layerFilter || ''}
            onChange={(e) => onFilterChange?.(segmentFilter || null, e.target.value || null)}
            className={selectStyles}
          >
            <option value="">All Layers</option>
            {layers.map((l) => (
              <option key={l.slug} value={l.slug}>
                {l.name}
              </option>
            ))}
          </select>

          <select
            value={stageFilter || ''}
            onChange={(e) => setStageFilter(e.target.value || null)}
            className={selectStyles}
          >
            <option value="">All Stages</option>
            {stages.map((s) => (
              <option key={s} value={s}>
                {STAGE_LABELS[s]}
              </option>
            ))}
          </select>

          {/* Clear & Count */}
          <div className="flex items-center gap-3 ml-auto">
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-text-muted hover:text-text-primary transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
            <span className="text-xs text-text-faint tabular-nums">
              {filteredProjects.length} of {projects.length}
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface-2/50">
              <th className="text-left px-4 py-3">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted hover:text-text-primary transition-colors"
                >
                  Company
                  <SortIcon column="name" />
                </button>
              </th>
              <th className="text-left px-4 py-3">
                <button
                  onClick={() => handleSort('segment')}
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted hover:text-text-primary transition-colors"
                >
                  Segment
                  <SortIcon column="segment" />
                </button>
              </th>
              <th className="text-left px-4 py-3">
                <button
                  onClick={() => handleSort('layer')}
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted hover:text-text-primary transition-colors"
                >
                  Layer
                  <SortIcon column="layer" />
                </button>
              </th>
              <th className="text-left px-4 py-3">
                <button
                  onClick={() => handleSort('stage')}
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted hover:text-text-primary transition-colors"
                >
                  Stage
                  <SortIcon column="stage" />
                </button>
              </th>
              <th className="text-right px-4 py-3">
                <button
                  onClick={() => handleSort('funding')}
                  className="flex items-center gap-2 ml-auto text-xs font-semibold uppercase tracking-wider text-text-muted hover:text-text-primary transition-colors"
                >
                  Funding
                  <SortIcon column="funding" />
                </button>
              </th>
              <th className="text-center px-4 py-3">
                <button
                  onClick={() => handleSort('founded')}
                  className="flex items-center gap-2 mx-auto text-xs font-semibold uppercase tracking-wider text-text-muted hover:text-text-primary transition-colors"
                >
                  Year
                  <SortIcon column="founded" />
                </button>
              </th>
              <th className="text-center px-4 py-3 w-12">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Link
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {filteredProjects.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <p className="text-text-muted">No companies found</p>
                  <p className="text-sm text-text-faint mt-1">Try adjusting your filters</p>
                </td>
              </tr>
            ) : (
              filteredProjects.map((project) => {
                const segment = segmentMap[project.segment];
                const layer = layerMap[project.layer];
                const additionalSegments = project.segments?.filter(s => s !== project.segment) || [];
                const additionalLayers = project.layers?.filter(l => l !== project.layer) || [];

                return (
                  <tr
                    key={project.slug}
                    className="hover:bg-surface-2/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/p/${project.slug}`}
                        className="group"
                      >
                        <span className="font-medium text-text-primary group-hover:text-accent transition-colors">
                          {project.name}
                        </span>
                        <p className="text-xs text-text-faint mt-0.5 line-clamp-1 max-w-xs">
                          {project.tagline}
                        </p>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {segment && (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="text-xs text-text-muted">
                            {segment.name}
                          </span>
                          {additionalSegments.length > 0 && (
                            <Tooltip
                              content={
                                <>
                                  {additionalSegments.map(slug => {
                                    const s = segmentMap[slug];
                                    return s ? (
                                      <span key={slug} className="text-text-secondary">
                                        {s.name}
                                      </span>
                                    ) : null;
                                  })}
                                </>
                              }
                            >
                              <span className="text-2xs px-1.5 py-0.5 rounded bg-surface-3 text-text-faint cursor-help">
                                +{additionalSegments.length}
                              </span>
                            </Tooltip>
                          )}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {layer && (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="text-xs text-text-muted">
                            {layer.name}
                          </span>
                          {additionalLayers.length > 0 && (
                            <Tooltip
                              content={
                                <>
                                  {additionalLayers.map(slug => {
                                    const l = layerMap[slug];
                                    return l ? (
                                      <span key={slug} className="text-text-secondary">
                                        {l.name}
                                      </span>
                                    ) : null;
                                  })}
                                </>
                              }
                            >
                              <span className="text-2xs px-1.5 py-0.5 rounded bg-surface-3 text-text-faint cursor-help">
                                +{additionalLayers.length}
                              </span>
                            </Tooltip>
                          )}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {project.stage && (
                        <span className="text-xs text-text-faint">
                          {formatStage(project.stage)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {project.funding ? (
                        <span className="text-sm font-medium tabular-nums text-text-secondary">
                          {formatFunding(project.funding)}
                        </span>
                      ) : (
                        <span className="text-xs text-text-faint">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {project.founded ? (
                        <span className="text-xs tabular-nums text-text-faint">{project.founded}</span>
                      ) : (
                        <span className="text-xs text-text-faint">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {project.website && (
                        <a
                          href={project.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-md text-text-faint hover:text-accent hover:bg-accent/10 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
