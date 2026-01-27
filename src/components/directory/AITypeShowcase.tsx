import { AIType, Project } from '@/types';

interface AITypeStat {
  type: AIType;
  label: string;
  color: string;
  description: string;
  count: number;
  topCompanies: Project[];
}

interface AITypeShowcaseProps {
  aiTypeStats: AITypeStat[];
}

export default function AITypeShowcase({ aiTypeStats }: AITypeShowcaseProps) {
  if (aiTypeStats.length === 0) return null;

  return (
    <section className="py-20 px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-14">
          <p className="label-refined text-accent mb-4">AI Intelligence Types</p>
          <h2 className="headline-section mb-4">How These Companies Use AI</h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            From large language models to reinforcement learning, the companies in this
            directory span the full spectrum of AI technologies applied to finance.
          </p>
        </div>

        {/* AI type cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {aiTypeStats.map((stat, index) => (
            <div
              key={stat.type}
              className="group relative bg-surface border border-border rounded-xl p-6 card-hover-glow animate-fade-in-up-slow animate-fill-both"
              style={{ animationDelay: `${index * 75}ms` }}
            >
              {/* Colored accent line */}
              <div
                className="absolute top-0 left-6 right-6 h-[2px] rounded-full opacity-60 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: stat.color }}
              />

              {/* AI type badge */}
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
                {stat.description}
              </p>

              {/* Company count */}
              <div className="flex items-baseline gap-1.5 mb-4">
                <span className="text-2xl font-extrabold tracking-tight text-text-primary">
                  {stat.count}
                </span>
                <span className="text-sm text-text-muted">
                  {stat.count === 1 ? 'company' : 'companies'}
                </span>
              </div>

              {/* Top companies */}
              {stat.topCompanies.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {stat.topCompanies.map(c => (
                    <span
                      key={c.slug}
                      className="px-2 py-0.5 rounded bg-surface-2 text-[11px] text-text-faint"
                    >
                      {c.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
