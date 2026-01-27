import { Metadata } from 'next';
import {
  agents,
  getActiveAgents,
  getAgentProtocolStats,
  getTotalAgentCapabilities,
  PROTOCOL_DESCRIPTIONS,
  BUILD_DATE,
} from '@/lib/data';
import AgentHero from '@/components/agents/AgentHero';
import ProtocolShowcase from '@/components/agents/ProtocolShowcase';
import AgentFilters from '@/components/AgentFilters';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'AI Agent Registry — EIP-8004 | AIFI',
  description: 'Browse live financial AI agents registered on the EIP-8004 Trustless Agent Registry. Verified identities, declared capabilities, and open communication protocols.',
  openGraph: {
    title: 'AI Agent Registry — EIP-8004',
    description: 'Browse live financial AI agents registered on the EIP-8004 Trustless Agent Registry. Verified identities, declared capabilities, and open communication protocols.',
    type: 'website',
    siteName: 'AIFI',
    images: [{ url: '/og/default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Agent Registry — EIP-8004',
    description: 'Browse live financial AI agents registered on the EIP-8004 Trustless Agent Registry.',
    images: ['/og/default.png'],
  },
};

export default function AgentsPage() {
  const activeCount = getActiveAgents().length;
  const protocolStats = getAgentProtocolStats();
  const uniqueProtocols = new Set(agents.flatMap(a => a.protocols));
  const totalCapabilities = getTotalAgentCapabilities();

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Financial AI Agent Registry — EIP-8004',
    description: `Registry of ${agents.length} autonomous AI agents for financial services, verified on-chain via EIP-8004.`,
    numberOfItems: agents.length,
    itemListElement: agents.map((a, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://aifimap.com/agents/${a.chainId}-${a.agentId}`,
      name: a.name,
    })),
  };

  return (
    <main className="min-h-screen">
      <JsonLd data={itemListJsonLd} />
      {/* Hero */}
      <AgentHero
        agentCount={agents.length}
        activeCount={activeCount}
        protocolCount={uniqueProtocols.size}
        capabilityCount={totalCapabilities}
      />

      {/* Protocol Showcase */}
      <ProtocolShowcase
        protocolStats={protocolStats}
        protocolDescriptions={PROTOCOL_DESCRIPTIONS}
      />

      {/* Browse All Section */}
      <section id="browse" className="py-16 px-8 scroll-mt-8">
        <div className="max-w-7xl mx-auto">
          {/* Section divider */}
          <div className="border-t border-border/30 mb-12" />

          <div className="mb-8">
            <p className="label-refined text-accent mb-3">Browse</p>
            <h2 className="headline-section mb-3">
              All Agents
            </h2>
            <p className="text-text-muted text-[0.9375rem] leading-relaxed max-w-2xl">
              Search, filter, and sort across the full registry.
              {agents.length > 0 && ` ${agents.length} agent${agents.length !== 1 ? 's' : ''} registered.`}
            </p>
          </div>

          <AgentFilters agents={agents} />

          {/* Freshness signal */}
          <p className="text-xs text-text-faint mt-8 text-right">
            Last updated: {BUILD_DATE}
          </p>
        </div>
      </section>
    </main>
  );
}
