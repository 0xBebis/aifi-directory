import { Metadata } from 'next';
import { Bot, Activity, Star, Network } from 'lucide-react';
import { agents, getActiveAgents, formatReputationScore } from '@/lib/data';
import AgentFilters from '@/components/AgentFilters';

export const metadata: Metadata = {
  title: 'AI Agents | AIFI',
  description: 'Browse live financial AI agents registered on the EIP-8004 Trustless Agent Registry.',
};

export default function AgentsPage() {
  const activeCount = getActiveAgents().length;
  const agentsWithRep = agents.filter(a => a.reputationScore !== null);
  const avgRep = agentsWithRep.length > 0
    ? agentsWithRep.reduce((sum, a) => sum + (a.reputationScore || 0), 0) / agentsWithRep.length
    : null;
  const uniqueProtocols = new Set(agents.flatMap(a => a.protocols));

  const stats = [
    { label: 'Agents', value: agents.length.toString(), icon: Bot },
    { label: 'Active', value: activeCount.toString(), icon: Activity },
    { label: 'Avg Reputation', value: formatReputationScore(avgRep), icon: Star },
    { label: 'Protocols', value: uniqueProtocols.size.toString(), icon: Network },
  ];

  return (
    <div className="max-w-7xl mx-auto px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="label-refined mb-2">The Registry</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary mb-3">
          Live Agents
        </h1>
        <p className="text-text-muted text-[0.9375rem] leading-relaxed max-w-2xl">
          {agents.length > 0 ? (
            <>
              Browse {agents.length} financial AI agent{agents.length !== 1 ? 's' : ''} registered on the{' '}
            </>
          ) : (
            <>
              Discover financial AI agents registered on the{' '}
            </>
          )}
          <a
            href="https://eips.ethereum.org/EIPS/eip-8004"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            EIP-8004
          </a>{' '}
          Trustless Agent Registry. Filtered to agents relevant to finance, trading, risk, DeFi, and payments.
        </p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border rounded-xl overflow-hidden mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-surface p-4 sm:p-5 flex flex-col items-center text-center">
              <Icon size={16} className="text-text-faint mb-2" />
              <span className="text-2xl font-extrabold tracking-tight text-text-primary">
                {stat.value}
              </span>
              <span className="text-xs text-text-faint mt-0.5">{stat.label}</span>
            </div>
          );
        })}
      </div>

      {/* Filters + Grid */}
      <AgentFilters agents={agents} />
    </div>
  );
}
