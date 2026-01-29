import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  segments,
  getSegment,
  getProjectsBySegmentAndAIType,
  getCrossDimensionalPages,
  formatFunding,
  AI_TYPE_LABELS,
  AI_TYPE_COLORS,
  AI_TYPE_DESCRIPTIONS,
  generateCrossDimensionalFAQs,
} from '@/lib/data';
import { AIType } from '@/types';
import CompanyLogo from '@/components/CompanyLogo';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';

const aiTypes: AIType[] = ['llm', 'predictive-ml', 'computer-vision', 'graph-analytics', 'reinforcement-learning', 'agentic', 'data-platform', 'infrastructure'];

export function generateStaticParams() {
  const crossPages = getCrossDimensionalPages();
  return crossPages.map(p => ({
    slug: p.segmentSlug,
    aiType: p.aiType,
  }));
}

export function generateMetadata({ params }: { params: { slug: string; aiType: string } }): Metadata {
  const segment = getSegment(params.slug);
  const aiType = params.aiType as AIType;
  const label = AI_TYPE_LABELS[aiType];
  if (!segment || !label) return { title: 'Not Found | AIFI Map' };

  const matching = getProjectsBySegmentAndAIType(params.slug, aiType);
  const description = `${matching.length} companies using ${label} in ${segment.name.toLowerCase()}. Explore AI-powered ${segment.name.toLowerCase()} companies that leverage ${label} technology.`;

  return {
    title: `${label} in ${segment.name} — AI Companies | AIFI Map`,
    description: description.slice(0, 160),
    openGraph: {
      title: `${label} in ${segment.name} — AI Companies`,
      description: description.slice(0, 160),
      type: 'website',
      siteName: 'AIFI Map',
      images: [{ url: '/og/default.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${label} in ${segment.name} — AI Companies`,
      description: description.slice(0, 160),
      images: ['/og/default.png'],
    },
  };
}

export default function CrossDimensionalPage({ params }: { params: { slug: string; aiType: string } }) {
  const segment = getSegment(params.slug);
  const aiType = params.aiType as AIType;
  const label = AI_TYPE_LABELS[aiType];
  const aiColor = AI_TYPE_COLORS[aiType];
  const aiDescription = AI_TYPE_DESCRIPTIONS[aiType];

  if (!segment || !label) notFound();

  const matching = getProjectsBySegmentAndAIType(params.slug, aiType);
  if (matching.length < 3) notFound();

  const funded = matching
    .filter(p => p.funding && p.funding > 0)
    .sort((a, b) => (b.funding || 0) - (a.funding || 0));
  const totalFunding = matching.reduce((sum, p) => sum + (p.funding || 0), 0);

  // Related cross-dimensional pages (same segment, different AI type)
  const relatedSameSegment = getCrossDimensionalPages()
    .filter(p => p.segmentSlug === segment.slug && p.aiType !== aiType)
    .slice(0, 4);

  // Related cross-dimensional pages (same AI type, different segment)
  const relatedSameAIType = getCrossDimensionalPages()
    .filter(p => p.aiType === aiType && p.segmentSlug !== segment.slug)
    .slice(0, 4);

  // FAQ (centralized)
  const faqs = generateCrossDimensionalFAQs(segment.slug, aiType);

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
      { '@type': 'ListItem', position: 2, name: segment.name, item: `https://aifimap.com/segments/${segment.slug}` },
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
        { label: segment.name, href: `/segments/${segment.slug}` },
        { label: label },
      ]} />

      {/* Hero */}
      <div className="relative bg-surface border border-border rounded-2xl overflow-hidden mb-6">
        <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${segment.color}, ${aiColor}, transparent)` }} />
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="label-refined" style={{ color: segment.color }}>{segment.name}</span>
            <span className="text-text-faint text-xs">&times;</span>
            <span className="label-refined" style={{ color: aiColor }}>{label}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary mb-3">
            {label} in {segment.name}
          </h1>
          <p className="text-text-secondary text-[0.9375rem] leading-relaxed max-w-3xl mb-6">
            {matching.length} companies using {label.toLowerCase()} technology in the {segment.name.toLowerCase()} sector. {aiDescription}
          </p>
          <div className="flex flex-wrap gap-6 text-sm">
            <div><span className="text-text-faint">Companies</span> <span className="font-semibold text-text-primary ml-1">{matching.length}</span></div>
            <div><span className="text-text-faint">Total Funding</span> <span className="font-semibold text-text-primary ml-1">{formatFunding(totalFunding)}</span></div>
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

      {/* Companies */}
      <section className="mb-10">
        <div className="mb-5">
          <p className="label-refined text-accent mb-2">Directory</p>
          <div className="flex items-center gap-6">
            <h2 className="headline-sub whitespace-nowrap">
              {funded.length > 0 ? 'Companies by Funding' : 'All Companies'}
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-border/50 to-transparent" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(funded.length > 0 ? funded : matching).map(p => (
            <Link
              key={p.slug}
              href={`/p/${p.slug}`}
              className="group bg-surface border border-border/40 rounded-xl p-4 card-hover-glow transition-all"
            >
              <div className="flex items-start gap-3">
                <CompanyLogo project={p} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-text-primary group-hover:text-accent transition-colors truncate">{p.name}</p>
                  <p className="text-xs text-text-muted mt-0.5 line-clamp-2 leading-relaxed">{p.tagline}</p>
                </div>
              </div>
              {p.funding && p.funding > 0 && (
                <div className="mt-3 text-xs font-medium text-text-faint tabular-nums">{formatFunding(p.funding)} raised</div>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Related: Same Segment */}
      {relatedSameSegment.length > 0 && (
        <section className="mb-10">
          <div className="mb-5">
            <p className="label-refined text-accent mb-2">Related</p>
            <div className="flex items-center gap-6">
              <h2 className="headline-sub whitespace-nowrap">Other AI Technologies in {segment.name}</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-border/50 to-transparent" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {relatedSameSegment.map(r => (
              <Link
                key={r.aiType}
                href={`/segments/${segment.slug}/ai-types/${r.aiType}`}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface border border-border/40 card-hover-glow transition-all text-sm"
              >
                <span className="w-2 h-2 rounded-full" style={{ background: r.aiTypeColor }} />
                <span className="text-text-secondary font-medium">{r.aiTypeLabel}</span>
                <span className="text-text-faint font-medium tabular-nums">{r.count}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Related: Same AI Type */}
      {relatedSameAIType.length > 0 && (
        <section className="mb-10">
          <div className="mb-5">
            <p className="label-refined text-accent mb-2">Related</p>
            <div className="flex items-center gap-6">
              <h2 className="headline-sub whitespace-nowrap">{label} in Other Segments</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-border/50 to-transparent" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {relatedSameAIType.map(r => (
              <Link
                key={r.segmentSlug}
                href={`/segments/${r.segmentSlug}/ai-types/${aiType}`}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface border border-border/40 card-hover-glow transition-all text-sm"
              >
                <span className="w-2 h-2 rounded-full" style={{ background: r.segmentColor }} />
                <span className="text-text-secondary font-medium">{r.segmentName}</span>
                <span className="text-text-faint font-medium tabular-nums">{r.count}</span>
              </Link>
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
