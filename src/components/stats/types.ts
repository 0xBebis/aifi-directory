import { AIType, CompanyType, FundingStage } from '@/types';

export interface StatsDashboardData {
  heroStats: {
    totalCompanies: number;
    totalFunding: number;
    totalFundingFormatted: string;
    countryCount: number;
    agentCount: number;
  };

  insightCards: InsightCard[];

  segmentBreakdown: BreakdownItem[];
  layerBreakdown: BreakdownItem[];
  aiTypeBreakdown: AITypeBreakdownItem[];

  topFunded: TopFundedItem[];
  fundingStageChips: FundingStageChip[];

  countryDistribution: CountryItem[];
  regionSummary: RegionSummaryItem[];
  companyTypes: CompanyTypeItem[];
  activeCount: number;
  defunctCount: number;

  fundingByYear: YearItem[];
  topPairings: PairingItem[];

  faqs: FAQItem[];
  buildDate: string;
}

export interface BreakdownItem {
  slug: string;
  name: string;
  color: string;
  count: number;
  funding: number;
  fundingFormatted: string;
  pctOfTotal: number;
  pctOfFunding: number;
}

export interface AITypeBreakdownItem extends BreakdownItem {
  type: AIType;
}

export interface FundingStageChip {
  stage: FundingStage;
  label: string;
  color: string;
  count: number;
  funding: number;
  fundingFormatted: string;
}

export interface TopFundedItem {
  slug: string;
  name: string;
  logo?: string;
  segmentName: string;
  segmentColor: string;
  funding: number;
  fundingFormatted: string;
}

export interface CountryItem {
  code: string;
  name: string;
  flag: string;
  count: number;
  pctOfTotal: number;
}

export interface RegionSummaryItem {
  region: string;
  label: string;
  count: number;
  funding: number;
  fundingFormatted: string;
  pctOfTotal: number;
}

export interface CompanyTypeItem {
  type: CompanyType;
  label: string;
  color: string;
  count: number;
  pctOfTotal: number;
}

export interface YearItem {
  label: string;
  count: number;
  funding: number;
  fundingFormatted: string;
}

export interface PairingItem {
  segmentName: string;
  segmentColor: string;
  aiTypeLabel: string;
  aiTypeColor: string;
  count: number;
}

export interface InsightCard {
  label: string;
  value: string;
  detail: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}
