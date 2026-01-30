import { Metadata } from 'next';
import Link from 'next/link';
import {
  projects,
  segments,
  layers,
  getTotalFunding,
  getTopCompanies,
  getProjectsBySegment,
  getProjectsByLayer,
  getProjectsByAIType,
  formatFunding,
  AI_TYPE_LABELS,
  AI_TYPE_COLORS,
  REGION_LABELS,
  FUNDING_STAGE_LABELS,
  BUILD_DATE_ISO,
  BUILD_DATE,
} from '@/lib/data';
import { AIType, Region, FundingStage } from '@/types';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';

const aiTypes: AIType[] = ['llm', 'predictive-ml', 'computer-vision', 'graph-analytics', 'reinforcement-learning', 'agentic', 'data-platform', 'infrastructure'];

export const metadata: Metadata = {
  title: 'Financial AI Market Report — Trends, Funding & Analysis | AIFI Map',
  description: 'State of financial AI: funding trends, company growth, segment analysis, AI technology adoption, and regional distribution. Data-driven market report.',
  openGraph: {
    title: 'Financial AI Market Report',
    description: 'State of financial AI: funding trends, company growth, segment analysis, and AI technology adoption.',
    type: 'article',
    siteName: 'AIFI Map',
    images: [{ url: '/og/content/market-report.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Financial AI Market Report',
    description: 'State of financial AI: funding trends, company growth, and AI technology adoption.',
    images: ['/og/content/market-report.png'],
  },
};

export default function MarketReportPage() {
  const totalFunding = getTotalFunding();
  const topCompanies = getTopCompanies(10);
  const fundedCompanies = projects.filter(p => p.funding && p.funding > 0);
  const cryptoCount = projects.filter(p => p.crypto).length;
  const defunctCount = projects.filter(p => p.defunct).length;

  // ── Founding year distribution ──
  const foundedByYear: Record<number, number> = {};
  projects.forEach(p => {
    if (p.founded) foundedByYear[p.founded] = (foundedByYear[p.founded] || 0) + 1;
  });
  const yearEntries = Object.entries(foundedByYear)
    .map(([y, c]) => ({ year: Number(y), count: c }))
    .sort((a, b) => a.year - b.year);
  const recentYears = yearEntries.filter(e => e.year >= 2015);
  const peakYear = recentYears.length > 0
    ? recentYears.reduce((max, e) => e.count > max.count ? e : max, recentYears[0])
    : null;

  // ── Region distribution ──
  const regionCounts: Array<{ region: Region; label: string; count: number; funding: number }> = [];
  const regionSlugs: Region[] = ['americas', 'emea', 'apac'];
  regionSlugs.forEach(r => {
    const rProjects = projects.filter(p => p.region === r);
    regionCounts.push({
      region: r,
      label: REGION_LABELS[r],
      count: rProjects.length,
      funding: rProjects.reduce((sum, p) => sum + (p.funding || 0), 0),
    });
  });
  regionCounts.sort((a, b) => b.count - a.count);

  // ── Funding stage distribution ──
  const stageCounts: Array<{ stage: string; label: string; count: number }> = [];
  const stageMap: Record<string, number> = {};
  projects.forEach(p => {
    const stage = p.funding_stage || 'undisclosed';
    stageMap[stage] = (stageMap[stage] || 0) + 1;
  });
  Object.entries(stageMap)
    .filter(([s]) => s !== 'undisclosed')
    .forEach(([s, c]) => stageCounts.push({ stage: s, label: FUNDING_STAGE_LABELS[s as FundingStage] || s, count: c }));
  stageCounts.sort((a, b) => b.count - a.count);

  // ── Segment stats ──
  const segmentStats = segments.map(s => {
    const sp = getProjectsBySegment(s.slug);
    return {
      slug: s.slug, name: s.name, color: s.color,
      count: sp.length,
      funding: sp.reduce((sum, p) => sum + (p.funding || 0), 0),
      funded: sp.filter(p => p.funding && p.funding > 0).length,
    };
  }).sort((a, b) => b.count - a.count);

  // ── Layer stats ──
  const layerStats = layers.map(l => {
    const lp = getProjectsByLayer(l.slug);
    return {
      slug: l.slug, name: l.name, color: l.color, position: l.position,
      count: lp.length,
      funding: lp.reduce((sum, p) => sum + (p.funding || 0), 0),
    };
  }).sort((a, b) => a.position - b.position);

  // ── AI type stats ──
  const aiTypeStats = aiTypes.map(t => ({
    type: t,
    label: AI_TYPE_LABELS[t],
    color: AI_TYPE_COLORS[t],
    count: getProjectsByAIType(t).length,
    funding: getProjectsByAIType(t).reduce((sum, p) => sum + (p.funding || 0), 0),
  })).sort((a, b) => b.count - a.count);

  // ── Avg funding per funded company ──
  const avgFunding = fundedCompanies.length > 0
    ? totalFunding / fundedCompanies.length
    : 0;

  // ── Companies by employee size ──
  const empCounts: Record<string, number> = {};
  projects.forEach(p => { if (p.employees) empCounts[p.employees] = (empCounts[p.employees] || 0) + 1; });

  // FAQs
  const faqs = [
    {
      question: 'How large is the financial AI market?',
      answer: `The AIFI Map tracks ${projects.length} companies building AI for financial services with ${formatFunding(totalFunding)} in combined disclosed funding. ${fundedCompanies.length} companies have raised venture or public funding, with an average of ${formatFunding(avgFunding)} per funded company. The largest segment is ${segmentStats[0].name} (${segmentStats[0].count} companies). (Source: AIFI Map directory.)`,
    },
    {
      question: 'What are the biggest trends in financial AI?',
      answer: `Key trends include: (1) Rapid growth of ${aiTypeStats[0].label} adoption (${aiTypeStats[0].count} companies), reflecting the impact of large language models on financial services. (2) Agentic AI emergence, with autonomous agents increasingly handling financial workflows. (3) Web3 convergence — ${cryptoCount} companies combine AI with blockchain technology. (4) The ${segmentStats[0].name} segment leads with ${segmentStats[0].count} companies and ${formatFunding(segmentStats[0].funding)} in funding.`,
    },
    {
      question: 'Which regions lead in financial AI?',
      answer: `${regionCounts.map(r => `${r.label}: ${r.count} companies (${formatFunding(r.funding)} funded)`).join('. ')}. The ${regionCounts[0].label} region leads both in company count and total funding. (Source: AIFI Map directory.)`,
    },
    {
      question: 'What is the most common funding stage for financial AI companies?',
      answer: stageCounts.length > 0
        ? `The most common funding stage is ${stageCounts[0].label} (${stageCounts[0].count} companies), followed by ${stageCounts.slice(1, 3).map(s => `${s.label} (${s.count})`).join(' and ')}. ${defunctCount > 0 ? `${defunctCount} companies tracked are no longer operating.` : ''} (Source: AIFI Map directory.)`
        : 'Funding stage data is not available for all companies.',
    },
  ];

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Financial AI Market Report',
    description: `State of financial AI: ${projects.length} companies, ${formatFunding(totalFunding)} in funding, across ${segments.length} segments.`,
    author: { '@type': 'Organization', name: 'AIFI Map', url: 'https://aifimap.com' },
    publisher: { '@type': 'Organization', name: 'AIFI Map', url: 'https://aifimap.com' },
    datePublished: '2025-01-01',
    dateModified: BUILD_DATE_ISO,
    mainEntityOfPage: 'https://aifimap.com/market-report',
    articleSection: 'Market Report',
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'AIFI Map', item: 'https://aifimap.com' },
      { '@type': 'ListItem', position: 2, name: 'Market Report', item: 'https://aifimap.com/market-report' },
    ],
  };

  return (
    <>
    <JsonLd data={articleJsonLd} />
    <JsonLd data={faqJsonLd} />
    <JsonLd data={breadcrumbJsonLd} />
    <div className="max-w-4xl mx-auto px-6 sm:px-8 py-8">
      <Breadcrumbs items={[{ label: 'Market Report' }]} />

      <header className="mb-10">
        <p className="label-refined mb-4 text-accent">Report</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tighter text-text-primary leading-[1.1] mb-4">
          State of Financial AI
        </h1>
        <p className="text-text-secondary leading-relaxed max-w-3xl">
          A data-driven overview of the financial AI landscape: {projects.length} companies,{' '}
          {formatFunding(totalFunding)} in combined funding, across {segments.length} market segments
          and {aiTypes.length} AI technologies. Updated {BUILD_DATE}.
        </p>
      </header>

      <article className="space-y-12">
        {/* Key metrics */}
        <section>
          <h2 className="text-2xl font-bold text-text-primary mb-6">Key Metrics</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Companies Tracked', value: String(projects.length) },
              { label: 'Total Funding', value: formatFunding(totalFunding) },
              { label: 'Funded Companies', value: String(fundedCompanies.length) },
              { label: 'Avg Funding', value: formatFunding(avgFunding) },
              { label: 'Market Segments', value: String(segments.length) },
              { label: 'AI Technologies', value: String(aiTypes.length) },
              { label: 'Web3 Companies', value: String(cryptoCount) },
              { label: 'Regions', value: String(regionCounts.length) },
            ].map(stat => (
              <div key={stat.label} className="bg-surface border border-border rounded-xl p-4">
                <p className="text-2xl font-bold text-text-primary tabular-nums">{stat.value}</p>
                <p className="text-xs text-text-muted mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Company growth by founding year */}
        <section>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Company Growth Over Time</h2>
          <p className="text-text-secondary leading-relaxed mb-6">
            Financial AI company creation has accelerated significantly since 2015.
            {peakYear && ` Peak founding year was ${peakYear.year} with ${peakYear.count} new companies.`}
            {' '}{projects.filter(p => p.founded && p.founded >= 2020).length} companies were founded in 2020 or later.
          </p>
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-end gap-1 h-32">
              {recentYears.map(e => {
                const maxCount = Math.max(...recentYears.map(y => y.count));
                const height = maxCount > 0 ? (e.count / maxCount) * 100 : 0;
                return (
                  <div key={e.year} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-2xs text-text-faint tabular-nums">{e.count}</span>
                    <div
                      className="w-full rounded-t bg-accent/60 transition-all min-h-[2px]"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-2xs text-text-faint tabular-nums">{String(e.year).slice(2)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Segments */}
        <section>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Market Segments</h2>
          <p className="text-text-secondary leading-relaxed mb-6">
            Financial AI spans {segments.length} market segments. {segmentStats[0].name} leads with{' '}
            {segmentStats[0].count} companies and {formatFunding(segmentStats[0].funding)} in funding.
          </p>
          <div className="space-y-2">
            {segmentStats.map(s => {
              const maxCount = segmentStats[0].count;
              const width = maxCount > 0 ? (s.count / maxCount) * 100 : 0;
              return (
                <Link key={s.slug} href={`/segments/${s.slug}`} className="block group">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
                    <span className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors w-40 shrink-0">{s.name}</span>
                    <div className="flex-1 bg-surface-2 rounded-full h-5 overflow-hidden">
                      <div className="h-full rounded-full flex items-center px-2" style={{ width: `${Math.max(width, 8)}%`, background: `${s.color}40` }}>
                        <span className="text-2xs font-medium text-text-primary tabular-nums">{s.count}</span>
                      </div>
                    </div>
                    <span className="text-xs text-text-faint tabular-nums w-16 text-right shrink-0">{formatFunding(s.funding)}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* AI Technologies */}
        <section>
          <h2 className="text-2xl font-bold text-text-primary mb-2">AI Technology Adoption</h2>
          <p className="text-text-secondary leading-relaxed mb-6">
            {aiTypeStats[0].label} is the most widely adopted AI technology ({aiTypeStats[0].count} companies),
            followed by {aiTypeStats[1].label} ({aiTypeStats[1].count}) and {aiTypeStats[2].label} ({aiTypeStats[2].count}).
          </p>
          <div className="space-y-2">
            {aiTypeStats.map(t => {
              const maxCount = aiTypeStats[0].count;
              const width = maxCount > 0 ? (t.count / maxCount) * 100 : 0;
              return (
                <Link key={t.type} href={`/ai-types/${t.type}`} className="block group">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: t.color }} />
                    <span className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors w-44 shrink-0">{t.label}</span>
                    <div className="flex-1 bg-surface-2 rounded-full h-5 overflow-hidden">
                      <div className="h-full rounded-full flex items-center px-2" style={{ width: `${Math.max(width, 8)}%`, background: `${t.color}40` }}>
                        <span className="text-2xs font-medium text-text-primary tabular-nums">{t.count}</span>
                      </div>
                    </div>
                    <span className="text-xs text-text-faint tabular-nums w-16 text-right shrink-0">{formatFunding(t.funding)}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Technology Stack */}
        <section>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Technology Stack Distribution</h2>
          <p className="text-text-secondary leading-relaxed mb-6">
            Companies are distributed across {layers.length} technology layers, from infrastructure to end-user applications.
          </p>
          <div className="space-y-2">
            {layerStats.map(l => (
              <Link key={l.slug} href={`/layers/${l.slug}`} className="flex items-center gap-3 bg-surface border border-border rounded-lg px-4 py-3 hover:border-accent/30 transition-all group">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: l.color }} />
                <span className="font-medium text-sm text-text-primary group-hover:text-accent transition-colors">{l.name}</span>
                <span className="text-xs text-text-faint">Layer {l.position}</span>
                <span className="ml-auto text-xs text-text-faint tabular-nums">{l.count} companies &middot; {formatFunding(l.funding)}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Regional distribution */}
        <section>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Regional Distribution</h2>
          <p className="text-text-secondary leading-relaxed mb-6">
            Financial AI companies span {regionCounts.length} global regions.{' '}
            {regionCounts[0].label} leads with {regionCounts[0].count} companies.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {regionCounts.map(r => (
              <Link key={r.region} href={`/regions/${r.region}`} className="bg-surface border border-border rounded-xl p-5 hover:border-accent/30 transition-all group text-center">
                <p className="text-2xl font-bold text-text-primary tabular-nums">{r.count}</p>
                <p className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">{r.label}</p>
                <p className="text-xs text-text-faint mt-1 tabular-nums">{formatFunding(r.funding)} funded</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Funding stages */}
        <section>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Funding Stage Distribution</h2>
          <p className="text-text-secondary leading-relaxed mb-6">
            {stageCounts.length > 0 && `The most common funding stage is ${stageCounts[0].label} (${stageCounts[0].count} companies). `}
            {defunctCount > 0 && `${defunctCount} companies are no longer operating. `}
            {fundedCompanies.length} of {projects.length} companies have disclosed funding.
          </p>
          <div className="flex flex-wrap gap-2">
            {stageCounts.map(s => (
              <div key={s.stage} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-border text-sm">
                <span className="text-text-secondary">{s.label}</span>
                <span className="text-text-faint tabular-nums">{s.count}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Top companies table */}
        <section>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Most Funded Companies</h2>
          <p className="text-text-secondary leading-relaxed mb-6">
            The 10 most-funded financial AI companies represent{' '}
            {formatFunding(topCompanies.reduce((sum, p) => sum + (p.funding || 0), 0))} in combined funding.
          </p>
          <div className="space-y-2">
            {topCompanies.map((p, i) => (
              <Link key={p.slug} href={`/p/${p.slug}`} className="flex items-center gap-4 bg-surface border border-border rounded-lg px-4 py-3 hover:border-accent/30 transition-all group">
                <span className="text-xs text-text-faint tabular-nums w-5 text-right">{i + 1}.</span>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-sm text-text-primary group-hover:text-accent transition-colors">{p.name}</span>
                  <span className="text-xs text-text-muted ml-2 hidden sm:inline">{p.tagline}</span>
                </div>
                {p.funding && <span className="text-xs text-text-faint tabular-nums shrink-0">{formatFunding(p.funding)}</span>}
              </Link>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link href="/directory" className="text-sm text-accent hover:text-accent-hover transition-colors">
              Browse all {projects.length} companies &rarr;
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-surface/50 border border-border/30 rounded-xl p-8">
          <h2 className="text-xl font-bold text-text-primary mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((f, i) => (
              <div key={i}>
                <h3 className="text-[0.9375rem] font-semibold text-text-primary mb-2">{f.question}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{f.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Links */}
        <section className="border-t border-border/30 pt-8">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Explore More</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Link href="/what-is-financial-ai" className="group bg-surface border border-border rounded-xl p-4 hover:border-accent/30 transition-all">
              <p className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors mb-1">What is Financial AI?</p>
              <p className="text-xs text-text-muted">Definition, technologies, and companies</p>
            </Link>
            <Link href="/compare" className="group bg-surface border border-border rounded-xl p-4 hover:border-accent/30 transition-all">
              <p className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors mb-1">Technology Comparisons</p>
              <p className="text-xs text-text-muted">LLM vs Predictive ML and more</p>
            </Link>
            <Link href="/about" className="group bg-surface border border-border rounded-xl p-4 hover:border-accent/30 transition-all">
              <p className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors mb-1">Thesis</p>
              <p className="text-xs text-text-muted">The future of financial AI</p>
            </Link>
          </div>
        </section>
      </article>
    </div>
    </>
  );
}
