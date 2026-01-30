import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  segments,
  getProjectsByAIType,
  getProjectsBySegment,
  formatFunding,
  AI_TYPE_LABELS,
  AI_TYPE_COLORS,
  AI_TYPE_DESCRIPTIONS,
  BUILD_DATE_ISO,
} from '@/lib/data';
import { AIType } from '@/types';
import CompanyLogo from '@/components/CompanyLogo';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';

const aiTypes: AIType[] = ['llm', 'predictive-ml', 'computer-vision', 'graph-analytics', 'reinforcement-learning', 'agentic', 'data-platform', 'infrastructure'];

function parseSlug(slug: string): { a: AIType; b: AIType } | null {
  const parts = slug.split('-vs-');
  if (parts.length !== 2) return null;
  const a = parts[0] as AIType;
  const b = parts[1] as AIType;
  if (!AI_TYPE_LABELS[a] || !AI_TYPE_LABELS[b]) return null;
  return { a, b };
}

function getViablePairs() {
  const viable = aiTypes.filter(t => getProjectsByAIType(t).length >= 5);
  const pairs: Array<{ a: AIType; b: AIType }> = [];
  for (let i = 0; i < viable.length; i++) {
    for (let j = i + 1; j < viable.length; j++) {
      pairs.push({ a: viable[i], b: viable[j] });
    }
  }
  return pairs;
}

