import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Project, Segment, Layer, FUNDING_STAGE_LABELS, FundingStage, AI_TYPE_LABELS, AIType } from '@/types';
import { formatFunding, getCountryName } from '@/lib/data';
import CompanyLogo from '@/components/CompanyLogo';

interface TopCompanyCardProps {
  project: Project;
  segment?: Segment;
  layer?: Layer;
  index: number;
}

function TopCompanyCard({ project, segment, layer, index }: TopCompanyCardProps) {
  const segmentColor = segment?.color || '#64748b';

  return (
    <Link
      href={`/p/${project.slug}`}
      className="group block card-hover-glow animate-fade-in-up-slow animate-fill-both"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative bg-surface border border-border rounded-2xl overflow-hidden">
        {/* Segment-colored gradient bar */}
        <div
          className="h-1"
          style={{
            background: `linear-gradient(90deg, ${segmentColor}, ${segmentColor}66, transparent)`,
          }}
        />

        <div className="p-6 sm:p-8">
          {/* Top row: Logo + Name + Funding */}
          <div className="flex items-start gap-5 mb-5">
            <CompanyLogo project={project} size="lg" />

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-text-primary tracking-tight group-hover:text-accent transition-colors">
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {/* Segment */}
                    {segment && (
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border"
                        style={{
                          borderColor: `${segmentColor}33`,
                          background: `${segmentColor}0d`,
                          color: segmentColor,
                        }}
                      >
                        {segment.name}
                      </span>
                    )}

                    {/* Layer */}
                    {layer && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-surface-2 border border-border/50 text-text-muted">
                        {layer.name}
                      </span>
                    )}

                    {/* Funding stage */}
                    {project.funding_stage && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-accent/10 text-accent border border-accent/20">
                        {FUNDING_STAGE_LABELS[project.funding_stage as FundingStage]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Funding amount */}
                {project.funding && (
                  <div className="hidden sm:block shrink-0 text-right">
                    <span className="text-2xl font-extrabold tracking-tight text-accent tabular-nums">
                      {formatFunding(project.funding)}
                    </span>
                    <p className="text-xs text-text-faint mt-0.5">raised</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tagline */}
          <p className="text-text-secondary text-[0.9375rem] leading-relaxed mb-5 max-w-3xl">
            {project.tagline}
          </p>

          {/* AI Types */}
          {project.ai_types && project.ai_types.length > 0 && (
            <div className="mb-5">
              <p className="text-2xs uppercase tracking-wider text-text-faint mb-2">AI Technologies</p>
              <div className="flex flex-wrap gap-1.5">
                {project.ai_types.map(type => (
                  <span
                    key={type}
                    className="px-2.5 py-1 rounded-md bg-surface-2 border border-border/50 text-xs text-text-secondary font-mono"
                  >
                    {AI_TYPE_LABELS[type as AIType] || type}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="flex items-center gap-4 text-xs text-text-faint">
              {project.founded && (
                <span>Founded {project.founded}</span>
              )}
              {project.hq_country && (
                <>
                  {project.founded && <span className="text-border">·</span>}
                  <span>{project.hq_city ? `${project.hq_city}, ` : ''}{getCountryName(project.hq_country)}</span>
                </>
              )}
              {project.funding && (
                <span className="sm:hidden text-accent font-medium">
                  {formatFunding(project.funding)}
                </span>
              )}
            </div>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted group-hover:text-accent transition-colors">
              View Profile
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

interface TopCompaniesProps {
  companies: Project[];
  getSegment: (slug: string) => Segment | undefined;
  getLayer: (slug: string) => Layer | undefined;
}

export default function TopCompanies({ companies, getSegment, getLayer }: TopCompaniesProps) {
  if (companies.length === 0) return null;

  return (
    <section className="py-16 px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="label-refined text-accent mb-4">Notable Companies</p>
          <h2 className="headline-section mb-4">
            Leading the Space
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            The most well-funded companies driving the convergence of artificial intelligence
            and financial services.
          </p>
        </div>

        <div className="space-y-6">
          {companies.slice(0, 6).map((project, i) => (
            <TopCompanyCard
              key={project.slug}
              project={project}
              segment={getSegment(project.segment)}
              layer={getLayer(project.layer)}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
