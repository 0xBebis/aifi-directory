import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import {
  getProjectsByRegion,
  getCountryDistribution,
  getCountryFlag,
  formatFunding,
  REGION_LABELS,
} from '@/lib/data';
import { Region } from '@/types';
import CompanyLogo from '@/components/CompanyLogo';
import JsonLd from '@/components/JsonLd';

const regionSlugs: Region[] = ['americas', 'emea', 'apac'];

const REGION_DESCRIPTIONS: Record<Region, string> = {
  americas: 'The Americas region encompasses North America, Central America, and South America. The United States leads in financial AI innovation with major hubs in San Francisco, New York, and Boston.',
  emea: 'Europe, the Middle East, and Africa (EMEA) is home to a thriving financial AI ecosystem. London, Berlin, and Tel Aviv are leading hubs for fintech innovation.',
  apac: 'The Asia-Pacific region is rapidly growing its financial AI sector. Singapore, Tokyo, and Sydney are key centers for AI-powered financial services.',
};

export function generateStaticParams() {
  return regionSlugs.map(r => ({ slug: r }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const region = params.slug as Region;
  const label = REGION_LABELS[region];
  if (!label) return { title: 'Region Not Found | AIFI' };
  const regionProjects = getProjectsByRegion(region);
  const description = `${regionProjects.length} financial AI companies in ${label}. ${REGION_DESCRIPTIONS[region].slice(0, 80)} Explore companies building AI for finance in this region.`;
  return {
    title: `Financial AI Companies in ${label} | AIFI`,
    description: description.slice(0, 160),
    openGraph: {
      title: `Financial AI Companies in ${label}`,
      description: description.slice(0, 160),
      type: 'website',
      siteName: 'AIFI',
      images: [{ url: '/og/default.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Financial AI Companies in ${label}`,
      description: description.slice(0, 160),
      images: ['/og/default.png'],
    },
  };
}

export default function RegionPage({ params }: { params: { slug: string } }) {
  const region = params.slug as Region;
  const label = REGION_LABELS[region];
  if (!label) notFound();

  const regionProjects = getProjectsByRegion(region);
  const funded = regionProjects.filter(p => p.funding && p.funding > 0).sort((a, b) => (b.funding || 0) - (a.funding || 0));
  const totalFunding = regionProjects.reduce((sum, p) => sum + (p.funding || 0), 0);
  const countries = getCountryDistribution(regionProjects);

  // Other regions
  const otherRegions = regionSlugs.filter(r => r !== region);

  // FAQ content
  const topCompany = funded[0];
  const faqs = [
    {
      q: `Which ${label} companies are building financial AI?`,
      a: `The AIFI directory tracks ${regionProjects.length} financial AI companies in ${label}. ${funded.slice(0, 3).map(p => `${p.name} (${p.tagline})`).join('. ')}${funded.length > 3 ? `. And ${funded.length - 3} more.` : '.'}`,
    },
    {
      q: `How many financial AI companies are in ${label}?`,
      a: `${regionProjects.length} companies in the AIFI directory are based in ${label}, with a combined ${formatFunding(totalFunding)} in funding. ${countries.length > 0 ? `The top countries are ${countries.slice(0, 3).map(c => `${c.name} (${c.count})`).join(', ')}.` : ''}`,
    },
    ...(topCompany ? [{
      q: `What is the most funded financial AI company in ${label}?`,
      a: `${topCompany.name} is the most funded financial AI company in ${label} tracked by AIFI${topCompany.funding ? `, with ${formatFunding(topCompany.funding)} raised` : ''}. ${topCompany.tagline}`,
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
        <div className="h-1.5" style={{ background: 'linear-gradient(90deg, #3b82f6, #3b82f666, transparent)' }} />
        <div className="p-6 sm:p-8">
          <p className="label-refined mb-2 text-accent">Region</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary mb-3">
            Financial AI Companies in {label}
          </h1>
          <p className="text-text-secondary text-[0.9375rem] leading-relaxed max-w-3xl mb-6">
            {REGION_DESCRIPTIONS[region]}
          </p>
          <div className="flex flex-wrap gap-6 text-sm">
            <div><span className="text-text-faint">Companies</span> <span className="font-semibold text-text-primary ml-1">{regionProjects.length}</span></div>
            <div><span className="text-text-faint">Total Funding</span> <span className="font-semibold text-text-primary ml-1">{formatFunding(totalFunding)}</span></div>
            <div><span className="text-text-faint">Countries</span> <span className="font-semibold text-text-primary ml-1">{countries.length}</span></div>
          </div>
        </div>
      </div>

      {/* Country Breakdown */}
      {countries.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Countries</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {countries.map(c => (
              <div key={c.country} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-border text-sm">
                <span>{getCountryFlag(c.country)}</span>
                <span className="text-text-secondary truncate">{c.name}</span>
                <span className="ml-auto text-text-faint tabular-nums">{c.count}</span>
              </div>
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
            href="/directory"
            className="text-sm text-text-muted hover:text-accent transition-colors inline-flex items-center gap-1"
          >
            View in directory <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(funded.length > 0 ? funded : regionProjects).slice(0, 18).map(p => (
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
        {regionProjects.length > 18 && (
          <div className="mt-4 text-center">
            <Link href="/directory" className="text-sm text-accent hover:text-accent-hover transition-colors">
              View all {regionProjects.length} {label} companies →
            </Link>
          </div>
        )}
      </section>

      {/* Other Regions */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Other Regions</h2>
        <div className="flex flex-wrap gap-2">
          {otherRegions.map(r => (
            <Link
              key={r}
              href={`/regions/${r}`}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border hover:border-accent/30 transition-colors text-sm text-text-secondary"
            >
              {REGION_LABELS[r]}
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
