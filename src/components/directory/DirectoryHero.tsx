'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface DirectoryHeroProps {
  companyCount: number;
  segmentCount: number;
  layerCount: number;
  totalFunding: number;
}

function formatFundingShort(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  }
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(0)}M`;
  }
  return `$${amount}`;
}

function Counter({ value, duration = 2000 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * value));

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [value, duration]);

  return <span className="tabular-nums">{count.toLocaleString()}</span>;
}

export default function DirectoryHero({ companyCount, segmentCount, layerCount, totalFunding }: DirectoryHeroProps) {
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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px]">
          <div className="absolute inset-0 bg-gradient-to-b from-accent/15 via-accent/5 to-transparent blur-[80px]" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 sm:px-8 pt-16 pb-20">
        <div className="flex flex-col items-center text-center">
          {/* Eyebrow */}
          <p
            className={`label-refined text-accent mb-6 transition-all duration-700 ease-out ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            The Index
          </p>

          {/* Main headline */}
          <h1
            className={`mb-6 transition-all duration-1000 ease-out ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <span className="block text-[clamp(2.5rem,7vw,5.5rem)] font-extrabold leading-[1.05] tracking-[-0.035em] text-text-primary">
              The AIFi
            </span>
            <span className="block text-[clamp(2.5rem,7vw,5.5rem)] font-extrabold leading-[1.05] tracking-[-0.035em]">
              <span className="bg-gradient-to-r from-accent to-teal-400 bg-clip-text text-transparent pr-[0.05em]">
                Directory
              </span>
            </span>
          </h1>

          {/* Subheadline */}
          <p
            className={`text-lg sm:text-xl text-text-muted max-w-2xl leading-relaxed mb-10 transition-all duration-1000 delay-100 ease-out ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            Tracking {companyCount} companies building at the intersection of
            artificial intelligence and financial services.
          </p>

          {/* Stats */}
          <div
            className={`flex items-center gap-6 sm:gap-8 mb-12 text-sm sm:text-base text-text-muted transition-all duration-1000 delay-200 ease-out ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-text-primary font-semibold text-lg sm:text-xl">
                {mounted ? <Counter value={companyCount} duration={1500} /> : '0'}
              </span>
              <span>companies</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-text-primary font-semibold text-lg sm:text-xl">
                {mounted ? <Counter value={segmentCount} duration={1500} /> : '0'}
              </span>
              <span>segments</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-text-primary font-semibold text-lg sm:text-xl">
                {mounted ? <Counter value={layerCount} duration={1500} /> : '0'}
              </span>
              <span>layers</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-accent font-semibold text-lg sm:text-xl">
                {mounted ? formatFundingShort(totalFunding) : '$0'}
              </span>
              <span>raised</span>
            </div>
          </div>

          {/* CTA */}
          <div
            className={`flex flex-col sm:flex-row items-center gap-4 transition-all duration-1000 delay-300 ease-out ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <a
              href="#browse"
              className="group relative inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-semibold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-accent to-teal-500" />
              <div className="absolute inset-[1px] rounded-full bg-gradient-to-r from-accent to-teal-600 group-hover:from-accent-hover group-hover:to-teal-500 transition-all duration-300" />
              <div className="absolute inset-0 rounded-full bg-accent/50 blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-300" />
              <span className="relative">Explore Market Map</span>
              <ArrowRight className="relative w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
            </a>

            <Link
              href="/submit"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-medium text-text-secondary hover:text-text-primary transition-colors duration-200"
            >
              Submit a Company
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
