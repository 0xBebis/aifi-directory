import {
  Project, Segment, Layer, STAGE_LABELS, Stage, AIType,
  AI_TYPE_LABELS, AI_TYPE_COLORS, AI_TYPE_DESCRIPTIONS,
  CompanyType, COMPANY_TYPE_LABELS, FundingStage, FUNDING_STAGE_LABELS,
  Region, REGION_LABELS, EMPLOYEE_RANGE_LABELS, EmployeeRange,
  Agent, FinanceCategory, AgentProtocol,
  FINANCE_CATEGORY_LABELS, FINANCE_CATEGORY_COLORS,
  PROTOCOL_LABELS, PROTOCOL_COLORS,
} from '@/types';
import projectsData from '@/data/projects.json';
import segmentsData from '@/data/segments.json';
import layersData from '@/data/layers.json';
import agentsData from '@/data/agents.json';

// Projects data - reload on JSON changes
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

/**
 * Format a funding date string (YYYY, YYYY-MM, or YYYY-MM-DD) into human-readable form.
 * Examples:
 *   "2025-03" -> "Mar 2025"
 *   "2025" -> "2025"
 *   "2024-12-15" -> "Dec 2024"
 */
export function formatFundingDate(date: string): string {
  if (!date) return '';

  // Handle YYYY-MM or YYYY-MM-DD format
  const parts = date.split('-');
  if (parts.length >= 2) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    if (month >= 1 && month <= 12) {
      return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short' }).format(new Date(year, month - 1));
    }
  }

  // Handle YYYY format or fallback
  return date;
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
    ? projects.filter(p => p.ai_types?.includes(aiTypeFilter))
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

      // Track AI type breakdown (count each type, but project already counted once above)
      const types = project.ai_types?.length ? project.ai_types : ['unknown'];
      for (const aiType of types) {
        cell.aiTypeBreakdown[aiType] = (cell.aiTypeBreakdown[aiType] || 0) + 1;
      }
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
  // Each project counts once per type it belongs to, but funding is only counted once per project
  const aiTypeTotals: Record<string, { count: number; funding: number }> = {};
  filteredProjects.forEach(project => {
    const types = project.ai_types?.length ? project.ai_types : ['unknown'];
    for (const aiType of types) {
      if (!aiTypeTotals[aiType]) {
        aiTypeTotals[aiType] = { count: 0, funding: 0 };
      }
      aiTypeTotals[aiType].count++;
      aiTypeTotals[aiType].funding += project.funding || 0;
    }
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
    const matchesAiType = !aiTypeFilter || p.ai_types?.includes(aiTypeFilter);
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
  'data-platform',
  'infrastructure',
];

export {
  AI_TYPE_LABELS, AI_TYPE_COLORS, AI_TYPE_DESCRIPTIONS,
  COMPANY_TYPE_LABELS, FUNDING_STAGE_LABELS, REGION_LABELS, EMPLOYEE_RANGE_LABELS,
  FINANCE_CATEGORY_LABELS, FINANCE_CATEGORY_COLORS,
  PROTOCOL_LABELS, PROTOCOL_COLORS,
};

// Taxonomy page helpers

export function getProjectsByAIType(aiType: AIType): Project[] {
  return projects.filter(p => p.ai_types?.includes(aiType));
}

export function getProjectsByRegion(region: Region): Project[] {
  return projects.filter(p => p.region === region);
}

export function getProjectsByFundingStage(stage: FundingStage): Project[] {
  return projects.filter(p => p.funding_stage === stage);
}

export function getCountryDistribution(projectList: Project[]): Array<{ country: string; name: string; count: number }> {
  const counts: Record<string, number> = {};
  for (const p of projectList) {
    if (p.hq_country) {
      counts[p.hq_country] = (counts[p.hq_country] || 0) + 1;
    }
  }
  return Object.entries(counts)
    .map(([country, count]) => ({ country, name: getCountryName(country), count }))
    .sort((a, b) => b.count - a.count);
}

// Directory page helpers

export function getAITypeStats(): Array<{
  type: AIType;
  label: string;
  color: string;
  description: string;
  count: number;
  topCompanies: Project[];
}> {
  return aiTypes.map(type => {
    const matching = projects.filter(p => p.ai_types?.includes(type));
    return {
      type,
      label: AI_TYPE_LABELS[type],
      color: AI_TYPE_COLORS[type],
      description: AI_TYPE_DESCRIPTIONS[type],
      count: matching.length,
      topCompanies: matching
        .filter(p => p.funding && p.funding > 0)
        .sort((a, b) => (b.funding || 0) - (a.funding || 0))
        .slice(0, 3),
    };
  }).filter(s => s.count > 0);
}

// Freshness signal — build date for "Last updated" display
export const BUILD_DATE = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}).format(new Date());

export const BUILD_DATE_ISO = new Date().toISOString().split('T')[0];

// SEO helpers

export function generateSeoDescription(project: Project): string {
  if (project.seo_description) return project.seo_description;

  const parts: string[] = [];
  const stageLabel = project.funding_stage ? FUNDING_STAGE_LABELS[project.funding_stage as FundingStage] : null;
  const typeLabel = project.company_type ? COMPANY_TYPE_LABELS[project.company_type as CompanyType] : null;

  // Entity-first opening: "{Name} is a {stage} {type} company {tagline}."
  let opener = project.name;
  if (stageLabel && stageLabel !== 'Undisclosed') {
    opener += ` is a ${stageLabel.toLowerCase()}`;
  } else {
    opener += ' is a';
  }
  if (typeLabel && typeLabel !== 'Private') {
    opener += ` ${typeLabel.toLowerCase()}`;
  }
  opener += ` company: ${project.tagline}`;
  parts.push(opener);

  if (project.founded && project.hq_city && project.hq_country) {
    parts.push(`Founded ${project.founded} in ${project.hq_city}, ${getCountryName(project.hq_country)}.`);
  } else if (project.founded) {
    parts.push(`Founded ${project.founded}.`);
  } else if (project.hq_city && project.hq_country) {
    parts.push(`Based in ${project.hq_city}, ${getCountryName(project.hq_country)}.`);
  }

  if (project.funding) {
    parts.push(`Raised ${formatFunding(project.funding)}.`);
  }

  return parts.join(' ').slice(0, 160);
}

export function getRecentlyFunded(limit: number = 30): Project[] {
  return [...projects]
    .filter(p => p.last_funding_date)
    .sort((a, b) => {
      // Sort by last_funding_date descending (string comparison works for YYYY or YYYY-MM)
      const dateA = a.last_funding_date || '';
      const dateB = b.last_funding_date || '';
      return dateB.localeCompare(dateA);
    })
    .slice(0, limit);
}

