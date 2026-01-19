'use client';

import { useState } from 'react';
import { projects, segments, layers } from '@/lib/data';
import MarketMap from '@/components/MarketMap';
import ProjectTable from '@/components/ProjectTable';

export default function DirectoryPage() {
  const [segmentFilter, setSegmentFilter] = useState<string | null>(null);
  const [layerFilter, setLayerFilter] = useState<string | null>(null);

  const handleMapCellClick = (segment: string | null, layer: string | null) => {
    setSegmentFilter(segment);
    setLayerFilter(layer);
  };

  const handleFilterChange = (segment: string | null, layer: string | null) => {
    setSegmentFilter(segment);
    setLayerFilter(layer);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">AI + Finance Directory</h1>
        <p className="text-text-muted text-sm mt-1">
          {projects.length} companies building at the intersection of AI and Finance
        </p>
      </div>

      {/* Market Map */}
      <div className="mb-6">
        <MarketMap
          projects={projects}
          segments={segments}
          layers={layers}
          onCellClick={handleMapCellClick}
          activeSegment={segmentFilter}
          activeLayer={layerFilter}
        />
      </div>

      {/* Project Table */}
      <ProjectTable
        projects={projects}
        segments={segments}
        layers={layers}
        segmentFilter={segmentFilter}
        layerFilter={layerFilter}
        onFilterChange={handleFilterChange}
      />
    </div>
  );
}
