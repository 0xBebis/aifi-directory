import { Suspense } from 'react';
import { Metadata } from 'next';
import {
  projects,
  segments,
  layers,
  getTotalFunding,
  formatFunding,
  BUILD_DATE,
} from '@/lib/data';
import DirectoryBrowser from '@/components/DirectoryBrowser';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';

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

      {/* Page header */}
      <div className="relative overflow-hidden border-b border-border">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-surface/50 via-background to-background" />
        {/* Accent glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px]">
          <div className="absolute inset-0 bg-gradient-to-b from-accent/15 via-accent/5 to-transparent blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 pt-6 pb-8">
        <Breadcrumbs items={[{ label: 'Directory' }]} />

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
              AI Finance Directory
            </h1>
            <p className="text-text-muted text-[0.9375rem] leading-relaxed mt-2 max-w-xl">
              Interactive market map and full company directory.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-muted flex-shrink-0">
            <span>
              <span className="font-semibold text-text-primary tabular-nums">{projects.length}</span> companies
            </span>
            <span className="text-border">&middot;</span>
            <span>
              <span className="font-semibold text-text-primary tabular-nums">{segments.length}</span> segments
            </span>
            <span className="text-border">&middot;</span>
            <span>
              <span className="font-semibold text-text-primary tabular-nums">{layers.length}</span> layers
            </span>
            <span className="text-border">&middot;</span>
            <span>
              <span className="font-semibold text-accent tabular-nums">{formatFunding(totalFunding)}</span> raised
            </span>
            <span className="text-border">&middot;</span>
            <span className="text-text-faint text-xs">Updated {BUILD_DATE}</span>
          </div>
        </div>
        </div>
      </div>

      {/* Directory browser */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
        <Suspense fallback={null}>
          <DirectoryBrowser
            projects={projects}
            segments={segments}
            layers={layers}
          />
        </Suspense>
      </div>
    </main>
  );
}
