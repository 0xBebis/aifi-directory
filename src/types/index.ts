export interface Project {
  slug: string;
  name: string;
  logo?: string;
  tagline: string;
  description?: string;
  website?: string;
  twitter?: string;
  linkedin?: string;
  segment: string;
  segments?: string[];
  layer: string;
  layers?: string[];
  stage?: Stage;
  funding?: number;
  founded?: number;
  hq_country?: string;
  hq_city?: string;
  team?: TeamMember[];
}

export interface TeamMember {
  name: string;
  role: string;
  linkedin?: string;
}

export interface Segment {
  slug: string;
  name: string;
  description: string;
  icon?: string;
  color: string;
}

export interface Layer {
  slug: string;
  name: string;
  description: string;
  position: number;
  icon?: string;
  color: string;
}

export type Stage =
  | 'pre_seed'
  | 'seed'
  | 'series_a'
  | 'series_b'
  | 'series_c_plus'
  | 'growth'
  | 'public'
  | 'acquired'
  | 'bootstrapped';

export const STAGE_LABELS: Record<Stage, string> = {
  pre_seed: 'Pre-Seed',
  seed: 'Seed',
  series_a: 'Series A',
  series_b: 'Series B',
  series_c_plus: 'Series C+',
  growth: 'Growth',
  public: 'Public',
  acquired: 'Acquired',
  bootstrapped: 'Bootstrapped',
};
