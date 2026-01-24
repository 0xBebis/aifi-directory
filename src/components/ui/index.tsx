import { ReactNode } from 'react';

/**
 * Tooltip component for showing additional information on hover
 */
export function Tooltip({ children, content }: { children: ReactNode; content: ReactNode }) {
  return (
    <span className="relative group/tooltip inline-flex items-center">
      {children}
      <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 hidden group-hover/tooltip:flex flex-col gap-1.5 px-3 py-2 bg-surface-3 border border-border rounded-lg shadow-medium text-xs whitespace-nowrap animate-fade-in">
        {content}
      </span>
    </span>
  );
}

/**
 * CategoryBadge component for displaying colored category labels
 */
export function CategoryBadge({
  label,
  color,
  onClick,
  isActive = false,
}: {
  label: string;
  color: string;
  onClick?: () => void;
  isActive?: boolean;
}) {
  const isClickable = !!onClick;
  return (
    <span
      onClick={(e) => {
        if (onClick) {
          e.stopPropagation();
          onClick();
        }
      }}
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium transition-all ${
        isClickable ? 'cursor-pointer hover:scale-105' : ''
      } ${isActive ? 'ring-1 ring-offset-1 ring-offset-surface' : ''}`}
      style={{
        backgroundColor: isActive ? `${color}25` : `${color}15`,
        color: color,
        border: `1px solid ${isActive ? color : `${color}30`}`,
        ['--tw-ring-color' as string]: isActive ? color : undefined,
      }}
    >
      {label}
    </span>
  );
}
