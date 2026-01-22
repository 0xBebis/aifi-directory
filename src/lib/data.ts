import { Project, Segment, Layer, STAGE_LABELS, Stage, AIType, AI_TYPE_LABELS, AI_TYPE_COLORS } from '@/types';
import projectsData from '@/data/projects.json';
import segmentsData from '@/data/segments.json';
import layersData from '@/data/layers.json';

export const projects: Project[] = projectsData as Project[];
export const segments: Segment[] = segmentsData as Segment[];
export const layers: Layer[] = (layersData as Layer[]).sort((a, b) => b.position - a.position);

export function getProject(slug: string): Project | undefined {
  return projects.find(p => p.slug === slug);
}

export function getSegment(slug: string): Segment | undefined {
  return segments.find(s => s.slug === slug);
}

export function getLayer(slug: string): Layer | undefined {
  return layers.find(l => l.slug === slug);
}

export function getProjectsBySegment(segmentSlug: string): Project[] {
  return projects.filter(p =>
    p.segment === segmentSlug || p.segments?.includes(segmentSlug)
  );
}

export function getProjectsByLayer(layerSlug: string): Project[] {
  return projects.filter(p =>
    p.layer === layerSlug || p.layers?.includes(layerSlug)
  );
}

export function getSimilarProjects(project: Project, limit: number = 4): Project[] {
  return projects
    .filter(p => p.slug !== project.slug)
    .filter(p => p.segment === project.segment || p.layer === project.layer)
    .slice(0, limit);
}

export function getSegmentCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  segments.forEach(s => {
    counts[s.slug] = getProjectsBySegment(s.slug).length;
  });
  return counts;
}

export function getLayerCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  layers.forEach(l => {
    counts[l.slug] = getProjectsByLayer(l.slug).length;
  });
  return counts;
}

export function formatFunding(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  }
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(0)}M`;
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(0)}K`;
  }
  return `$${amount}`;
}

export function formatStage(stage: Stage): string {
  return STAGE_LABELS[stage] || stage;
}

export function getCountryName(code: string): string {
  const countries: Record<string, string> = {
    US: 'United States',
    GB: 'United Kingdom',
    CA: 'Canada',
    FR: 'France',
    DE: 'Germany',
    SG: 'Singapore',
    JP: 'Japan',
    AU: 'Australia',
    NL: 'Netherlands',
    CH: 'Switzerland',
  };
  return countries[code] || code;
}

// Homepage data helpers

export function getTotalFunding(): number {
  return projects.reduce((sum, p) => sum + (p.funding || 0), 0);
}

export function getTopCompanies(limit: number = 10): Project[] {
  return [...projects]
    .filter(p => p.funding && p.funding > 0)
    .sort((a, b) => (b.funding || 0) - (a.funding || 0))
    .slice(0, limit);
}

export function getTopCompaniesBySegment(segmentSlug: string, limit: number = 3): Project[] {
  return getProjectsBySegment(segmentSlug)
    .filter(p => p.funding && p.funding > 0)
    .sort((a, b) => (b.funding || 0) - (a.funding || 0))
    .slice(0, limit);
}

export function getFundingStageDistribution(): Record<string, number> {
  const distribution: Record<string, number> = {};
  projects.forEach(p => {
    const stage = p.funding_stage || 'undisclosed';
    distribution[stage] = (distribution[stage] || 0) + 1;
  });
  return distribution;
}

export function getRegionDistribution(): Record<string, number> {
  const distribution: Record<string, number> = {};
  projects.forEach(p => {
    const region = p.region || 'unknown';
    distribution[region] = (distribution[region] || 0) + 1;
  });
  return distribution;
}

export function getSegmentStats(): Array<{
  segment: Segment;
  count: number;
  topCompanies: Project[];
}> {
  return segments.map(segment => ({
    segment,
    count: getProjectsBySegment(segment.slug).length,
    topCompanies: getTopCompaniesBySegment(segment.slug, 3),
  }));
}

// Market Map utilities

export interface MarketCell {
  segmentSlug: string;
  layerSlug: string;
  companies: Project[];
  count: number;
  totalFunding: number;
  avgFunding: number;
  aiTypeBreakdown: Record<string, number>;
}

