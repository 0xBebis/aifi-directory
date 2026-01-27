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
  return new Date(unix * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
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
