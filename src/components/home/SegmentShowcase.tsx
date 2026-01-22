import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Segment, Project } from '@/types';

interface SegmentCardProps {
  segment: Segment;
  count: number;
  topCompanies: Project[];
  index: number;
}

function SegmentCard({ segment, count, topCompanies, index }: SegmentCardProps) {
  return (
    <Link
      href={`/directory?segment=${segment.slug}`}
      className="group relative bg-surface border border-border rounded-xl p-6 card-hover-glow animate-fade-in-up-slow animate-fill-both"
      style={{ animationDelay: `${index * 75}ms` }}
    >
      {/* Colored accent line */}
      <div
        className="absolute top-0 left-6 right-6 h-[2px] rounded-full opacity-60 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: segment.color }}
      />

      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary group-hover:text-accent transition-colors">
            {segment.name}
          </h3>
          <p className="text-sm text-text-muted mt-1">
            {count} {count === 1 ? 'company' : 'companies'}
          </p>
        </div>
        <ArrowRight className="w-5 h-5 text-text-faint group-hover:text-accent group-hover:translate-x-1 transition-all" />
      </div>

      <p className="text-sm text-text-secondary leading-relaxed mb-4 line-clamp-2">
        {segment.description}
      </p>

      {topCompanies.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {topCompanies.slice(0, 3).map((company) => (
            <span
              key={company.slug}
              className="text-xs px-2 py-1 rounded-md bg-surface-2 text-text-muted"
            >
              {company.name}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}

interface SegmentShowcaseProps {
  segmentStats: Array<{
    segment: Segment;
    count: number;
    topCompanies: Project[];
  }>;
}

export default function SegmentShowcase({ segmentStats }: SegmentShowcaseProps) {
  return (
    <section className="py-24 px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="label-refined text-accent mb-4">Market Segments</p>
          <h2 className="headline-section mb-4">Explore by Industry</h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            From trading algorithms to insurance automation, discover how AI is transforming every corner of finance
          </p>
        </div>

        {/* Segment grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {segmentStats.map((stat, index) => (
            <SegmentCard
              key={stat.segment.slug}
              segment={stat.segment}
              count={stat.count}
              topCompanies={stat.topCompanies}
              index={index}
            />
          ))}
        </div>

        {/* View all CTA */}
        <div className="text-center mt-12">
          <Link
            href="/directory"
            className="inline-flex items-center gap-2 text-accent hover:text-accent-hover font-medium transition-colors"
          >
            View all companies
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
