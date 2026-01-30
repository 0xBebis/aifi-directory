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
}

export interface AITypeChip {
  type: string;
  label: string;
  color: string;
  count: number;
}

interface SegmentFilteredContentProps {
  companies: CompanyItem[];
  aiTypeCounts: AITypeChip[];
  segmentSlug: string;
  totalCount: number;
}

export default function SegmentFilteredContent({
  companies,
  aiTypeCounts,
  segmentSlug,
  totalCount,
}: SegmentFilteredContentProps) {
  const filterChips = aiTypeCounts.map(t => ({
    id: t.type,
    label: t.label,
    color: t.color,
    count: t.count,
  }));

  return (
    <FilteredCompanyGrid
      companies={companies}
      filterChips={filterChips}
      filterLabel="Technologies"
      filterHeading="AI Technologies Used"
      directoryParam="segment"
      directoryValue={segmentSlug}
      totalCount={totalCount}
      matchFn={(c, chipId) => c.aiTypes.includes(chipId)}
    />
  );
}
