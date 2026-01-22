'use client';

import { useState, useMemo, ReactNode } from 'react';
import Link from 'next/link';
import {
  Project,
  Segment,
  Layer,
  Region,
  AIType,
  REGION_LABELS,
  AI_TYPE_LABELS,
  AI_TYPE_COLORS,
} from '@/types';
import { formatFunding } from '@/lib/data';
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
      <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 hidden group-hover/tooltip:flex flex-col gap-1.5 px-3 py-2 bg-surface-3 border border-border rounded-lg shadow-medium text-xs whitespace-nowrap animate-fade-in">
        {content}
      </span>
    </span>
  );
}

// Colored badge component for categories
function CategoryBadge({
  label,
  color,
  onClick,
  isActive = false,
}: {
  label: string;
  color: string;
  onClick?: () => void;
  isActive?: boolean;
}) {
  const isClickable = !!onClick;
  return (
    <span
      onClick={(e) => {
        if (onClick) {
          e.stopPropagation();
          onClick();
        }
      }}
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium transition-all ${
        isClickable ? 'cursor-pointer hover:scale-105' : ''
      } ${isActive ? 'ring-1 ring-offset-1 ring-offset-surface' : ''}`}
      style={{
        backgroundColor: isActive ? `${color}25` : `${color}15`,
        color: color,
        border: `1px solid ${isActive ? color : `${color}30`}`,
        ringColor: isActive ? color : undefined,
      }}
    >
      {label}
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

type SortKey = 'name' | 'segment' | 'layer' | 'ai_type' | 'funding' | 'region';
type SortDir = 'asc' | 'desc';

const regions: Region[] = ['americas', 'emea', 'apac'];
const aiTypes: AIType[] = ['llm', 'predictive-ml', 'computer-vision', 'graph-analytics', 'reinforcement-learning', 'agentic', 'multi-modal', 'data-platform', 'infrastructure'];

export default function ProjectTable({
  projects,
  segments,
  layers,
  segmentFilter,
  layerFilter,
  onFilterChange,
}: ProjectTableProps) {
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState<string | null>(null);
  const [aiTypeFilter, setAiTypeFilter] = useState<string | null>(null);
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

    if (regionFilter) {
      result = result.filter((p) => p.region === regionFilter);
    }

    if (aiTypeFilter) {
      result = result.filter((p) => p.ai_type === aiTypeFilter);
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
        case 'ai_type':
          const aType = a.ai_type || '';
          const bType = b.ai_type || '';
          comparison = aType.localeCompare(bType);
          break;
        case 'funding':
          const aFunding = a.funding || 0;
          const bFunding = b.funding || 0;
          comparison = bFunding - aFunding;
          break;
        case 'region':
          const aRegion = regions.indexOf(a.region as Region);
          const bRegion = regions.indexOf(b.region as Region);
          comparison = aRegion - bRegion;
          break;
      }

      return sortDir === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [projects, search, segmentFilter, layerFilter, regionFilter, aiTypeFilter, sortKey, sortDir, fuse, layerMap]);

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
    setRegionFilter(null);
    setAiTypeFilter(null);
    onFilterChange?.(null, null);
  };

  const hasFilters = search || segmentFilter || layerFilter || regionFilter || aiTypeFilter;

  const selectStyles = "select-glass px-4 py-3 bg-[#18181b]/80 backdrop-blur-xl border border-white/10 rounded-lg text-sm text-text-primary hover:border-white/20 focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-all duration-200 cursor-pointer";

  return (
    <div className="bg-surface border border-border rounded-xl">
      {/* Toolbar */}
      <div className="p-5 border-b border-border/50">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-5 py-3 bg-surface-2/50 border border-border/50 rounded-lg text-sm text-text-primary placeholder:text-text-faint hover:border-border focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-all duration-200"
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
            value={regionFilter || ''}
            onChange={(e) => setRegionFilter(e.target.value || null)}
            className={selectStyles}
          >
            <option value="">All Regions</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {REGION_LABELS[r]}
              </option>
            ))}
          </select>

          <select
            value={aiTypeFilter || ''}
            onChange={(e) => setAiTypeFilter(e.target.value || null)}
            className={selectStyles}
          >
            <option value="">All AI Types</option>
            {aiTypes.map((t) => (
              <option key={t} value={t}>
                {AI_TYPE_LABELS[t]}
              </option>
            ))}
          </select>

          {/* Clear */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-3 text-sm text-text-muted hover:text-text-primary transition-colors"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>

        {/* Result count */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
          <span className="meta-text">
            Showing <span className="text-text-primary font-medium">{filteredProjects.length}</span> of {projects.length} companies
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface-2/30">
              <th className="text-left px-5 py-4">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-2 label-refined hover:text-text-primary transition-colors"
                >
                  Company
                  <SortIcon column="name" />
                </button>
              </th>
              <th className="text-left px-5 py-4">
                <button
                  onClick={() => handleSort('segment')}
                  className="flex items-center gap-2 label-refined hover:text-text-primary transition-colors"
                >
                  Segment
                  <SortIcon column="segment" />
                </button>
              </th>
              <th className="text-left px-5 py-4">
                <button
                  onClick={() => handleSort('layer')}
                  className="flex items-center gap-2 label-refined hover:text-text-primary transition-colors"
                >
                  Layer
                  <SortIcon column="layer" />
                </button>
              </th>
              <th className="text-left px-5 py-4">
                <button
                  onClick={() => handleSort('ai_type')}
                  className="flex items-center gap-2 label-refined hover:text-text-primary transition-colors"
                >
                  AI Type
                  <SortIcon column="ai_type" />
                </button>
              </th>
              <th className="text-left px-5 py-4">
                <button
                  onClick={() => handleSort('funding')}
                  className="flex items-center gap-2 label-refined hover:text-text-primary transition-colors"
                >
                  Funds Raised
                  <SortIcon column="funding" />
                </button>
              </th>
              <th className="text-left px-5 py-4">
                <button
                  onClick={() => handleSort('region')}
                  className="flex items-center gap-2 label-refined hover:text-text-primary transition-colors"
                >
                  Region
                  <SortIcon column="region" />
                </button>
              </th>
              <th className="text-center px-5 py-4 w-14">
                <span className="label-refined">
                  Link
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {filteredProjects.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center">
                  <p className="text-text-secondary text-lg">No companies found</p>
                  <p className="text-sm text-text-muted mt-2">Try adjusting your filters</p>
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
                    className="hover:bg-surface-2/40 transition-colors duration-150"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/p/${project.slug}`}
                        className="group block"
                      >
                        <span className="font-medium text-text-primary group-hover:text-accent transition-colors">
                          {project.name}
                        </span>
                        <p className="text-sm text-text-muted mt-0.5 line-clamp-1 max-w-xs">
                          {project.tagline}
                        </p>
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      {segment && (
                        <span className="inline-flex items-center gap-2">
                          <CategoryBadge
                            label={segment.name}
                            color={segment.color}
                            onClick={() => onFilterChange?.(segment.slug, layerFilter || null)}
                            isActive={segmentFilter === segment.slug}
                          />
                          {additionalSegments.length > 0 && (
                            <Tooltip
                              content={
                                <>
                                  {additionalSegments.map(slug => {
                                    const s = segmentMap[slug];
                                    return s ? (
                                      <CategoryBadge
                                        key={slug}
                                        label={s.name}
                                        color={s.color}
                                        onClick={() => onFilterChange?.(slug, layerFilter || null)}
                                        isActive={segmentFilter === slug}
                                      />
                                    ) : null;
                                  })}
                                </>
                              }
                            >
                              <span className="text-2xs px-1.5 py-0.5 rounded-md bg-surface-3 text-text-faint cursor-help">
                                +{additionalSegments.length}
                              </span>
                            </Tooltip>
                          )}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {layer && (
                        <span className="inline-flex items-center gap-2">
                          <CategoryBadge
                            label={layer.name}
                            color={layer.color}
                            onClick={() => onFilterChange?.(segmentFilter || null, layer.slug)}
                            isActive={layerFilter === layer.slug}
                          />
                          {additionalLayers.length > 0 && (
                            <Tooltip
                              content={
                                <>
                                  {additionalLayers.map(slug => {
                                    const l = layerMap[slug];
                                    return l ? (
                                      <CategoryBadge
                                        key={slug}
                                        label={l.name}
                                        color={l.color}
                                        onClick={() => onFilterChange?.(segmentFilter || null, slug)}
                                        isActive={layerFilter === slug}
                                      />
                                    ) : null;
                                  })}
                                </>
                              }
                            >
                              <span className="text-2xs px-1.5 py-0.5 rounded-md bg-surface-3 text-text-faint cursor-help">
                                +{additionalLayers.length}
                              </span>
                            </Tooltip>
                          )}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {project.ai_type ? (
                        <CategoryBadge
                          label={AI_TYPE_LABELS[project.ai_type]}
                          color={AI_TYPE_COLORS[project.ai_type]}
                          onClick={() => setAiTypeFilter(aiTypeFilter === project.ai_type ? null : project.ai_type!)}
                          isActive={aiTypeFilter === project.ai_type}
                        />
                      ) : (
                        <span className="text-sm text-text-faint">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {project.funding ? (
                        <span className="text-sm font-medium text-accent tabular-nums">
                          {formatFunding(project.funding)}
                        </span>
                      ) : (
                        <span className="text-sm text-text-faint">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {project.region ? (
                        <span
                          className={`text-sm cursor-pointer transition-colors ${
                            regionFilter === project.region
                              ? 'text-accent font-medium'
                              : 'text-text-muted hover:text-text-primary'
                          }`}
                          onClick={() => setRegionFilter(regionFilter === project.region ? null : project.region!)}
                        >
                          {REGION_LABELS[project.region as Region]}
                        </span>
                      ) : (
                        <span className="text-sm text-text-faint">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {project.website && (
                        <a
                          href={project.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-text-faint hover:text-accent hover:bg-accent/10 transition-all duration-200"
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