export function getProjectsBySegmentAndAIType(segmentSlug: string, aiType: AIType): Project[] {
  return projects.filter(p => {
    const matchesSegment = p.segment === segmentSlug || p.segments?.includes(segmentSlug);
    const matchesAiType = p.ai_types?.includes(aiType);
    return matchesSegment && matchesAiType;
  });
}

export function getCrossDimensionalPages(): Array<{
  segmentSlug: string;
  segmentName: string;
  segmentColor: string;
  aiType: AIType;
  aiTypeLabel: string;
  aiTypeColor: string;
  count: number;
}> {
  const pages: Array<{
    segmentSlug: string;
    segmentName: string;
    segmentColor: string;
    aiType: AIType;
    aiTypeLabel: string;
    aiTypeColor: string;
    count: number;
  }> = [];

  for (const segment of segments) {
    for (const aiType of aiTypes) {
      const matching = getProjectsBySegmentAndAIType(segment.slug, aiType);
      if (matching.length >= 3) {
        pages.push({
          segmentSlug: segment.slug,
          segmentName: segment.name,
          segmentColor: segment.color,
          aiType,
          aiTypeLabel: AI_TYPE_LABELS[aiType],
          aiTypeColor: AI_TYPE_COLORS[aiType],
          count: matching.length,
        });
      }
    }
  }

  return pages;
}

// Project page helpers

export function formatValuation(amount: number): string {
  return formatFunding(amount);
}

export function formatRevenue(amount: number): string {
  return formatFunding(amount);
}

export function getCountryFlag(code: string): string {
  const flags: Record<string, string> = {
    US: '🇺🇸', GB: '🇬🇧', CA: '🇨🇦', FR: '🇫🇷', DE: '🇩🇪', SG: '🇸🇬',
    JP: '🇯🇵', AU: '🇦🇺', NL: '🇳🇱', CH: '🇨🇭', IL: '🇮🇱', IN: '🇮🇳',
    BR: '🇧🇷', KR: '🇰🇷', CN: '🇨🇳', HK: '🇭🇰', SE: '🇸🇪', IE: '🇮🇪',
    ES: '🇪🇸', IT: '🇮🇹', PT: '🇵🇹', AE: '🇦🇪', CZ: '🇨🇿', EE: '🇪🇪',
    FI: '🇫🇮', NO: '🇳🇴', DK: '🇩🇰', PL: '🇵🇱', AT: '🇦🇹', BE: '🇧🇪',
    NZ: '🇳🇿', MX: '🇲🇽', AR: '🇦🇷', CO: '🇨🇴', CL: '🇨🇱', TW: '🇹🇼',
    ID: '🇮🇩', MY: '🇲🇾', TH: '🇹🇭', PH: '🇵🇭', ZA: '🇿🇦', UA: '🇺🇦',
    IS: '🇮🇸', LT: '🇱🇹', LV: '🇱🇻', RO: '🇷🇴', GR: '🇬🇷', GE: '🇬🇪',
    HR: '🇭🇷', HU: '🇭🇺', LU: '🇱🇺', VN: '🇻🇳', SI: '🇸🇮',
  };
  return flags[code] || '';
}

export function getCompanyTypeColor(type: CompanyType): string {
  const colors: Record<CompanyType, string> = {
    private: '#3b82f6',
    public: '#22c55e',
    acquired: '#f59e0b',
    token: '#a855f7',
  };
  return colors[type] || '#71717a';
}

export function getFundingStageColor(stage: FundingStage): string {
  const colors: Record<FundingStage, string> = {
    'pre-seed': '#94a3b8',
    'seed': '#60a5fa',
    'early': '#34d399',
    'growth': '#fbbf24',
    'late': '#f97316',
    'public': '#22c55e',
    'fair-launch': '#a855f7',
    'undisclosed': '#71717a',
  };
  return colors[stage] || '#71717a';
}

// ── Agent Data Utilities ──

export const agents: Agent[] = agentsData as Agent[];

/** Convert agent ID (11155111:462) to URL-safe slug (11155111-462) */
export function agentSlug(id: string): string {
  return id.replace(':', '-');
}

/** Convert URL slug (11155111-462) back to agent ID (11155111:462) */
export function agentIdFromSlug(slug: string): string {
  return slug.replace('-', ':');
}

export function getAgent(id: string): Agent | undefined {
  return agents.find(a => a.id === id);
}

export function getAgentsByCategory(category: FinanceCategory): Agent[] {
  return agents.filter(a => a.financeCategory === category);
}

export function getAgentsByProtocol(protocol: AgentProtocol): Agent[] {
  return agents.filter(a => a.protocols.includes(protocol));
}

export function getActiveAgents(): Agent[] {
  return agents.filter(a => a.active);
}

export function formatReputationScore(score: number | null): string {
  if (score === null) return 'N/A';
  return score.toFixed(1);
}

export function formatTimestamp(unix: number): string {
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(unix * 1000));
}

export function formatRelativeTime(unix: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - unix;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return formatTimestamp(unix);
}

export function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getAgentCategoryStats(): Array<{
  category: FinanceCategory;
  label: string;
  color: string;
  count: number;
}> {
  const categories = Object.keys(FINANCE_CATEGORY_LABELS) as FinanceCategory[];
  return categories
    .map(cat => ({
      category: cat,
      label: FINANCE_CATEGORY_LABELS[cat],
      color: FINANCE_CATEGORY_COLORS[cat],
      count: agents.filter(a => a.financeCategory === cat).length,
    }))
    .filter(c => c.count > 0)
    .sort((a, b) => b.count - a.count);
}

export function getAgentProtocolStats(): Array<{
  protocol: AgentProtocol;
  label: string;
  color: string;
  count: number;
}> {
  const protocols: AgentProtocol[] = ['mcp', 'a2a', 'oasf', 'web', 'email'];
  return protocols
    .map(p => ({
      protocol: p,
      label: PROTOCOL_LABELS[p],
      color: PROTOCOL_COLORS[p],
      count: agents.filter(a => a.protocols.includes(p)).length,
    }))
    .filter(s => s.count > 0)
    .sort((a, b) => b.count - a.count);
}

export function getScoreColorClass(score: number | null): string {
  if (score === null) return 'text-text-faint';
  if (score < 0) return 'text-negative';
  if (score >= 80) return 'text-positive';
  if (score >= 50) return 'text-warning';
  return 'text-text-muted';
}

export function getAgentEndpoints(agent: Agent): Array<{ label: string; url: string }> {
  const endpoints: Array<{ label: string; url: string }> = [];
  if (agent.mcpEndpoint) endpoints.push({ label: 'MCP Endpoint', url: agent.mcpEndpoint });
  if (agent.a2aEndpoint) endpoints.push({ label: 'A2A Endpoint', url: agent.a2aEndpoint });
  if (agent.oasfEndpoint) endpoints.push({ label: 'OASF Endpoint', url: agent.oasfEndpoint });
  if (agent.webEndpoint) endpoints.push({ label: 'Web Endpoint', url: agent.webEndpoint });
  return endpoints;
}

