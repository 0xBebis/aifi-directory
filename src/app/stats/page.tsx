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
  getActiveAgents,
  formatFunding,
  BUILD_DATE,
  AI_TYPE_LABELS,
  AI_TYPE_COLORS,
  REGION_LABELS,
  FUNDING_STAGE_LABELS,
} from '@/lib/data';
import { AIType, Region, FundingStage } from '@/types';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Financial AI Statistics & Market Data | AIFI',
  description: 'Key statistics on the financial AI landscape. Company counts, funding totals, market segment breakdowns, AI technology adoption, and geographic distribution.',
  openGraph: {
    title: 'Financial AI Statistics & Market Data',
    description: 'Key statistics on the financial AI landscape. Company counts, funding totals, market segment breakdowns, and more.',
    type: 'website',
    siteName: 'AIFI',
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
  const activeAgents = getActiveAgents();

  // AI type counts
  const aiTypeCounts: Array<{ type: AIType; label: string; color: string; count: number }> = [];
  const allTypes: AIType[] = ['llm', 'predictive-ml', 'computer-vision', 'graph-analytics', 'reinforcement-learning', 'agentic', 'data-platform', 'infrastructure'];
  allTypes.forEach(type => {
    const count = projects.filter(p => p.ai_types?.includes(type)).length;
    if (count > 0) aiTypeCounts.push({ type, label: AI_TYPE_LABELS[type], color: AI_TYPE_COLORS[type], count });
  });
  aiTypeCounts.sort((a, b) => b.count - a.count);

  // Founded year distribution
  const yearCounts: Record<number, number> = {};
  projects.forEach(p => {
    if (p.founded) {
      const decade = Math.floor(p.founded / 5) * 5;
      yearCounts[decade] = (yearCounts[decade] || 0) + 1;
    }
  });
  const yearBuckets = Object.entries(yearCounts)
    .map(([year, count]) => ({ year: Number(year), count }))
    .sort((a, b) => a.year - b.year);

  // FAQ
  const faqs = [
    {
      q: 'How many AI finance companies are there?',
      a: `The AIFI directory tracks ${projects.length} companies building at the intersection of artificial intelligence and financial services, across ${segments.length} market segments and ${layers.length} technology layers.`,
    },
    {
      q: 'How much funding has AI fintech raised?',
      a: `Companies in the AIFI directory have raised a combined ${formatFunding(totalFunding)} in funding. The top 10 most funded companies account for ${formatFunding(topCompanies.reduce((s, p) => s + (p.funding || 0), 0))} of that total.`,
    },
    {
      q: 'What percentage of AI finance companies use LLMs?',
      a: `${aiTypeCounts.find(t => t.type === 'llm')?.count || 0} out of ${projects.length} companies (${Math.round(((aiTypeCounts.find(t => t.type === 'llm')?.count || 0) / projects.length) * 100)}%) in the AIFI directory use Large Language Models (LLMs) or NLP technologies.`,
    },
    {
      q: 'Which country has the most AI finance companies?',
      a: `The United States leads with the most financial AI companies in the AIFI directory, followed by companies in the EMEA and APAC regions. ${Object.entries(regionDist).sort((a, b) => b[1] - a[1]).map(([r, c]) => `${REGION_LABELS[r as Region]}: ${c}`).join(', ')}.`,
    },
  ];

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <>
    <JsonLd data={faqJsonLd} />
    <div className="max-w-5xl mx-auto px-6 sm:px-8 py-8">
      <Breadcrumbs items={[
        { label: 'Statistics' },
      ]} />
      <p className="label-refined mb-2 text-accent">Market Data</p>
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary mb-3">
        Financial AI Statistics
      </h1>
      <p className="text-text-secondary text-[0.9375rem] leading-relaxed max-w-3xl mb-2">
        Key metrics on the AI + Finance landscape tracked by the AIFI directory. {projects.length} companies, {agents.length} autonomous agents, {segments.length} market segments.
      </p>
      <p className="text-xs text-text-faint mb-10">Last updated: {BUILD_DATE}</p>

      {/* Key Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-border rounded-xl overflow-hidden mb-10">
        {[
          { label: 'Companies', value: String(projects.length) },
          { label: 'Total Funding', value: formatFunding(totalFunding) },
          { label: 'Segments', value: String(segments.length) },
          { label: 'Tech Layers', value: String(layers.length) },
          { label: 'AI Types', value: String(aiTypeCounts.length) },
          { label: 'AI Agents', value: String(agents.length) },
          { label: 'Active Agents', value: String(activeAgents.length) },
          { label: 'Regions', value: String(Object.keys(regionDist).length) },
        ].map((stat, i) => (
          <div key={i} className="bg-surface px-4 py-4 flex flex-col gap-1">
            <span className="text-2xs uppercase tracking-wider text-text-faint">{stat.label}</span>
            <span className="text-lg font-bold text-text-primary tabular-nums">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Segment Breakdown */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Companies by Segment</h2>
        <div className="space-y-2">
          {segments.map(s => {
            const count = segmentCounts[s.slug] || 0;
            const pct = Math.round((count / projects.length) * 100);
            return (
              <Link key={s.slug} href={`/segments/${s.slug}`} className="flex items-center gap-3 group">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
                <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors w-40 truncate">{s.name}</span>
                <div className="flex-1 h-2 bg-surface-2 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: s.color }} />
                </div>
                <span className="text-xs text-text-faint tabular-nums w-16 text-right">{count} ({pct}%)</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Layer Breakdown */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Companies by Layer</h2>
        <div className="space-y-2">
          {layers.map(l => {
            const count = layerCounts[l.slug] || 0;
            const pct = Math.round((count / projects.length) * 100);
            return (
              <Link key={l.slug} href={`/layers/${l.slug}`} className="flex items-center gap-3 group">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: l.color }} />
                <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors w-40 truncate">{l.name}</span>
                <div className="flex-1 h-2 bg-surface-2 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: l.color }} />
                </div>
                <span className="text-xs text-text-faint tabular-nums w-16 text-right">{count} ({pct}%)</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* AI Type Breakdown */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Companies by AI Technology</h2>
        <div className="space-y-2">
          {aiTypeCounts.map(t => {
            const pct = Math.round((t.count / projects.length) * 100);
            return (
              <Link key={t.type} href={`/ai-types/${t.type}`} className="flex items-center gap-3 group">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: t.color }} />
                <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors w-40 truncate">{t.label}</span>
                <div className="flex-1 h-2 bg-surface-2 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: t.color }} />
                </div>
                <span className="text-xs text-text-faint tabular-nums w-16 text-right">{t.count} ({pct}%)</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Region Distribution */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Companies by Region</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(Object.entries(regionDist) as [Region, number][])
            .sort((a, b) => b[1] - a[1])
            .map(([region, count]) => (
              <Link
                key={region}
                href={`/regions/${region}`}
                className="bg-surface border border-border rounded-xl p-4 hover:border-accent/30 transition-all"
              >
                <p className="text-sm text-text-muted mb-1">{REGION_LABELS[region]}</p>
                <p className="text-2xl font-bold text-text-primary tabular-nums">{count}</p>
                <p className="text-xs text-text-faint mt-1">{Math.round((count / projects.length) * 100)}% of directory</p>
              </Link>
            ))}
        </div>
      </section>

      {/* Funding Stage Distribution */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Companies by Funding Stage</h2>
        <div className="flex flex-wrap gap-3">
          {(Object.entries(fundingStageDist) as [FundingStage, number][])
            .filter(([, count]) => count > 0)
            .sort((a, b) => b[1] - a[1])
            .map(([stage, count]) => (
              <div key={stage} className="bg-surface border border-border rounded-lg px-4 py-3">
                <p className="text-xs text-text-faint mb-1">{FUNDING_STAGE_LABELS[stage]}</p>
                <p className="text-lg font-bold text-text-primary tabular-nums">{count}</p>
              </div>
            ))}
        </div>
      </section>

      {/* Top 10 Most Funded */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Top 10 Most Funded Companies</h2>
        <div className="space-y-1">
          {topCompanies.map((p, i) => (
            <Link
              key={p.slug}
              href={`/p/${p.slug}`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-2 transition-colors group"
            >
              <span className="text-xs text-text-faint w-5 text-right tabular-nums">{i + 1}</span>
              <span className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors flex-1 truncate">{p.name}</span>
              <span className="text-sm text-text-muted tabular-nums">{formatFunding(p.funding || 0)}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Founded Year Distribution */}
      {yearBuckets.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Companies by Founded Period</h2>
          <div className="flex flex-wrap gap-3">
            {yearBuckets.map(b => (
              <div key={b.year} className="bg-surface border border-border rounded-lg px-4 py-3">
                <p className="text-xs text-text-faint mb-1">{b.year}–{b.year + 4}</p>
                <p className="text-lg font-bold text-text-primary tabular-nums">{b.count}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="border-t border-border/30 pt-8">
        <h2 className="text-lg font-semibold text-text-primary mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqs.map((f, i) => (
            <div key={i}>
              <h3 className="text-[0.9375rem] font-semibold text-text-primary mb-2">{f.q}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="mt-10 pt-8 border-t border-border/30">
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
