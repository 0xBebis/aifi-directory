import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Agent, FINANCE_CATEGORY_LABELS, FINANCE_CATEGORY_COLORS } from '@/types';
import { formatRelativeTime, agentSlug, getAgentEndpoints } from '@/lib/data';
import AgentImage from '@/components/AgentImage';
import ProtocolBadge from '@/components/ProtocolBadge';
import ReputationBadge from '@/components/ReputationBadge';

interface FeaturedAgentProps {
  agent: Agent;
  index: number;
}

export default function FeaturedAgent({ agent, index }: FeaturedAgentProps) {
  const categoryLabel = FINANCE_CATEGORY_LABELS[agent.financeCategory] || agent.financeCategory;
  const categoryColor = FINANCE_CATEGORY_COLORS[agent.financeCategory] || '#64748b';
  const endpoints = getAgentEndpoints(agent);

  // Collect all capabilities
  const capabilities: string[] = [
    ...agent.mcpTools,
    ...agent.a2aSkills,
    ...agent.oasfSkills.map(s => s.replace(/_/g, ' ').replace(/\//g, ' / ')),
  ].slice(0, 8);
  const totalCapabilities = agent.mcpTools.length + agent.a2aSkills.length
    + agent.oasfSkills.length + agent.mcpPrompts.length + agent.mcpResources.length
    + agent.oasfDomains.length;
  const moreCount = totalCapabilities - capabilities.length;

  // First line of description
  const descPreview = agent.description?.split('\n').filter(Boolean).slice(0, 3).join(' ') || '';

  return (
    <Link
      href={`/agents/${agentSlug(agent.id)}`}
      className="group block card-hover-glow animate-fade-in-up-slow animate-fill-both"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <div className="relative bg-surface border border-border rounded-2xl overflow-hidden">
        {/* Category-colored gradient bar */}
        <div
          className="h-1"
          style={{
            background: `linear-gradient(90deg, ${categoryColor}, ${categoryColor}66, transparent)`,
          }}
        />

        <div className="p-6 sm:p-8">
          {/* Top row: Image + Name + Meta */}
          <div className="flex items-start gap-5 mb-5">
            <AgentImage agent={agent} size="lg" />

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-text-primary tracking-tight group-hover:text-accent transition-colors">
                    {agent.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {/* Active status */}
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
                      {categoryLabel}
                    </span>

                    {/* Protocols */}
                    {agent.protocols.map(p => (
                      <ProtocolBadge key={p} protocol={p} />
                    ))}

                    {/* x402 */}
                    {agent.x402Support && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-positive/10 text-positive border border-positive/25">
                        x402
                      </span>
                    )}
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 shrink-0">
                  <ReputationBadge score={agent.reputationScore} feedbackCount={agent.feedbackCount} />
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-text-secondary text-[0.9375rem] leading-relaxed mb-5 max-w-3xl">
            {descPreview}
          </p>

          {/* Capabilities */}
          {capabilities.length > 0 && (
            <div className="mb-5">
              <p className="text-2xs uppercase tracking-wider text-text-faint mb-2">Capabilities</p>
              <div className="flex flex-wrap gap-1.5">
                {capabilities.map((cap, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md bg-surface-2 border border-border/50 text-xs text-text-secondary font-mono"
                  >
                    {cap}
                  </span>
                ))}
                {moreCount > 0 && (
                  <span className="px-2.5 py-1 rounded-md text-xs text-text-faint">
                    +{moreCount} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="flex items-center gap-4 text-xs text-text-faint">
              <span>{formatRelativeTime(agent.lastActivity)}</span>
              {endpoints.length > 0 && (
                <>
                  <span className="text-border">·</span>
                  <span>{endpoints.length} endpoint{endpoints.length !== 1 ? 's' : ''}</span>
                </>
              )}
              {totalCapabilities > 0 && (
                <>
                  <span className="text-border">·</span>
                  <span>{totalCapabilities} capabilities</span>
                </>
              )}
            </div>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted group-hover:text-accent transition-colors">
              View Details
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
