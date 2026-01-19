import Link from 'next/link';
import { projects, segments, layers } from '@/lib/data';

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-text-primary mb-8">
        About AIFI
      </h1>

      <div className="space-y-8">
        <p className="text-lg text-text-secondary leading-relaxed">
          AIFI (AI Finance Index) is a curated directory of companies building at the
          intersection of Artificial Intelligence and Finance.
        </p>

        <div className="bg-surface border border-border rounded-lg p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4">
            Index Overview
          </h2>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-2xl font-semibold text-text-primary">
                {projects.length}
              </div>
              <div className="text-sm text-text-muted mt-1">Companies</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-text-primary">
                {segments.length}
              </div>
              <div className="text-sm text-text-muted mt-1">Segments</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-text-primary">
                {layers.length}
              </div>
              <div className="text-sm text-text-muted mt-1">Tech Layers</div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-3">
            How to Use
          </h2>
          <p className="text-text-secondary leading-relaxed">
            The{' '}
            <Link href="/directory" className="text-accent hover:underline">
              Directory
            </Link>{' '}
            combines a visual market map with a searchable, filterable table. Click any cell
            in the map to filter the table, or use the dropdowns and search to find specific
            companies.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-3">
            Submit a Company
          </h2>
          <p className="text-text-secondary leading-relaxed mb-4">
            Know a company building AI + Finance products? Help us grow the directory.
          </p>
          <Link
            href="/submit"
            className="inline-flex items-center px-4 py-2 bg-accent text-white text-sm font-medium rounded-md hover:bg-accent-muted transition-colors"
          >
            Submit a Company
          </Link>
        </div>
      </div>
    </div>
  );
}
