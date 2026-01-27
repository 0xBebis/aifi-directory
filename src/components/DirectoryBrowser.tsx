'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import MarketMatrix from '@/components/MarketMatrix';
import ProjectTable from '@/components/ProjectTable';
import { Project, Segment, Layer, AIType } from '@/types';

interface DirectoryBrowserProps {
  projects: Project[];
  segments: Segment[];
  layers: Layer[];
}

const AI_TYPES: AIType[] = ['llm', 'predictive-ml', 'computer-vision', 'graph-analytics', 'reinforcement-learning', 'agentic', 'data-platform', 'infrastructure'];

function parseAITypes(param: string | null): AIType[] {
  if (!param) return [];
  return param.split(',').filter((t): t is AIType => AI_TYPES.includes(t as AIType));
}

function parseList(param: string | null): string[] {
  if (!param) return [];
  return param.split(',').filter(Boolean);
}

export default function DirectoryBrowser({ projects, segments, layers }: DirectoryBrowserProps) {
  const searchParams = useSearchParams();

  // Initialize from URL params
  const [segmentFilters, setSegmentFilters] = useState<string[]>(() => parseList(searchParams.get('segment')));
  const [layerFilters, setLayerFilters] = useState<string[]>(() => parseList(searchParams.get('layer')));
  const [aiTypeFilters, setAiTypeFilters] = useState<AIType[]>(() => parseAITypes(searchParams.get('aiType')));

  // Sync state to URL (without triggering navigation)
  const updateURL = useCallback((segs: string[], lays: string[], ais: AIType[]) => {
    const params = new URLSearchParams();
    if (segs.length > 0) params.set('segment', segs.join(','));
    if (lays.length > 0) params.set('layer', lays.join(','));
    if (ais.length > 0) params.set('aiType', ais.join(','));
    const qs = params.toString();
    const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, '', url);
  }, []);

  // Update URL when filters change
  useEffect(() => {
    updateURL(segmentFilters, layerFilters, aiTypeFilters);
  }, [segmentFilters, layerFilters, aiTypeFilters, updateURL]);

  // Filter projects based on selections
  const filteredProjects = useMemo(() => {
    let result = projects;

    // Filter by AI types
    if (aiTypeFilters.length > 0) {
      result = result.filter(p => p.ai_types?.some(t => aiTypeFilters.includes(t)));
    }

    return result;
  }, [projects, aiTypeFilters]);

  const handleMatrixFilterChange = (segs: string[], lays: string[], ais: AIType[]) => {
    setSegmentFilters(segs);
    setLayerFilters(lays);
    setAiTypeFilters(ais);
  };

  // For ProjectTable compatibility (single segment/layer filter)
  const segmentFilter = segmentFilters.length === 1 ? segmentFilters[0] : segmentFilters.length > 0 ? segmentFilters[0] : null;
  const layerFilter = layerFilters.length === 1 ? layerFilters[0] : layerFilters.length > 0 ? layerFilters[0] : null;

  const handleTableFilterChange = (segment: string | null, layer: string | null) => {
    setSegmentFilters(segment ? [segment] : []);
    setLayerFilters(layer ? [layer] : []);
  };

  return (
    <>
      {/* Market Matrix */}
      <div className="mb-10">
        <MarketMatrix
          projects={filteredProjects}
          onFilterChange={handleMatrixFilterChange}
          activeSegments={segmentFilters}
          activeLayers={layerFilters}
          activeAiTypes={aiTypeFilters}
        />
      </div>

      {/* Project Table */}
      <ProjectTable
        projects={filteredProjects}
        segments={segments}
        layers={layers}
        segmentFilter={segmentFilter}
        layerFilter={layerFilter}
        onFilterChange={handleTableFilterChange}
      />
    </>
  );
}
