'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Project, Segment, Layer, Stage, STAGE_LABELS } from '@/types';
import { formatFunding, formatStage } from '@/lib/data';
import {
  Search,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  ArrowUpDown,
} from 'lucide-react';
import Fuse from 'fuse.js';

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

    // Search
    if (search) {
      result = fuse.search(search).map((r) => r.item);
    }

    // Segment filter
    if (segmentFilter) {
      result = result.filter(
        (p) => p.segment === segmentFilter || p.segments?.includes(segmentFilter)
      );
    }

    // Layer filter
    if (layerFilter) {
      result = result.filter(
        (p) => p.layer === layerFilter || p.layers?.includes(layerFilter)
      );
    }

    // Stage filter
    if (stageFilter) {
      result = result.filter((p) => p.stage === stageFilter);
    }

    // Sort
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
      return <ArrowUpDown className="w-3 h-3 opacity-30" />;
    }
    return sortDir === 'asc' ? (
      <ChevronUp className="w-3 h-3" />
    ) : (
      <ChevronDown className="w-3 h-3" />
    );
  };

  const clearFilters = () => {
    setSearch('');
    setStageFilter(null);
    onFilterChange?.(null, null);
  };

  const hasFilters = search || segmentFilter || layerFilter || stageFilter;

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="p-3 border-b border-border flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-background border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
          />
        </div>

        {/* Segment Filter */}
        <select
          value={segmentFilter || ''}
          onChange={(e) => onFilterChange?.(e.target.value || null, layerFilter || null)}
          className="px-3 py-1.5 bg-background border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="">All Segments</option>
          {segments.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Layer Filter */}
        <select
          value={layerFilter || ''}
          onChange={(e) => onFilterChange?.(segmentFilter || null, e.target.value || null)}
          className="px-3 py-1.5 bg-background border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="">All Layers</option>
          {layers.map((l) => (
            <option key={l.slug} value={l.slug}>
              {l.name}
            </option>
          ))}
        </select>

        {/* Stage Filter */}
        <select
          value={stageFilter || ''}
          onChange={(e) => setStageFilter(e.target.value || null)}
          className="px-3 py-1.5 bg-background border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="">All Stages</option>
          {stages.map((s) => (
            <option key={s} value={s}>
              {STAGE_LABELS[s]}
            </option>
          ))}
        </select>

        {/* Clear */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            Clear
          </button>
        )}

        {/* Count */}
        <span className="text-xs text-text-muted ml-auto">
          {filteredProjects.length} of {projects.length}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-background">
              <th className="text-left p-3 font-medium">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-1 hover:text-accent transition-colors"
                >
                  Company
                  <SortIcon column="name" />
                </button>
              </th>
              <th className="text-left p-3 font-medium">
                <button
                  onClick={() => handleSort('segment')}
                  className="flex items-center gap-1 hover:text-accent transition-colors"
                >
                  Segment
                  <SortIcon column="segment" />
                </button>
              </th>
              <th className="text-left p-3 font-medium">
                <button
                  onClick={() => handleSort('layer')}
                  className="flex items-center gap-1 hover:text-accent transition-colors"
                >
                  Layer
                  <SortIcon column="layer" />
                </button>
              </th>
              <th className="text-left p-3 font-medium">
                <button
                  onClick={() => handleSort('stage')}
                  className="flex items-center gap-1 hover:text-accent transition-colors"
                >
                  Stage
                  <SortIcon column="stage" />
                </button>
              </th>
              <th className="text-right p-3 font-medium">
                <button
                  onClick={() => handleSort('funding')}
                  className="flex items-center gap-1 ml-auto hover:text-accent transition-colors"
                >
                  Funding
                  <SortIcon column="funding" />
                </button>
              </th>
              <th className="text-center p-3 font-medium">
                <button
                  onClick={() => handleSort('founded')}
                  className="flex items-center gap-1 mx-auto hover:text-accent transition-colors"
                >
                  Year
                  <SortIcon column="founded" />
                </button>
              </th>
              <th className="text-center p-3 font-medium w-10">Link</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-text-muted">
                  No projects found
                </td>
              </tr>
            ) : (
              filteredProjects.map((project) => {
                const segment = segmentMap[project.segment];
                const layer = layerMap[project.layer];

                return (
                  <tr
                    key={project.slug}
                    className="border-b border-border hover:bg-surface-2/50 transition-colors"
                  >
                    <td className="p-3">
                      <Link
                        href={`/p/${project.slug}`}
                        className="font-medium hover:text-accent transition-colors"
                      >
                        {project.name}
                      </Link>
                      <p className="text-xs text-text-muted truncate max-w-xs">
                        {project.tagline}
                      </p>
                    </td>
                    <td className="p-3">
                      {segment && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap"
                          style={{
                            backgroundColor: `${segment.color}20`,
                            color: segment.color,
                          }}
                        >
                          {segment.name}
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {layer && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap"
                          style={{
                            backgroundColor: `${layer.color}20`,
                            color: layer.color,
                          }}
                        >
                          {layer.name}
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {project.stage && (
                        <span className="text-xs text-text-muted">
                          {formatStage(project.stage)}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {project.funding ? (
                        <span className="text-xs font-mono">
                          {formatFunding(project.funding)}
                        </span>
                      ) : (
                        <span className="text-xs text-text-muted">-</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {project.founded ? (
                        <span className="text-xs text-text-muted">{project.founded}</span>
                      ) : (
                        <span className="text-xs text-text-muted">-</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {project.website && (
                        <a
                          href={project.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-text-muted hover:text-accent transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5 inline" />
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
