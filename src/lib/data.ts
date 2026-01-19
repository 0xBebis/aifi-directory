import { Project, Segment, Layer, STAGE_LABELS, Stage } from '@/types';
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
