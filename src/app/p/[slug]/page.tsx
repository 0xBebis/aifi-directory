import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Globe, ExternalLink, Twitter, Linkedin } from 'lucide-react';
import {
  projects,
  getProject,
  getSegment,
  getLayer,
  getSimilarProjects,
  formatFunding,
  formatStage,
} from '@/lib/data';

export function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const project = getProject(params.slug);

  if (!project) {
    notFound();
  }

  const primarySegment = getSegment(project.segment);
  const primaryLayer = getLayer(project.layer);
  const allLayers = project.layers?.map(getLayer).filter(Boolean) || [primaryLayer].filter(Boolean);
  const allSegments = project.segments?.map(getSegment).filter(Boolean) || [primarySegment].filter(Boolean);
  const similarProjects = getSimilarProjects(project, 6);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Back Link */}
      <Link
        href="/directory"
        className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors mb-8 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Directory
      </Link>

      {/* Header Card */}
      <div className="bg-surface border border-border rounded-lg p-6 mb-6">
        <div className="flex items-start gap-5">
          {/* Logo/Initial */}
          <div className="w-14 h-14 rounded-lg bg-surface-2 border border-border flex items-center justify-center text-xl font-semibold text-text-muted shrink-0">
            {project.name.charAt(0)}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
              {project.name}
            </h1>
            <p className="text-text-muted mt-1">{project.tagline}</p>

            {/* Action Links */}
            <div className="flex flex-wrap gap-2 mt-4">
              {project.website && (
                <a
                  href={project.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white text-sm font-medium rounded-md hover:bg-accent-muted transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  Visit Website
                </a>
              )}
              {project.twitter && (
                <a
                  href={project.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-surface-2 border border-border text-text-secondary text-sm font-medium rounded-md hover:bg-surface-3 hover:text-text-primary transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                  Twitter
                </a>
              )}
              {project.linkedin && (
                <a
                  href={project.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-surface-2 border border-border text-text-secondary text-sm font-medium rounded-md hover:bg-surface-3 hover:text-text-primary transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-6 pt-6 border-t border-border">
          {primarySegment && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-text-muted mb-1">
                Segment
              </p>
              <p className="text-sm font-medium text-text-primary">
                {primarySegment.name}
              </p>
            </div>
          )}
          {primaryLayer && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-text-muted mb-1">
                Layer
              </p>
              <p className="text-sm font-medium text-text-primary">
                {primaryLayer.name}
              </p>
            </div>
          )}
          {project.stage && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-text-muted mb-1">
                Stage
              </p>
              <p className="text-sm font-medium text-text-primary">
                {formatStage(project.stage)}
              </p>
            </div>
          )}
          {project.funding && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-text-muted mb-1">
                Funding
              </p>
              <p className="text-sm font-medium text-text-primary tabular-nums">
                {formatFunding(project.funding)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {project.description && (
            <div className="bg-surface border border-border rounded-lg p-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-4">
                About
              </h2>
              <p className="text-text-secondary leading-relaxed">
                {project.description}
              </p>
            </div>
          )}

          {/* Team */}
          {project.team && project.team.length > 0 && (
            <div className="bg-surface border border-border rounded-lg p-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-4">
                Team
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {project.team.map((member, i) => (
                  <div key={i} className="bg-surface-2 rounded-md p-4">
                    <p className="font-medium text-sm text-text-primary">
                      {member.name}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {member.role}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details */}
          <div className="bg-surface border border-border rounded-lg p-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-4">
              Details
            </h2>
            <dl className="space-y-3">
              {project.founded && (
                <div className="flex justify-between items-center">
                  <dt className="text-sm text-text-muted">Founded</dt>
                  <dd className="text-sm text-text-primary tabular-nums">{project.founded}</dd>
                </div>
              )}
              {project.hq_city && project.hq_country && (
                <div className="flex justify-between items-center">
                  <dt className="text-sm text-text-muted">Location</dt>
                  <dd className="text-sm text-text-primary">
                    {project.hq_city}, {project.hq_country}
                  </dd>
                </div>
              )}
              {project.stage && (
                <div className="flex justify-between items-center">
                  <dt className="text-sm text-text-muted">Stage</dt>
                  <dd className="text-sm text-text-primary">{formatStage(project.stage)}</dd>
                </div>
              )}
              {project.funding && (
                <div className="flex justify-between items-center">
                  <dt className="text-sm text-text-muted">Funding</dt>
                  <dd className="text-sm text-text-primary tabular-nums">{formatFunding(project.funding)}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Segments */}
          {allSegments.length > 0 && (
            <div className="bg-surface border border-border rounded-lg p-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-4">
                Market Segments
              </h2>
              <div className="flex flex-wrap gap-2">
                {allSegments.map(
                  (segment) =>
                    segment && (
                      <span
                        key={segment.slug}
                        className="text-xs px-3 py-1.5 rounded-md bg-surface-2 text-text-secondary"
                      >
                        {segment.name}
                      </span>
                    )
                )}
              </div>
            </div>
          )}

          {/* Layers */}
          {allLayers.length > 0 && (
            <div className="bg-surface border border-border rounded-lg p-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-4">
                Tech Stack Layers
              </h2>
              <div className="flex flex-wrap gap-2">
                {allLayers.map(
                  (layer) =>
                    layer && (
                      <span
                        key={layer.slug}
                        className="text-xs px-3 py-1.5 rounded-md bg-surface-2 text-text-secondary"
                      >
                        {layer.name}
                      </span>
                    )
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Similar Companies */}
      {similarProjects.length > 0 && (
        <div className="mt-10 pt-10 border-t border-border">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-5">
            Similar Companies
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {similarProjects.map((p) => {
              const seg = getSegment(p.segment);
              const lay = getLayer(p.layer);
              return (
                <Link
                  key={p.slug}
                  href={`/p/${p.slug}`}
                  className="group bg-surface border border-border rounded-lg p-4 hover:border-accent/50 transition-colors"
                >
                  <p className="font-medium text-sm text-text-primary group-hover:text-accent transition-colors truncate">
                    {p.name}
                  </p>
                  <p className="text-xs text-text-muted mt-1 line-clamp-1">
                    {p.tagline}
                  </p>
                  <div className="flex gap-2 mt-3">
                    {seg && (
                      <span className="text-2xs px-2 py-1 rounded bg-surface-2 text-text-muted">
                        {seg.name}
                      </span>
                    )}
                    {lay && (
                      <span className="text-2xs px-2 py-1 rounded bg-surface-2 text-text-muted">
                        {lay.name}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