export const PROTOCOL_DESCRIPTIONS: Record<AgentProtocol, string> = {
  mcp: 'Structured tool, prompt, and resource interface for AI models',
  a2a: 'Peer-to-peer agent communication with skill declarations',
  oasf: 'Domain and skill taxonomy for agent discovery',
  web: 'Standard HTTP/HTTPS web endpoints',
  email: 'Email-based agent communication',
};

export function getTotalAgentCapabilities(): number {
  return agents.reduce((sum, a) =>
    sum + a.mcpTools.length + a.mcpPrompts.length + a.mcpResources.length
    + a.a2aSkills.length + a.oasfSkills.length + a.oasfDomains.length, 0);
}

export function getSimilarAgents(agent: Agent, limit: number = 3): Agent[] {
  return agents
    .filter(a => a.id !== agent.id && a.financeCategory === agent.financeCategory)
    .sort((a, b) => {
      if (a.reputationScore !== null && b.reputationScore !== null) {
        return b.reputationScore - a.reputationScore;
      }
      if (a.reputationScore !== null) return -1;
      if (b.reputationScore !== null) return 1;
      return b.lastActivity - a.lastActivity;
    })
    .slice(0, limit);
}

// ── Global Search ──

export interface SearchableItem {
  name: string;
  description: string;
  href: string;
  category: 'Company' | 'Segment' | 'Layer' | 'AI Type' | 'Page';
}

export function getSearchableItems(): SearchableItem[] {
  const items: SearchableItem[] = [];

  for (const p of projects) {
    items.push({
      name: p.name,
      description: p.tagline,
      href: `/p/${p.slug}`,
      category: 'Company',
    });
  }

  for (const s of segments) {
    items.push({
      name: s.name,
      description: s.description,
      href: `/segments/${s.slug}`,
      category: 'Segment',
    });
  }

  for (const l of layers) {
    items.push({
      name: l.name,
      description: l.description,
      href: `/layers/${l.slug}`,
      category: 'Layer',
    });
  }

  for (const t of aiTypes) {
    items.push({
      name: AI_TYPE_LABELS[t],
      description: AI_TYPE_DESCRIPTIONS[t],
      href: `/ai-types/${t}`,
      category: 'AI Type',
    });
  }

  const pages = [
    { name: 'Company Directory', description: 'Browse all AI + Finance companies', href: '/directory' },
    { name: 'AI Agent Registry', description: 'Autonomous agents in financial services', href: '/agents' },
    { name: 'Thesis', description: 'The future of financial AI', href: '/about' },
    { name: 'History', description: 'A brief history of financial AI', href: '/about/history' },
    { name: 'Statistics', description: 'Funding, segments, and AI type breakdowns', href: '/stats' },
    { name: 'Recently Funded', description: 'Latest funding rounds in financial AI', href: '/recent' },
    { name: 'Glossary', description: 'Key terms and definitions for financial AI', href: '/glossary' },
    { name: 'Submit a Company', description: 'Suggest a company for the AIFI Map directory', href: '/submit' },
  ];
  for (const page of pages) {
    items.push({ ...page, category: 'Page' });
  }

  return items;
}

// ── Stats Page Helpers ──

export function getSegmentFunding(): Record<string, number> {
  const funding: Record<string, number> = {};
  segments.forEach(s => {
    funding[s.slug] = getProjectsBySegment(s.slug)
      .reduce((sum, p) => sum + (p.funding || 0), 0);
  });
  return funding;
}

export function getLayerFunding(): Record<string, number> {
  const funding: Record<string, number> = {};
  layers.forEach(l => {
    funding[l.slug] = getProjectsByLayer(l.slug)
      .reduce((sum, p) => sum + (p.funding || 0), 0);
  });
  return funding;
}

export function getRegionFunding(): Record<string, number> {
  const funding: Record<string, number> = {};
  projects.forEach(p => {
    if (p.region) {
      funding[p.region] = (funding[p.region] || 0) + (p.funding || 0);
    }
  });
  return funding;
}

export function getFundingStageFunding(): Record<string, number> {
  const funding: Record<string, number> = {};
  projects.forEach(p => {
    const stage = p.funding_stage || 'undisclosed';
    funding[stage] = (funding[stage] || 0) + (p.funding || 0);
  });
  return funding;
}

export function getUniqueCountryCount(): number {
  return new Set(projects.map(p => p.hq_country).filter(Boolean)).size;
}

// ── Funding Stage Peers ──

export function getCompaniesAtSameFundingStage(project: Project, limit: number = 4): Project[] {
  if (!project.funding_stage || project.funding_stage === 'undisclosed') return [];
  return projects
    .filter(p => p.slug !== project.slug && p.funding_stage === project.funding_stage)
    .sort((a, b) => (b.funding || 0) - (a.funding || 0))
    .slice(0, limit);
}

// ── SEO / AEO Helpers ──

export interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_MAX_ANSWER_LENGTH = 5000;

function validateFAQAnswers(faqs: FAQItem[], context: string): void {
  for (const faq of faqs) {
    if (faq.answer.length > FAQ_MAX_ANSWER_LENGTH) {
      console.warn(
        `[FAQ Warning] Answer exceeds ${FAQ_MAX_ANSWER_LENGTH} chars (${faq.answer.length}) in ${context}: "${faq.question.slice(0, 60)}"`
      );
    }
  }
}

