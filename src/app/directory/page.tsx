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
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
          AI + Finance Directory
        </h1>
        <p className="text-text-muted mt-2">
          {projects.length} companies building at the intersection of artificial intelligence and financial services.
        </p>
      </div>

      {/* Market Map */}
      <div className="mb-8">
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
