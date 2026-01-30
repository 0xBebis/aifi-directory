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
  AI_TYPE_DESCRIPTIONS,
  BUILD_DATE_ISO,
} from '@/lib/data';
import { AIType } from '@/types';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';

const aiTypes: AIType[] = ['llm', 'predictive-ml', 'computer-vision', 'graph-analytics', 'reinforcement-learning', 'agentic', 'data-platform', 'infrastructure'];

export const metadata: Metadata = {
  title: 'What is Financial AI? Definition, Technologies & Companies | AIFI Map',
  description: 'Financial AI is the application of artificial intelligence to financial services. Learn about the technologies, companies, market segments, and trends shaping AI in finance.',
  openGraph: {
    title: 'What is Financial AI? Definition, Technologies & Companies',
    description: 'Financial AI is the application of artificial intelligence to financial services. Learn about the technologies, companies, and trends shaping AI in finance.',
    type: 'article',
    siteName: 'AIFI Map',
    images: [{ url: '/og/content/what-is-financial-ai.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'What is Financial AI?',
    description: 'Financial AI is the application of artificial intelligence to financial services. Learn about the technologies, companies, and trends shaping AI in finance.',
    images: ['/og/content/what-is-financial-ai.png'],
  },
};

export default function WhatIsFinancialAIPage() {
  const totalFunding = getTotalFunding();
  const topCompanies = getTopCompanies(10);
  const fundedCompanies = projects.filter(p => p.funding && p.funding > 0);
  const cryptoCount = projects.filter(p => p.crypto).length;

  // AI type adoption stats
  const aiTypeStats = aiTypes.map(t => ({
    type: t,
    label: AI_TYPE_LABELS[t],
    color: AI_TYPE_COLORS[t],
    description: AI_TYPE_DESCRIPTIONS[t],
    count: getProjectsByAIType(t).length,
    funding: getProjectsByAIType(t).reduce((sum, p) => sum + (p.funding || 0), 0),
  })).sort((a, b) => b.count - a.count);

  // Segment stats
  const segmentStats = segments.map(s => ({
    slug: s.slug,
    name: s.name,
    color: s.color,
    count: getProjectsBySegment(s.slug).length,
    funding: getProjectsBySegment(s.slug).reduce((sum, p) => sum + (p.funding || 0), 0),
  })).sort((a, b) => b.count - a.count);

  // Layer stats
  const layerStats = layers.map(l => ({
    slug: l.slug,
    name: l.name,
    color: l.color,
    position: l.position,
    count: getProjectsByLayer(l.slug).length,
  })).sort((a, b) => a.position - b.position);

  // Founding year distribution
  const foundedProjects = projects.filter(p => p.founded);
  const medianYear = foundedProjects.length > 0
    ? [...foundedProjects].sort((a, b) => (a.founded || 0) - (b.founded || 0))[Math.floor(foundedProjects.length / 2)].founded
    : 2020;
  const recentCount = projects.filter(p => p.founded && p.founded >= 2020).length;

  // Region breakdown
  const regionCounts: Record<string, number> = {};
  projects.forEach(p => { if (p.region) regionCounts[p.region] = (regionCounts[p.region] || 0) + 1; });

  // FAQs for the page
  const faqs = [
    {
      question: 'What is financial AI?',
      answer: `Financial AI refers to the application of artificial intelligence and machine learning technologies to financial services. This includes using AI for trading, lending, risk management, insurance, banking, wealth management, and more. The AIFI Map directory tracks ${projects.length} companies building AI-powered financial technology, with ${formatFunding(totalFunding)} in combined funding. (Source: AIFI Map directory.)`,
    },
    {
      question: 'What AI technologies are used in finance?',
      answer: `Financial companies use ${aiTypes.length} primary AI technologies: ${aiTypeStats.slice(0, 4).map(t => `${t.label} (${t.count} companies)`).join(', ')}, and others including ${aiTypeStats.slice(4).map(t => t.label).join(', ')}. Large language models and predictive ML are the most widely adopted, while agentic AI is the fastest-growing category. (Source: AIFI Map directory.)`,
    },
    {
      question: 'How large is the financial AI market?',
      answer: `The AIFI Map tracks ${projects.length} companies in the financial AI space with ${formatFunding(totalFunding)} in combined disclosed funding. ${fundedCompanies.length} companies have raised venture or public funding. The largest segment by company count is ${segmentStats[0].name} (${segmentStats[0].count} companies), and the most-funded company is ${topCompanies[0]?.name} with ${topCompanies[0]?.funding ? formatFunding(topCompanies[0].funding) : 'undisclosed funding'}. (Source: AIFI Map directory.)`,
    },
    {
      question: 'Which are the largest financial AI companies?',
      answer: `The most-funded financial AI companies tracked by AIFI Map include ${topCompanies.slice(0, 5).map(p => `${p.name} (${p.funding ? formatFunding(p.funding) : 'undisclosed'})`).join(', ')}. These companies span multiple segments including trading, banking, lending, and risk management. (Source: AIFI Map directory.)`,
    },
    {
      question: 'What are the main financial AI market segments?',
      answer: `Financial AI spans ${segments.length} market segments: ${segmentStats.map(s => `${s.name} (${s.count} companies)`).join(', ')}. Each segment represents a distinct area of financial services where AI is being applied to automate decisions, reduce risk, or improve efficiency.`,
    },
    {
      question: 'Is financial AI the same as fintech?',
      answer: `Financial AI is a subset of fintech. While fintech broadly covers technology applied to financial services (including mobile banking, payment apps, and digital wallets), financial AI specifically refers to companies using artificial intelligence and machine learning as a core part of their technology. Not all fintech companies use AI, and not all AI companies focus on finance. The ${projects.length} companies in the AIFI Map directory are specifically those applying AI to financial services.`,
    },
  ];

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'What is Financial AI?',
    description: `Financial AI is the application of artificial intelligence to financial services. ${projects.length} companies are building AI for finance with ${formatFunding(totalFunding)} in funding.`,
    author: { '@type': 'Organization', name: 'AIFI Map', url: 'https://aifimap.com' },
    publisher: { '@type': 'Organization', name: 'AIFI Map', url: 'https://aifimap.com' },
    datePublished: '2025-01-01',
    dateModified: BUILD_DATE_ISO,
    mainEntityOfPage: 'https://aifimap.com/what-is-financial-ai',
    articleSection: 'Education',
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
      { '@type': 'ListItem', position: 2, name: 'What is Financial AI?', item: 'https://aifimap.com/what-is-financial-ai' },
    ],
  };

  return (
    <>
    <JsonLd data={articleJsonLd} />
    <JsonLd data={faqJsonLd} />
    <JsonLd data={breadcrumbJsonLd} />
    <div className="max-w-4xl mx-auto px-6 sm:px-8 py-8">
      <Breadcrumbs items={[{ label: 'What is Financial AI?' }]} />

      {/* Hero */}
      <header className="mb-12">
        <p className="label-refined mb-4 text-accent">Definition</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tighter text-text-primary leading-[1.1] mb-6">
          What is Financial AI?
        </h1>
        <p className="text-lg text-text-primary leading-relaxed">
          Financial AI is the application of artificial intelligence and machine learning to financial services.
          It spans every part of the industry — from algorithmic trading and credit underwriting to fraud detection,
          insurance pricing, wealth management, and regulatory compliance.
        </p>
      </header>

      <article className="space-y-12">
        {/* Definition section */}
        <section>
          <p className="text-text-secondary leading-relaxed mb-4">
            The AIFI Map tracks {projects.length} companies building AI-powered financial technology,
            with {formatFunding(totalFunding)} in combined disclosed funding across {segments.length} market
            segments and {layers.length} technology layers. These companies range from early-stage startups
            to publicly traded enterprises, spanning {Object.keys(regionCounts).length} global regions.
          </p>
          <p className="text-text-secondary leading-relaxed">
            Unlike traditional fintech, which applies technology broadly to financial services, financial AI companies
            use machine learning, natural language processing, computer vision, and other AI techniques as core
            technology. {recentCount} of the {projects.length} tracked companies were founded in 2020 or later,
            reflecting the rapid acceleration of AI adoption in finance.
          </p>
        </section>

        {/* Key stats */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Companies', value: String(projects.length) },
            { label: 'Total Funding', value: formatFunding(totalFunding) },
            { label: 'Market Segments', value: String(segments.length) },
            { label: 'AI Technologies', value: String(aiTypes.length) },
          ].map(stat => (
            <div key={stat.label} className="bg-surface border border-border rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
              <p className="text-xs text-text-muted mt-1">{stat.label}</p>
            </div>
          ))}
        </section>

        {/* AI Technologies */}
        <section>
          <h2 className="text-2xl font-bold text-text-primary mb-2">AI Technologies Used in Finance</h2>
          <p className="text-text-secondary leading-relaxed mb-6">
            Financial AI companies employ {aiTypes.length} primary technology categories. Each represents a
            distinct approach to applying artificial intelligence to financial problems.
          </p>
          <div className="space-y-4">
            {aiTypeStats.map(t => (
              <Link
                key={t.type}
                href={`/ai-types/${t.type}`}
                className="block bg-surface border border-border rounded-xl p-5 hover:border-accent/30 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <span className="w-3 h-3 rounded-full mt-1 shrink-0" style={{ background: t.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-text-primary group-hover:text-accent transition-colors">{t.label}</h3>
                      <span className="text-xs text-text-faint tabular-nums shrink-0">{t.count} companies &middot; {formatFunding(t.funding)}</span>
                    </div>
                    <p className="text-sm text-text-muted leading-relaxed">{t.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Market Segments */}
        <section>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Financial AI Market Segments</h2>
          <p className="text-text-secondary leading-relaxed mb-6">
            The financial AI landscape spans {segments.length} market segments, each representing a distinct area
            of financial services where AI is being applied.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {segmentStats.map(s => (
              <Link
                key={s.slug}
                href={`/segments/${s.slug}`}
                className="flex items-center gap-3 bg-surface border border-border rounded-xl px-4 py-3.5 hover:border-accent/30 transition-all group"
              >
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                <span className="font-medium text-sm text-text-primary group-hover:text-accent transition-colors">{s.name}</span>
                <span className="ml-auto text-xs text-text-faint tabular-nums">{s.count} companies &middot; {formatFunding(s.funding)}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Technology Stack */}
        <section>
          <h2 className="text-2xl font-bold text-text-primary mb-2">The Financial AI Technology Stack</h2>
          <p className="text-text-secondary leading-relaxed mb-6">
            Companies are organized into {layers.length} technology layers, from low-level infrastructure
            to end-user applications. This stack represents where in the technology chain a company operates.
          </p>
          <div className="space-y-2">
            {layerStats.map(l => (
              <Link
                key={l.slug}
                href={`/layers/${l.slug}`}
                className="flex items-center gap-3 bg-surface border border-border rounded-lg px-4 py-3 hover:border-accent/30 transition-all group"
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: l.color }} />
                <span className="font-medium text-sm text-text-primary group-hover:text-accent transition-colors">{l.name}</span>
                <span className="text-xs text-text-faint ml-1">Layer {l.position}</span>
                <span className="ml-auto text-xs text-text-faint tabular-nums">{l.count} companies</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Top Companies */}
        <section>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Largest Financial AI Companies</h2>
          <p className="text-text-secondary leading-relaxed mb-6">
            The 10 most-funded financial AI companies represent {formatFunding(topCompanies.reduce((sum, p) => sum + (p.funding || 0), 0))} in
            combined funding and span multiple market segments.
          </p>
          <div className="space-y-2">
            {topCompanies.map((p, i) => (
              <Link
                key={p.slug}
                href={`/p/${p.slug}`}
                className="flex items-center gap-4 bg-surface border border-border rounded-lg px-4 py-3 hover:border-accent/30 transition-all group"
              >
                <span className="text-xs text-text-faint tabular-nums w-5 text-right">{i + 1}.</span>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-sm text-text-primary group-hover:text-accent transition-colors">{p.name}</span>
                  <span className="text-xs text-text-muted ml-2">{p.tagline}</span>
                </div>
                {p.funding && <span className="text-xs text-text-faint tabular-nums shrink-0">{formatFunding(p.funding)}</span>}
              </Link>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link href="/directory" className="text-sm text-accent hover:text-accent-hover transition-colors">
              Browse all {projects.length} companies in the directory &rarr;
            </Link>
          </div>
        </section>

        {/* Web3 & Crypto */}
        <section>
          <h2 className="text-2xl font-bold text-text-primary mb-2">AI and Web3 in Finance</h2>
          <p className="text-text-secondary leading-relaxed">
            {cryptoCount} companies in the AIFI directory incorporate Web3 or blockchain technology alongside AI.
            These companies operate at the intersection of decentralized finance (DeFi) and artificial intelligence,
            using on-chain data, smart contracts, and tokenized systems to build financial products. The{' '}
            <Link href="/segments/crypto" className="text-accent hover:text-accent-hover transition-colors">
              Crypto & Web3 segment
            </Link>{' '}
            tracks companies primarily focused on this intersection.
          </p>
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

        {/* Internal links */}
        <section className="border-t border-border/30 pt-8">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Explore More</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Link href="/directory" className="group bg-surface border border-border rounded-xl p-4 hover:border-accent/30 transition-all">
              <p className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors mb-1">Company Directory</p>
              <p className="text-xs text-text-muted">Browse all {projects.length} companies</p>
            </Link>
            <Link href="/about" className="group bg-surface border border-border rounded-xl p-4 hover:border-accent/30 transition-all">
              <p className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors mb-1">Thesis: The Future of Financial AI</p>
              <p className="text-xs text-text-muted">Why AI will reshape financial services</p>
            </Link>
            <Link href="/stats" className="group bg-surface border border-border rounded-xl p-4 hover:border-accent/30 transition-all">
              <p className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors mb-1">Market Statistics</p>
              <p className="text-xs text-text-muted">Funding, segments, and trends</p>
            </Link>
            <Link href="/market-report" className="group bg-surface border border-border rounded-xl p-4 hover:border-accent/30 transition-all">
              <p className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors mb-1">Market Report</p>
              <p className="text-xs text-text-muted">State of financial AI</p>
            </Link>
            <Link href="/agents" className="group bg-surface border border-border rounded-xl p-4 hover:border-accent/30 transition-all">
              <p className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors mb-1">AI Agent Registry</p>
              <p className="text-xs text-text-muted">Autonomous agents in finance</p>
            </Link>
            <Link href="/compare" className="group bg-surface border border-border rounded-xl p-4 hover:border-accent/30 transition-all">
              <p className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors mb-1">Technology Comparisons</p>
              <p className="text-xs text-text-muted">LLM vs Predictive ML and more</p>
            </Link>
          </div>
        </section>
      </article>
    </div>
    </>
  );
}
