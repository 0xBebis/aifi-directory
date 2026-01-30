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
  getRecentlyFunded,
  formatFunding,
  BUILD_DATE,
  BUILD_DATE_ISO,
} from '@/lib/data';
import JsonLd from '@/components/JsonLd';
import LandingHero from '@/components/home/LandingHero';
import SiteNav from '@/components/home/SiteNav';
import RecentActivity from '@/components/home/RecentActivity';
import SegmentShowcase from '@/components/home/SegmentShowcase';
import FeaturedCompanies from '@/components/home/FeaturedCompanies';
import TechStack from '@/components/home/TechStack';
import CallToAction from '@/components/home/CallToAction';

export const metadata: Metadata = {
  title: 'AIFI Map — The Financial AI Landscape',
  description: `A curated directory of ${projects.length} companies and autonomous AI agents building the future of finance with artificial intelligence.`,
  openGraph: {
    title: 'AIFI Map — The Financial AI Landscape',
    description: `A curated directory of ${projects.length} companies and AI agents building the future of finance with artificial intelligence.`,
    type: 'website',
    siteName: 'AIFI Map',
    images: [{ url: '/og/default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AIFI Map — The Financial AI Landscape',
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

  const recentlyFunded = getRecentlyFunded(4);
  const recentCompanies = recentlyFunded.map(p => ({
    name: p.name,
    slug: p.slug,
    fundingDisplay: p.funding ? formatFunding(p.funding) : '',
  }));
  const recentActivityCompanies = recentlyFunded.map(p => ({
    name: p.name,
    slug: p.slug,
    logo: p.logo,
    fundingDisplay: p.funding ? formatFunding(p.funding) : '',
    fundingDate: p.last_funding_date || '',
  }));

  const webPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'AIFI Map — The Financial AI Landscape',
    description: `A curated directory of ${companyCount} companies and autonomous AI agents building the future of finance with artificial intelligence.`,
    url: 'https://aifimap.com',
    isPartOf: { '@type': 'WebSite', name: 'AIFI Map', url: 'https://aifimap.com' },
    dateModified: BUILD_DATE_ISO,
    about: {
      '@type': 'Thing',
      name: 'Financial Artificial Intelligence',
      description: `The intersection of AI and financial services, spanning ${segments.length} market segments and ${layers.length} technology layers.`,
    },
    mainEntity: {
      '@type': 'ItemList',
      name: 'Top Financial AI Companies by Funding',
      numberOfItems: topCompanies.length,
      itemListElement: topCompanies.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: p.name,
        url: `https://aifimap.com/p/${p.slug}`,
      })),
    },
  };

  return (
    <>
    <JsonLd data={webPageJsonLd} />
    <main className="min-h-screen">
      <LandingHero companyCount={companyCount} recentCompanies={recentCompanies} />
      <SiteNav
        companyCount={companyCount}
        segmentCount={segmentCount}
        layerCount={layerCount}
        totalFunding={totalFunding}
        agentCount={agentCount}
        activeAgentCount={activeAgentCount}
        totalCapabilities={totalCapabilities}
      />
      <RecentActivity companies={recentActivityCompanies} buildDate={BUILD_DATE} />
      <SegmentShowcase segmentStats={segmentStats} />
      <FeaturedCompanies
        companies={topCompanies}
        getSegment={getSegment}
        getLayer={getLayer}
        totalCount={companyCount}
      />
      <TechStack layers={layers} layerCounts={layerCounts} />
      <CallToAction />
    </main>
    </>
  );
}
