import { AgentProtocol, PROTOCOL_LABELS, PROTOCOL_COLORS } from '@/types';

interface ProtocolBadgeProps {
  protocol: AgentProtocol;
  className?: string;
}

export default function ProtocolBadge({ protocol, className = '' }: ProtocolBadgeProps) {
  const label = PROTOCOL_LABELS[protocol] || protocol.toUpperCase();
  const color = PROTOCOL_COLORS[protocol] || '#64748b';

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${className}`}
      style={{
        backgroundColor: `${color}15`,
        color: color,
        border: `1px solid ${color}25`,
      }}
    >
      {label}
    </span>
  );
}
