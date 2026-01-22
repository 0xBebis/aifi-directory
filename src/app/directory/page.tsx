'use client';

import { useState, useMemo } from 'react';
import { projects, segments, layers } from '@/lib/data';
import MarketMap from '@/components/MarketMap';
import ProjectTable from '@/components/ProjectTable';

export type CryptoFilter = 'all' | 'crypto' | 'traditional';

export default function DirectoryPage() {
  const [segmentFilter, setSegmentFilter] = useState<string | null>(null);
  const [layerFilter, setLayerFilter] = useState<string | null>(null);
  const [cryptoFilter, setCryptoFilter] = useState<CryptoFilter>('all');

  // Filter projects based on crypto toggle
  const filteredProjects = useMemo(() => {
    if (cryptoFilter === 'all') return projects;
    if (cryptoFilter === 'crypto') return projects.filter(p => p.crypto === true);
    return projects.filter(p => !p.crypto);
  }, [cryptoFilter]);

  const handleMapCellClick = (segment: string | null, layer: string | null) => {
    setSegmentFilter(segment);
    setLayerFilter(layer);
  };

  const handleFilterChange = (segment: string | null, layer: string | null) => {
    setSegmentFilter(segment);
    setLayerFilter(layer);
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-10">
      {/* Editorial Header */}
      <div className="mb-8">
        {/* Eyebrow */}
        <p className="label-refined mb-3 text-accent">
          The Index
        </p>

        {/* Main headline */}
        <h1 className="headline-display mb-4">
          AIFi Directory
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-text-secondary max-w-xl leading-relaxed">
          Tracking {projects.length} companies building at the intersection of
          artificial intelligence and financial services.
        </p>


      </div>

      {/* Market Map */}
      <div className="mb-10">
        <MarketMap
          projects={filteredProjects}
          segments={segments}
          layers={layers}
          onCellClick={handleMapCellClick}
          activeSegment={segmentFilter}
          activeLayer={layerFilter}
          cryptoFilter={cryptoFilter}
          onCryptoFilterChange={setCryptoFilter}
        />
      </div>

      {/* Project Table */}
      <ProjectTable
        projects={filteredProjects}
        segments={segments}
        layers={layers}
        segmentFilter={segmentFilter}
        layerFilter={layerFilter}
        onFilterChange={handleFilterChange}
      />
    </div>
  );
}
