import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Globe, ExternalLink, Twitter, Linkedin, Pencil } from 'lucide-react';
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
    <div className="max-w-4xl mx-auto px-8 py-10">
      {/* Back Link */}
      <Link
        href="/directory"
        className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors mb-6 text-sm tracking-wide"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Directory
      </Link>

      {/* Header */}
      <div className="bg-surface border border-border rounded-xl p-6 mb-6">
        <div className="flex items-start gap-5">
          {/* Logo/Initial */}
          <div className="w-14 h-14 rounded-lg bg-surface-2 border border-border/50 flex items-center justify-center text-xl font-bold text-text-muted shrink-0">
            {project.name.charAt(0)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-text-primary">
                  {project.name}
                </h1>
                <p className="text-text-secondary mt-1">{project.tagline}</p>
              </div>

              {/* Action Links */}
              <div className="flex gap-2 shrink-0">
                {project.website && (
                  <a
                    href={project.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-muted transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    Website
                  </a>
                )}
                <Link
                  href={`/submit/update/${project.slug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-2 border border-border text-text-secondary text-sm font-medium rounded-lg hover:bg-surface-3 hover:text-text-primary transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Request Update
                </Link>
                {project.twitter && (
                  <a
                    href={project.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-8 h-8 bg-surface-2 border border-border text-text-muted rounded-lg hover:text-text-primary transition-colors"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                )}
                {project.linkedin && (
                  <a
                    href={project.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-8 h-8 bg-surface-2 border border-border text-text-muted rounded-lg hover:text-text-primary transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Quick Info Row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-sm">
              {project.hq_city && project.hq_country && (
                <span className="text-text-muted">
                  {project.hq_city}, {project.hq_country}
                </span>
              )}
              {project.founded && (
                <span className="text-text-muted">
                  Founded {project.founded}
                </span>
              )}
              {project.funding && (
                <span className="text-text-muted tabular-nums">
                  {formatFunding(project.funding)} raised
                </span>
              )}
              {project.stage && (
                <span className="px-2 py-0.5 rounded bg-surface-2 text-text-secondary text-xs">
                  {formatStage(project.stage)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      {project.summary && (
        <div className="bg-surface border border-border rounded-xl p-6 mb-6">
          <p className="text-text-secondary leading-relaxed">
            {project.summary}
          </p>
        </div>
      )}

      {/* Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Classification */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="label-refined mb-4">Classification</h2>
          <div className="space-y-3">
            {allSegments.length > 0 && (
              <div>
                <p className="text-xs text-text-muted mb-2">Market Segments</p>
                <div className="flex flex-wrap gap-1.5">
                  {allSegments.map(
                    (segment) =>
                      segment && (
                        <span
                          key={segment.slug}
                          className="text-sm px-2.5 py-1 rounded-md bg-surface-2 text-text-secondary"
                        >
                          {segment.name}
                        </span>
                      )
                  )}
                </div>
              </div>
            )}
            {allLayers.length > 0 && (
              <div>
                <p className="text-xs text-text-muted mb-2">Tech Stack</p>
                <div className="flex flex-wrap gap-1.5">
                  {allLayers.map(
                    (layer) =>
                      layer && (
                        <span
                          key={layer.slug}
                          className="text-sm px-2.5 py-1 rounded-md bg-surface-2 text-text-secondary"
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

        {/* Team */}
        {project.team && project.team.length > 0 && (
          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="label-refined mb-4">Team</h2>
            <div className="space-y-2">
              {project.team.map((member, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <span className="font-medium text-text-primary text-sm">{member.name}</span>
                  <span className="text-sm text-text-muted">{member.role}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Similar Companies */}
      {similarProjects.length > 0 && (
        <div className="mt-10 pt-8 border-t border-border/30">
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="text-lg font-medium text-text-primary">Related Companies</h2>
            <span className="text-sm text-text-muted">{similarProjects.length} similar</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {similarProjects.map((p) => {
              const seg = getSegment(p.segment);
              const lay = getLayer(p.layer);
              return (
                <Link
                  key={p.slug}
                  href={`/p/${p.slug}`}
                  className="group bg-surface border border-border rounded-lg p-4 hover:border-accent/30 transition-colors"
                >
                  <p className="font-medium text-sm text-text-primary group-hover:text-accent transition-colors truncate">
                    {p.name}
                  </p>
                  <p className="text-xs text-text-muted mt-1 line-clamp-1">
                    {p.tagline}
                  </p>
                  <div className="flex gap-1.5 mt-3">
                    {seg && (
                      <span className="text-xs px-2 py-0.5 rounded bg-surface-2 text-text-muted">
                        {seg.name}
                      </span>
                    )}
                    {lay && (
                      <span className="text-xs px-2 py-0.5 rounded bg-surface-2 text-text-muted">
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