export function generateStaticParams() {
  return getViablePairs().map(p => ({ slug: `${p.a}-vs-${p.b}` }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const parsed = parseSlug(params.slug);
  if (!parsed) return { title: 'Comparison Not Found | AIFI Map' };
  const labelA = AI_TYPE_LABELS[parsed.a];
  const labelB = AI_TYPE_LABELS[parsed.b];
  const countA = getProjectsByAIType(parsed.a).length;
  const countB = getProjectsByAIType(parsed.b).length;
  const description = `${labelA} vs ${labelB} in financial AI: ${countA} vs ${countB} companies compared. Side-by-side analysis of adoption, funding, and market segments.`;
  return {
    title: `${labelA} vs ${labelB} in Finance — Comparison | AIFI Map`,
    description: description.slice(0, 160),
    openGraph: {
      title: `${labelA} vs ${labelB} in Finance`,
      description: description.slice(0, 160),
      type: 'article',
      siteName: 'AIFI Map',
      images: [{ url: `/og/compare/${params.slug}.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${labelA} vs ${labelB} in Finance`,
      description: description.slice(0, 160),
      images: [`/og/compare/${params.slug}.png`],
    },
  };
}

export default function ComparisonPage({ params }: { params: { slug: string } }) {
  const parsed = parseSlug(params.slug);
  if (!parsed) notFound();

  const { a, b } = parsed;
  const labelA = AI_TYPE_LABELS[a];
  const labelB = AI_TYPE_LABELS[b];
  const colorA = AI_TYPE_COLORS[a];
  const colorB = AI_TYPE_COLORS[b];
  const descA = AI_TYPE_DESCRIPTIONS[a];
  const descB = AI_TYPE_DESCRIPTIONS[b];

  const projectsA = getProjectsByAIType(a);
  const projectsB = getProjectsByAIType(b);
  const fundedA = projectsA.filter(p => p.funding && p.funding > 0).sort((a, b) => (b.funding || 0) - (a.funding || 0));
  const fundedB = projectsB.filter(p => p.funding && p.funding > 0).sort((a, b) => (b.funding || 0) - (a.funding || 0));
  const totalFundingA = projectsA.reduce((sum, p) => sum + (p.funding || 0), 0);
  const totalFundingB = projectsB.reduce((sum, p) => sum + (p.funding || 0), 0);

  // Overlap: companies using both
  const slugsA = new Set(projectsA.map(p => p.slug));
  const overlap = projectsB.filter(p => slugsA.has(p.slug));

  // Segment distribution for each
  const segDistA = segments.map(s => ({
    name: s.name, slug: s.slug, color: s.color,
    count: projectsA.filter(p => p.segment === s.slug || p.segments?.includes(s.slug)).length,
  })).filter(s => s.count > 0).sort((a, b) => b.count - a.count);

  const segDistB = segments.map(s => ({
    name: s.name, slug: s.slug, color: s.color,
    count: projectsB.filter(p => p.segment === s.slug || p.segments?.includes(s.slug)).length,
  })).filter(s => s.count > 0).sort((a, b) => b.count - a.count);

  // Median founded year
  const medianFoundedA = getMedianFounded(projectsA);
  const medianFoundedB = getMedianFounded(projectsB);

  // Other comparisons for "Related" section
  const otherPairs = getViablePairs()
    .filter(p => !(p.a === a && p.b === b))
    .filter(p => p.a === a || p.b === a || p.a === b || p.b === b)
    .slice(0, 6);

  // FAQs
  const faqs = [
    {
      question: `What is the difference between ${labelA} and ${labelB} in finance?`,
      answer: `${labelA} and ${labelB} represent different approaches to applying AI in financial services. ${descA} ${descB} In the AIFI Map directory, ${projectsA.length} companies use ${labelA} and ${projectsB.length} use ${labelB}. ${overlap.length > 0 ? `${overlap.length} companies use both technologies.` : 'These technologies are typically used by different companies.'} (Source: AIFI Map directory.)`,
    },
    {
      question: `Which is more widely used in finance, ${labelA} or ${labelB}?`,
      answer: `${projectsA.length > projectsB.length ? labelA : labelB} is more widely adopted, with ${Math.max(projectsA.length, projectsB.length)} companies versus ${Math.min(projectsA.length, projectsB.length)}. In terms of total funding, ${totalFundingA > totalFundingB ? `${labelA} companies have raised ${formatFunding(totalFundingA)}` : `${labelB} companies have raised ${formatFunding(totalFundingB)}`}, compared to ${totalFundingA > totalFundingB ? formatFunding(totalFundingB) : formatFunding(totalFundingA)} for ${totalFundingA > totalFundingB ? labelB : labelA}. (Source: AIFI Map directory.)`,
    },
    {
      question: `Which ${labelA} and ${labelB} companies are the most funded?`,
      answer: `The most-funded ${labelA} company is ${fundedA[0]?.name || 'unknown'}${fundedA[0]?.funding ? ` (${formatFunding(fundedA[0].funding)})` : ''}. The most-funded ${labelB} company is ${fundedB[0]?.name || 'unknown'}${fundedB[0]?.funding ? ` (${formatFunding(fundedB[0].funding)})` : ''}. (Source: AIFI Map directory.)`,
    },
    {
      question: `Can a company use both ${labelA} and ${labelB}?`,
      answer: overlap.length > 0
        ? `Yes. ${overlap.length} companies in the AIFI directory use both ${labelA} and ${labelB}. Examples include ${overlap.slice(0, 3).map(p => p.name).join(', ')}. Multi-technology approaches are common in financial AI, where companies combine different AI techniques to solve complex problems.`
        : `While it's possible in theory, no companies in the AIFI directory currently combine both ${labelA} and ${labelB} as primary technologies. These approaches tend to serve different use cases in financial services.`,
    },
  ];

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${labelA} vs ${labelB} in Finance`,
    description: `Comparing ${labelA} and ${labelB} in financial services: ${projectsA.length} vs ${projectsB.length} companies, funding, and market segments.`,
    author: { '@type': 'Organization', name: 'AIFI Map', url: 'https://aifimap.com' },
    publisher: { '@type': 'Organization', name: 'AIFI Map', url: 'https://aifimap.com' },
    datePublished: '2025-01-01',
    dateModified: BUILD_DATE_ISO,
    mainEntityOfPage: `https://aifimap.com/compare/${params.slug}`,
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
      { '@type': 'ListItem', position: 2, name: 'Compare', item: 'https://aifimap.com/compare' },
      { '@type': 'ListItem', position: 3, name: `${labelA} vs ${labelB}`, item: `https://aifimap.com/compare/${params.slug}` },
    ],
  };

  return (
    <>
    <JsonLd data={articleJsonLd} />
    <JsonLd data={faqJsonLd} />
    <JsonLd data={breadcrumbJsonLd} />
    <div className="max-w-5xl mx-auto px-6 sm:px-8 py-8">
      <Breadcrumbs items={[
        { label: 'Compare', href: '/compare' },
        { label: `${labelA} vs ${labelB}` },
      ]} />

      {/* Hero */}
      <div className="relative bg-surface border border-border rounded-2xl overflow-hidden mb-8">
        <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${colorA}, ${colorB})` }} />
        <div className="p-6 sm:p-8">
          <p className="label-refined text-accent mb-2">Comparison</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary mb-3">
            <span style={{ color: colorA }}>{labelA}</span>
            {' '}vs{' '}
            <span style={{ color: colorB }}>{labelB}</span>
          </h1>
          <p className="text-text-secondary text-[0.9375rem] leading-relaxed max-w-3xl">
            Comparing two AI approaches used in financial services: {labelA} ({projectsA.length} companies,{' '}
            {formatFunding(totalFundingA)} funded) and {labelB} ({projectsB.length} companies,{' '}
            {formatFunding(totalFundingB)} funded).
            {overlap.length > 0 && ` ${overlap.length} companies use both technologies.`}
          </p>
        </div>
      </div>

      {/* Side-by-side stats */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-text-primary mb-4">At a Glance</h2>
        <div className="grid grid-cols-2 gap-4">
          {/* Column A */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-3 h-3 rounded-full" style={{ background: colorA }} />
              <h3 className="font-semibold text-text-primary">{labelA}</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-text-muted">Companies</span><span className="font-semibold text-text-primary tabular-nums">{projectsA.length}</span></div>
              <div className="flex justify-between"><span className="text-text-muted">Total Funding</span><span className="font-semibold text-text-primary tabular-nums">{formatFunding(totalFundingA)}</span></div>
              <div className="flex justify-between"><span className="text-text-muted">Funded Companies</span><span className="font-semibold text-text-primary tabular-nums">{fundedA.length}</span></div>
              <div className="flex justify-between"><span className="text-text-muted">Median Founded</span><span className="font-semibold text-text-primary tabular-nums">{medianFoundedA || '—'}</span></div>
              <div className="flex justify-between"><span className="text-text-muted">Segments</span><span className="font-semibold text-text-primary tabular-nums">{segDistA.length}</span></div>
            </div>
          </div>
          {/* Column B */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-3 h-3 rounded-full" style={{ background: colorB }} />
              <h3 className="font-semibold text-text-primary">{labelB}</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-text-muted">Companies</span><span className="font-semibold text-text-primary tabular-nums">{projectsB.length}</span></div>
              <div className="flex justify-between"><span className="text-text-muted">Total Funding</span><span className="font-semibold text-text-primary tabular-nums">{formatFunding(totalFundingB)}</span></div>
              <div className="flex justify-between"><span className="text-text-muted">Funded Companies</span><span className="font-semibold text-text-primary tabular-nums">{fundedB.length}</span></div>
              <div className="flex justify-between"><span className="text-text-muted">Median Founded</span><span className="font-semibold text-text-primary tabular-nums">{medianFoundedB || '—'}</span></div>
              <div className="flex justify-between"><span className="text-text-muted">Segments</span><span className="font-semibold text-text-primary tabular-nums">{segDistB.length}</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology descriptions */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Technology Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: colorA }} />
              <h3 className="font-semibold text-sm text-text-primary">{labelA}</h3>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">{descA}</p>
            <Link href={`/ai-types/${a}`} className="inline-block mt-3 text-xs text-accent hover:text-accent-hover transition-colors">
              View all {labelA} companies &rarr;
            </Link>
          </div>
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: colorB }} />
              <h3 className="font-semibold text-sm text-text-primary">{labelB}</h3>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">{descB}</p>
            <Link href={`/ai-types/${b}`} className="inline-block mt-3 text-xs text-accent hover:text-accent-hover transition-colors">
              View all {labelB} companies &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Top companies side-by-side */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Top Companies by Funding</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2" style={{ color: colorA }}>{labelA}</p>
            {fundedA.slice(0, 5).map(p => (
              <Link key={p.slug} href={`/p/${p.slug}`} className="flex items-center gap-3 bg-surface border border-border rounded-lg px-3 py-2.5 hover:border-accent/30 transition-all group">
                <CompanyLogo project={p} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors truncate">{p.name}</p>
                  <p className="text-xs text-text-muted truncate">{p.tagline}</p>
                </div>
                {p.funding && <span className="text-xs text-text-faint tabular-nums shrink-0">{formatFunding(p.funding)}</span>}
              </Link>
            ))}
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2" style={{ color: colorB }}>{labelB}</p>
            {fundedB.slice(0, 5).map(p => (
              <Link key={p.slug} href={`/p/${p.slug}`} className="flex items-center gap-3 bg-surface border border-border rounded-lg px-3 py-2.5 hover:border-accent/30 transition-all group">
                <CompanyLogo project={p} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors truncate">{p.name}</p>
                  <p className="text-xs text-text-muted truncate">{p.tagline}</p>
                </div>
                {p.funding && <span className="text-xs text-text-faint tabular-nums shrink-0">{formatFunding(p.funding)}</span>}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Segment distribution */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Segment Distribution</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2" style={{ color: colorA }}>{labelA}</p>
            <div className="space-y-1.5">
              {segDistA.slice(0, 6).map(s => (
                <Link key={s.slug} href={`/segments/${s.slug}`} className="flex items-center gap-2 text-sm hover:text-accent transition-colors">
                  <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                  <span className="text-text-secondary">{s.name}</span>
                  <span className="ml-auto text-text-faint tabular-nums">{s.count}</span>
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2" style={{ color: colorB }}>{labelB}</p>
            <div className="space-y-1.5">
              {segDistB.slice(0, 6).map(s => (
                <Link key={s.slug} href={`/segments/${s.slug}`} className="flex items-center gap-2 text-sm hover:text-accent transition-colors">
                  <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                  <span className="text-text-secondary">{s.name}</span>
                  <span className="ml-auto text-text-faint tabular-nums">{s.count}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Overlap */}
      {overlap.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Companies Using Both ({overlap.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {overlap.slice(0, 9).map(p => (
              <Link key={p.slug} href={`/p/${p.slug}`} className="flex items-center gap-3 bg-surface border border-border rounded-lg px-3 py-2.5 hover:border-accent/30 transition-all group">
                <CompanyLogo project={p} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors truncate">{p.name}</p>
                  {p.funding && <p className="text-xs text-text-faint tabular-nums">{formatFunding(p.funding)}</p>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Related comparisons */}
      {otherPairs.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Related Comparisons</h2>
          <div className="flex flex-wrap gap-2">
            {otherPairs.map(p => (
              <Link
                key={`${p.a}-vs-${p.b}`}
                href={`/compare/${p.a}-vs-${p.b}`}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-border hover:border-accent/30 transition-all text-sm"
              >
                <span className="w-2 h-2 rounded-full" style={{ background: AI_TYPE_COLORS[p.a] }} />
                <span className="text-text-secondary">{AI_TYPE_LABELS[p.a]}</span>
                <span className="text-text-faint text-xs">vs</span>
                <span className="w-2 h-2 rounded-full" style={{ background: AI_TYPE_COLORS[p.b] }} />
                <span className="text-text-secondary">{AI_TYPE_LABELS[p.b]}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

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
    </div>
    </>
  );
}

function getMedianFounded(projs: { founded?: number }[]): number | null {
  const years = projs.filter(p => p.founded).map(p => p.founded!).sort((a, b) => a - b);
  if (years.length === 0) return null;
  return years[Math.floor(years.length / 2)];
}
