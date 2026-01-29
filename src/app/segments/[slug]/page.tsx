import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import SegmentFilteredContent from '@/components/SegmentFilteredContent';
import {
  segments,
  getSegment,
  getProjectsBySegment,
  formatFunding,
  AI_TYPE_LABELS,
  AI_TYPE_COLORS,
} from '@/lib/data';
import { AIType } from '@/types';
import JsonLd from '@/components/JsonLd';

export function generateStaticParams() {
  return segments.map(s => ({ slug: s.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const segment = getSegment(params.slug);
  if (!segment) return { title: 'Segment Not Found | AIFI Map' };
  const segProjects = getProjectsBySegment(segment.slug);
  const description = `Explore ${segProjects.length} AI-powered ${segment.name.toLowerCase()} companies. ${segment.description} Browse the full directory of companies building AI for ${segment.name.toLowerCase()}.`;
  return {
    title: `${segment.name}: AI Companies & Platforms | AIFI Map`,
    description: description.slice(0, 160),
    openGraph: {
      title: `${segment.name}: AI Companies & Platforms`,
      description: description.slice(0, 160),
      type: 'website',
      siteName: 'AIFI Map',
      images: [{ url: '/og/default.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${segment.name}: AI Companies & Platforms`,
      description: description.slice(0, 160),
      images: ['/og/default.png'],
    },
  };
}

export default function SegmentPage({ params }: { params: { slug: string } }) {
  const segment = getSegment(params.slug);
  if (!segment) notFound();

  const segProjects = getProjectsBySegment(segment.slug);
  const funded = segProjects.filter(p => p.funding && p.funding > 0).sort((a, b) => (b.funding || 0) - (a.funding || 0));
  const totalFunding = segProjects.reduce((sum, p) => sum + (p.funding || 0), 0);
  const avgFounded = Math.round(
    segProjects.filter(p => p.founded).reduce((sum, p) => sum + (p.founded || 0), 0) /
    (segProjects.filter(p => p.founded).length || 1)
  );

  // AI type breakdown for this segment
  const aiTypeCounts: Array<{ type: AIType; label: string; color: string; count: number }> = [];
  const allTypes = new Set<AIType>();
  segProjects.forEach(p => p.ai_types?.forEach(t => allTypes.add(t)));
  allTypes.forEach(type => {
    const count = segProjects.filter(p => p.ai_types?.includes(type)).length;
    if (count > 0) {
      aiTypeCounts.push({ type, label: AI_TYPE_LABELS[type], color: AI_TYPE_COLORS[type], count });
    }
  });
  aiTypeCounts.sort((a, b) => b.count - a.count);

  // Prepare company data for client-side filtering
  const companyItems = [...segProjects]
    .sort((a, b) => (b.funding || 0) - (a.funding || 0))
    .map(p => ({
      slug: p.slug,
      name: p.name,
      tagline: p.tagline,
      logo: p.logo,
      funding: p.funding || 0,
      fundingFormatted: p.funding ? formatFunding(p.funding) : '',
      aiTypes: (p.ai_types || []) as string[],
    }));

  // FAQ content
  const topCompany = funded[0];
  const faqs = [
    {
      q: `What is AI ${segment.name.toLowerCase()}?`,
      a: `AI ${segment.name.toLowerCase()} refers to the use of artificial intelligence and machine learning technologies in the ${segment.name.toLowerCase()} sector. ${segment.description} The AIFI Map directory tracks ${segProjects.length} companies building AI-powered solutions in this space.`,
    },
    {
      q: `How many AI ${segment.name.toLowerCase()} companies are there?`,
      a: `The AIFI Map directory tracks ${segProjects.length} companies focused on AI-powered ${segment.name.toLowerCase()}. Together, these companies have raised ${formatFunding(totalFunding)} in funding.`,
    },
    {
      q: `What AI technologies are used in ${segment.name.toLowerCase()}?`,
      a: `The most common AI technologies in ${segment.name.toLowerCase()} include ${aiTypeCounts.slice(0, 4).map(t => `${t.label} (${t.count} companies)`).join(', ')}. Companies in this segment apply these technologies to ${segment.description.toLowerCase()}`,
    },
    ...(topCompany ? [{
      q: `What is the most funded AI ${segment.name.toLowerCase()} company?`,
      a: `${topCompany.name} is the most funded AI ${segment.name.toLowerCase()} company tracked by AIFI Map${topCompany.funding ? `, having raised ${formatFunding(topCompany.funding)}` : ''}. ${topCompany.tagline}`,
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
      { '@type': 'ListItem', position: 3, name: segment.name },
    ],
  };

  return (
    <>
    <JsonLd data={faqJsonLd} />
    <JsonLd data={breadcrumbJsonLd} />
    <div className="max-w-5xl mx-auto px-6 sm:px-8 py-8">
      <Breadcrumbs items={[
        { label: 'Directory', href: '/directory' },
        { label: segment.name },
      ]} />

      {/* Hero */}
      <div className="relative bg-surface border border-border rounded-2xl overflow-hidden mb-6">
        <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${segment.color}, ${segment.color}66, transparent)` }} />
        <div className="p-6 sm:p-8">
          <p className="label-refined mb-2" style={{ color: segment.color }}>Segment</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary mb-3">
            {segment.name}
          </h1>
          <p className="text-text-secondary text-[0.9375rem] leading-relaxed max-w-3xl mb-6">
            {segment.description}
          </p>
          <div className="flex flex-wrap gap-6 text-sm">
            <div><span className="text-text-faint">Companies</span> <span className="font-semibold text-text-primary ml-1">{segProjects.length}</span></div>
            <div><span className="text-text-faint">Total Funding</span> <span className="font-semibold text-text-primary ml-1">{formatFunding(totalFunding)}</span></div>
            <div><span className="text-text-faint">Avg. Founded</span> <span className="font-semibold text-text-primary ml-1">{avgFounded}</span></div>
            <div><span className="text-text-faint">AI Types</span> <span className="font-semibold text-text-primary ml-1">{aiTypeCounts.length}</span></div>
          </div>
        </div>
      </div>

      {/* Segment Switcher Bar */}
      <nav className="flex flex-wrap gap-2 mb-10" aria-label="Market segments">
        {segments.map(s => {
          const isActive = s.slug === segment.slug;
          return (
            <Link
              key={s.slug}
              href={`/segments/${s.slug}`}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                isActive
                  ? 'border-opacity-30 bg-opacity-15'
                  : 'border-transparent text-text-muted hover:text-text-primary hover:bg-surface-2/50'
              }`}
              style={isActive ? {
                backgroundColor: `${s.color}15`,
                color: s.color,
                borderColor: `${s.color}30`,
              } : undefined}
              aria-current={isActive ? 'page' : undefined}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: s.color }}
              />
              {s.name}
            </Link>
          );
        })}
      </nav>

      {/* AI Type Filter + Companies (client component) */}
      <SegmentFilteredContent
        companies={companyItems}
        aiTypeCounts={aiTypeCounts}
        segmentSlug={segment.slug}
        totalCount={segProjects.length}
      />

      {/* Editorial Content */}
      {segment.long_description && (
        <section className="mb-10">
          <div className="mb-5">
            <p className="label-refined text-accent mb-2">Overview</p>
            <div className="flex items-center gap-6">
              <h2 className="headline-sub whitespace-nowrap">About {segment.name}</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-border/50 to-transparent" />
            </div>
          </div>
          <div className="prose-custom space-y-4">
            {segment.long_description.split('\n\n').map((paragraph, i) => (
              <p key={i} className="text-sm text-text-secondary leading-relaxed">{paragraph}</p>
            ))}
          </div>
        </section>
      )}

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
