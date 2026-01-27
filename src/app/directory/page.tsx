import { Metadata } from 'next';
import {
  projects,
  segments,
  layers,
  getTotalFunding,
  getAITypeStats,
  BUILD_DATE,
} from '@/lib/data';
import DirectoryHero from '@/components/directory/DirectoryHero';
import AITypeShowcase from '@/components/directory/AITypeShowcase';
import DirectoryBrowser from '@/components/DirectoryBrowser';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'AI Finance Company Directory | AIFI',
  description: 'Browse the comprehensive directory of AI + Finance companies across 9 market segments, 5 technology layers, and 8 AI types. Interactive market map and full search.',
  openGraph: {
    title: 'AI Finance Company Directory',
    description: 'Browse the comprehensive directory of AI + Finance companies across 9 market segments, 5 technology layers, and 8 AI types.',
    type: 'website',
    siteName: 'AIFI',
    images: [{ url: '/og/default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Finance Company Directory',
    description: 'Browse the comprehensive directory of AI + Finance companies across 9 market segments, 5 technology layers, and 8 AI types.',
    images: ['/og/default.png'],
  },
};

export default function DirectoryPage() {
  const totalFunding = getTotalFunding();
  const aiTypeStats = getAITypeStats();

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'AI Finance Companies Directory',
    description: `Comprehensive directory of ${projects.length} companies building at the intersection of artificial intelligence and financial services.`,
    numberOfItems: projects.length,
    itemListElement: projects.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://aifimap.com/p/${p.slug}`,
      name: p.name,
    })),
  };

  return (
    <main className="min-h-screen">
      <JsonLd data={itemListJsonLd} />
      {/* Hero */}
      <DirectoryHero
        companyCount={projects.length}
        segmentCount={segments.length}
        layerCount={layers.length}
        totalFunding={totalFunding}
      />

      {/* AI Type Showcase */}
      <AITypeShowcase aiTypeStats={aiTypeStats} />

      {/* Browse Section */}
      <section id="browse" className="py-16 px-8 scroll-mt-8">
        <div className="max-w-7xl mx-auto">
          {/* Section divider */}
          <div className="border-t border-border/30 mb-12" />

          <div className="mb-8">
            <p className="label-refined text-accent mb-3">Explore</p>
            <h2 className="headline-section mb-3">
              Market Map
            </h2>
            <p className="text-text-muted text-[0.9375rem] leading-relaxed max-w-2xl">
              Interactive market matrix and full company directory.
              {projects.length > 0 && ` ${projects.length} companies across ${segments.length} segments and ${layers.length} layers.`}
            </p>
          </div>

          <DirectoryBrowser
            projects={projects}
            segments={segments}
            layers={layers}
          />

          {/* Freshness signal */}
          <p className="text-xs text-text-faint mt-8 text-right">
            Last updated: {BUILD_DATE}
          </p>
        </div>
      </section>
    </main>
  );
}
