import {
  projects,
  segments,
  layers,
  agents,
  getTotalFunding,
  getActiveAgents,
  getTotalAgentCapabilities,
} from '@/lib/data';
import LandingHero from '@/components/home/LandingHero';
import SiteNav from '@/components/home/SiteNav';

export default function Home() {
  const companyCount = projects.length;
  const segmentCount = segments.length;
  const layerCount = layers.length;
  const totalFunding = getTotalFunding();
  const agentCount = agents.length;
  const activeAgentCount = getActiveAgents().length;
  const totalCapabilities = getTotalAgentCapabilities();

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
    </main>
  );
}
