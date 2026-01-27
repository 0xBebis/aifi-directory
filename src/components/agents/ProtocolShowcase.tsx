import { AgentProtocol, PROTOCOL_LABELS, PROTOCOL_COLORS } from '@/types';

interface ProtocolStat {
  protocol: AgentProtocol;
  label: string;
  color: string;
  count: number;
}

interface ProtocolShowcaseProps {
  protocolStats: ProtocolStat[];
  protocolDescriptions: Record<AgentProtocol, string>;
}

const PROTOCOL_FEATURES: Record<AgentProtocol, string[]> = {
  mcp: ['Tools', 'Prompts', 'Resources'],
  a2a: ['Skills', 'Peer Discovery'],
  oasf: ['Skills', 'Domains', 'Taxonomy'],
  web: ['HTTP/HTTPS', 'REST APIs'],
  email: ['Async Messaging'],
};

export default function ProtocolShowcase({ protocolStats, protocolDescriptions }: ProtocolShowcaseProps) {
  if (protocolStats.length === 0) return null;

  return (
    <section className="py-20 px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-14">
          <p className="label-refined text-accent mb-4">Agent Protocols</p>
          <h2 className="headline-section mb-4">How Agents Communicate</h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Each agent declares its capabilities through open protocols, enabling
            structured discovery and interoperability across the registry.
          </p>
        </div>

        {/* Protocol cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {protocolStats.map((stat, index) => {
            const features = PROTOCOL_FEATURES[stat.protocol] || [];
            return (
              <div
                key={stat.protocol}
                className="group relative bg-surface border border-border rounded-xl p-6 card-hover-glow animate-fade-in-up-slow animate-fill-both"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Colored accent line */}
                <div
                  className="absolute top-0 left-6 right-6 h-[2px] rounded-full opacity-60 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: stat.color }}
                />

                {/* Protocol badge */}
                <div className="mb-4">
                  <span
                    className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider"
                    style={{
                      backgroundColor: `${stat.color}15`,
                      color: stat.color,
                      border: `1px solid ${stat.color}30`,
                    }}
                  >
                    {stat.label}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-text-secondary leading-relaxed mb-4">
                  {protocolDescriptions[stat.protocol]}
                </p>

                {/* Agent count */}
                <div className="flex items-baseline gap-1.5 mb-4">
                  <span className="text-2xl font-extrabold tracking-tight text-text-primary">
                    {stat.count}
                  </span>
                  <span className="text-sm text-text-muted">
                    agent{stat.count !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Features */}
                {features.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {features.map(f => (
                      <span
                        key={f}
                        className="px-2 py-0.5 rounded bg-surface-2 text-[11px] text-text-faint"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
