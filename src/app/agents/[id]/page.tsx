import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Globe, ExternalLink, ChevronRight,
  Star, MessageSquare, ShieldCheck, Calendar, Clock,
  Cpu, Zap, Link2,
} from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import {
  agents,
  getAgent,
  getSimilarAgents,
  getAgentEndpoints,
  getScoreColorClass,
  formatTimestamp,
  formatRelativeTime,
  formatReputationScore,
  truncateAddress,
  agentSlug,
  agentIdFromSlug,
  FINANCE_CATEGORY_LABELS,
  FINANCE_CATEGORY_COLORS,
} from '@/lib/data';
import { AgentProtocol } from '@/types';
import AgentImage from '@/components/AgentImage';
import ProtocolBadge from '@/components/ProtocolBadge';
import AgentCard from '@/components/AgentCard';
import EndpointList from '@/components/EndpointList';
import CapabilitySection from '@/components/CapabilitySection';
import JsonLd from '@/components/JsonLd';

const EXPLORER_BASE = 'https://sepolia.etherscan.io';
const REGISTRY_ADDRESS = '0x8004A818BFB912233c491871b3d84c89A494BD9e';

export function generateStaticParams() {
  return agents.map((agent) => ({
    id: agentSlug(agent.id),
  }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const agent = getAgent(agentIdFromSlug(params.id));
  if (!agent) return { title: 'Agent Not Found | AIFI' };
  const categoryLabel = FINANCE_CATEGORY_LABELS[agent.financeCategory] || 'Finance';
  const description = agent.description?.slice(0, 160) || `${agent.name} is a financial AI agent registered on EIP-8004.`;
  return {
    title: `${agent.name} — ${categoryLabel} Agent | AIFI`,
    description,
    openGraph: {
      title: `${agent.name} — ${categoryLabel} Agent`,
      description,
      type: 'website',
      siteName: 'AIFI',
      images: [{ url: `/og/agents/${params.id}.png`, width: 1200, height: 630, alt: `${agent.name} — ${categoryLabel} Agent` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${agent.name} — ${categoryLabel} Agent`,
      description,
      images: [`/og/agents/${params.id}.png`],
    },
  };
}

export default function AgentDetailPage({ params }: { params: { id: string } }) {
  const agent = getAgent(agentIdFromSlug(params.id));

  if (!agent) {
    notFound();
  }

  const categoryLabel = FINANCE_CATEGORY_LABELS[agent.financeCategory] || agent.financeCategory;
  const categoryColor = FINANCE_CATEGORY_COLORS[agent.financeCategory] || '#64748b';
  const similarAgents = getSimilarAgents(agent, 3);
  const endpoints = getAgentEndpoints(agent);

  // Build metrics
  const metrics: Array<{ label: string; value: string; icon: React.ReactNode }> = [
    {
      label: 'Reputation',
      value: formatReputationScore(agent.reputationScore),
      icon: <Star className="w-3.5 h-3.5" />,
    },
    {
      label: 'Feedback',
      value: String(agent.feedbackCount),
      icon: <MessageSquare className="w-3.5 h-3.5" />,
    },
    {
      label: 'Validations',
      value: agent.validationCount > 0
        ? `${agent.completedValidations}/${agent.validationCount}`
        : '0',
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
    },
    {
      label: 'Created',
      value: formatTimestamp(agent.createdAt),
      icon: <Calendar className="w-3.5 h-3.5" />,
    },
    {
      label: 'Last Active',
      value: formatRelativeTime(agent.lastActivity),
      icon: <Clock className="w-3.5 h-3.5" />,
    },
  ];

  const totalCapabilities = agent.mcpTools.length + agent.mcpPrompts.length + agent.mcpResources.length
    + agent.a2aSkills.length + agent.oasfSkills.length + agent.oasfDomains.length;

  // JSON-LD structured data
  const softwareJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: agent.name,
    description: agent.description || `${agent.name} is a financial AI agent registered on EIP-8004.`,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    ...(agent.webEndpoint && { url: agent.webEndpoint }),
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  const breadcrumbJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'AIFI', item: 'https://aifimap.com' },
      { '@type': 'ListItem', position: 2, name: 'Agent Registry', item: 'https://aifimap.com/agents' },
      { '@type': 'ListItem', position: 3, name: agent.name, item: `https://aifimap.com/agents/${agentSlug(agent.id)}` },
    ],
  };

  return (
    <>
    <JsonLd data={softwareJsonLd} />
    <JsonLd data={breadcrumbJsonLd} />
    <div className="max-w-5xl mx-auto px-6 sm:px-8 py-8">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[
        { label: 'Agents', href: '/agents' },
        { label: agent.name },
      ]} />

      {/* ── Hero Header ── */}
      <div className="relative bg-surface border border-border rounded-2xl overflow-hidden mb-6">
        {/* Accent gradient bar at top */}
        <div
          className="h-1.5"
          style={{
            background: `linear-gradient(90deg, ${categoryColor}, ${categoryColor}66, transparent)`,
          }}
        />

        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-5">
            <AgentImage agent={agent} size="lg" />

            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                    {agent.name}
                  </h1>
                  <p className="text-text-secondary mt-1.5 text-base leading-relaxed max-w-2xl line-clamp-3">
                    {agent.description?.split('\n')[0] || ''}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 shrink-0">
                  {agent.webEndpoint && (
                    <a
                      href={agent.webEndpoint}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary text-sm gap-1.5"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      Open Web
                    </a>
                  )}
                  <a
                    href={`${EXPLORER_BASE}/token/${REGISTRY_ADDRESS}?a=${agent.agentId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-sm gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Registry
                  </a>
                </div>
              </div>

              {/* Status Pills */}
              <div className="flex flex-wrap items-center gap-2 mt-4">
                {/* Active/Inactive */}
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                  agent.active
                    ? 'border-positive/30 bg-positive/10 text-positive'
                    : 'border-border bg-surface-2 text-text-faint'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${agent.active ? 'bg-positive' : 'bg-text-faint'}`} />
                  {agent.active ? 'Active' : 'Inactive'}
                </span>

                {/* Category */}
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border"
                  style={{
                    borderColor: `${categoryColor}33`,
                    background: `${categoryColor}0d`,
                    color: categoryColor,
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: categoryColor }} />
                  {categoryLabel}
                </span>

                {/* Protocols */}
                {agent.protocols.map(p => (
                  <ProtocolBadge key={p} protocol={p as AgentProtocol} />
                ))}

                {/* x402 */}
                {agent.x402Support && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-positive/30 bg-positive/10 text-positive">
                    <Zap className="w-3 h-3" />
                    x402
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Metrics Strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-border rounded-xl overflow-hidden mb-6">
        {metrics.map((m, i) => (
          <div
            key={i}
            className="bg-surface px-4 py-3.5 flex flex-col gap-1"
          >
            <span className="text-2xs uppercase tracking-wider text-text-faint flex items-center gap-1.5">
              {m.icon}
              {m.label}
            </span>
            <span className="text-sm font-semibold text-text-primary tabular-nums">
              {m.value}
            </span>
          </div>
        ))}
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Main content - 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
          {agent.description && (
            <div className="bg-surface border border-border rounded-xl p-6">
              <h2 className="label-refined mb-3">About</h2>
              <div className="text-text-secondary leading-relaxed text-[0.9375rem] whitespace-pre-line">
                {agent.description}
              </div>
            </div>
          )}

          {/* Capabilities */}
          {totalCapabilities > 0 && (
            <div className="bg-surface border border-border rounded-xl p-6">
              <h2 className="label-refined mb-4">Capabilities</h2>
              <div className="space-y-4">
                <CapabilitySection title="MCP Tools" items={agent.mcpTools} mono />
                <CapabilitySection title="MCP Prompts" items={agent.mcpPrompts} mono />
                <CapabilitySection title="MCP Resources" items={agent.mcpResources} mono />
                <CapabilitySection title="A2A Skills" items={agent.a2aSkills} />
                <CapabilitySection title="OASF Skills" items={agent.oasfSkills} formatItem={s => s.replace(/_/g, ' ').replace(/\//g, ' / ')} />
                <CapabilitySection title="OASF Domains" items={agent.oasfDomains} formatItem={s => s.replace(/_/g, ' ').replace(/\//g, ' / ')} />
              </div>
            </div>
          )}

          {/* Feedback History */}
          {agent.recentFeedback.length > 0 && (
            <div className="bg-surface border border-border rounded-xl p-6">
              <h2 className="label-refined mb-4">Recent Feedback</h2>
              <div className="space-y-3">
                {agent.recentFeedback.map((fb, i) => {
                  return (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-lg bg-surface-2/50 border border-border/50"
                    >
                      <div className={`flex items-center gap-1 shrink-0 text-sm font-semibold ${getScoreColorClass(fb.score)}`}>
                        <Star size={14} className="fill-current" />
                        {fb.score.toFixed(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        {fb.text && (
                          <p className="text-sm text-text-secondary leading-relaxed mb-1">
                            {fb.text}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-text-faint">
                          <span className="font-mono">{fb.reviewer}</span>
                          {fb.tag1 && (
                            <>
                              <span className="text-border">·</span>
                              <span>{fb.tag1}</span>
                            </>
                          )}
                          {fb.tag2 && (
                            <>
                              <span className="text-border">·</span>
                              <span>{fb.tag2}</span>
                            </>
                          )}
                          <span className="text-border">·</span>
                          <span>{formatRelativeTime(fb.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - 1 col */}
        <div className="space-y-6">
          {/* Endpoints */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="label-refined mb-3 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5" />
              Endpoints
            </h2>
            <EndpointList endpoints={endpoints} />
          </div>

          {/* Trust Model */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="label-refined mb-4">Trust Model</h2>
            <div className="space-y-3">
              <div>
                <p className="text-2xs uppercase tracking-wider text-text-faint mb-2">Supported Trust</p>
                <div className="flex flex-wrap gap-1.5">
                  {agent.supportedTrust.length > 0 ? (
                    agent.supportedTrust.map((trust, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-2.5 py-1 rounded-md bg-surface-2 border border-border/50 text-sm text-text-secondary capitalize"
                      >
                        {trust.replace(/-/g, ' ')}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-text-faint">None declared</span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between text-sm pt-2 border-t border-border/50">
                <span className="text-text-muted">x402 Support</span>
                <span className={`font-medium ${agent.x402Support ? 'text-positive' : 'text-text-faint'}`}>
                  {agent.x402Support ? 'Enabled' : 'No'}
                </span>
              </div>
            </div>
          </div>

          {/* On-Chain Identity */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="label-refined mb-4">On-Chain Identity</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Chain</span>
                <span className="text-text-primary font-medium">Sepolia</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Agent ID</span>
                <span className="text-text-primary font-medium tabular-nums">#{agent.agentId}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Owner</span>
                <a
                  href={`${EXPLORER_BASE}/address/${agent.owner}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:text-accent-hover transition-colors font-mono text-xs inline-flex items-center gap-1"
                >
                  {truncateAddress(agent.owner)}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              {agent.agentWallet && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Wallet</span>
                  <a
                    href={`${EXPLORER_BASE}/address/${agent.agentWallet}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:text-accent-hover transition-colors font-mono text-xs inline-flex items-center gap-1"
                  >
                    {truncateAddress(agent.agentWallet)}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Registry</span>
                <a
                  href={`${EXPLORER_BASE}/address/${REGISTRY_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:text-accent-hover transition-colors font-mono text-xs inline-flex items-center gap-1"
                >
                  {truncateAddress(REGISTRY_ADDRESS)}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              {agent.ens && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">ENS</span>
                  <span className="text-text-primary font-medium">{agent.ens}</span>
                </div>
              )}
              {agent.did && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">DID</span>
                  <span className="text-text-primary font-mono text-xs truncate max-w-[160px]">{agent.did}</span>
                </div>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="label-refined mb-3">Category</h2>
            <Link
              href={`/agents?category=${agent.financeCategory}`}
              className="group inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-md bg-surface-2 text-text-secondary hover:text-text-primary transition-colors border border-transparent hover:border-border"
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: categoryColor }}
              />
              {categoryLabel}
              <ChevronRight className="w-3.5 h-3.5 text-text-faint group-hover:text-text-muted transition-colors" />
            </Link>
            <div className="mt-3 flex items-center gap-2 text-xs text-text-faint">
              <Cpu className="w-3.5 h-3.5" />
              <span>Finance relevance: {(agent.financeScore * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Related Agents ── */}
      {similarAgents.length > 0 && (
        <div className="mt-8 pt-8 border-t border-border/30">
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="text-lg font-semibold text-text-primary">Related Agents</h2>
            <Link
              href={`/agents?category=${agent.financeCategory}`}
              className="text-sm text-text-muted hover:text-accent transition-colors inline-flex items-center gap-1"
            >
              View all in {categoryLabel}
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {similarAgents.map((a, i) => (
              <AgentCard key={a.id} agent={a} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
    </>
  );
}
