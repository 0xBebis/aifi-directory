import Link from 'next/link';
import { Layer } from '@/types';
import { Layers, Database, Brain, Bot, AppWindow } from 'lucide-react';

interface TechStackProps {
  layers: Layer[];
  layerCounts: Record<string, number>;
}

const layerIcons: Record<string, React.ReactNode> = {
  infrastructure: <Layers className="w-6 h-6" />,
  data: <Database className="w-6 h-6" />,
  models: <Brain className="w-6 h-6" />,
  automation: <Bot className="w-6 h-6" />,
  applications: <AppWindow className="w-6 h-6" />,
};

export default function TechStack({ layers, layerCounts }: TechStackProps) {
  // Sort layers by position (reversed - applications at top, infrastructure at bottom)
  const sortedLayers = [...layers].sort((a, b) => b.position - a.position);

  return (
    <section className="py-24 px-8">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="label-refined text-accent mb-4">Technology Stack</p>
          <h2 className="headline-section mb-4">Built on Five Layers</h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            From foundational infrastructure to end-user applications, understand how the AI finance ecosystem is structured
          </p>
        </div>

        {/* Stack visualization */}
        <div className="relative max-w-2xl mx-auto">
          {/* Connecting line */}
          <div className="absolute left-8 top-8 bottom-8 w-px bg-gradient-to-b from-accent/50 via-accent/20 to-transparent hidden sm:block" />

          <div className="space-y-4">
            {sortedLayers.map((layer, index) => {
              const count = layerCounts[layer.slug] || 0;
              const Icon = layerIcons[layer.slug];

              return (
                <Link
                  key={layer.slug}
                  href={`/directory?layer=${layer.slug}`}
                  className="group relative flex items-center gap-6 p-5 bg-surface border border-border rounded-xl card-hover-glow animate-fade-in-up-slow animate-fill-both"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Icon circle */}
                  <div
                    className="relative z-10 w-16 h-16 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                    style={{
                      backgroundColor: `${layer.color}15`,
                      color: layer.color,
                    }}
                  >
                    {Icon || <Layers className="w-6 h-6" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-3">
                      <h3 className="text-lg font-semibold text-text-primary group-hover:text-accent transition-colors">
                        {layer.name}
                      </h3>
                      <span className="text-sm text-text-muted">
                        {count} {count === 1 ? 'company' : 'companies'}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary mt-1 line-clamp-1">
                      {layer.description}
                    </p>
                  </div>

                  {/* Arrow indicator */}
                  <div className="text-text-faint group-hover:text-accent group-hover:translate-x-1 transition-all">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Educational note */}
        <div className="text-center mt-12">
          <p className="text-sm text-text-muted max-w-xl mx-auto">
            Companies often span multiple layers. Explore the{' '}
            <Link href="/directory" className="text-accent hover:text-accent-hover transition-colors">
              interactive market map
            </Link>{' '}
            to see how segments and layers intersect.
          </p>
        </div>
      </div>
    </section>
  );
}
