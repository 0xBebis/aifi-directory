import Link from 'next/link';
import { TrendingUp, ArrowRight } from 'lucide-react';

interface RecentCompany {
  name: string;
  slug: string;
  logo?: string;
  fundingDisplay: string;
  fundingDate: string;
}

interface RecentActivityProps {
  companies: RecentCompany[];
  buildDate: string;
}

export default function RecentActivity({ companies, buildDate }: RecentActivityProps) {
  if (companies.length === 0) return null;

  return (
    <section className="py-10 px-6 sm:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-semibold text-text-primary">Recent Funding Activity</h2>
            <span className="text-xs text-text-faint ml-2">Updated {buildDate}</span>
          </div>
          <Link
            href="/recent"
            className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent-hover transition-colors font-medium"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {companies.map((c) => (
            <Link
              key={c.slug}
              href={`/p/${c.slug}`}
              className="group flex items-center gap-3 px-4 py-3 bg-surface border border-border rounded-xl hover:border-accent/30 transition-all"
            >
              {c.logo ? (
                <img src={c.logo} alt="" className="w-8 h-8 rounded-lg object-contain bg-white p-0.5" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center text-text-faint text-xs font-bold">
                  {c.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors truncate">
                  {c.name}
                </p>
                <p className="text-xs text-text-muted">
                  {c.fundingDisplay && <span>{c.fundingDisplay}</span>}
                  {c.fundingDisplay && c.fundingDate && <span className="mx-1">&middot;</span>}
                  {c.fundingDate && <span>{c.fundingDate}</span>}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
