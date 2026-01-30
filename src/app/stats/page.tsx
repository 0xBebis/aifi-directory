import { Metadata } from 'next';
import Link from 'next/link';
import {
  projects,
  segments,
  layers,
  agents,
  getTotalFunding,
  getSegmentCounts,
  getLayerCounts,
  getRegionDistribution,
  getFundingStageDistribution,
  getTopCompanies,
  getSegmentFunding,
  getLayerFunding,
  getRegionFunding,
  getFundingStageFunding,
  getUniqueCountryCount,
  getCountryDistribution,
  getCountryFlag,
  getCrossDimensionalPages,
  getProjectsBySegmentAndAIType,
  getProjectsBySegment,
  formatFunding,
  getCompanyTypeColor,
  getFundingStageColor,
  BUILD_DATE,
  AI_TYPE_LABELS,
  AI_TYPE_COLORS,
  REGION_LABELS,
  FUNDING_STAGE_LABELS,
  COMPANY_TYPE_LABELS,
} from '@/lib/data';
import { AIType, Region, FundingStage, CompanyType } from '@/types';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';
import StatsDashboard from '@/components/stats/StatsDashboard';
import type { StatsDashboardData } from '@/components/stats/types';

export const metadata: Metadata = {
  title: 'Financial AI Statistics & Market Data | AIFI Map',
  description: 'Key statistics on the financial AI landscape. Company counts, funding totals, market segment breakdowns, AI technology adoption, and geographic distribution.',
  openGraph: {
    title: 'Financial AI Statistics & Market Data',
    description: 'Key statistics on the financial AI landscape. Company counts, funding totals, market segment breakdowns, and more.',
    type: 'website',
    siteName: 'AIFI Map',
    images: [{ url: '/og/default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Financial AI Statistics & Market Data',
    description: 'Key statistics on the financial AI landscape.',
    images: ['/og/default.png'],
  },
};

export default function StatsPage() {
  const totalFunding = getTotalFunding();
  const segmentCounts = getSegmentCounts();
  const layerCounts = getLayerCounts();
  const regionDist = getRegionDistribution();
  const fundingStageDist = getFundingStageDistribution();
  const topCompanies = getTopCompanies(10);
  const segmentFunding = getSegmentFunding();
  const layerFunding = getLayerFunding();
  const regionFunding = getRegionFunding();
  const fundingStageFunding = getFundingStageFunding();
  const countryCount = getUniqueCountryCount();
  const countryDist = getCountryDistribution(projects);
  const crossPages = getCrossDimensionalPages();

  // AI type breakdown
  const allTypes: AIType[] = ['llm', 'predictive-ml', 'computer-vision', 'graph-analytics', 'reinforcement-learning', 'agentic', 'data-platform', 'infrastructure'];
  const aiTypeBreakdown = allTypes
    .map(type => {
      const matching = projects.filter(p => p.ai_types?.includes(type));
      const funding = matching.reduce((sum, p) => sum + (p.funding || 0), 0);
      return {
        type,
        slug: type,
        name: AI_TYPE_LABELS[type],
        label: AI_TYPE_LABELS[type],
        color: AI_TYPE_COLORS[type],
        count: matching.length,
        funding,
        fundingFormatted: formatFunding(funding),
        pctOfTotal: Math.round((matching.length / projects.length) * 100),
        pctOfFunding: totalFunding > 0 ? Math.round((funding / totalFunding) * 100) : 0,
      };
    })
    .filter(t => t.count > 0)
    .sort((a, b) => b.count - a.count);

  // Segment breakdown
  const segmentBreakdown = segments.map(s => {
    const count = segmentCounts[s.slug] || 0;
    const funding = segmentFunding[s.slug] || 0;
    return {
      slug: s.slug,
      name: s.name,
      color: s.color,
      count,
      funding,
      fundingFormatted: formatFunding(funding),
      pctOfTotal: Math.round((count / projects.length) * 100),
      pctOfFunding: totalFunding > 0 ? Math.round((funding / totalFunding) * 100) : 0,
    };
  }).sort((a, b) => b.count - a.count);

  // Layer breakdown
  const layerBreakdown = layers.map(l => {
    const count = layerCounts[l.slug] || 0;
    const funding = layerFunding[l.slug] || 0;
    return {
      slug: l.slug,
      name: l.name,
      color: l.color,
      count,
      funding,
      fundingFormatted: formatFunding(funding),
      pctOfTotal: Math.round((count / projects.length) * 100),
      pctOfFunding: totalFunding > 0 ? Math.round((funding / totalFunding) * 100) : 0,
    };
  }).sort((a, b) => b.count - a.count);

  // Top funded companies
  const topFunded = topCompanies.map(p => {
    const seg = segments.find(s => s.slug === p.segment);
    return {
      slug: p.slug,
      name: p.name,
      logo: p.logo,
      segmentName: seg?.name || p.segment,
      segmentColor: seg?.color || '#71717a',
      funding: p.funding || 0,
      fundingFormatted: formatFunding(p.funding || 0),
    };
  });

  // Funding stage chips
  const stageOrder: FundingStage[] = ['pre-seed', 'seed', 'early', 'growth', 'late', 'public', 'fair-launch', 'undisclosed'];
  const fundingStageChips = stageOrder
    .map(stage => ({
      stage,
      label: FUNDING_STAGE_LABELS[stage],
      color: getFundingStageColor(stage),
      count: fundingStageDist[stage] || 0,
      funding: fundingStageFunding[stage] || 0,
      fundingFormatted: formatFunding(fundingStageFunding[stage] || 0),
    }))
    .filter(s => s.count > 0);

  // Country distribution (top 8)
  const countryDistribution = countryDist.slice(0, 8).map(c => ({
    code: c.country,
    name: c.name,
    flag: getCountryFlag(c.country),
    count: c.count,
    pctOfTotal: Math.round((c.count / projects.length) * 100),
  }));

  // Region summary
  const regionSummary = (Object.entries(regionDist) as [string, number][])
    .filter(([r]) => r in REGION_LABELS)
    .sort((a, b) => b[1] - a[1])
    .map(([region, count]) => ({
      region,
      label: REGION_LABELS[region as Region] || region,
      count,
      funding: regionFunding[region] || 0,
      fundingFormatted: formatFunding(regionFunding[region] || 0),
      pctOfTotal: Math.round((count / projects.length) * 100),
    }));

  // Company types
  const typeOrder: CompanyType[] = ['private', 'public', 'acquired', 'token'];
  const companyTypes = typeOrder.map(type => {
    const count = projects.filter(p => p.company_type === type).length;
    return {
      type,
      label: COMPANY_TYPE_LABELS[type],
      color: getCompanyTypeColor(type),
      count,
      pctOfTotal: Math.round((count / projects.length) * 100),
    };
  }).filter(t => t.count > 0);

  // Active / defunct
  const defunctCount = projects.filter(p => p.defunct).length;
  const activeCount = projects.length - defunctCount;

  // Funding by year (based on last_funding_date)
  const fundingYearMap: Record<string, { count: number; funding: number }> = {};
  projects.forEach(p => {
    if (p.last_funding_date && p.funding) {
      const year = p.last_funding_date.split('-')[0];
      if (!fundingYearMap[year]) fundingYearMap[year] = { count: 0, funding: 0 };
      fundingYearMap[year].count += 1;
      fundingYearMap[year].funding += p.funding;
    }
  });
  const fundingByYear = Object.entries(fundingYearMap)
    .map(([year, data]) => ({
      label: year,
      count: data.count,
      funding: data.funding,
      fundingFormatted: formatFunding(data.funding),
    }))
    .sort((a, b) => Number(a.label) - Number(b.label));

  // Top pairings (5)
  const topPairings = crossPages
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map(p => ({
      segmentName: p.segmentName,
      segmentColor: p.segmentColor,
      aiTypeLabel: p.aiTypeLabel,
      aiTypeColor: p.aiTypeColor,
      count: p.count,
    }));

  // Insight cards
  const llmCount = projects.filter(p => p.ai_types?.includes('llm')).length;
  const tradingProjects = getProjectsBySegment('trading');
  const tradingLlmCount = getProjectsBySegmentAndAIType('trading', 'llm').length;
  const tradingLlmPct = tradingProjects.length > 0 ? Math.round((tradingLlmCount / tradingProjects.length) * 100) : 0;
  const usCount = countryDist.find(c => c.country === 'US')?.count || 0;
  const usPct = Math.round((usCount / projects.length) * 100);
  const acquiredCount = projects.filter(p => p.company_type === 'acquired').length;

  const insightCards = [
    { label: 'LLM Adoption', value: `${Math.round((llmCount / projects.length) * 100)}%`, detail: `${llmCount} companies use LLM/NLP` },
    { label: 'US Concentration', value: `${usPct}%`, detail: `${usCount} companies based in the US` },
    { label: 'Acquired', value: String(acquiredCount), detail: `${acquiredCount} companies have been acquired` },
    { label: 'Trading + LLM', value: `${tradingLlmPct}%`, detail: 'of Trading companies use LLMs' },
  ];

  // FAQ
  const faqs = [
    {
      question: 'How many AI finance companies are there?',
      answer: `The AIFI Map directory tracks ${projects.length} companies building at the intersection of artificial intelligence and financial services, across ${segments.length} market segments and ${layers.length} technology layers.`,
    },
    {
      question: 'How much funding has AI fintech raised?',
      answer: `Companies in the AIFI Map directory have raised a combined ${formatFunding(totalFunding)} in funding. The top 10 most funded companies account for ${formatFunding(topCompanies.reduce((s, p) => s + (p.funding || 0), 0))} of that total.`,
    },
    {
      question: 'What percentage of AI finance companies use LLMs?',
      answer: `${llmCount} out of ${projects.length} companies (${Math.round((llmCount / projects.length) * 100)}%) in the AIFI Map directory use Large Language Models (LLMs) or NLP technologies.`,
    },
    {
      question: 'Which country has the most AI finance companies?',
      answer: `The United States leads with the most financial AI companies in the AIFI Map directory, followed by companies in the EMEA and APAC regions. ${(Object.entries(regionDist) as [string, number][]).filter(([r]) => r in REGION_LABELS).sort((a, b) => b[1] - a[1]).map(([r, c]) => `${REGION_LABELS[r as Region] || r}: ${c}`).join(', ')}.`,
    },
  ];

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };

  // Assemble dashboard data
  const dashboardData: StatsDashboardData = {
    heroStats: {
      totalCompanies: projects.length,
      totalFunding,
      totalFundingFormatted: formatFunding(totalFunding),
      countryCount,
      agentCount: agents.length,
    },
    insightCards,
    segmentBreakdown,
    layerBreakdown,
    aiTypeBreakdown,
    topFunded,
    fundingStageChips,
    countryDistribution,
    regionSummary,
    companyTypes,
    activeCount,
    defunctCount,
    fundingByYear,
    topPairings,
    faqs,
    buildDate: BUILD_DATE,
  };

  const webPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Financial AI Statistics & Market Data',
    description: `Key statistics on the financial AI landscape: ${projects.length} companies, ${formatFunding(totalFunding)} in total funding, across ${segments.length} market segments.`,
    url: 'https://aifimap.com/stats',
    isPartOf: { '@type': 'WebSite', name: 'AIFI Map', url: 'https://aifimap.com' },
    dateModified: BUILD_DATE,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'AIFI Map', item: 'https://aifimap.com' },
        { '@type': 'ListItem', position: 2, name: 'Statistics', item: 'https://aifimap.com/stats' },
      ],
    },
    mainEntity: {
      '@type': 'Dataset',
      name: 'Financial AI Market Statistics',
      description: `Market data for ${projects.length} AI finance companies spanning ${segments.length} segments, ${layers.length} layers, and ${countryCount} countries.`,
      creator: { '@type': 'Organization', name: 'AIFI Map', url: 'https://aifimap.com' },
      variableMeasured: ['Company Count', 'Total Funding', 'Market Segments', 'AI Technologies', 'Geographic Distribution'],
    },
  };

  return (
    <>
      <JsonLd data={webPageJsonLd} />
      <JsonLd data={faqJsonLd} />
      {/* Hero header */}
      <div className="relative overflow-hidden border-b border-border/30">
        <div className="absolute inset-0 bg-gradient-to-b from-surface/50 via-background to-background" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px]">
          <div className="absolute inset-0 bg-gradient-to-b from-accent/10 via-accent/5 to-transparent blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 pt-6 pb-8">
          <Breadcrumbs items={[{ label: 'Statistics' }]} />
          <p className="label-refined mb-2 text-accent">Market Data</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary mb-3">
            Financial AI Statistics
          </h1>
          <p className="text-text-secondary text-[0.9375rem] leading-relaxed max-w-3xl mb-1">
            Key metrics on the AI + Finance landscape tracked by the AIFI Map directory. {projects.length} companies, {agents.length} autonomous agents, {segments.length} market segments.
          </p>
          <p className="text-xs text-text-faint">Last updated: {BUILD_DATE}</p>
        </div>
      </div>

      {/* Dashboard */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-10">
        <StatsDashboard data={dashboardData} />

        {/* CTA */}
        <div className="mt-12 pt-8 border-t border-border/30">
          <Link
            href="/directory"
            className="inline-flex items-center px-6 py-3 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent-muted transition-all duration-200"
          >
            Browse the Full Directory
          </Link>
        </div>
      </div>
    </>
  );
}
