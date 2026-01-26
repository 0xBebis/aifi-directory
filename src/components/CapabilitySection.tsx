interface CapabilitySectionProps {
  title: string;
  items: string[];
  mono?: boolean;
  formatItem?: (item: string) => string;
}

export default function CapabilitySection({ title, items, mono, formatItem }: CapabilitySectionProps) {
  if (items.length === 0) return null;

  return (
    <div>
      <p className="text-2xs uppercase tracking-wider text-text-faint mb-2">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <span
            key={i}
            className={`inline-flex items-center px-2.5 py-1 rounded-md bg-surface-2 border border-border/50 text-sm text-text-secondary${mono ? ' font-mono' : ''}`}
          >
            {formatItem ? formatItem(item) : item}
          </span>
        ))}
      </div>
    </div>
  );
}