export function generateCompanyFAQs(project: Project): FAQItem[] {
  const segment = getSegment(project.segment);
  const layer = getLayer(project.layer);
  const faqs: FAQItem[] = [];

  // Q1: Always — "What is {name}?"
  if (project.summary) {
    let answer = project.summary;
    if (!answer.endsWith('.')) answer += '.';
    if (segment && layer) {
      answer += ` ${project.name} is classified in the ${segment.name} segment at the ${layer.name} layer of the financial AI stack.`;
    }
    faqs.push({ question: `What is ${project.name}?`, answer });
  } else {
    const parts = [`${project.name} is ${project.tagline.endsWith('.') ? project.tagline : project.tagline + '.'}`];
    if (segment && layer) {
      parts.push(`The company operates in the ${segment.name} segment at the ${layer.name} layer.`);
    }
    if (project.founded && project.hq_city && project.hq_country) {
      parts.push(`Founded in ${project.founded} in ${project.hq_city}, ${getCountryName(project.hq_country)}.`);
    } else if (project.founded) {
      parts.push(`Founded in ${project.founded}.`);
    }
    faqs.push({ question: `What is ${project.name}?`, answer: parts.join(' ') });
  }

  // Q2: Conditional — "Who founded {name}?"
  if (project.founders && project.founders.length > 0) {
    const founderList = project.founders.map(f => f.title ? `${f.name} (${f.title})` : f.name);
    let founderText: string;
    if (founderList.length === 1) {
      founderText = founderList[0];
    } else if (founderList.length === 2) {
      founderText = `${founderList[0]} and ${founderList[1]}`;
    } else {
      founderText = `${founderList.slice(0, -1).join(', ')}, and ${founderList[founderList.length - 1]}`;
    }
    let answer = `${project.name} was founded by ${founderText}`;
    if (project.founded) {
      answer += ` in ${project.founded}`;
      if (project.hq_city && project.hq_country) {
        answer += ` in ${project.hq_city}, ${getCountryName(project.hq_country)}`;
      }
    }
    answer += '.';
    if (project.founded) {
      const age = new Date().getFullYear() - project.founded;
      if (age <= 2) {
        answer += ` The company is an early-stage startup, ${age} year${age !== 1 ? 's' : ''} old.`;
      } else if (age >= 10) {
        answer += ` The company has been operating for ${age} years.`;
      }
    }
    if (project.company_type === 'public') {
      answer += ` ${project.name} is now a publicly traded company.`;
    } else if (project.company_type === 'acquired' && project.acquirer) {
      answer += ` The company was acquired by ${project.acquirer}${project.acquired_date ? ` in ${project.acquired_date}` : ''}.`;
    }
    faqs.push({ question: `Who founded ${project.name}?`, answer });
  }

  // Q3: Conditional — "How much funding has {name} raised?"
  if (project.funding) {
    let answer = `${project.name} has raised ${formatFunding(project.funding)} in total funding`;
    if (project.funding_stage && project.funding_stage !== 'undisclosed') {
      answer += `, placing the company at the ${FUNDING_STAGE_LABELS[project.funding_stage as FundingStage]} stage`;
    }
    answer += '.';
    if (project.last_funding_date) {
      answer += ` The most recent round closed in ${formatFundingDate(project.last_funding_date)}.`;
    }
    if (project.valuation) {
      answer += ` The company is valued at approximately ${formatFunding(project.valuation)}.`;
    }
    if (project.revenue) {
      answer += ` ${project.name} generates approximately ${formatFunding(project.revenue)} in annual revenue.`;
    }
    if (segment) {
      const segFunded = getProjectsBySegment(segment.slug)
        .filter(p => p.funding && p.funding > 0)
        .sort((a, b) => (b.funding || 0) - (a.funding || 0));
      const rank = segFunded.findIndex(p => p.slug === project.slug) + 1;
      if (rank === 1) {
        answer += ` This makes ${project.name} the most-funded company in the ${segment.name} segment.`;
      } else if (rank > 0 && rank <= 3) {
        answer += ` This makes ${project.name} one of the top ${rank} most-funded companies in the ${segment.name} segment.`;
      } else if (rank > 0 && segFunded.length > 5) {
        answer += ` Among ${segFunded.length} funded ${segment.name} companies, ${project.name} ranks #${rank} by total capital raised.`;
      }
    }
    answer += ` (Source: AIFI Map directory.)`;
    faqs.push({ question: `How much funding has ${project.name} raised?`, answer });
  }

  // Q4: Conditional — "What AI technology does {name} use?"
  if (project.ai_types && project.ai_types.length > 0) {
    let answer: string;
    if (project.ai_types.length === 1) {
      const t = project.ai_types[0];
      answer = `${project.name} primarily leverages ${AI_TYPE_LABELS[t]} technology. ${AI_TYPE_DESCRIPTIONS[t]}.`;
      if (segment) {
        const sameTypeCount = getProjectsBySegment(segment.slug).filter(p => p.ai_types?.includes(t)).length;
        answer += ` Within the ${segment.name} segment, ${sameTypeCount} companies use this technology.`;
      }
    } else {
      const typeLabels = project.ai_types.map(t => AI_TYPE_LABELS[t]);
      answer = `${project.name} combines multiple AI technologies: ${typeLabels.join(', ')}.`;
      for (const t of project.ai_types) {
        answer += ` ${AI_TYPE_LABELS[t]} provides ${AI_TYPE_DESCRIPTIONS[t].charAt(0).toLowerCase()}${AI_TYPE_DESCRIPTIONS[t].slice(1)}.`;
      }
    }
    faqs.push({ question: `What AI technology does ${project.name} use?`, answer });
  }

  // Q5: Conditional — "What market segment does {name} operate in?"
  if (segment) {
    const additionalSegs = (project.segments || []).map(s => getSegment(s)).filter(Boolean);
    const allNames = [segment.name, ...additionalSegs.map(s => s!.name)];
    let answer = `${project.name} operates in the ${allNames.join(' and ')} market segment${allNames.length > 1 ? 's' : ''}. `;
    if (segment.long_description) {
      const firstPara = segment.long_description.split('\n\n')[0];
      const sentences = firstPara.match(/[^.!?]+[.!?]+/g) || [];
      answer += sentences.slice(0, 2).join(' ').trim();
    } else {
      answer += segment.description;
    }
    if (additionalSegs.length > 0) {
      answer += ` The company also has a footprint in ${additionalSegs.map(s => s!.name.toLowerCase()).join(' and ')}, reflecting its cross-functional approach to financial AI.`;
    }
    faqs.push({ question: `What market segment does ${project.name} operate in?`, answer });
  }

  // Q6: Conditional — "Where is {name} headquartered?"
  if (project.hq_city && project.hq_country) {
    const countryName = getCountryName(project.hq_country);
    let answer = `${project.name} is headquartered in ${project.hq_city}, ${countryName}.`;
    if (project.region) {
      answer += ` The company operates in the ${REGION_LABELS[project.region]} region.`;
    }
    if (project.employees) {
      answer += ` The team consists of ${EMPLOYEE_RANGE_LABELS[project.employees as EmployeeRange]} employees.`;
    }
    const sameCountry = projects.filter(p => p.hq_country === project.hq_country).length;
    if (sameCountry > 1) {
      answer += ` ${countryName} is home to ${sameCountry} financial AI companies tracked by AIFI Map.`;
    }
    faqs.push({ question: `Where is ${project.name} headquartered?`, answer });
  }

  // Q7: Conditional — "Who are {name}'s competitors?"
  const similar = getSimilarProjects(project, 5);
  if (similar.length >= 2) {
    const namedCompetitors = similar.map(p => {
      let desc = p.name;
      if (p.funding) desc += ` (${formatFunding(p.funding)} raised)`;
      return desc;
    });
    let answer = `Companies similar to ${project.name} in the ${segment?.name || 'financial AI'} space include ${namedCompetitors.join(', ')}.`;
    answer += ` These companies operate in related areas of financial AI:`;
    for (const comp of similar.slice(0, 3)) {
      answer += ` ${comp.name} focuses on ${comp.tagline.toLowerCase().replace(/\.$/, '')}.`;
    }
    answer += ` (Based on AIFI Map classification data.)`;
    faqs.push({ question: `Who are ${project.name}'s competitors?`, answer });
  }

  // Q8: Conditional — "What products does {name} offer?"
  if (project.summary && project.ai_types && project.ai_types.length > 0) {
    let answer = `${project.name} builds ${layer?.name.toLowerCase() || 'technology'}-layer solutions for the financial services industry. `;
    answer += `The company's core offering: ${project.tagline}`;
    if (!project.tagline.endsWith('.')) answer += '.';
    const techNames = project.ai_types.map(t => AI_TYPE_LABELS[t]).join(', ');
    answer += ` The platform is powered by ${techNames} technology.`;
    if (project.customers && project.customers.length > 0) {
      answer += ` Notable users include ${project.customers.slice(0, 4).join(', ')}.`;
    }
    faqs.push({ question: `What products does ${project.name} offer?`, answer });
  }

  // Q9: Conditional — "Is {name} publicly traded?" (only for non-private companies)
  if (project.company_type && project.company_type !== 'private') {
    let answer: string;
    if (project.company_type === 'public') {
      answer = `Yes, ${project.name} is a publicly traded company.`;
      if (project.valuation) answer += ` The company has a market valuation of approximately ${formatFunding(project.valuation)}.`;
      if (project.revenue) answer += ` Annual revenue is approximately ${formatFunding(project.revenue)}.`;
    } else if (project.company_type === 'acquired') {
      answer = `${project.name} is no longer independently traded. The company was acquired by ${project.acquirer || 'another company'}`;
      if (project.acquired_date) answer += ` in ${project.acquired_date}`;
      answer += '.';
      if (project.funding) answer += ` Prior to the acquisition, ${project.name} had raised ${formatFunding(project.funding)} in venture funding.`;
    } else if (project.company_type === 'token') {
      answer = `${project.name} operates as a token-based project rather than a traditional equity-backed company.`;
      if (project.crypto) answer += ` It is a Web3-native platform leveraging blockchain and decentralized finance.`;
      if (project.funding_stage === 'fair-launch') answer += ` The project launched via a fair-launch model without traditional venture capital funding.`;
    } else {
      answer = `${project.name} is a privately held company.`;
    }
    faqs.push({ question: `Is ${project.name} publicly traded?`, answer });
  }

  // Q10: Conditional — "Does {name} use Web3 or blockchain technology?" (crypto companies)
  if (project.crypto) {
    let answer = `Yes, ${project.name} incorporates Web3 and blockchain technology. ${project.tagline}`;
    if (!project.tagline.endsWith('.')) answer += '.';
    if (project.company_type === 'token') {
      answer += ` The project operates as a token-based platform.`;
    }
    if (project.segment === 'crypto' || project.segments?.includes('crypto')) {
      answer += ` ${project.name} is part of the Crypto & Web3 segment in the AIFI directory.`;
    } else {
      answer += ` While not solely a crypto company, ${project.name} leverages blockchain alongside its primary focus in ${segment?.name?.toLowerCase() || 'financial services'}.`;
    }
    faqs.push({ question: `Does ${project.name} use Web3 or blockchain technology?`, answer });
  }

  validateFAQAnswers(faqs, `company/${project.slug}`);
  return faqs;
}

