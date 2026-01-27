'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';

interface RecentCompany {
  name: string;
  slug: string;
  fundingDisplay: string;
}

interface LandingHeroProps {
  companyCount: number;
  recentCompanies: RecentCompany[];
}

export default function LandingHero({ companyCount, recentCompanies }: LandingHeroProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-surface/50 via-background to-background" />

      {/* Accent glow */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[700px]">
          <div className="absolute inset-0 bg-gradient-to-b from-accent/20 via-accent/5 to-transparent blur-[100px]" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 sm:px-8 pt-24 pb-16">
        <div className="flex flex-col items-center text-center">
          {/* Main headline */}
          <h1
            className={`mb-6 transition-all duration-1000 ease-out ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <span className="block text-[clamp(2.75rem,8vw,6.5rem)] font-extrabold leading-[1.05] tracking-[-0.035em] text-text-primary">
              The Financial AI
            </span>
            <span className="block text-[clamp(2.75rem,8vw,6.5rem)] font-extrabold leading-[1.05] tracking-[-0.035em]">
              <span className="bg-gradient-to-r from-accent to-teal-400 bg-clip-text text-transparent pr-[0.05em]">
                Landscape
              </span>
            </span>
          </h1>

          {/* Subheadline */}
          <p
            className={`text-lg sm:text-xl text-text-muted max-w-2xl leading-relaxed mb-8 transition-all duration-1000 delay-100 ease-out ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            A curated index of {companyCount} companies and autonomous agents building
            the future of finance with artificial intelligence.
          </p>

          {/* Search bar button */}
          <button
            onClick={() => window.dispatchEvent(new Event('open-search'))}
            className={`w-full max-w-md flex items-center gap-3 px-4 py-3 rounded-xl bg-surface border border-border hover:border-accent/30 cursor-text group mb-8 transition-all duration-1000 delay-200 ease-out ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <Search className="w-5 h-5 text-text-muted group-hover:text-accent transition-colors" />
            <span className="flex-1 text-left text-sm text-text-faint">Search companies, segments, pages...</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-1 text-2xs text-text-faint bg-surface-2 border border-border rounded-md font-mono">
              Ctrl K
            </kbd>
          </button>

          {/* Recently funded strip */}
          {recentCompanies.length > 0 && (
            <div
              className={`flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm transition-all duration-1000 delay-300 ease-out ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <span className="text-text-faint font-medium">Recently Funded</span>
              <span className="text-border">|</span>
              {recentCompanies.map((c, i) => (
                <span key={c.slug} className="inline-flex items-center">
                  <Link
                    href={`/p/${c.slug}`}
                    className="text-text-muted hover:text-accent transition-colors"
                  >
                    {c.name}
                    {c.fundingDisplay && (
                      <span className="text-text-faint ml-1">({c.fundingDisplay})</span>
                    )}
                  </Link>
                  {i < recentCompanies.length - 1 && (
                    <span className="text-border mx-1.5">&middot;</span>
                  )}
                </span>
              ))}
              <span className="text-border ml-0.5">|</span>
              <Link
                href="/recent"
                className="text-accent hover:text-accent-hover transition-colors font-medium"
              >
                See all &rarr;
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
