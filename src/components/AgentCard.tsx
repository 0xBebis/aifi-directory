import Link from 'next/link';
import { Agent, FINANCE_CATEGORY_LABELS, FINANCE_CATEGORY_COLORS, CHAIN_LABELS, CHAIN_COLORS } from '@/types';
import { formatRelativeTime, agentSlug } from '@/lib/data';
import AgentImage from './AgentImage';
import ProtocolBadge from './ProtocolBadge';
import ReputationBadge from './ReputationBadge';
import { ArrowRight } from 'lucide-react';

interface AgentCardProps {
  agent: Agent;
  index?: number;
}

export default function AgentCard({ agent, index = 0 }: AgentCardProps) {
  const categoryLabel = FINANCE_CATEGORY_LABELS[agent.financeCategory] || agent.financeCategory;
  const categoryColor = FINANCE_CATEGORY_COLORS[agent.financeCategory] || '#64748b';

  // Collect capabilities to preview
  const capabilities: string[] = [
    ...agent.mcpTools.slice(0, 2),
    ...agent.a2aSkills.slice(0, 2),
    ...agent.oasfSkills.slice(0, 2),
  ].slice(0, 3);
  const totalCapabilities = agent.mcpTools.length + agent.a2aSkills.length + agent.oasfSkills.length;
  const moreCount = totalCapabilities - capabilities.length;

  return (
    <Link
      href={`/agents/${agentSlug(agent.id)}`}
      className={`group block bg-surface border border-border rounded-xl p-5 hover:border-accent/30 hover:shadow-soft transition-all duration-200 animate-fade-in-up-slow animate-fill-both ${
        !agent.active ? 'opacity-60' : ''
      }`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Header: Image + Name + Protocols */}
      <div className="flex items-start gap-3 mb-3">
        <AgentImage agent={agent} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-sm font-semibold text-text-primary truncate group-hover:text-accent transition-colors" translate="no">
              {agent.name}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {agent.protocols.map(p => (
              <ProtocolBadge key={p} protocol={p} />
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      {agent.description && (
        <p className="text-xs text-text-muted leading-relaxed line-clamp-2 mb-3">
          {agent.description}
        </p>
      )}

      {/* Category + Reputation */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium"
          style={{
            backgroundColor: `${categoryColor}15`,
            color: categoryColor,
            border: `1px solid ${categoryColor}30`,
          }}
        >
          {categoryLabel}
        </span>
        <ReputationBadge score={agent.reputationScore} feedbackCount={agent.feedbackCount} />
      </div>

      {/* Capabilities preview */}
      {capabilities.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap mb-3">
          {capabilities.map((cap, i) => (
            <span key={i} className="px-1.5 py-0.5 rounded bg-surface-2 text-[10px] text-text-faint font-mono truncate max-w-[120px]">
              {cap}
            </span>
          ))}
          {moreCount > 0 && (
            <span className="text-[10px] text-text-faint">+{moreCount} more</span>
          )}
        </div>
      )}

      {/* Footer: Status + Chain + Last activity */}
      <div className="flex items-center justify-between pt-3 border-t border-border/50">
        <div className="flex items-center gap-2 text-xs text-text-faint">
          <span
            className={`w-1.5 h-1.5 rounded-full ${agent.active ? 'bg-positive' : 'bg-text-faint'}`}
          />
          <span>{agent.active ? 'Active' : 'Inactive'}</span>
          <span className="text-border">·</span>
          <span className="inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: CHAIN_COLORS[agent.chainId] || '#627EEA' }} />
            {CHAIN_LABELS[agent.chainId] || `Chain ${agent.chainId}`}
          </span>
          <span className="text-border">·</span>
          <span>{formatRelativeTime(agent.lastActivity)}</span>
        </div>
        <ArrowRight size={14} className="text-text-faint group-hover:text-accent transition-colors" />
      </div>
    </Link>
  );
}
