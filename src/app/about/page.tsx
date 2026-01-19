import Link from 'next/link';
import { projects, segments, layers } from '@/lib/data';

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-6">About AIFI</h1>

      <div className="space-y-6 text-text-muted">
        <p className="text-lg">
          AIFI (AI Finance Index) is a curated directory of companies building at the
          intersection of Artificial Intelligence and Finance.
        </p>

        <div className="bg-surface border border-border rounded-lg p-5">
          <h2 className="text-lg font-semibold text-text-primary mb-3">What We Track</h2>
          <ul className="space-y-2">
            <li>
              <strong className="text-text-primary">{projects.length}</strong> companies indexed
            </li>
            <li>
              <strong className="text-text-primary">{segments.length}</strong> market segments
              <span className="text-xs ml-2">
                (Trading, Lending, Insurance, Payments, Crypto, etc.)
              </span>
            </li>
            <li>
              <strong className="text-text-primary">{layers.length}</strong> technology layers
              <span className="text-xs ml-2">
                (Infrastructure to Application)
              </span>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-3">How to Use</h2>
          <p>
            The <Link href="/directory" className="text-accent hover:underline">Directory</Link> combines
            a visual market map with a searchable, filterable table. Click any cell in the map to
            filter the table, or use the dropdowns and search to find specific companies.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-3">Submit a Company</h2>
          <p className="mb-4">
            Know a company building AI + Finance products? Help us grow the directory.
          </p>
          <Link
            href="/submit"
            className="inline-block px-4 py-2 bg-accent text-white rounded font-medium text-sm hover:bg-accent/90 transition-colors"
          >
            Submit a Project
          </Link>
        </div>
      </div>
    </div>
  );
}
