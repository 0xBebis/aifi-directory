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
  ai_type?: AIType; // Classification of AI/ML technology used
  defunct?: boolean; // True if company is no longer in business
  // Extended company data
  employees?: EmployeeRange; // Employee count range
  valuation?: number; // Latest known valuation in USD
  revenue?: number; // Annual revenue/ARR in USD (if known)
  customers?: string[]; // Key customer names
  founders?: Founder[]; // Founders and key executives
  last_funding_date?: string; // Year or YYYY-MM of most recent funding
  acquirer?: string; // Name of acquiring company (if acquired)
  acquired_date?: string; // Year or YYYY-MM of acquisition
  job_openings?: number; // Current open positions
}

export interface TeamMember {
  name: string;
  role: string;
  linkedin?: string;
}

export interface Founder {
  name: string;
  title?: string; // CEO, CTO, Co-founder, etc.
  linkedin?: string;
}

export type EmployeeRange =
  | '1-10'
  | '11-50'
  | '51-200'
  | '201-500'
  | '501-1000'
  | '1001-5000'
  | '5000+';

export const EMPLOYEE_RANGE_LABELS: Record<EmployeeRange, string> = {
  '1-10': '1-10',
  '11-50': '11-50',
  '51-200': '51-200',
  '201-500': '201-500',
  '501-1000': '501-1,000',
  '1001-5000': '1,001-5,000',
  '5000+': '5,000+',
};

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
// AI/ML technology type classification
export type AIType =
  | 'llm'                  // Large Language Models - NLP, chat, document understanding
  | 'predictive-ml'        // Traditional ML - classification, regression, scoring
  | 'computer-vision'      // Image/video processing, OCR, document extraction
  | 'graph-analytics'      // Graph neural networks, network analysis, blockchain analytics
  | 'reinforcement-learning' // RL for trading, portfolio optimization
  | 'agentic'              // Autonomous AI agents that execute actions
  | 'multi-modal'          // Combines multiple AI types significantly
  | 'data-platform'        // Data aggregation/enrichment, minimal ML
  | 'infrastructure';      // AI/ML infrastructure, compute, not application

export const AI_TYPE_LABELS: Record<AIType, string> = {
  'llm': 'LLM / NLP',
  'predictive-ml': 'Predictive ML',
  'computer-vision': 'Computer Vision',
  'graph-analytics': 'Graph Analytics',
  'reinforcement-learning': 'Reinforcement Learning',
  'agentic': 'Agentic AI',
  'multi-modal': 'Multi-Modal',
  'data-platform': 'Data Platform',
  'infrastructure': 'Infrastructure',
};

export const AI_TYPE_DESCRIPTIONS: Record<AIType, string> = {
  'llm': 'Large language models for NLP, chat, document understanding, and text generation',
  'predictive-ml': 'Traditional ML algorithms for classification, regression, and scoring models',
  'computer-vision': 'Image and video processing, OCR, and document extraction',
  'graph-analytics': 'Graph neural networks for network analysis and relationship detection',
  'reinforcement-learning': 'Reinforcement learning for trading and portfolio optimization',
  'agentic': 'Autonomous AI agents that execute actions independently',
  'multi-modal': 'Systems combining multiple AI approaches (LLM + vision + etc.)',
  'data-platform': 'Data aggregation and enrichment platforms with minimal ML',
  'infrastructure': 'AI/ML infrastructure, compute networks, and tooling',
};

export const AI_TYPE_COLORS: Record<AIType, string> = {
  'llm': '#8b5cf6',              // Purple - language/text
  'predictive-ml': '#3b82f6',    // Blue - traditional ML
  'computer-vision': '#06b6d4',  // Cyan - vision
  'graph-analytics': '#f97316',  // Orange - graphs/networks
  'reinforcement-learning': '#ec4899', // Pink - RL/trading
  'agentic': '#22c55e',          // Green - autonomous agents
  'multi-modal': '#a855f7',      // Violet - multi-modal
  'data-platform': '#64748b',    // Slate - data
  'infrastructure': '#71717a',   // Gray - infra
};

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
