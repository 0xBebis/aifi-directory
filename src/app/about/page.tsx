import Link from 'next/link';
import { projects, segments, layers } from '@/lib/data';

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-8 py-14">
      {/* Eyebrow */}
      <p className="label-refined mb-4 text-accent">
        About
      </p>

      <h1 className="headline-display mb-10">
        AIFI
      </h1>

      <div className="space-y-10">
        <p className="text-xl text-text-secondary leading-relaxed">
          AIFI (AI Finance Index) is a curated directory of companies building at the
          intersection of Artificial Intelligence and Finance.
        </p>

        <div className="bg-surface border border-border rounded-xl p-8">
          <h2 className="label-refined mb-6">
            Index Overview
          </h2>
          <div className="grid grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold text-text-primary tracking-tight">
                {projects.length}
              </div>
              <div className="text-sm text-text-muted mt-2">Companies</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-text-primary tracking-tight">
                {segments.length}
              </div>
              <div className="text-sm text-text-muted mt-2">Segments</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-text-primary tracking-tight">
                {layers.length}
              </div>
              <div className="text-sm text-text-muted mt-2">Tech Layers</div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="label-refined mb-4">
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
          <h2 className="label-refined mb-4">
            Submit a Company
          </h2>
          <p className="text-text-secondary leading-relaxed mb-6">
            Know a company building AI + Finance products? Help us grow the directory.
          </p>
          <Link
            href="/submit"
            className="inline-flex items-center px-6 py-3 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent-muted transition-all duration-200"
          >
            Submit a Company
          </Link>
        </div>
      </div>
    </div>
  );
}
