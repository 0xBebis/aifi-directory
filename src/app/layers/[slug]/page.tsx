import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import {
  layers,
  segments,
  getLayer,
  getProjectsByLayer,
  formatFunding,
} from '@/lib/data';
import CompanyLogo from '@/components/CompanyLogo';
import JsonLd from '@/components/JsonLd';

export function generateStaticParams() {
  return layers.map(l => ({ slug: l.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const layer = getLayer(params.slug);
  if (!layer) return { title: 'Layer Not Found | AIFI' };
  const layerProjects = getProjectsByLayer(layer.slug);
  const description = `${layerProjects.length} financial AI companies at the ${layer.name} layer. ${layer.description} Explore the companies building ${layer.name.toLowerCase()} for financial services.`;
  return {
    title: `${layer.name} Layer: Financial AI Companies | AIFI`,
    description: description.slice(0, 160),
    openGraph: {
      title: `${layer.name} Layer: Financial AI Companies`,
      description: description.slice(0, 160),
      type: 'website',
      siteName: 'AIFI',
      images: [{ url: '/og/default.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${layer.name} Layer: Financial AI Companies`,
      description: description.slice(0, 160),
      images: ['/og/default.png'],
    },
  };
}

export default function LayerPage({ params }: { params: { slug: string } }) {
  const layer = getLayer(params.slug);
  if (!layer) notFound();

  const layerProjects = getProjectsByLayer(layer.slug);
  const funded = layerProjects.filter(p => p.funding && p.funding > 0).sort((a, b) => (b.funding || 0) - (a.funding || 0));
  const totalFunding = layerProjects.reduce((sum, p) => sum + (p.funding || 0), 0);

  // Segment breakdown
  const segCounts: Array<{ slug: string; name: string; color: string; count: number }> = [];
  segments.forEach(s => {
    const count = layerProjects.filter(p => p.segment === s.slug || p.segments?.includes(s.slug)).length;
    if (count > 0) segCounts.push({ slug: s.slug, name: s.name, color: s.color, count });
  });
  segCounts.sort((a, b) => b.count - a.count);

  // Stack context
  const layerIndex = layers.findIndex(l => l.slug === layer.slug);
  const layerAbove = layerIndex > 0 ? layers[layerIndex - 1] : null;
  const layerBelow = layerIndex < layers.length - 1 ? layers[layerIndex + 1] : null;

  // Related layers
  const relatedLayers = layers.filter(l => l.slug !== layer.slug);

  // FAQ content
  const topCompany = funded[0];
  const faqs = [
    {
      q: `What is the ${layer.name} layer in financial AI?`,
      a: `${layer.description} The ${layer.name} layer sits at position ${layer.position} in the financial AI technology stack${layerAbove ? `, below ${layerAbove.name}` : ''}${layerBelow ? ` and above ${layerBelow.name}` : ''}. ${layerProjects.length} companies in the AIFI directory operate at this layer.`,
    },
    {
      q: `Which companies operate at the ${layer.name} layer?`,
      a: `${layerProjects.length} companies operate at the ${layer.name} layer. ${funded.slice(0, 3).map(p => `${p.name} (${p.tagline})`).join('. ')}${funded.length > 3 ? `. And ${funded.length - 3} more.` : '.'}`,
    },
    {
      q: `How does ${layer.name} fit in the financial AI stack?`,
      a: `The financial AI stack has 5 layers: ${layers.map(l => l.name).join(', ')} (top to bottom). ${layer.name} is at position ${layer.position}${layerAbove ? `. Above it, ${layerAbove.name}: ${layerAbove.description}` : ''}${layerBelow ? `. Below it, ${layerBelow.name}: ${layerBelow.description}` : ''}.`,
    },
    ...(topCompany ? [{
      q: `What is the most funded ${layer.name} company?`,
      a: `${topCompany.name} is the most funded company at the ${layer.name} layer${topCompany.funding ? `, with ${formatFunding(topCompany.funding)} raised` : ''}. ${topCompany.tagline}`,
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
      { '@type': 'ListItem', position: 3, name: `${layer.name} Layer` },
    ],
  };

  return (
    <>
    <JsonLd data={faqJsonLd} />
    <JsonLd data={breadcrumbJsonLd} />
    <div className="max-w-5xl mx-auto px-6 sm:px-8 py-8">
      <Breadcrumbs items={[
        { label: 'Directory', href: '/directory' },
        { label: layer.name },
      ]} />

      {/* Hero */}
      <div className="relative bg-surface border border-border rounded-2xl overflow-hidden mb-8">
        <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${layer.color}, ${layer.color}66, transparent)` }} />
        <div className="p-6 sm:p-8">
          <p className="label-refined mb-2" style={{ color: layer.color }}>Tech Layer · Position {layer.position}</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary mb-3">
            {layer.name} Layer
          </h1>
          <p className="text-text-secondary text-[0.9375rem] leading-relaxed max-w-3xl mb-6">
            {layer.description}
          </p>
          <div className="flex flex-wrap gap-6 text-sm">
            <div><span className="text-text-faint">Companies</span> <span className="font-semibold text-text-primary ml-1">{layerProjects.length}</span></div>
            <div><span className="text-text-faint">Total Funding</span> <span className="font-semibold text-text-primary ml-1">{formatFunding(totalFunding)}</span></div>
            <div><span className="text-text-faint">Segments</span> <span className="font-semibold text-text-primary ml-1">{segCounts.length}</span></div>
          </div>
        </div>
      </div>

      {/* Stack Context */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Technology Stack</h2>
        <div className="space-y-1">
          {layers.map(l => (
            <Link
              key={l.slug}
              href={`/layers/${l.slug}`}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border transition-colors text-sm ${
                l.slug === layer.slug
                  ? 'bg-surface-2 border-accent/30 text-text-primary font-medium'
                  : 'bg-surface border-border/50 text-text-muted hover:border-border hover:text-text-secondary'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: l.color }} />
              <span>{l.name}</span>
              <span className="ml-auto text-text-faint text-xs">Position {l.position}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Segment Breakdown */}
      {segCounts.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Segments at This Layer</h2>
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
            href={`/directory?layer=${layer.slug}`}
            className="text-sm text-text-muted hover:text-accent transition-colors inline-flex items-center gap-1"
          >
            View in directory <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(funded.length > 0 ? funded : layerProjects).slice(0, 18).map(p => (
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
        {layerProjects.length > 18 && (
          <div className="mt-4 text-center">
            <Link href={`/directory?layer=${layer.slug}`} className="text-sm text-accent hover:text-accent-hover transition-colors">
              View all {layerProjects.length} companies →
            </Link>
          </div>
        )}
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
