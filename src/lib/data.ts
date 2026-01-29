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

export function generateCompanyFAQs(project: Project): FAQItem[] {
  const segment = getSegment(project.segment);
  const layer = getLayer(project.layer);
  const faqs: FAQItem[] = [];

  // Q1: Always — "What is {name}?"
  const whatParts = [
    `${project.name} is ${project.tagline.endsWith('.') ? project.tagline : project.tagline + '.'}`,
    segment ? `The company operates in the ${segment.name} segment` : null,
    layer ? `at the ${layer.name} layer of the financial AI stack.` : null,
    project.founded ? `Founded in ${project.founded}` : null,
    project.hq_city && project.hq_country
      ? `${project.founded ? 'and headquartered' : 'Headquartered'} in ${project.hq_city}, ${getCountryName(project.hq_country)}.`
      : project.founded ? '.' : null,
  ].filter(Boolean).join(' ');
  faqs.push({ question: `What is ${project.name}?`, answer: whatParts });

  // Q2: Conditional — "Who founded {name}?"
  if (project.founders && project.founders.length > 0) {
    const founderList = project.founders.map(f => f.title ? `${f.name} (${f.title})` : f.name).join(', ');
    faqs.push({
      question: `Who founded ${project.name}?`,
      answer: `${project.name} was founded by ${founderList}${project.founded ? ` in ${project.founded}` : ''}.`,
    });
  }

  // Q3: Conditional — "How much funding has {name} raised?"
  if (project.funding) {
    let a = `${project.name} has raised ${formatFunding(project.funding)} in total funding.`;
    if (project.funding_stage && project.funding_stage !== 'undisclosed') {
      a += ` The company is at the ${FUNDING_STAGE_LABELS[project.funding_stage as FundingStage]} stage.`;
    }
    if (project.last_funding_date) {
      a += ` The most recent funding round was in ${formatFundingDate(project.last_funding_date)}.`;
    }
    if (project.valuation) {
      a += ` The company is valued at ${formatFunding(project.valuation)}.`;
    }
    faqs.push({ question: `How much funding has ${project.name} raised?`, answer: a });
  }

  // Q4: Conditional — "What AI technology does {name} use?"
  if (project.ai_types && project.ai_types.length > 0) {
    const typeLabels = project.ai_types.map(t => AI_TYPE_LABELS[t]);
    const descriptions = project.ai_types.map(t => `${AI_TYPE_LABELS[t]}: ${AI_TYPE_DESCRIPTIONS[t]}`);
    faqs.push({
      question: `What AI technology does ${project.name} use?`,
      answer: `${project.name} uses ${typeLabels.join(', ')} technology. ${descriptions.join('. ')}.`,
    });
  }

  // Q5: Conditional — "What market segment does {name} operate in?"
  if (segment) {
    const additionalSegs = (project.segments || []).map(s => getSegment(s)).filter(Boolean);
    const allNames = [segment.name, ...additionalSegs.map(s => s!.name)];
    faqs.push({
      question: `What market segment does ${project.name} operate in?`,
      answer: `${project.name} operates in the ${allNames.join(', ')} market segment${allNames.length > 1 ? 's' : ''}. ${segment.description}`,
    });
  }

  // Q6: Conditional — "Where is {name} headquartered?"
  if (project.hq_city && project.hq_country) {
    let a = `${project.name} is headquartered in ${project.hq_city}, ${getCountryName(project.hq_country)}.`;
    if (project.employees) {
      a += ` The company has ${EMPLOYEE_RANGE_LABELS[project.employees as EmployeeRange]} employees.`;
    }
    if (project.region) {
      a += ` It operates in the ${REGION_LABELS[project.region]} region.`;
    }
    faqs.push({ question: `Where is ${project.name} headquartered?`, answer: a });
  }

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
