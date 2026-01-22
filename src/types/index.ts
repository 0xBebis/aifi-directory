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
  // Legacy fields (deprecated)
  stage?: Stage;
  funding?: number;
  // New structured fields
  company_type?: CompanyType;
  funding_stage?: FundingStage;
  region?: Region;
  founded?: number;
  hq_country?: string;
  hq_city?: string;
  team?: TeamMember[];
  summary?: string;
  crypto?: boolean; // Flag for Web3/crypto companies (allows filtering while using functional segments)
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

// Legacy stage type (deprecated)
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

// New company classification types
export type CompanyType = 'private' | 'public' | 'acquired' | 'token';

export const COMPANY_TYPE_LABELS: Record<CompanyType, string> = {
  private: 'Private',
  public: 'Public',
  acquired: 'Acquired',
  token: 'Token',
};

export type FundingStage =
  | 'pre-seed'    // <$2M
  | 'seed'        // $2M-$15M
  | 'early'       // $15M-$50M (Series A)
  | 'growth'      // $50M-$200M (Series B-C)
  | 'late'        // $200M+ (Series D+)
  | 'public'      // Public company
  | 'fair-launch' // Token without VC funding
  | 'undisclosed'; // Unknown

export const FUNDING_STAGE_LABELS: Record<FundingStage, string> = {
  'pre-seed': 'Pre-Seed',
  'seed': 'Seed',
  'early': 'Early Stage',
  'growth': 'Growth',
  'late': 'Late Stage',
  'public': 'Public',
  'fair-launch': 'Fair Launch',
  'undisclosed': 'Undisclosed',
};

export const FUNDING_STAGE_ORDER: Record<FundingStage, number> = {
  'pre-seed': 1,
  'seed': 2,
  'early': 3,
  'growth': 4,
  'late': 5,
  'public': 6,
  'fair-launch': 0,
  'undisclosed': -1,
};

export type Region = 'americas' | 'emea' | 'apac';

export const REGION_LABELS: Record<Region, string> = {
  americas: 'Americas',
  emea: 'EMEA',
  apac: 'APAC',
};

// Country to region mapping
export const COUNTRY_TO_REGION: Record<string, Region> = {
  // Americas
  'US': 'americas', 'USA': 'americas', 'United States': 'americas',
  'CA': 'americas', 'Canada': 'americas',
  'MX': 'americas', 'Mexico': 'americas',
  'BR': 'americas', 'Brazil': 'americas',
  'AR': 'americas', 'Argentina': 'americas',
  'CO': 'americas', 'Colombia': 'americas',
  'CL': 'americas', 'Chile': 'americas',
  // EMEA
  'GB': 'emea', 'UK': 'emea', 'United Kingdom': 'emea',
  'DE': 'emea', 'Germany': 'emea',
  'FR': 'emea', 'France': 'emea',
  'NL': 'emea', 'Netherlands': 'emea',
  'ES': 'emea', 'Spain': 'emea',
  'IT': 'emea', 'Italy': 'emea',
  'CH': 'emea', 'Switzerland': 'emea',
  'SE': 'emea', 'Sweden': 'emea',
  'IE': 'emea', 'Ireland': 'emea',
  'IL': 'emea', 'Israel': 'emea',
  'AE': 'emea', 'UAE': 'emea', 'United Arab Emirates': 'emea',
  'ZA': 'emea', 'South Africa': 'emea',
  'PT': 'emea', 'Portugal': 'emea',
  'AT': 'emea', 'Austria': 'emea',
  'BE': 'emea', 'Belgium': 'emea',
  'DK': 'emea', 'Denmark': 'emea',
  'FI': 'emea', 'Finland': 'emea',
  'NO': 'emea', 'Norway': 'emea',
  'PL': 'emea', 'Poland': 'emea',
  'EE': 'emea', 'Estonia': 'emea',
  'LT': 'emea', 'Lithuania': 'emea',
  'LV': 'emea', 'Latvia': 'emea',
  'CZ': 'emea', 'Czech Republic': 'emea',
  'RO': 'emea', 'Romania': 'emea',
  'HU': 'emea', 'Hungary': 'emea',
  'LU': 'emea', 'Luxembourg': 'emea',
  'GR': 'emea', 'Greece': 'emea',
  'GE': 'emea', 'Georgia': 'emea',
  'SI': 'emea', 'Slovenia': 'emea',
  'IS': 'emea', 'Iceland': 'emea',
  'UA': 'emea', 'Ukraine': 'emea',
  'HR': 'emea', 'Croatia': 'emea',
  // APAC
  'CN': 'apac', 'China': 'apac',
  'JP': 'apac', 'Japan': 'apac',
  'KR': 'apac', 'South Korea': 'apac',
  'IN': 'apac', 'India': 'apac',
  'SG': 'apac', 'Singapore': 'apac',
  'AU': 'apac', 'Australia': 'apac',
  'NZ': 'apac', 'New Zealand': 'apac',
  'HK': 'apac', 'Hong Kong': 'apac',
  'TW': 'apac', 'Taiwan': 'apac',
  'ID': 'apac', 'Indonesia': 'apac',
  'MY': 'apac', 'Malaysia': 'apac',
  'TH': 'apac', 'Thailand': 'apac',
  'VN': 'apac', 'Vietnam': 'apac',
  'PH': 'apac', 'Philippines': 'apac',
};
