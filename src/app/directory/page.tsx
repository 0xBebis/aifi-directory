'use client';

import { useState, useMemo } from 'react';
import { projects, segments, layers } from '@/lib/data';
import MarketMatrix from '@/components/MarketMatrix';
import ProjectTable from '@/components/ProjectTable';
import { AIType } from '@/types';

export default function DirectoryPage() {
  const [segmentFilters, setSegmentFilters] = useState<string[]>([]);
  const [layerFilters, setLayerFilters] = useState<string[]>([]);
  const [aiTypeFilters, setAiTypeFilters] = useState<AIType[]>([]);

  // Filter projects based on selections
  const filteredProjects = useMemo(() => {
    let result = projects;

    // Filter by AI types
    if (aiTypeFilters.length > 0) {
      result = result.filter(p => p.ai_type && aiTypeFilters.includes(p.ai_type));
    }

    return result;
  }, [aiTypeFilters]);

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
    <div className="max-w-7xl mx-auto px-8 py-10">
      {/* Editorial Header */}
      <div className="mb-8">
        <p className="label-refined mb-3 text-accent">
          The Index
        </p>
        <h1 className="headline-display mb-4">
          AIFi Directory
        </h1>
        <p className="text-lg text-text-secondary max-w-xl leading-relaxed">
          Tracking {projects.length} companies building at the intersection of
          artificial intelligence and financial services.
        </p>
      </div>

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
    </div>
  );
}
