import { Agent, FINANCE_CATEGORY_COLORS, FinanceCategory } from '@/types';
import { Cpu } from 'lucide-react';

interface AgentImageProps {
  agent: Pick<Agent, 'name' | 'image' | 'financeCategory'>;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: { container: 'w-9 h-9 rounded-lg', icon: 14, padding: 'p-1' },
  md: { container: 'w-12 h-12 rounded-lg', icon: 18, padding: 'p-1.5' },
  lg: { container: 'w-16 h-16 sm:w-18 sm:h-18 rounded-xl', icon: 24, padding: 'p-2' },
};

export default function AgentImage({ agent, size = 'md', className = '' }: AgentImageProps) {
  const color = FINANCE_CATEGORY_COLORS[agent.financeCategory as FinanceCategory] || '#64748b';
  const s = sizeClasses[size];

  if (agent.image) {
    return (
      <div className={`${s.container} ${s.padding} bg-white flex items-center justify-center shrink-0 border border-border/20 overflow-hidden ${className}`}>
        <img
          src={agent.image}
          alt={agent.name}
          className="max-w-full max-h-full object-contain"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div
      className={`${s.container} flex items-center justify-center shrink-0 border border-white/5 ${className}`}
      style={{
        background: `linear-gradient(135deg, ${color}22, ${color}08)`,
        color: color,
      }}
    >
      <Cpu size={s.icon} />
    </div>
  );
}
