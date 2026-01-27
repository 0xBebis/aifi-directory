import { Metadata } from 'next';
import {
  projects,
  segments,
  layers,
  agents,
  getTotalFunding,
  getActiveAgents,
  getTotalAgentCapabilities,
  getTopCompanies,
  getSegmentStats,
  getLayerCounts,
  getSegment,
  getLayer,
} from '@/lib/data';
import LandingHero from '@/components/home/LandingHero';
import SiteNav from '@/components/home/SiteNav';
import SegmentShowcase from '@/components/home/SegmentShowcase';
import FeaturedCompanies from '@/components/home/FeaturedCompanies';
import TechStack from '@/components/home/TechStack';
import CallToAction from '@/components/home/CallToAction';

export const metadata: Metadata = {
  title: 'AIFI — The Financial AI Landscape',
  description: `A curated directory of ${projects.length} companies and autonomous AI agents building the future of finance with artificial intelligence.`,
  openGraph: {
    title: 'AIFI — The Financial AI Landscape',
    description: `A curated directory of ${projects.length} companies and AI agents building the future of finance with artificial intelligence.`,
    type: 'website',
    siteName: 'AIFI',
    images: [{ url: '/og/default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AIFI — The Financial AI Landscape',
    description: `A curated directory of ${projects.length} companies and AI agents building the future of finance with artificial intelligence.`,
    images: ['/og/default.png'],
  },
};

export default function Home() {
  const companyCount = projects.length;
  const segmentCount = segments.length;
  const layerCount = layers.length;
  const totalFunding = getTotalFunding();
  const agentCount = agents.length;
  const activeAgentCount = getActiveAgents().length;
  const totalCapabilities = getTotalAgentCapabilities();
  const topCompanies = getTopCompanies(9);
  const segmentStats = getSegmentStats();
  const layerCounts = getLayerCounts();

  return (
    <main className="min-h-screen">
      <LandingHero />
      <SiteNav
        companyCount={companyCount}
        segmentCount={segmentCount}
        layerCount={layerCount}
        totalFunding={totalFunding}
        agentCount={agentCount}
        activeAgentCount={activeAgentCount}
        totalCapabilities={totalCapabilities}
      />
      <SegmentShowcase segmentStats={segmentStats} />
      <FeaturedCompanies
        companies={topCompanies}
        getSegment={getSegment}
        getLayer={getLayer}
      />
      <TechStack layers={layers} layerCounts={layerCounts} />
      <CallToAction />
    </main>
  );
}
