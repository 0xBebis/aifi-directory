import { Metadata } from 'next';
import Link from 'next/link';
import {
  getProjectsByAIType,
  formatFunding,
  AI_TYPE_LABELS,
  AI_TYPE_COLORS,
  AI_TYPE_DESCRIPTIONS,
  BUILD_DATE_ISO,
} from '@/lib/data';
import { AIType } from '@/types';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';

const aiTypes: AIType[] = ['llm', 'predictive-ml', 'computer-vision', 'graph-analytics', 'reinforcement-learning', 'agentic', 'data-platform', 'infrastructure'];

// Generate all meaningful comparison pairs (both types must have >=5 companies)
function getComparisonPairs() {
  const viable = aiTypes.filter(t => getProjectsByAIType(t).length >= 5);
  const pairs: Array<{ slugA: AIType; slugB: AIType; labelA: string; labelB: string; countA: number; countB: number }> = [];
  for (let i = 0; i < viable.length; i++) {
    for (let j = i + 1; j < viable.length; j++) {
      const a = viable[i];
      const b = viable[j];
      pairs.push({
        slugA: a,
        slugB: b,
        labelA: AI_TYPE_LABELS[a],
        labelB: AI_TYPE_LABELS[b],
        countA: getProjectsByAIType(a).length,
        countB: getProjectsByAIType(b).length,
      });
    }
  }
  // Sort by combined company count (most relevant comparisons first)
  return pairs.sort((a, b) => (b.countA + b.countB) - (a.countA + a.countB));
}

export const metadata: Metadata = {
  title: 'AI Technology Comparisons in Finance | AIFI Map',
  description: 'Compare AI technologies used in financial services: LLM vs Predictive ML, Agentic AI vs Data Platforms, and more. Side-by-side analysis with company data.',
  openGraph: {
    title: 'AI Technology Comparisons in Finance',
    description: 'Compare AI technologies used in financial services. Side-by-side analysis with company data.',
    type: 'website',
    siteName: 'AIFI Map',
    images: [{ url: '/og/content/compare.png', width: 1200, height: 630 }],
  },
};

export default function CompareIndexPage() {
  const pairs = getComparisonPairs();

  const webPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'AI Technology Comparisons in Finance',
    url: 'https://aifimap.com/compare',
    description: `Compare ${aiTypes.length} AI technologies used in financial services. ${pairs.length} side-by-side comparisons with company counts and funding data.`,
    dateModified: BUILD_DATE_ISO,
    isPartOf: { '@type': 'WebSite', name: 'AIFI Map', url: 'https://aifimap.com' },
    numberOfItems: pairs.length,
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'AIFI Map', item: 'https://aifimap.com' },
      { '@type': 'ListItem', position: 2, name: 'Compare', item: 'https://aifimap.com/compare' },
    ],
  };

  return (
    <>
    <JsonLd data={webPageJsonLd} />
    <JsonLd data={breadcrumbJsonLd} />
    <div className="max-w-5xl mx-auto px-6 sm:px-8 py-8">
      <Breadcrumbs items={[{ label: 'Compare' }]} />

      <header className="mb-10">
        <p className="label-refined mb-4 text-accent">Analysis</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary mb-4">
          AI Technology Comparisons
        </h1>
        <p className="text-text-secondary text-[0.9375rem] leading-relaxed max-w-3xl">
          Side-by-side comparisons of AI technologies used in financial services. Each comparison covers
          company counts, funding, market segment distribution, and key differentiators.
        </p>
      </header>

      {/* Featured comparisons */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-text-primary mb-4">All Comparisons</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {pairs.map(pair => (
            <Link
              key={`${pair.slugA}-vs-${pair.slugB}`}
              href={`/compare/${pair.slugA}-vs-${pair.slugB}`}
              className="group bg-surface border border-border rounded-xl p-4 hover:border-accent/30 transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full" style={{ background: AI_TYPE_COLORS[pair.slugA] }} />
                <span className="text-sm font-medium text-text-primary">{pair.labelA}</span>
                <span className="text-xs text-text-faint">vs</span>
                <span className="w-2 h-2 rounded-full" style={{ background: AI_TYPE_COLORS[pair.slugB] }} />
                <span className="text-sm font-medium text-text-primary">{pair.labelB}</span>
              </div>
              <p className="text-xs text-text-muted">
                {pair.countA} vs {pair.countB} companies
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-border/30 pt-8">
        <p className="text-sm text-text-secondary leading-relaxed">
          These comparisons are based on the{' '}
          <Link href="/directory" className="text-accent hover:text-accent-hover transition-colors">AIFI Map directory</Link>{' '}
          of financial AI companies. Each technology classification reflects the primary AI approach used by the company.
          Many companies use multiple technologies — see individual{' '}
          <Link href="/what-is-financial-ai" className="text-accent hover:text-accent-hover transition-colors">AI technology descriptions</Link>{' '}
          for details.
        </p>
      </section>
    </div>
    </>
  );
}