export interface Citation {
  id: number;
  label: string;
  text: string;
}

export function generateCitations(project: Project): Citation[] {
  const citations: Citation[] = [];
  let idx = 1;

  if (project.founded) {
    citations.push({
      id: idx++,
      label: 'Founded',
      text: `Founded in ${project.founded}${project.hq_city && project.hq_country ? ` in ${project.hq_city}, ${getCountryName(project.hq_country)}` : ''}.`,
    });
  }

  if (project.funding) {
    let t = `Total funding: ${formatFunding(project.funding)}`;
    if (project.last_funding_date) t += `. Last round: ${formatFundingDate(project.last_funding_date)}`;
    if (project.funding_stage && project.funding_stage !== 'undisclosed') {
      t += `. Stage: ${FUNDING_STAGE_LABELS[project.funding_stage as FundingStage]}`;
    }
    t += '.';
    citations.push({ id: idx++, label: 'Funding', text: t });
  }

  if (project.valuation) {
    citations.push({ id: idx++, label: 'Valuation', text: `Valued at ${formatFunding(project.valuation)}.` });
  }

  if (project.customers && project.customers.length > 0) {
    citations.push({ id: idx++, label: 'Customers', text: `Key customers include ${project.customers.join(', ')}.` });
  }

  if (project.employees) {
    citations.push({ id: idx++, label: 'Employees', text: `Employee count: ${EMPLOYEE_RANGE_LABELS[project.employees as EmployeeRange]}.` });
  }

  if (project.company_type === 'acquired' && project.acquirer) {
    let t = `Acquired by ${project.acquirer}`;
    if (project.acquired_date) t += ` in ${project.acquired_date}`;
    t += '.';
    citations.push({ id: idx++, label: 'Acquisition', text: t });
  }

  if (project.revenue) {
    citations.push({ id: idx++, label: 'Revenue', text: `Annual revenue/ARR: approximately ${formatFunding(project.revenue)}.` });
  }

  if (project.company_type && project.company_type !== 'private') {
    const typeLabel = COMPANY_TYPE_LABELS[project.company_type as CompanyType];
    citations.push({ id: idx++, label: 'Company Type', text: `${typeLabel} company${project.company_type === 'token' ? ' (token-based project)' : ''}.` });
  }

  if (project.crypto) {
    citations.push({ id: idx++, label: 'Web3', text: `Web3 and blockchain technology company.${project.company_type === 'token' ? ' Token-based project.' : ''}` });
  }

  if (project.website) {
    const domain = project.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
    citations.push({ id: idx++, label: 'Website', text: `Official website: ${domain}.` });
  }

  if (project.ai_types && project.ai_types.length > 0) {
    const labels = project.ai_types.map(t => AI_TYPE_LABELS[t]);
    citations.push({ id: idx++, label: 'AI Technology', text: `Core AI/ML technologies: ${labels.join(', ')}.` });
  }

  if (project.region) {
    let regionText = `Region: ${REGION_LABELS[project.region]}`;
    if (project.hq_country) regionText += ` (${getCountryName(project.hq_country)})`;
    regionText += '.';
    citations.push({ id: idx++, label: 'Region', text: regionText });
  }

  if (project.defunct) {
    citations.push({ id: idx++, label: 'Status', text: 'This company is no longer operating.' });
  }

  return citations;
}

