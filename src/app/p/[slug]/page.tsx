import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Globe, Twitter, Linkedin, Pencil,
  Building2, Calendar, MapPin, Users, DollarSign, TrendingUp,
  Briefcase, Cpu, Award, ExternalLink, ChevronRight,
} from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import ShareButtons from '@/components/ShareButtons';
import {
  projects,
  getProject,
  getSegment,
  getLayer,
  getSimilarProjects,
  getCompaniesAtSameFundingStage,
  formatFunding,
  formatFundingDate,
  formatStage,
  getCountryName,
  getCountryFlag,
  getCompanyTypeColor,
  getFundingStageColor,
  generateSeoDescription,
  generateCompanyFAQs,
  generateCitations,
  BUILD_DATE_ISO,
  AI_TYPE_LABELS,
  AI_TYPE_COLORS,
  AI_TYPE_DESCRIPTIONS,
  COMPANY_TYPE_LABELS,
  FUNDING_STAGE_LABELS,
  REGION_LABELS,
  EMPLOYEE_RANGE_LABELS,
} from '@/lib/data';
import { CompanyType, FundingStage, EmployeeRange, AIType } from '@/types';
import CompanyLogo from '@/components/CompanyLogo';
import JsonLd from '@/components/JsonLd';

export function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const project = getProject(params.slug);
  if (!project) return { title: 'Company Not Found | AIFI Map' };

  const description = generateSeoDescription(project);

  return {
    title: `${project.name} — ${project.tagline} | AIFI Map`,
    description,
    openGraph: {
      title: `${project.name} — ${project.tagline}`,
      description,
      type: 'website',
      siteName: 'AIFI Map',
      images: [{ url: `/og/p/${params.slug}.png`, width: 1200, height: 630, alt: `${project.name} — ${project.tagline}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${project.name} — ${project.tagline}`,
      description,
      images: [`/og/p/${params.slug}.png`],
    },
  };
}

function parseEmployeeRange(range: string): { minValue: number; maxValue?: number } {
  const map: Record<string, { minValue: number; maxValue?: number }> = {
    '1-10': { minValue: 1, maxValue: 10 },
    '11-50': { minValue: 11, maxValue: 50 },
    '51-200': { minValue: 51, maxValue: 200 },
    '201-500': { minValue: 201, maxValue: 500 },
    '501-1000': { minValue: 501, maxValue: 1000 },
    '1001-5000': { minValue: 1001, maxValue: 5000 },
    '5000+': { minValue: 5000 },
  };
  return map[range] || { minValue: 0 };
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const project = getProject(params.slug);

  if (!project) {
    notFound();
  }

  const primarySegment = getSegment(project.segment);
  const primaryLayer = getLayer(project.layer);
  const allLayers = [primaryLayer, ...(project.layers?.map(getLayer) || [])].filter(Boolean);
  const allSegments = [primarySegment, ...(project.segments?.map(getSegment) || [])].filter(Boolean);
  const similarProjects = getSimilarProjects(project, 6);
  const fundingStagePeers = getCompaniesAtSameFundingStage(project, 4);

  const companyTypeColor = project.company_type ? getCompanyTypeColor(project.company_type as CompanyType) : null;
  const fundingStageColor = project.funding_stage ? getFundingStageColor(project.funding_stage as FundingStage) : null;
  const primaryAiType = project.ai_types?.[0] || null;
  const aiTypeColor = primaryAiType ? AI_TYPE_COLORS[primaryAiType] : null;

  const hasFinancials = project.funding || project.valuation || project.revenue;
  const hasFounders = project.founders && project.founders.length > 0;
  const hasCustomers = project.customers && project.customers.length > 0;
  const isAcquired = project.company_type === 'acquired';
  const isDefunct = project.defunct;
  const faqs = generateCompanyFAQs(project);
  const citations = generateCitations(project);

  // Build metrics for the stats bar
  const metrics: Array<{ label: string; value: string; icon: React.ReactNode }> = [];
  if (project.founded) {
    metrics.push({ label: 'Founded', value: String(project.founded), icon: <Calendar className="w-3.5 h-3.5" /> });
  }
  if (project.hq_city && project.hq_country) {
    const flag = getCountryFlag(project.hq_country);
    metrics.push({ label: 'Headquarters', value: `${flag} ${project.hq_city}`, icon: <MapPin className="w-3.5 h-3.5" /> });
  }
  if (project.employees) {
    metrics.push({ label: 'Employees', value: EMPLOYEE_RANGE_LABELS[project.employees as EmployeeRange] || project.employees, icon: <Users className="w-3.5 h-3.5" /> });
  }
  if (project.funding) {
    metrics.push({ label: 'Total Raised', value: formatFunding(project.funding), icon: <DollarSign className="w-3.5 h-3.5" /> });
  }
  if (project.last_funding_date) {
    metrics.push({ label: 'Last Funded', value: formatFundingDate(project.last_funding_date), icon: <Calendar className="w-3.5 h-3.5" /> });
  }
  if (project.valuation) {
    metrics.push({ label: 'Valuation', value: formatFunding(project.valuation), icon: <TrendingUp className="w-3.5 h-3.5" /> });
  }
  if (project.revenue) {
    metrics.push({ label: 'Revenue', value: formatFunding(project.revenue), icon: <Award className="w-3.5 h-3.5" /> });
  }

  // JSON-LD structured data
  const sameAs: string[] = [];
  if (project.twitter) sameAs.push(project.twitter);
  if (project.linkedin) sameAs.push(project.linkedin);

  const allSegmentNames = [
    primarySegment?.name,
    ...(project.segments || []).map(s => getSegment(s)?.name),
  ].filter(Boolean) as string[];

  const organizationJsonLd: Record<string, unknown> = {
    '@type': 'Organization',
    name: project.name,
    description: project.summary || project.tagline,
    ...(project.logo && { logo: `https://aifimap.com${project.logo}` }),
    ...(project.website && { url: project.website }),
    ...(project.founded && { foundingDate: String(project.founded) }),
    ...(project.hq_city && project.hq_country && {
      address: {
        '@type': 'PostalAddress',
        addressLocality: project.hq_city,
        addressCountry: project.hq_country,
      },
    }),
    ...(project.employees && {
      numberOfEmployees: {
        '@type': 'QuantitativeValue',
        ...parseEmployeeRange(project.employees),
      },
    }),
    ...(project.founders && project.founders.length > 0 && {
      founder: project.founders.map(f => ({
        '@type': 'Person',
        name: f.name,
        ...(f.title && { jobTitle: f.title }),
      })),
    }),
    ...(sameAs.length > 0 && { sameAs }),
    industry: 'Financial Services',
    additionalType: 'https://schema.org/FinancialService',
    knowsAbout: [
      ...(project.ai_types?.map(t => AI_TYPE_LABELS[t]) || []),
      ...allSegmentNames,
    ],
    ...(project.region && {
      areaServed: { '@type': 'Place', name: REGION_LABELS[project.region] },
    }),
    ...(primarySegment && {
      memberOf: {
        '@type': 'ProgramMembership',
        name: `AIFI Map ${primarySegment.name} Directory`,
        hostingOrganization: { '@type': 'Organization', name: 'AIFI Map', url: 'https://aifimap.com' },
      },
    }),
  };

  const breadcrumbJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'AIFI Map', item: 'https://aifimap.com' },
      { '@type': 'ListItem', position: 2, name: 'Directory', item: 'https://aifimap.com/directory' },
      { '@type': 'ListItem', position: 3, name: project.name, item: `https://aifimap.com/p/${project.slug}` },
    ],
  };

  const webPageJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${project.name} — ${project.tagline}`,
    description: generateSeoDescription(project),
    url: `https://aifimap.com/p/${project.slug}`,
    isPartOf: { '@type': 'WebSite', name: 'AIFI Map', url: 'https://aifimap.com' },
    mainEntity: organizationJsonLd,
    dateModified: project.last_funding_date
      ? (project.last_funding_date.length === 4 ? `${project.last_funding_date}-01-01` : `${project.last_funding_date}-01`)
      : BUILD_DATE_ISO,
    breadcrumb: breadcrumbJsonLd,
  };

  const faqJsonLd: Record<string, unknown> | null = faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  } : null;

  return (
    <>
    <JsonLd data={webPageJsonLd} />
    <JsonLd data={breadcrumbJsonLd} />
    {faqJsonLd && <JsonLd data={faqJsonLd} />}
    <div className="max-w-5xl mx-auto px-6 sm:px-8 py-8">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[
        { label: 'Directory', href: '/directory' },
        { label: project.name },
      ]} />

      {/* ── Hero Header ── */}
      <div className="relative bg-surface border border-border rounded-2xl overflow-hidden mb-6">
        {/* Accent gradient bar at top */}
        <div
          className="h-1"
          style={{
            background: aiTypeColor
              ? `linear-gradient(90deg, ${aiTypeColor}, ${aiTypeColor}66, transparent)`
              : primarySegment?.color
                ? `linear-gradient(90deg, ${primarySegment.color}, ${primarySegment.color}66, transparent)`
                : 'linear-gradient(90deg, #0d9488, transparent)',
          }}
        />

        <div className="p-6 sm:p-8">
          {/* Status banner for acquired/defunct */}
          {(isAcquired || isDefunct) && (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium mb-4 ${
              isDefunct
                ? 'bg-negative/10 text-negative border border-negative/20'
                : 'bg-warning/10 text-warning border border-warning/20'
            }`}>
              <Building2 className="w-3.5 h-3.5" />
              {isDefunct
                ? 'No Longer Operating'
                : `Acquired by ${project.acquirer || 'Unknown'}`}
              {project.acquired_date && ` (${project.acquired_date})`}
            </div>
          )}

          <div className="flex items-start gap-5">
            {/* Logo/Initial */}
            <CompanyLogo project={project} size="lg" />

            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-semibold text-text-primary tracking-tight" translate="no">
                    {project.name}
                  </h1>
                  <p className="text-text-secondary mt-1.5 text-base leading-relaxed max-w-2xl">
                    {project.tagline}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 shrink-0 items-end">
                  <div className="flex gap-2">
                    {project.website && (
                      <a
                        href={project.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary text-sm gap-1.5"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        Website
                      </a>
                    )}
                    <Link
                      href={`/submit/update/${project.slug}`}
                      className="btn-secondary text-sm gap-1.5"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Update
                    </Link>
                    {project.twitter && (
                      <a href={project.twitter} target="_blank" rel="noopener noreferrer" className="btn-ghost w-9 h-9 p-0">
                        <Twitter className="w-4 h-4" />
                      </a>
                    )}
                    {project.linkedin && (
                      <a href={project.linkedin} target="_blank" rel="noopener noreferrer" className="btn-ghost w-9 h-9 p-0">
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  <ShareButtons url={`/p/${project.slug}`} title={project.name} description={project.tagline} />
                </div>
              </div>

              {/* Status Pills */}
              <div className="flex flex-wrap items-center gap-2 mt-4">
                {project.company_type && (
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border"
                    style={{
                      borderColor: `${companyTypeColor}33`,
                      background: `${companyTypeColor}0d`,
                      color: companyTypeColor || undefined,
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: companyTypeColor || undefined }} />
                    {COMPANY_TYPE_LABELS[project.company_type as CompanyType]}
                  </span>
                )}
                {project.funding_stage && (
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border"
                    style={{
                      borderColor: `${fundingStageColor}33`,
                      background: `${fundingStageColor}0d`,
                      color: fundingStageColor || undefined,
                    }}
                  >
                    {FUNDING_STAGE_LABELS[project.funding_stage as FundingStage]}
                  </span>
                )}
                {project.ai_types?.map(t => {
                  const color = AI_TYPE_COLORS[t];
                  return (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border"
                      style={{
                        borderColor: `${color}33`,
                        background: `${color}0d`,
                        color: color,
                      }}
                    >
                      <Cpu className="w-3 h-3" />
                      {AI_TYPE_LABELS[t]}
                    </span>
                  );
                })}
                {project.region && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-border bg-surface-2/50 text-text-muted">
                    {REGION_LABELS[project.region]}
                  </span>
                )}
                {project.crypto && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-purple-500/30 bg-purple-500/10 text-purple-400">
                    Web3
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Metrics Strip ── */}
      {metrics.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-border rounded-xl overflow-hidden mb-6">
          {metrics.map((m, i) => (
            <div
              key={i}
              className="bg-surface px-4 py-3.5 flex flex-col gap-1"
            >
              <span className="text-2xs uppercase tracking-wider text-text-faint flex items-center gap-1.5">
                {m.icon}
                {m.label}
              </span>
              <span className="text-sm font-semibold text-text-primary tabular-nums">
                {m.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Summary - takes 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
          {project.summary && (
            <div className="bg-surface border border-border rounded-xl p-6">
              <h2 className="label-refined mb-3">About</h2>
              <p className="text-text-secondary leading-relaxed text-[0.9375rem]">
                {project.summary}
              </p>
              {citations.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border/30">
                  <p className="text-[0.625rem] uppercase tracking-wider text-text-faint mb-2">Key Facts</p>
                  <ol className="space-y-1">
                    {citations.map(c => (
                      <li key={c.id} className="text-xs text-text-muted leading-relaxed flex gap-2">
                        <span className="text-text-faint shrink-0">[{c.id}]</span>
                        <span><span className="font-medium text-text-secondary">{c.label}:</span> {c.text}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* Founders */}
          {hasFounders && (
            <div className="bg-surface border border-border rounded-xl p-6">
              <h2 className="label-refined mb-4">
                {project.founders!.length === 1 ? 'Founder' : 'Founders'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {project.founders!.map((founder, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg bg-surface-2/50 border border-border/50"
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${aiTypeColor || '#0d9488'}33, ${aiTypeColor || '#0d9488'}11)`,
                        color: aiTypeColor || '#0d9488',
                      }}
                    >
                      {founder.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {founder.name}
                      </p>
                      {founder.title && (
                        <p className="text-xs text-text-muted truncate">{founder.title}</p>
                      )}
                    </div>
                    {founder.linkedin && (
                      <a
                        href={founder.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto shrink-0 text-text-faint hover:text-accent transition-colors"
                      >
                        <Linkedin className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customers */}
          {hasCustomers && (
            <div className="bg-surface border border-border rounded-xl p-6">
              <h2 className="label-refined mb-3">Key Customers & Partners</h2>
              <div className="flex flex-wrap gap-2">
                {project.customers!.map((customer, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-surface-2 border border-border/50 text-sm text-text-secondary"
                  >
                    {customer}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - takes 1 col */}
        <div className="space-y-6">
          {/* AI Technology Card */}
          {project.ai_types && project.ai_types.length > 0 && (
            <div className="bg-surface border border-border rounded-xl p-6">
              <h2 className="label-refined mb-3">AI Technology</h2>
              <div className="space-y-3">
                {project.ai_types.map(t => {
                  const color = AI_TYPE_COLORS[t];
                  return (
                    <div key={t} className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          background: `${color}1a`,
                          border: `1px solid ${color}33`,
                        }}
                      >
                        <Cpu className="w-5 h-5" style={{ color }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">{AI_TYPE_LABELS[t]}</p>
                        <p className="text-xs text-text-muted mt-1 leading-relaxed">{AI_TYPE_DESCRIPTIONS[t]}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Classification */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="label-refined mb-4">Classification</h2>
            <div className="space-y-4">
              {allSegments.length > 0 && (
                <div>
                  <p className="text-2xs uppercase tracking-wider text-text-faint mb-2">Market Segments</p>
                  <div className="flex flex-wrap gap-1.5">
                    {allSegments.map(
                      (segment) =>
                        segment && (
                          <Link
                            key={segment.slug}
                            href={`/directory?segment=${segment.slug}`}
                            className="group inline-flex items-center gap-1.5 text-sm px-2.5 py-1 rounded-md bg-surface-2 text-text-secondary hover:text-text-primary transition-colors border border-transparent hover:border-border"
                          >
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ background: segment.color }}
                            />
                            {segment.name}
                          </Link>
                        )
                    )}
                  </div>
                </div>
              )}
              {allLayers.length > 0 && (
                <div>
                  <p className="text-2xs uppercase tracking-wider text-text-faint mb-2">Tech Stack Layers</p>
                  <div className="flex flex-wrap gap-1.5">
                    {allLayers.map(
                      (layer) =>
                        layer && (
                          <Link
                            key={layer.slug}
                            href={`/directory?layer=${layer.slug}`}
                            className="group inline-flex items-center gap-1.5 text-sm px-2.5 py-1 rounded-md bg-surface-2 text-text-secondary hover:text-text-primary transition-colors border border-transparent hover:border-border"
                          >
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ background: layer.color }}
                            />
                            {layer.name}
                          </Link>
                        )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Facts */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="label-refined mb-4">Details</h2>
            <div className="space-y-3">
              {project.last_funding_date && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Last Funding</span>
                  <span className="text-text-primary font-medium tabular-nums">{formatFundingDate(project.last_funding_date)}</span>
                </div>
              )}
              {project.stage && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Funding Round</span>
                  <span className="text-text-primary font-medium">{formatStage(project.stage)}</span>
                </div>
              )}
              {project.founded && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Age</span>
                  <span className="text-text-primary font-medium tabular-nums">
                    {new Date().getFullYear() - project.founded} years
                  </span>
                </div>
              )}
              {project.hq_country && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Country</span>
                  <span className="text-text-primary font-medium">
                    {getCountryFlag(project.hq_country)} {getCountryName(project.hq_country)}
                  </span>
                </div>
              )}
              {project.website && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Website</span>
                  <a
                    href={project.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:text-accent-hover transition-colors truncate max-w-[180px] inline-flex items-center gap-1"
                  >
                    {project.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Team (legacy field) */}
          {project.team && project.team.length > 0 && (
            <div className="bg-surface border border-border rounded-xl p-6">
              <h2 className="label-refined mb-4">Team</h2>
              <div className="space-y-2">
                {project.team.map((member, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <span className="font-medium text-text-primary text-sm">{member.name}</span>
                    <span className="text-xs text-text-muted">{member.role}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Similar Companies ── */}
      {similarProjects.length > 0 && (
        <div className="mt-8 pt-8 border-t border-border/30">
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="text-lg font-medium text-text-primary">Related Companies</h2>
            <Link
              href={`/directory?segment=${project.segment}`}
              className="text-sm text-text-muted hover:text-accent transition-colors inline-flex items-center gap-1"
            >
              View all in {primarySegment?.name}
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {similarProjects.map((p) => {
              const seg = getSegment(p.segment);
              const lay = getLayer(p.layer);
              const pAiColor = p.ai_types?.[0] ? AI_TYPE_COLORS[p.ai_types[0]] : null;
              return (
                <Link
                  key={p.slug}
                  href={`/p/${p.slug}`}
                  className="group bg-surface border border-border rounded-xl p-4 hover:border-accent/30 transition-all hover:shadow-soft"
                >
                  <div className="flex items-start gap-3">
                    <CompanyLogo project={p} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm text-text-primary group-hover:text-accent transition-colors truncate" translate="no">
                        {p.name}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5 line-clamp-2 leading-relaxed">
                        {p.tagline}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                    {seg && (
                      <span
                        className="inline-flex items-center gap-1 text-2xs px-2 py-0.5 rounded bg-surface-2 text-text-muted"
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: seg.color }} />
                        {seg.name}
                      </span>
                    )}
                    {lay && (
                      <span className="text-2xs px-2 py-0.5 rounded bg-surface-2 text-text-muted">
                        {lay.name}
                      </span>
                    )}
                    {p.funding && p.funding > 0 && (
                      <span className="text-2xs text-text-faint ml-auto tabular-nums">
                        {formatFunding(p.funding)}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Funding Stage Peers ── */}
      {project.funding_stage && fundingStagePeers.length > 0 && (
        <div className="mt-8 pt-8 border-t border-border/30">
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="text-lg font-medium text-text-primary">
              Other {FUNDING_STAGE_LABELS[project.funding_stage as FundingStage]} Companies
            </h2>
            <Link
              href={`/directory?stage=${project.funding_stage}`}
              className="text-sm text-text-muted hover:text-accent transition-colors inline-flex items-center gap-1"
            >
              View all
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {fundingStagePeers.map((p) => (
              <Link
                key={p.slug}
                href={`/p/${p.slug}`}
                className="group bg-surface border border-border rounded-xl p-4 hover:border-accent/30 transition-all hover:shadow-soft"
              >
                <div className="flex items-center gap-3 mb-2">
                  <CompanyLogo project={p} size="sm" />
                  <p className="font-medium text-sm text-text-primary group-hover:text-accent transition-colors truncate" translate="no">
                    {p.name}
                  </p>
                </div>
                {p.funding && p.funding > 0 && (
                  <span className="text-xs text-text-muted tabular-nums">
                    {formatFunding(p.funding)}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── FAQ ── */}
      {faqs.length > 0 && (
        <div className="mt-8 pt-8 border-t border-border/30">
          <h2 className="text-lg font-medium text-text-primary mb-5">Frequently Asked Questions</h2>
          <div className="space-y-5">
            {faqs.map((f, i) => (
              <div key={i}>
                <h3 className="text-[0.9375rem] font-semibold text-text-primary mb-2">{f.question}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{f.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Explore More ── */}
      <div className="mt-8 pt-8 border-t border-border/30">
        <h2 className="text-lg font-medium text-text-primary mb-4">Explore More</h2>
        <div className="flex flex-wrap gap-2">
          {primarySegment && (
            <Link
              href={`/segments/${primarySegment.slug}`}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-border hover:border-accent/30 transition-colors text-sm"
            >
              <span className="w-2 h-2 rounded-full" style={{ background: primarySegment.color }} />
              <span className="text-text-secondary">{primarySegment.name} Segment</span>
            </Link>
          )}
          {primaryLayer && (
            <Link
              href={`/layers/${primaryLayer.slug}`}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-border hover:border-accent/30 transition-colors text-sm"
            >
              <span className="w-2 h-2 rounded-full" style={{ background: primaryLayer.color }} />
              <span className="text-text-secondary">{primaryLayer.name} Layer</span>
            </Link>
          )}
          {project.ai_types?.map(t => (
            <Link
              key={t}
              href={`/ai-types/${t}`}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-border hover:border-accent/30 transition-colors text-sm"
            >
              <span className="w-2 h-2 rounded-full" style={{ background: AI_TYPE_COLORS[t] }} />
              <span className="text-text-secondary">{AI_TYPE_LABELS[t]}</span>
            </Link>
          ))}
          {project.region && (
            <Link
              href={`/regions/${project.region}`}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-border hover:border-accent/30 transition-colors text-sm text-text-secondary"
            >
              {REGION_LABELS[project.region]}
            </Link>
          )}
          <Link
            href="/stats"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-border hover:border-accent/30 transition-colors text-sm text-text-secondary"
          >
            Statistics
          </Link>
        </div>
      </div>
    </div>
    </>
  );
}
