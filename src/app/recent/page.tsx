import { Metadata } from 'next';
import Link from 'next/link';
import {
  getRecentlyFunded,
  getTopCompanies,
  getSegment,
  getLayer,
  formatFunding,
  AI_TYPE_LABELS,
  AI_TYPE_COLORS,
  FUNDING_STAGE_LABELS,
} from '@/lib/data';
import { FundingStage } from '@/types';
import CompanyLogo from '@/components/CompanyLogo';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Recently Funded AI Finance Companies | AIFI',
  description: 'The latest AI finance funding rounds. See which companies building AI for financial services have recently raised capital, sorted by most recent funding date.',
  openGraph: {
    title: 'Recently Funded AI Finance Companies',
    description: 'The latest AI finance funding rounds. See which companies building AI for financial services have recently raised capital.',
    type: 'website',
    siteName: 'AIFI',
    images: [{ url: '/og/default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Recently Funded AI Finance Companies',
    description: 'The latest AI finance funding rounds.',
    images: ['/og/default.png'],
  },
};

export default function RecentPage() {
  const recentlyFunded = getRecentlyFunded(50);
  const topFunded = getTopCompanies(5);
  const totalRecent = recentlyFunded.reduce((sum, p) => sum + (p.funding || 0), 0);

  const faqs = [
    {
      q: 'Which AI finance companies were recently funded?',
      a: `The AIFI directory tracks ${recentlyFunded.length} companies with known funding dates. Recent rounds include ${recentlyFunded.slice(0, 3).map(p => `${p.name} (${p.last_funding_date}${p.funding ? `, ${formatFunding(p.funding)}` : ''})`).join(', ')}.`,
    },
    {
      q: 'How much has been invested in AI finance companies?',
      a: `Companies tracked in the AIFI directory with recent funding dates have raised a combined ${formatFunding(totalRecent)}. The most funded companies overall include ${topFunded.slice(0, 3).map(p => `${p.name} (${formatFunding(p.funding || 0)})`).join(', ')}.`,
    },
    {
      q: 'What are the latest AI fintech funding rounds?',
      a: `Recent funding activity in AI-powered financial services includes rounds from ${recentlyFunded.slice(0, 5).map(p => p.name).join(', ')}. Browse the full list of recently funded companies to see the latest rounds.`,
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

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'AIFI', item: 'https://aifimap.com' },
      { '@type': 'ListItem', position: 2, name: 'Directory', item: 'https://aifimap.com/directory' },
      { '@type': 'ListItem', position: 3, name: 'Recently Funded' },
    ],
  };

  return (
    <>
    <JsonLd data={faqJsonLd} />
    <JsonLd data={breadcrumbJsonLd} />
    <div className="max-w-5xl mx-auto px-6 sm:px-8 py-8">
      <Breadcrumbs items={[
        { label: 'Recently Funded' },
      ]} />
      <p className="label-refined mb-2 text-accent">Funding Activity</p>
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary mb-3">
        Recently Funded Companies
      </h1>
      <p className="text-text-secondary text-[0.9375rem] leading-relaxed max-w-3xl mb-6">
        AI-powered finance companies with the most recent funding activity. {recentlyFunded.length} companies
        with known funding dates, representing {formatFunding(totalRecent)} in total capital raised.
      </p>

      {/* Key Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden mb-10">
        {[
          { label: 'Companies', value: String(recentlyFunded.length) },
          { label: 'Total Raised', value: formatFunding(totalRecent) },
          { label: 'Most Recent', value: recentlyFunded[0]?.last_funding_date || 'N/A' },
        ].map((stat, i) => (
          <div key={i} className="bg-surface px-4 py-4 flex flex-col gap-1">
            <span className="text-2xs uppercase tracking-wider text-text-faint">{stat.label}</span>
            <span className="text-lg font-bold text-text-primary tabular-nums">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Recently Funded List */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Companies by Last Funding Date</h2>
        <div className="space-y-1">
          {recentlyFunded.map((p, i) => {
            const seg = getSegment(p.segment);
            return (
              <Link
                key={p.slug}
                href={`/p/${p.slug}`}
                className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-surface-2 transition-colors group"
              >
                <span className="text-xs text-text-faint w-6 text-right tabular-nums shrink-0">{i + 1}</span>
                <CompanyLogo project={p} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm text-text-primary group-hover:text-accent transition-colors truncate">
                    {p.name}
                  </p>
                  <p className="text-xs text-text-muted truncate">{p.tagline}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {p.funding_stage && (
                    <span className="text-xs text-text-faint hidden sm:block">
                      {FUNDING_STAGE_LABELS[p.funding_stage as FundingStage]}
                    </span>
                  )}
                  {p.funding && p.funding > 0 && (
                    <span className="text-sm text-text-muted tabular-nums font-medium w-20 text-right">
                      {formatFunding(p.funding)}
                    </span>
                  )}
                  <span className="text-xs text-text-faint tabular-nums w-20 text-right">
                    {p.last_funding_date}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Top Funded of All Time */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Top Funded Overall</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topFunded.map(p => {
            const seg = getSegment(p.segment);
            return (
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
                <div className="flex items-center justify-between mt-3">
                  {seg && (
                    <span className="inline-flex items-center gap-1 text-2xs text-text-faint">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: seg.color }} />
                      {seg.name}
                    </span>
                  )}
                  {p.funding && p.funding > 0 && (
                    <span className="text-xs text-text-faint tabular-nums">{formatFunding(p.funding)} raised</span>
                  )}
                </div>
              </Link>
            );
          })}
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