export interface ComparisonMetrics {
  name: string;
  segment: string;
  segmentName: string;
  layer: string;
  layerName: string;
  aiTypes: string[];
  funding: number | null;
  fundingFormatted: string | null;
  fundingStage: string | null;
  founded: number | null;
  employeeRange: string | null;
  region: string | null;
  hqCountry: string | null;
  companyType: string | null;
  valuation: number | null;
  valuationFormatted: string | null;
  competitors: Array<{ slug: string; name: string; funding: number | null }>;
}

export function generateComparisonData(project: Project): ComparisonMetrics {
  const segment = getSegment(project.segment);
  const layer = getLayer(project.layer);
  const similar = getSimilarProjects(project, 5);

  return {
    name: project.name,
    segment: project.segment,
    segmentName: segment?.name || project.segment,
    layer: project.layer,
    layerName: layer?.name || project.layer,
    aiTypes: project.ai_types?.map(t => AI_TYPE_LABELS[t]) || [],
    funding: project.funding || null,
    fundingFormatted: project.funding ? formatFunding(project.funding) : null,
    fundingStage: project.funding_stage ? FUNDING_STAGE_LABELS[project.funding_stage as FundingStage] : null,
    founded: project.founded || null,
    employeeRange: project.employees || null,
    region: project.region ? REGION_LABELS[project.region] : null,
    hqCountry: project.hq_country ? getCountryName(project.hq_country) : null,
    companyType: project.company_type ? COMPANY_TYPE_LABELS[project.company_type as CompanyType] : null,
    valuation: project.valuation || null,
    valuationFormatted: project.valuation ? formatFunding(project.valuation) : null,
    competitors: similar.map(p => ({
      slug: p.slug,
      name: p.name,
      funding: p.funding || null,
    })),
  };
}

// ── Taxonomy FAQ Generators ──

export function generateSegmentFAQs(segment: Segment): FAQItem[] {
  const segProjects = getProjectsBySegment(segment.slug);
  const funded = segProjects.filter(p => p.funding && p.funding > 0).sort((a, b) => (b.funding || 0) - (a.funding || 0));
  const totalFunding = segProjects.reduce((sum, p) => sum + (p.funding || 0), 0);

  const aiTypeCounts: Record<string, number> = {};
  segProjects.forEach(p => p.ai_types?.forEach(t => { aiTypeCounts[t] = (aiTypeCounts[t] || 0) + 1; }));
  const topAiTypes = Object.entries(aiTypeCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([type, count]) => ({ label: AI_TYPE_LABELS[type as AIType], count }));

  const regionCounts: Record<string, number> = {};
  segProjects.forEach(p => { if (p.region) regionCounts[p.region] = (regionCounts[p.region] || 0) + 1; });
  const topRegion = Object.entries(regionCounts).sort(([, a], [, b]) => b - a)[0];

  const stageCounts: Record<string, number> = {};
  segProjects.forEach(p => {
    const stage = p.funding_stage;
    if (stage && stage !== 'undisclosed') stageCounts[stage] = (stageCounts[stage] || 0) + 1;
  });
  const topStage = Object.entries(stageCounts).sort(([, a], [, b]) => b - a)[0];

  const faqs: FAQItem[] = [];

  // Q1: "What is AI {segment}?"
  if (segment.long_description) {
    const firstPara = segment.long_description.split('\n\n')[0];
    const sentences = firstPara.match(/[^.!?]+[.!?]+/g) || [firstPara];
    let answer = sentences.slice(0, 3).join(' ').trim();
    answer += ` The AIFI Map directory tracks ${segProjects.length} companies in this segment, with ${formatFunding(totalFunding)} in combined funding.`;
    faqs.push({ question: `What is AI ${segment.name.toLowerCase()}?`, answer });
  } else {
    faqs.push({
      question: `What is AI ${segment.name.toLowerCase()}?`,
      answer: `AI ${segment.name.toLowerCase()} refers to the application of artificial intelligence in ${segment.description.toLowerCase()} The AIFI Map tracks ${segProjects.length} companies building AI-powered solutions in this space, with ${formatFunding(totalFunding)} in combined funding.`,
    });
  }

  // Q2: "How many AI {segment} companies are there?"
  let q2 = `The AIFI Map directory tracks ${segProjects.length} companies building AI for ${segment.name.toLowerCase()}, with ${formatFunding(totalFunding)} in combined funding raised.`;
  if (topStage) {
    q2 += ` The most common funding stage is ${FUNDING_STAGE_LABELS[topStage[0] as FundingStage]} (${topStage[1]} companies).`;
  }
  if (topRegion) {
    q2 += ` The majority are based in the ${REGION_LABELS[topRegion[0] as Region]} region (${topRegion[1]} companies).`;
  }
  q2 += ` (Source: AIFI Map directory.)`;
  faqs.push({ question: `How many AI ${segment.name.toLowerCase()} companies are there?`, answer: q2 });

  // Q3: "What AI technologies are used in {segment}?"
  let q3 = `The most common AI technologies in ${segment.name.toLowerCase()} include ${topAiTypes.map(t => `${t.label} (${t.count} companies)`).join(', ')}.`;
  if (segment.long_description) {
    const keyApps = segment.long_description.split('\n\n').find(p => p.toLowerCase().startsWith('key application'));
    if (keyApps) {
      const sentences = keyApps.match(/[^.!?]+[.!?]+/g) || [];
      q3 += ' ' + sentences.slice(0, 2).join(' ').trim();
    }
  }
  faqs.push({ question: `What AI technologies are used in ${segment.name.toLowerCase()}?`, answer: q3 });

  // Q4: "What is the most funded AI {segment} company?"
  if (funded[0]) {
    let q4 = `${funded[0].name} is the most funded AI ${segment.name.toLowerCase()} company tracked by AIFI Map`;
    if (funded[0].funding) q4 += `, having raised ${formatFunding(funded[0].funding)}`;
    q4 += `. ${funded[0].tagline}`;
    if (!funded[0].tagline.endsWith('.')) q4 += '.';
    if (funded[1]) {
      q4 += ` The second-most-funded is ${funded[1].name}${funded[1].funding ? ` with ${formatFunding(funded[1].funding)}` : ''}.`;
    }
    faqs.push({ question: `What is the most funded AI ${segment.name.toLowerCase()} company?`, answer: q4 });
  }

  // Q5: Conditional — "What are the key trends in AI {segment}?"
  if (segment.long_description) {
    const trendsPara = segment.long_description.split('\n\n').find(p => p.toLowerCase().includes('notable trends') || p.toLowerCase().includes('key trends'));
    if (trendsPara) {
      const sentences = trendsPara.match(/[^.!?]+[.!?]+/g) || [];
      faqs.push({
        question: `What are the key trends in AI ${segment.name.toLowerCase()}?`,
        answer: sentences.slice(0, 3).join(' ').trim(),
      });
    }
  }

  // Q6: Conditional — "Which companies use Web3/blockchain?"
  const cryptoCompanies = segProjects.filter(p => p.crypto);
  if (cryptoCompanies.length >= 2) {
    const topCrypto = cryptoCompanies.sort((a, b) => (b.funding || 0) - (a.funding || 0)).slice(0, 5);
    faqs.push({
      question: `Which ${segment.name.toLowerCase()} companies use Web3 or blockchain?`,
      answer: `${cryptoCompanies.length} companies in the ${segment.name} segment incorporate Web3 or blockchain technology. Leading examples include ${topCrypto.map(p => p.name).join(', ')}.`,
    });
  }

  validateFAQAnswers(faqs, `segment/${segment.slug}`);
  return faqs;
}

