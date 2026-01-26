import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { Project, Segment, Layer, FUNDING_STAGE_LABELS, FundingStage } from '@/types';
import { formatFunding } from '@/lib/data';
import CompanyLogo from '@/components/CompanyLogo';

interface FeaturedCompanyCardProps {
  project: Project;
  segment?: Segment;
  layer?: Layer;
  index: number;
}

function FeaturedCompanyCard({ project, segment, layer, index }: FeaturedCompanyCardProps) {
  return (
    <div
      className="group relative bg-surface border border-border rounded-xl p-6 card-hover-glow animate-fade-in-up-slow animate-fill-both"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <CompanyLogo project={project} size="md" />
          <div>
            <Link
              href={`/p/${project.slug}`}
              className="text-lg font-semibold text-text-primary group-hover:text-accent transition-colors"
            >
              {project.name}
            </Link>
            {project.funding_stage && (
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                {FUNDING_STAGE_LABELS[project.funding_stage as FundingStage]}
              </span>
            )}
          </div>
        </div>
        {project.website && (
          <a
            href={project.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-faint hover:text-accent transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

      <p className="text-sm text-text-secondary mb-4 line-clamp-2">
        {project.tagline}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {segment && (
            <span className="text-xs px-2 py-1 rounded-md bg-surface-2 text-text-muted">
              {segment.name}
            </span>
          )}
          {layer && (
            <span className="text-xs px-2 py-1 rounded-md bg-surface-2 text-text-muted">
              {layer.name}
            </span>
          )}
        </div>
        {project.funding && (
          <span className="text-sm font-medium text-accent tabular-nums">
            {formatFunding(project.funding)}
          </span>
        )}
      </div>
    </div>
  );
}

interface FeaturedCompaniesProps {
  companies: Project[];
  getSegment: (slug: string) => Segment | undefined;
  getLayer: (slug: string) => Layer | undefined;
}

export default function FeaturedCompanies({ companies, getSegment, getLayer }: FeaturedCompaniesProps) {
  return (
    <section className="py-24 px-8 bg-surface-2/30">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="label-refined text-accent mb-4">Notable Companies</p>
          <h2 className="headline-section mb-4">Defining the Space</h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Leading companies driving the convergence of artificial intelligence and financial services
          </p>
        </div>

        {/* Companies grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.slice(0, 9).map((project, index) => (
            <FeaturedCompanyCard
              key={project.slug}
              project={project}
              segment={getSegment(project.segment)}
              layer={getLayer(project.layer)}
              index={index}
            />
          ))}
        </div>

        {/* Browse all CTA */}
        <div className="text-center mt-12">
          <Link
            href="/directory"
            className="inline-flex items-center gap-2 px-6 py-3 bg-surface border border-border text-text-primary font-medium rounded-lg hover:bg-surface-2 transition-colors"
          >
            Browse all {companies.length > 9 ? '447+' : companies.length} companies
          </Link>
        </div>
      </div>
    </section>
  );
}
