'use client';

import { useState, useMemo } from 'react';
import MarketMatrix from '@/components/MarketMatrix';
import ProjectTable from '@/components/ProjectTable';
import { Project, Segment, Layer, AIType } from '@/types';

interface DirectoryBrowserProps {
  projects: Project[];
  segments: Segment[];
  layers: Layer[];
}

export default function DirectoryBrowser({ projects, segments, layers }: DirectoryBrowserProps) {
  const [segmentFilters, setSegmentFilters] = useState<string[]>([]);
  const [layerFilters, setLayerFilters] = useState<string[]>([]);
  const [aiTypeFilters, setAiTypeFilters] = useState<AIType[]>([]);

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