export function generateAITypeFAQs(aiType: AIType): FAQItem[] {
  const label = AI_TYPE_LABELS[aiType];
  const description = AI_TYPE_DESCRIPTIONS[aiType];
  const typeProjects = getProjectsByAIType(aiType);
  const funded = typeProjects.filter(p => p.funding && p.funding > 0).sort((a, b) => (b.funding || 0) - (a.funding || 0));
  const totalFunding = typeProjects.reduce((sum, p) => sum + (p.funding || 0), 0);

  const segCounts: Array<{ name: string; count: number }> = [];
  segments.forEach(s => {
    const count = typeProjects.filter(p => p.segment === s.slug || p.segments?.includes(s.slug)).length;
    if (count > 0) segCounts.push({ name: s.name, count });
  });
  segCounts.sort((a, b) => b.count - a.count);

  const layerCounts: Array<{ name: string; count: number }> = [];
  layers.forEach(l => {
    const count = typeProjects.filter(p => p.layer === l.slug || p.layers?.includes(l.slug)).length;
    if (count > 0) layerCounts.push({ name: l.name, count });
  });
  layerCounts.sort((a, b) => b.count - a.count);

  const faqs: FAQItem[] = [];

  // Q1: "How is {label} used in finance?"
  let q1 = `${description} In the financial sector, ${label} is applied across ${segCounts.length} market segments.`;
  q1 += ` The most common are ${segCounts.slice(0, 3).map(s => `${s.name} (${s.count} companies)`).join(', ')}.`;
  q1 += ` ${typeProjects.length} companies in the AIFI directory use ${label}, with ${formatFunding(totalFunding)} in combined funding.`;
  faqs.push({ question: `How is ${label} used in finance?`, answer: q1 });

  // Q2: "Which financial companies use {label}?"
  let q2 = `${typeProjects.length} companies in the AIFI directory use ${label}. `;
  q2 += funded.slice(0, 3).map(p => `${p.name}: ${p.tagline}`).join('. ');
  if (funded.length > 3) q2 += `. And ${funded.length - 3} more.`;
  faqs.push({ question: `Which financial companies use ${label}?`, answer: q2 });

  // Q3: "How many companies use {label}?"
  let q3 = `The AIFI directory tracks ${typeProjects.length} financial companies using ${label}, with a combined ${formatFunding(totalFunding)} in funding raised.`;
  if (layerCounts.length > 0) {
    q3 += ` These companies span the technology stack: ${layerCounts.map(l => `${l.name} (${l.count})`).join(', ')}.`;
  }
  q3 += ` (Source: AIFI Map directory.)`;
  faqs.push({ question: `How many companies use ${label} in finance?`, answer: q3 });

  // Q4: "Most funded {label} company?"
  if (funded[0]) {
    let q4 = `${funded[0].name} is the most funded ${label} company in the AIFI directory`;
    if (funded[0].funding) q4 += `, with ${formatFunding(funded[0].funding)} raised`;
    q4 += `. ${funded[0].tagline}`;
    if (funded[1]) {
      q4 += ` Other highly funded ${label} companies include ${funded.slice(1, 4).map(p => `${p.name}${p.funding ? ` (${formatFunding(p.funding)})` : ''}`).join(', ')}.`;
    }
    faqs.push({ question: `What is the most funded ${label} finance company?`, answer: q4 });
  }

  // Q5: "What market segments use {label}?"
  if (segCounts.length > 1) {
    let q5 = `${label} is used across ${segCounts.length} market segments in financial services. `;
    q5 += segCounts.map(s => `${s.name}: ${s.count} companies`).join('. ') + '.';
    faqs.push({ question: `What market segments use ${label}?`, answer: q5 });
  }

  validateFAQAnswers(faqs, `ai-type/${aiType}`);
  return faqs;
}

