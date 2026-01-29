import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import AITypeFilteredContent from '@/components/AITypeFilteredContent';
import {
  segments,
  getProjectsByAIType,
  formatFunding,
  AI_TYPE_LABELS,
  AI_TYPE_COLORS,
  AI_TYPE_DESCRIPTIONS,
} from '@/lib/data';
import { AIType } from '@/types';
import JsonLd from '@/components/JsonLd';

const aiTypes: AIType[] = ['llm', 'predictive-ml', 'computer-vision', 'graph-analytics', 'reinforcement-learning', 'agentic', 'data-platform', 'infrastructure'];

export function generateStaticParams() {
  return aiTypes.map(t => ({ slug: t }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const aiType = params.slug as AIType;
  const label = AI_TYPE_LABELS[aiType];
  if (!label) return { title: 'AI Type Not Found | AIFI Map' };
  const typeProjects = getProjectsByAIType(aiType);
  const description = `${typeProjects.length} financial companies using ${label}. ${AI_TYPE_DESCRIPTIONS[aiType]} Explore which companies apply ${label} to finance.`;
  return {
    title: `${label} in Finance — AI Companies | AIFI Map`,
    description: description.slice(0, 160),
    openGraph: {
      title: `${label} in Finance — AI Companies`,
      description: description.slice(0, 160),
      type: 'website',
      siteName: 'AIFI Map',
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

  // Segment breakdown for this AI type
  const segCounts: Array<{ slug: string; name: string; color: string; count: number }> = [];
  segments.forEach(s => {
    const count = typeProjects.filter(p => p.segment === s.slug || p.segments?.includes(s.slug)).length;
    if (count > 0) segCounts.push({ slug: s.slug, name: s.name, color: s.color, count });
  });
  segCounts.sort((a, b) => b.count - a.count);

  // Prepare company data for client-side filtering
  const companyItems = [...typeProjects]
    .sort((a, b) => (b.funding || 0) - (a.funding || 0))
    .map(p => ({
      slug: p.slug,
      name: p.name,
      tagline: p.tagline,
      logo: p.logo,
      funding: p.funding || 0,
      fundingFormatted: p.funding ? formatFunding(p.funding) : '',
      aiTypes: (p.ai_types || []) as string[],
      segment: p.segment,
      segments: p.segments || [],
    }));

  // FAQ content
  const topCompany = funded[0];
  const faqs = [
    {
      q: `How is ${label} used in finance?`,
      a: `${description} In the financial sector, ${label} is applied across ${segCounts.length} market segments including ${segCounts.slice(0, 3).map(s => s.name.toLowerCase()).join(', ')}. The AIFI Map directory tracks ${typeProjects.length} companies using ${label} in financial services.`,
    },
    {
      q: `Which financial companies use ${label}?`,
      a: `${typeProjects.length} companies in the AIFI Map directory use ${label}. ${funded.slice(0, 3).map(p => `${p.name} (${p.tagline})`).join('. ')}${funded.length > 3 ? `. And ${funded.length - 3} more.` : '.'}`,
    },
    {
      q: `How many companies use ${label} in finance?`,
      a: `The AIFI Map directory tracks ${typeProjects.length} financial companies using ${label}, with a combined ${formatFunding(totalFunding)} in funding raised.`,
    },
    ...(topCompany ? [{
      q: `What is the most funded ${label} finance company?`,
      a: `${topCompany.name} is the most funded ${label} company in the AIFI Map directory${topCompany.funding ? `, with ${formatFunding(topCompany.funding)} raised` : ''}. ${topCompany.tagline}`,
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
      { '@type': 'ListItem', position: 1, name: 'AIFI Map', item: 'https://aifimap.com' },
      { '@type': 'ListItem', position: 2, name: 'Directory', item: 'https://aifimap.com/directory' },
      { '@type': 'ListItem', position: 3, name: label },
    ],
  };

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${label} in Finance: AI Companies`,
    url: `https://aifimap.com/ai-types/${aiType}`,
    description: `${typeProjects.length} financial companies using ${label}. ${description}`,
    numberOfItems: typeProjects.length,
    isPartOf: { '@type': 'WebSite', name: 'AIFI Map', url: 'https://aifimap.com' },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: funded.slice(0, 20).map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: p.name,
        url: `https://aifimap.com/p/${p.slug}`,
      })),
    },
  };

  return (
    <>
    <JsonLd data={faqJsonLd} />
    <JsonLd data={breadcrumbJsonLd} />
    <JsonLd data={collectionJsonLd} />
    <div className="max-w-5xl mx-auto px-6 sm:px-8 py-8">
      <Breadcrumbs items={[
        { label: 'Directory', href: '/directory' },
        { label: label },
      ]} />

      {/* Hero */}
      <div className="relative bg-surface border border-border rounded-2xl overflow-hidden mb-6">
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

      {/* AI Type Switcher Bar */}
      <nav className="flex flex-wrap gap-2 mb-10" aria-label="AI technologies">
        {aiTypes.map(t => {
          const isActive = t === aiType;
          const tColor = AI_TYPE_COLORS[t];
          return (
            <Link
              key={t}
              href={`/ai-types/${t}`}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                isActive
                  ? 'border-opacity-30 bg-opacity-15'
                  : 'border-transparent text-text-muted hover:text-text-primary hover:bg-surface-2/50'
              }`}
              style={isActive ? {
                backgroundColor: `${tColor}15`,
                color: tColor,
                borderColor: `${tColor}30`,
              } : undefined}
              aria-current={isActive ? 'page' : undefined}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: tColor }}
              />
              {AI_TYPE_LABELS[t]}
            </Link>
          );
        })}
      </nav>

      {/* Segment Filter + Companies (client component) */}
      <AITypeFilteredContent
        companies={companyItems}
        segmentCounts={segCounts}
        aiTypeSlug={aiType}
        totalCount={typeProjects.length}
      />

      {/* FAQ */}
      <section className="bg-surface/50 border border-border/30 rounded-xl p-8">
        <div className="flex items-center gap-6 mb-6">
          <h2 className="headline-sub whitespace-nowrap">Frequently Asked Questions</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-border/50 to-transparent" />
        </div>
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
