import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Globe, ExternalLink } from 'lucide-react';
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
  const similarProjects = getSimilarProjects(project, 6);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Link */}
      <Link
        href="/directory"
        className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Directory
      </Link>

      {/* Header */}
      <div className="bg-surface border border-border rounded-lg p-6 mb-6">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-lg bg-surface-2 flex items-center justify-center text-2xl font-bold text-text-muted shrink-0">
            {project.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold mb-1">{project.name}</h1>
            <p className="text-text-muted">{project.tagline}</p>

            {/* Links */}
            <div className="flex flex-wrap gap-2 mt-4">
              {project.website && (
                <a
                  href={project.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-2 rounded text-sm hover:bg-border transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  Website
                  <ExternalLink className="w-3 h-3 opacity-50" />
                </a>
              )}
              {project.twitter && (
                <a
                  href={project.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-2 rounded text-sm hover:bg-border transition-colors"
                >
                  Twitter
                  <ExternalLink className="w-3 h-3 opacity-50" />
                </a>
              )}
              {project.linkedin && (
                <a
                  href={project.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-2 rounded text-sm hover:bg-border transition-colors"
                >
                  LinkedIn
                  <ExternalLink className="w-3 h-3 opacity-50" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
          {primarySegment && (
            <div>
              <p className="text-xs text-text-muted mb-1">Segment</p>
              <span
                className="inline-flex items-center gap-1.5 text-sm font-medium"
                style={{ color: primarySegment.color }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: primarySegment.color }}
                />
                {primarySegment.name}
              </span>
            </div>
          )}
          {primaryLayer && (
            <div>
              <p className="text-xs text-text-muted mb-1">Layer</p>
              <span
                className="inline-flex items-center gap-1.5 text-sm font-medium"
                style={{ color: primaryLayer.color }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: primaryLayer.color }}
                />
                {primaryLayer.name}
              </span>
            </div>
          )}
          {project.stage && (
            <div>
              <p className="text-xs text-text-muted mb-1">Stage</p>
              <p className="text-sm font-medium">{formatStage(project.stage)}</p>
            </div>
          )}
          {project.funding && (
            <div>
              <p className="text-xs text-text-muted mb-1">Funding</p>
              <p className="text-sm font-medium">{formatFunding(project.funding)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Description */}
          {project.description && (
            <div className="bg-surface border border-border rounded-lg p-5">
              <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
                About
              </h2>
              <p className="text-text-muted leading-relaxed">{project.description}</p>
            </div>
          )}

          {/* Team */}
          {project.team && project.team.length > 0 && (
            <div className="bg-surface border border-border rounded-lg p-5">
              <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
                Team
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {project.team.map((member, i) => (
                  <div key={i} className="bg-background rounded p-3">
                    <p className="font-medium text-sm">{member.name}</p>
                    <p className="text-xs text-text-muted">{member.role}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details */}
          <div className="bg-surface border border-border rounded-lg p-5">
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
              Details
            </h2>
            <dl className="space-y-2 text-sm">
              {project.founded && (
                <div className="flex justify-between">
                  <dt className="text-text-muted">Founded</dt>
                  <dd>{project.founded}</dd>
                </div>
              )}
              {project.hq_city && project.hq_country && (
                <div className="flex justify-between">
                  <dt className="text-text-muted">Location</dt>
                  <dd>
                    {project.hq_city}, {project.hq_country}
                  </dd>
                </div>
              )}
              {project.stage && (
                <div className="flex justify-between">
                  <dt className="text-text-muted">Stage</dt>
                  <dd>{formatStage(project.stage)}</dd>
                </div>
              )}
              {project.funding && (
                <div className="flex justify-between">
                  <dt className="text-text-muted">Funding</dt>
                  <dd>{formatFunding(project.funding)}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Layers */}
          {allLayers.length > 0 && (
            <div className="bg-surface border border-border rounded-lg p-5">
              <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
                Tech Stack Layers
              </h2>
              <div className="flex flex-wrap gap-2">
                {allLayers.map(
                  (layer) =>
                    layer && (
                      <span
                        key={layer.slug}
                        className="text-xs px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: `${layer.color}20`,
                          color: layer.color,
                        }}
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

      {/* Similar Projects */}
      {similarProjects.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">
            Similar Companies
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {similarProjects.map((p) => {
              const seg = getSegment(p.segment);
              const lay = getLayer(p.layer);
              return (
                <Link
                  key={p.slug}
                  href={`/p/${p.slug}`}
                  className="bg-surface border border-border rounded-lg p-4 hover:bg-surface-2 hover:border-border/60 transition-all"
                >
                  <p className="font-medium text-sm truncate">{p.name}</p>
                  <div className="flex gap-2 mt-2">
                    {seg && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${seg.color}20`,
                          color: seg.color,
                        }}
                      >
                        {seg.name.split(' ')[0]}
                      </span>
                    )}
                    {lay && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${lay.color}20`,
                          color: lay.color,
                        }}
                      >
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