export interface MarketMapData {
  cells: MarketCell[][];
  segmentTotals: Record<string, { count: number; funding: number }>;
  layerTotals: Record<string, { count: number; funding: number }>;
  aiTypeTotals: Record<string, { count: number; funding: number }>;
  maxCount: number;
  maxFunding: number;
  totalCompanies: number;
  totalFunding: number;
}

export function getMarketMapData(aiTypeFilter?: AIType | null): MarketMapData {
  // Filter projects by AI type if specified
  const filteredProjects = aiTypeFilter
    ? projects.filter(p => p.ai_type === aiTypeFilter)
    : projects;

  // Initialize the grid
  const cells: MarketCell[][] = segments.map(segment =>
    layers.map(layer => ({
      segmentSlug: segment.slug,
      layerSlug: layer.slug,
      companies: [],
      count: 0,
      totalFunding: 0,
      avgFunding: 0,
      aiTypeBreakdown: {},
    }))
  );

  // Populate the grid
  filteredProjects.forEach(project => {
    const segmentIndex = segments.findIndex(s => s.slug === project.segment);
    const layerIndex = layers.findIndex(l => l.slug === project.layer);

    if (segmentIndex !== -1 && layerIndex !== -1) {
      const cell = cells[segmentIndex][layerIndex];
      cell.companies.push(project);
      cell.count++;
      cell.totalFunding += project.funding || 0;

      // Track AI type breakdown
      const aiType = project.ai_type || 'unknown';
      cell.aiTypeBreakdown[aiType] = (cell.aiTypeBreakdown[aiType] || 0) + 1;
    }
  });

  // Calculate averages and find max values
  let maxCount = 0;
  let maxFunding = 0;

  cells.forEach(row => {
    row.forEach(cell => {
      cell.avgFunding = cell.count > 0 ? cell.totalFunding / cell.count : 0;
      maxCount = Math.max(maxCount, cell.count);
      maxFunding = Math.max(maxFunding, cell.totalFunding);
    });
  });

  // Calculate segment totals
  const segmentTotals: Record<string, { count: number; funding: number }> = {};
  segments.forEach((segment, i) => {
    segmentTotals[segment.slug] = cells[i].reduce(
      (acc, cell) => ({
        count: acc.count + cell.count,
        funding: acc.funding + cell.totalFunding,
      }),
      { count: 0, funding: 0 }
    );
  });

  // Calculate layer totals
  const layerTotals: Record<string, { count: number; funding: number }> = {};
  layers.forEach((layer, j) => {
    layerTotals[layer.slug] = cells.reduce(
      (acc, row) => ({
        count: acc.count + row[j].count,
        funding: acc.funding + row[j].totalFunding,
      }),
      { count: 0, funding: 0 }
    );
  });

  // Calculate AI type totals
  const aiTypeTotals: Record<string, { count: number; funding: number }> = {};
  filteredProjects.forEach(project => {
    const aiType = project.ai_type || 'unknown';
    if (!aiTypeTotals[aiType]) {
      aiTypeTotals[aiType] = { count: 0, funding: 0 };
    }
    aiTypeTotals[aiType].count++;
    aiTypeTotals[aiType].funding += project.funding || 0;
  });

  return {
    cells,
    segmentTotals,
    layerTotals,
    aiTypeTotals,
    maxCount,
    maxFunding,
    totalCompanies: filteredProjects.length,
    totalFunding: filteredProjects.reduce((sum, p) => sum + (p.funding || 0), 0),
  };
}

export function getProjectsAtIntersection(
  segmentSlug: string,
  layerSlug: string,
  aiTypeFilter?: AIType | null
): Project[] {
  return projects.filter(p => {
    const matchesSegment = p.segment === segmentSlug || p.segments?.includes(segmentSlug);
    const matchesLayer = p.layer === layerSlug || p.layers?.includes(layerSlug);
    const matchesAiType = !aiTypeFilter || p.ai_type === aiTypeFilter;
    return matchesSegment && matchesLayer && matchesAiType;
  });
}

export const aiTypes: AIType[] = [
  'llm',
  'predictive-ml',
  'computer-vision',
  'graph-analytics',
  'reinforcement-learning',
  'agentic',
  'multi-modal',
  'data-platform',
  'infrastructure',
];

export { AI_TYPE_LABELS, AI_TYPE_COLORS };
