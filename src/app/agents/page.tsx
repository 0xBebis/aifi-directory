import { Metadata } from 'next';
import {
  agents,
  getActiveAgents,
  getTotalAgentCapabilities,
  BUILD_DATE,
} from '@/lib/data';
import AgentFilters from '@/components/AgentFilters';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'AI Agent Registry — EIP-8004 | AIFI Map',
  description: 'Browse live financial AI agents registered on the EIP-8004 Trustless Agent Registry. Verified identities, declared capabilities, and open communication protocols.',
  openGraph: {
    title: 'AI Agent Registry — EIP-8004',
    description: 'Browse live financial AI agents registered on the EIP-8004 Trustless Agent Registry. Verified identities, declared capabilities, and open communication protocols.',
    type: 'website',
    siteName: 'AIFI Map',
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

      {/* Page header */}
      <div className="relative overflow-hidden border-b border-border">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-surface/50 via-background to-background" />
        {/* Accent glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px]">
          <div className="absolute inset-0 bg-gradient-to-b from-accent/15 via-accent/5 to-transparent blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 pt-6 pb-8">
        <Breadcrumbs items={[{ label: 'Agents' }]} />

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
              AI Agent Registry
            </h1>
            <p className="text-text-muted text-[0.9375rem] leading-relaxed mt-2 max-w-xl">
              On-chain AI agents via{' '}
              <a
                href="https://eips.ethereum.org/EIPS/eip-8004"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:text-accent-hover transition-colors"
              >
                EIP-8004
              </a>
              . Search, filter, and sort across the full registry.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-muted flex-shrink-0">
            <span>
              <span className="font-semibold text-text-primary tabular-nums">{agents.length}</span> agents
            </span>
            <span className="text-border">&middot;</span>
            <span>
              <span className="font-semibold text-positive tabular-nums">{activeCount}</span> active
            </span>
            <span className="text-border">&middot;</span>
            <span>
              <span className="font-semibold text-text-primary tabular-nums">{uniqueProtocols.size}</span> protocols
            </span>
            <span className="text-border">&middot;</span>
            <span>
              <span className="font-semibold text-accent tabular-nums">{totalCapabilities}</span> capabilities
            </span>
            <span className="text-border">&middot;</span>
            <span className="text-text-faint text-xs">Updated {BUILD_DATE}</span>
          </div>
        </div>
        </div>
      </div>

      {/* Agent filters + grid */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
        <AgentFilters agents={agents} />
      </div>
    </main>
  );
}