export function generateLayerFAQs(layer: Layer): FAQItem[] {
  const layerProjects = getProjectsByLayer(layer.slug);
  const funded = layerProjects.filter(p => p.funding && p.funding > 0).sort((a, b) => (b.funding || 0) - (a.funding || 0));
  const totalFunding = layerProjects.reduce((sum, p) => sum + (p.funding || 0), 0);

  const layerIndex = layers.findIndex(l => l.slug === layer.slug);
  const layerAbove = layerIndex > 0 ? layers[layerIndex - 1] : null;
  const layerBelow = layerIndex < layers.length - 1 ? layers[layerIndex + 1] : null;

  const segCounts: Array<{ name: string; count: number }> = [];
  segments.forEach(s => {
    const count = layerProjects.filter(p => p.segment === s.slug || p.segments?.includes(s.slug)).length;
    if (count > 0) segCounts.push({ name: s.name, count });
  });
  segCounts.sort((a, b) => b.count - a.count);

  const aiTypeCounts: Record<string, number> = {};
  layerProjects.forEach(p => p.ai_types?.forEach(t => { aiTypeCounts[t] = (aiTypeCounts[t] || 0) + 1; }));
  const topAiTypes = Object.entries(aiTypeCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([type, count]) => ({ label: AI_TYPE_LABELS[type as AIType], count }));

  const faqs: FAQItem[] = [];

  // Q1: "What is the {layer} layer?"
  let q1 = `${layer.description} The ${layer.name} layer sits at position ${layer.position} in the five-layer financial AI technology stack`;
  if (layerAbove) q1 += `, below ${layerAbove.name}`;
  if (layerBelow) q1 += ` and above ${layerBelow.name}`;
  q1 += `. ${layerProjects.length} companies in the AIFI directory operate at this layer, with ${formatFunding(totalFunding)} in combined funding.`;
  faqs.push({ question: `What is the ${layer.name} layer in financial AI?`, answer: q1 });

  // Q2: "Which companies operate here?"
  let q2 = `${layerProjects.length} companies operate at the ${layer.name} layer. `;
  q2 += funded.slice(0, 3).map(p => `${p.name}: ${p.tagline}`).join('. ');
  if (funded.length > 3) q2 += `. And ${funded.length - 3} more.`;
  faqs.push({ question: `Which companies operate at the ${layer.name} layer?`, answer: q2 });

  // Q3: "How does {layer} fit in the stack?"
  let q3 = `The financial AI stack has 5 layers: ${layers.map(l => l.name).join(', ')} (ordered by position). ${layer.name} is at position ${layer.position}.`;
  if (layerAbove) q3 += ` Above it, ${layerAbove.name}: ${layerAbove.description}`;
  if (layerBelow) q3 += ` Below it, ${layerBelow.name}: ${layerBelow.description}`;
  faqs.push({ question: `How does the ${layer.name} layer fit in the financial AI stack?`, answer: q3 });

  // Q4: "Most funded company?"
  if (funded[0]) {
    let q4 = `${funded[0].name} is the most funded company at the ${layer.name} layer`;
    if (funded[0].funding) q4 += `, with ${formatFunding(funded[0].funding)} raised`;
    q4 += `. ${funded[0].tagline}`;
    if (funded[1]) {
      q4 += ` Followed by ${funded[1].name}${funded[1].funding ? ` (${formatFunding(funded[1].funding)})` : ''}.`;
    }
    faqs.push({ question: `What is the most funded ${layer.name} company?`, answer: q4 });
  }

  // Q5: "What AI technologies are used at this layer?"
  if (topAiTypes.length > 0) {
    faqs.push({
      question: `What AI technologies are used at the ${layer.name} layer?`,
      answer: `Companies at the ${layer.name} layer most commonly use ${topAiTypes.map(t => `${t.label} (${t.count} companies)`).join(', ')}.`,
    });
  }

  // Q6: "Which market segments are represented?"
  if (segCounts.length > 0) {
    let q6 = `The ${layer.name} layer serves ${segCounts.length} market segments. `;
    q6 += `The largest are ${segCounts.slice(0, 3).map(s => `${s.name} (${s.count} companies)`).join(', ')}.`;
    faqs.push({ question: `Which market segments are represented at the ${layer.name} layer?`, answer: q6 });
  }

  validateFAQAnswers(faqs, `layer/${layer.slug}`);
  return faqs;
}

export function generateCrossDimensionalFAQs(segmentSlug: string, aiType: AIType): FAQItem[] {
  const segment = getSegment(segmentSlug);
  const label = AI_TYPE_LABELS[aiType];
  const description = AI_TYPE_DESCRIPTIONS[aiType];
  if (!segment || !label) return [];

  const matching = getProjectsBySegmentAndAIType(segmentSlug, aiType);
  const funded = matching.filter(p => p.funding && p.funding > 0).sort((a, b) => (b.funding || 0) - (a.funding || 0));
  const totalFunding = matching.reduce((sum, p) => sum + (p.funding || 0), 0);

  const faqs: FAQItem[] = [];

  // Q1: "How is {label} used in {segment}?"
  let q1 = `${description} In the ${segment.name.toLowerCase()} sector, ${label} is applied by ${matching.length} companies tracked by AIFI Map, with ${formatFunding(totalFunding)} in combined funding.`;
  if (funded.length > 0) {
    q1 += ` Leading companies include ${funded.slice(0, 3).map(p => `${p.name} (${p.tagline})`).join('; ')}.`;
  }
  faqs.push({ question: `How is ${label} used in ${segment.name.toLowerCase()}?`, answer: q1 });

  // Q2: "Which {segment} companies use {label}?"
  let q2 = `The AIFI directory tracks ${matching.length} ${segment.name.toLowerCase()} companies using ${label}, with a combined ${formatFunding(totalFunding)} in funding. `;
  q2 += funded.slice(0, 5).map(p => p.name).join(', ');
  if (funded.length > 5) q2 += `, and ${funded.length - 5} more`;
  q2 += '. (Source: AIFI Map directory.)';
  faqs.push({ question: `Which ${segment.name.toLowerCase()} companies use ${label}?`, answer: q2 });

  // Q3: "Most funded?"
  if (funded[0]) {
    let q3 = `${funded[0].name} is the most funded company using ${label} in ${segment.name.toLowerCase()}`;
    if (funded[0].funding) q3 += `, with ${formatFunding(funded[0].funding)} raised`;
    q3 += `. ${funded[0].tagline}`;
    if (funded[1]) {
      q3 += ` Followed by ${funded[1].name}${funded[1].funding ? ` (${formatFunding(funded[1].funding)})` : ''}.`;
    }
    faqs.push({ question: `What is the most funded ${label} ${segment.name.toLowerCase()} company?`, answer: q3 });
  }

  // Q4: "How does {label} compare to other technologies in {segment}?"
  const segProjects = getProjectsBySegment(segmentSlug);
  const allTypes = new Set<AIType>();
  segProjects.forEach(p => p.ai_types?.forEach(t => allTypes.add(t)));
  const otherTypes = Array.from(allTypes)
    .filter(t => t !== aiType)
    .map(t => {
      const tProjects = getProjectsBySegmentAndAIType(segmentSlug, t);
      const tFunding = tProjects.reduce((sum, p) => sum + (p.funding || 0), 0);
      return { type: t, label: AI_TYPE_LABELS[t], desc: AI_TYPE_DESCRIPTIONS[t], count: tProjects.length, funding: tFunding };
    })
    .sort((a, b) => b.count - a.count);
  const allRanked = [{ type: aiType, label, count: matching.length, funding: totalFunding }, ...otherTypes].sort((a, b) => b.count - a.count);
  const rank = allRanked.findIndex(t => t.type === aiType) + 1;
  if (otherTypes.length > 0) {
    const top3 = otherTypes.slice(0, 3);
    let q4 = `In the ${segment.name} segment, ${label} ranks #${rank} out of ${allRanked.length} AI technologies by adoption, with ${matching.length} companies and ${formatFunding(totalFunding)} in combined funding. `;
    q4 += `The most widely adopted technologies in ${segment.name.toLowerCase()} are ${allRanked.slice(0, 3).map(t => `${t.label} (${t.count} companies, ${formatFunding(t.funding)} funded)`).join('; ')}. `;
    q4 += `While ${label} focuses on ${description.split('.')[0].toLowerCase()}, `;
    q4 += `alternative approaches include ${top3.slice(0, 2).map(t => `${t.label}, which ${t.desc.split('.')[0].toLowerCase()}`).join(', and ')}.`;
    faqs.push({ question: `How does ${label} compare to other AI technologies in ${segment.name.toLowerCase()}?`, answer: q4 });
  }

  validateFAQAnswers(faqs, `cross/${segmentSlug}/${aiType}`);
  return faqs;
}
