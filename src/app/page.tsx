import {
  projects,
  segments,
  layers,
  getTotalFunding,
  getTopCompanies,
  getSegmentStats,
  getLayerCounts,
  getSegment,
  getLayer,
} from '@/lib/data';
import Hero from '@/components/home/Hero';
import SegmentShowcase from '@/components/home/SegmentShowcase';
import FeaturedCompanies from '@/components/home/FeaturedCompanies';
import TechStack from '@/components/home/TechStack';
import CallToAction from '@/components/home/CallToAction';

export default function Home() {
  const companyCount = projects.length;
  const segmentCount = segments.length;
  const layerCount = layers.length;
  const totalFunding = getTotalFunding();
  const topCompanies = getTopCompanies(9);
  const segmentStats = getSegmentStats();
  const layerCounts = getLayerCounts();

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <Hero
        companyCount={companyCount}
        segmentCount={segmentCount}
        layerCount={layerCount}
        totalFunding={totalFunding}
      />

      {/* Segment Showcase */}
      <SegmentShowcase segmentStats={segmentStats} />

      {/* Featured Companies */}
      <FeaturedCompanies
        companies={topCompanies}
        getSegment={getSegment}
        getLayer={getLayer}
      />

      {/* Tech Stack */}
      <TechStack layers={layers} layerCounts={layerCounts} />

      {/* Final CTA */}
      <CallToAction />
    </main>
  );
}
