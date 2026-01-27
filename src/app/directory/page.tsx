import { Metadata } from 'next';
import {
  projects,
  segments,
  layers,
  getTotalFunding,
  getAITypeStats,
} from '@/lib/data';
import DirectoryHero from '@/components/directory/DirectoryHero';
import AITypeShowcase from '@/components/directory/AITypeShowcase';
import DirectoryBrowser from '@/components/DirectoryBrowser';

export const metadata: Metadata = {
  title: 'Directory | AIFI',
  description: 'Browse the comprehensive directory of AI + Finance companies across segments, layers, and AI types.',
};

export default function DirectoryPage() {
  const totalFunding = getTotalFunding();
  const aiTypeStats = getAITypeStats();

  return (
    <main className="min-h-screen">
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
        </div>
      </section>
    </main>
  );
}
