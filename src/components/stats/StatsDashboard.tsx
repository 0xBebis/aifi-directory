'use client';

import { StatsDashboardData } from './types';
import HeroStats from './HeroStats';
import MarketBreakdown from './MarketBreakdown';
import FundingLandscape from './FundingLandscape';
import GeographicDistribution from './GeographicDistribution';
import FoundedTimeline from './FoundedTimeline';
import FAQAccordion from './FAQAccordion';

interface Props {
  data: StatsDashboardData;
}

export default function StatsDashboard({ data }: Props) {
  return (
    <div className="space-y-20">
      {/* Tier 1: The Story */}
      <HeroStats stats={data.heroStats} insights={data.insightCards} />

      {/* Tier 2: Market Breakdown */}
      <section>
        <SectionHeader title="Market Breakdown" subtitle="What the market looks like" />
        <MarketBreakdown
          segments={data.segmentBreakdown}
          layers={data.layerBreakdown}
          aiTypes={data.aiTypeBreakdown}
        />
      </section>

      {/* Tier 2: Capital & Leaders */}
      <section>
        <SectionHeader title="Capital & Leaders" subtitle="Where the money goes" />
        <FundingLandscape
          topFunded={data.topFunded}
          stageChips={data.fundingStageChips}
        />
      </section>

      {/* Tier 2: Geography & Profile */}
      <section>
        <SectionHeader title="Geography & Profile" subtitle="Who builds this" />
        <GeographicDistribution
          countries={data.countryDistribution}
          regions={data.regionSummary}
          companyTypes={data.companyTypes}
          activeCount={data.activeCount}
          defunctCount={data.defunctCount}
        />
      </section>

      {/* Tier 3: Timeline & Patterns */}
      <section>
        <SectionHeader title="Timeline & Patterns" subtitle="How we got here" />
        <FoundedTimeline
          years={data.fundingByYear}
          pairings={data.topPairings}
        />
      </section>

      {/* FAQ */}
      <section className="bg-surface/50 border border-border/30 rounded-xl p-8">
        <div className="flex items-center gap-6 mb-6">
          <h2 className="headline-sub whitespace-nowrap">Frequently Asked Questions</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-border/50 to-transparent" />
        </div>
        <FAQAccordion faqs={data.faqs} />
      </section>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-8">
      <p className="label-refined text-accent mb-2">{subtitle}</p>
      <div className="flex items-center gap-6">
        <h2 className="headline-sub whitespace-nowrap">{title}</h2>
        <div className="flex-1 h-px bg-gradient-to-r from-border/50 to-transparent" />
      </div>
    </div>
  );
}
