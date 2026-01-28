'use client';

import { useState, useMemo } from 'react';
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
import { formatFunding, formatFundingDate } from '@/lib/data';
import { Tooltip, CategoryBadge } from '@/components/ui';
import {
  Search,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  ArrowUpDown,
  X,
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

type SortKey = 'name' | 'segment' | 'layer' | 'ai_type' | 'funding' | 'last_funded' | 'region';
type SortDir = 'asc' | 'desc';

const regions: Region[] = ['americas', 'emea', 'apac'];
const aiTypes: AIType[] = ['llm', 'predictive-ml', 'computer-vision', 'graph-analytics', 'reinforcement-learning', 'agentic', 'data-platform', 'infrastructure'];

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
      result = result.filter((p) => p.ai_types?.includes(aiTypeFilter as AIType));
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
          const aType = a.ai_types?.[0] || '';
          const bType = b.ai_types?.[0] || '';
          comparison = aType.localeCompare(bType);
          break;
        case 'funding':
          const aFunding = a.funding || 0;
          const bFunding = b.funding || 0;
          comparison = bFunding - aFunding;
          break;
        case 'last_funded':
          const aDate = a.last_funding_date || '';
          const bDate = b.last_funding_date || '';
          comparison = bDate.localeCompare(aDate); // Descending by default (most recent first)
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

  const selectStyles = "form-select select-glass text-sm w-auto";

  return (
    <div className="bg-surface border border-border rounded-xl">
      {/* Toolbar */}
      <div className="p-5 border-b border-border/50">
        <div className="flex flex-wrap items-center gap-4">
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

          {/* Search - right aligned */}
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
                  Raised
                  <SortIcon column="funding" />
                </button>
              </th>
              <th className="text-left px-5 py-4">
                <button
                  onClick={() => handleSort('last_funded')}
                  className="flex items-center gap-2 label-refined hover:text-text-primary transition-colors"
                >
                  Last Funded
                  <SortIcon column="last_funded" />
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
                <td colSpan={8} className="px-5 py-16 text-center">
                  <p className="text-text-secondary text-lg">No companies found</p>
                  <p className="text-sm text-text-muted mt-2">Try adjusting your filters</p>
                </td>
              </tr>
            ) : (
              filteredProjects.map((project) => {
                // Determine which segment to show as primary (prefer filtered one)
                const allSegments = [project.segment, ...(project.segments || [])].filter((v, i, a) => a.indexOf(v) === i);
                const primarySegmentSlug = segmentFilter && allSegments.includes(segmentFilter)
                  ? segmentFilter
                  : project.segment;
                const segment = segmentMap[primarySegmentSlug];
                const additionalSegments = allSegments.filter(s => s !== primarySegmentSlug);

                // Determine which layer to show as primary (prefer filtered one)
                const allLayers = [project.layer, ...(project.layers || [])].filter((v, i, a) => a.indexOf(v) === i);
                const primaryLayerSlug = layerFilter && allLayers.includes(layerFilter)
                  ? layerFilter
                  : project.layer;
                const layer = layerMap[primaryLayerSlug];
                const additionalLayers = allLayers.filter(l => l !== primaryLayerSlug);

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
                            onClick={() => onFilterChange?.(
                              segmentFilter === primarySegmentSlug ? null : primarySegmentSlug,
                              layerFilter || null
                            )}
                            isActive={segmentFilter === primarySegmentSlug}
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
                                        onClick={() => onFilterChange?.(
                                          segmentFilter === slug ? null : slug,
                                          layerFilter || null
                                        )}
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
                            onClick={() => onFilterChange?.(
                              segmentFilter || null,
                              layerFilter === primaryLayerSlug ? null : primaryLayerSlug
                            )}
                            isActive={layerFilter === primaryLayerSlug}
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
                                        onClick={() => onFilterChange?.(
                                          segmentFilter || null,
                                          layerFilter === slug ? null : slug
                                        )}
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
                      {project.ai_types && project.ai_types.length > 0 ? (
                        <span className="inline-flex flex-wrap gap-1">
                          {project.ai_types.map(t => (
                            <CategoryBadge
                              key={t}
                              label={AI_TYPE_LABELS[t]}
                              color={AI_TYPE_COLORS[t]}
                              onClick={() => setAiTypeFilter(aiTypeFilter === t ? null : t)}
                              isActive={aiTypeFilter === t}
                            />
                          ))}
                        </span>
                      ) : (
                        <span className="text-sm text-text-faint">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-left">
                      {project.funding ? (
                        <span className="text-sm font-medium text-accent tabular-nums">
                          {formatFunding(project.funding)}
                        </span>
                      ) : (
                        <span className="text-sm text-text-faint">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {project.last_funding_date ? (
                        <span className="text-sm text-text-secondary tabular-nums">
                          {formatFundingDate(project.last_funding_date)}
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
