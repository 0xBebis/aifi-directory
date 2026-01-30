'use client';

import FilteredCompanyGrid from '@/components/FilteredCompanyGrid';

export interface CompanyItem {
  slug: string;
  name: string;
  tagline: string;
  logo?: string;
  funding: number;
  fundingFormatted: string;
  aiTypes: string[];
  segment: string;
  segments: string[];
}

export interface SegmentChip {
  slug: string;
  name: string;
  color: string;
  count: number;
}

interface AITypeFilteredContentProps {
  companies: CompanyItem[];
  segmentCounts: SegmentChip[];
  aiTypeSlug: string;
  totalCount: number;
}

export default function AITypeFilteredContent({
  companies,
  segmentCounts,
  aiTypeSlug,
  totalCount,
}: AITypeFilteredContentProps) {
  const filterChips = segmentCounts.map(s => ({
    id: s.slug,
    label: s.name,
    color: s.color,
    count: s.count,
  }));

  return (
    <FilteredCompanyGrid
      companies={companies}
      filterChips={filterChips}
      filterLabel="Segments"
      filterHeading="Market Segments"
      directoryParam="aiType"
      directoryValue={aiTypeSlug}
      totalCount={totalCount}
      matchFn={(c, chipId) => c.segment === chipId || c.segments.includes(chipId)}
    />
  );
}
