import { Metadata } from 'next';
import {
  agents,
  getActiveAgents,
  getAgentProtocolStats,
  getTotalAgentCapabilities,
  PROTOCOL_DESCRIPTIONS,
} from '@/lib/data';
import AgentHero from '@/components/agents/AgentHero';
import ProtocolShowcase from '@/components/agents/ProtocolShowcase';
import FeaturedAgent from '@/components/agents/FeaturedAgent';
import AgentFilters from '@/components/AgentFilters';

export const metadata: Metadata = {
  title: 'AI Agents | AIFI',
  description: 'Browse live financial AI agents registered on the EIP-8004 Trustless Agent Registry.',
};

export default function AgentsPage() {
  const activeCount = getActiveAgents().length;
  const protocolStats = getAgentProtocolStats();
  const uniqueProtocols = new Set(agents.flatMap(a => a.protocols));
  const totalCapabilities = getTotalAgentCapabilities();

  // Sort agents for featured section: active first, then by last activity
  const featuredAgents = [...agents].sort((a, b) => {
    if (a.active !== b.active) return a.active ? -1 : 1;
    return b.lastActivity - a.lastActivity;
  });

  return (
    <main className="min-h-screen">
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

      {/* Featured Agents */}
      <section className="py-16 px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="label-refined text-accent mb-4">Featured Agents</p>
            <h2 className="headline-section mb-4">
              Meet the Agents
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Financial AI agents with verified on-chain identities, declared capabilities,
              and open communication protocols.
            </p>
          </div>

          <div className="space-y-6">
            {featuredAgents.map((agent, i) => (
              <FeaturedAgent key={agent.id} agent={agent} index={i} />
            ))}
          </div>
        </div>
      </section>

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
        </div>
      </section>
    </main>
  );
}
