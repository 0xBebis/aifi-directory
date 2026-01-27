import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import {
  segments,
  getProjectsByAIType,
  getProjectsBySegment,
  formatFunding,
  AI_TYPE_LABELS,
  AI_TYPE_COLORS,
  AI_TYPE_DESCRIPTIONS,
} from '@/lib/data';
import { AIType } from '@/types';
import CompanyLogo from '@/components/CompanyLogo';
import JsonLd from '@/components/JsonLd';

const aiTypes: AIType[] = ['llm', 'predictive-ml', 'computer-vision', 'graph-analytics', 'reinforcement-learning', 'agentic', 'data-platform', 'infrastructure'];

export function generateStaticParams() {
  return aiTypes.map(t => ({ slug: t }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const aiType = params.slug as AIType;
  const label = AI_TYPE_LABELS[aiType];
  if (!label) return { title: 'AI Type Not Found | AIFI' };
  const typeProjects = getProjectsByAIType(aiType);
  const description = `${typeProjects.length} financial companies using ${label}. ${AI_TYPE_DESCRIPTIONS[aiType]} Explore which companies apply ${label} to finance.`;
  return {
    title: `${label} in Finance — AI Companies | AIFI`,
    description: description.slice(0, 160),
    openGraph: {
      title: `${label} in Finance — AI Companies`,
      description: description.slice(0, 160),
      type: 'website',
      siteName: 'AIFI',
      images: [{ url: '/og/default.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${label} in Finance — AI Companies`,
      description: description.slice(0, 160),
      images: ['/og/default.png'],
    },
  };
}

export default function AITypePage({ params }: { params: { slug: string } }) {
  const aiType = params.slug as AIType;
  const label = AI_TYPE_LABELS[aiType];
  const color = AI_TYPE_COLORS[aiType];
  const description = AI_TYPE_DESCRIPTIONS[aiType];
  if (!label) notFound();

  const typeProjects = getProjectsByAIType(aiType);
  const funded = typeProjects.filter(p => p.funding && p.funding > 0).sort((a, b) => (b.funding || 0) - (a.funding || 0));
  const totalFunding = typeProjects.reduce((sum, p) => sum + (p.funding || 0), 0);

  // Segment breakdown
  const segCounts: Array<{ slug: string; name: string; color: string; count: number }> = [];
  segments.forEach(s => {
    const count = typeProjects.filter(p => p.segment === s.slug || p.segments?.includes(s.slug)).length;
    if (count > 0) segCounts.push({ slug: s.slug, name: s.name, color: s.color, count });
  });
  segCounts.sort((a, b) => b.count - a.count);

  // Related AI types
  const relatedTypes = aiTypes.filter(t => t !== aiType).slice(0, 4);

  // FAQ content
  const topCompany = funded[0];
  const faqs = [
    {
      q: `How is ${label} used in finance?`,
      a: `${description} In the financial sector, ${label} is applied across ${segCounts.length} market segments including ${segCounts.slice(0, 3).map(s => s.name.toLowerCase()).join(', ')}. The AIFI directory tracks ${typeProjects.length} companies using ${label} in financial services.`,
    },
    {
      q: `Which financial companies use ${label}?`,
      a: `${typeProjects.length} companies in the AIFI directory use ${label}. ${funded.slice(0, 3).map(p => `${p.name} (${p.tagline})`).join('. ')}${funded.length > 3 ? `. And ${funded.length - 3} more.` : '.'}`,
    },
    {
      q: `How many companies use ${label} in finance?`,
      a: `The AIFI directory tracks ${typeProjects.length} financial companies using ${label}, with a combined ${formatFunding(totalFunding)} in funding raised.`,
    },
    ...(topCompany ? [{
      q: `What is the most funded ${label} finance company?`,
      a: `${topCompany.name} is the most funded ${label} company in the AIFI directory${topCompany.funding ? `, with ${formatFunding(topCompany.funding)} raised` : ''}. ${topCompany.tagline}`,
    }] : []),
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

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'AIFI', item: 'https://aifimap.com' },
      { '@type': 'ListItem', position: 2, name: 'Directory', item: 'https://aifimap.com/directory' },
      { '@type': 'ListItem', position: 3, name: label },
    ],
  };

  return (
    <>
    <JsonLd data={faqJsonLd} />
    <JsonLd data={breadcrumbJsonLd} />
    <div className="max-w-5xl mx-auto px-6 sm:px-8 py-8">
      <Breadcrumbs items={[
        { label: 'Directory', href: '/directory' },
        { label: label },
      ]} />

      {/* Hero */}
      <div className="relative bg-surface border border-border rounded-2xl overflow-hidden mb-8">
        <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${color}, ${color}66, transparent)` }} />
        <div className="p-6 sm:p-8">
          <p className="label-refined mb-2" style={{ color }}>AI Technology</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary mb-3">
            {label} in Finance
          </h1>
          <p className="text-text-secondary text-[0.9375rem] leading-relaxed max-w-3xl mb-6">
            {description}
          </p>
          <div className="flex flex-wrap gap-6 text-sm">
            <div><span className="text-text-faint">Companies</span> <span className="font-semibold text-text-primary ml-1">{typeProjects.length}</span></div>
            <div><span className="text-text-faint">Total Funding</span> <span className="font-semibold text-text-primary ml-1">{formatFunding(totalFunding)}</span></div>
            <div><span className="text-text-faint">Segments</span> <span className="font-semibold text-text-primary ml-1">{segCounts.length}</span></div>
          </div>
        </div>
      </div>

      {/* Segment Breakdown */}
      {segCounts.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Market Segments Using {label}</h2>
          <div className="flex flex-wrap gap-2">
            {segCounts.map(s => (
              <Link
                key={s.slug}
                href={`/segments/${s.slug}`}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border hover:border-accent/30 transition-colors text-sm"
              >
                <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                <span className="text-text-secondary">{s.name}</span>
                <span className="text-text-faint">{s.count}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Companies */}
      <section className="mb-10">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">
            {funded.length > 0 ? 'Top Companies by Funding' : 'All Companies'}
          </h2>
          <Link
            href={`/directory?aiType=${aiType}`}
            className="text-sm text-text-muted hover:text-accent transition-colors inline-flex items-center gap-1"
          >
            View in directory <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(funded.length > 0 ? funded : typeProjects).slice(0, 18).map(p => (
            <Link
              key={p.slug}
              href={`/p/${p.slug}`}
              className="group bg-surface border border-border rounded-xl p-4 hover:border-accent/30 transition-all hover:shadow-soft"
            >
              <div className="flex items-start gap-3">
                <CompanyLogo project={p} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm text-text-primary group-hover:text-accent transition-colors truncate">{p.name}</p>
                  <p className="text-xs text-text-muted mt-0.5 line-clamp-2 leading-relaxed">{p.tagline}</p>
                </div>
              </div>
              {p.funding && p.funding > 0 && (
                <div className="mt-3 text-xs text-text-faint tabular-nums">{formatFunding(p.funding)} raised</div>
              )}
            </Link>
          ))}
        </div>
        {typeProjects.length > 18 && (
          <div className="mt-4 text-center">
            <Link href={`/directory?aiType=${aiType}`} className="text-sm text-accent hover:text-accent-hover transition-colors">
              View all {typeProjects.length} companies →
            </Link>
          </div>
        )}
      </section>

      {/* Related AI Types */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Other AI Technologies</h2>
        <div className="flex flex-wrap gap-2">
          {relatedTypes.map(t => (
            <Link
              key={t}
              href={`/ai-types/${t}`}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border hover:border-accent/30 transition-colors text-sm"
            >
              <span className="w-2 h-2 rounded-full" style={{ background: AI_TYPE_COLORS[t] }} />
              <span className="text-text-secondary">{AI_TYPE_LABELS[t]}</span>
            </Link>
          ))}
        </div>
      </section>

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
    </div>
    </>
  );
}
