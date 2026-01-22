'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

interface HeroProps {
  companyCount: number;
  segmentCount: number;
  layerCount: number;
  totalFunding: number;
}

function AnimatedNumber({ value, suffix = '', prefix = '' }: { value: number; suffix?: string; prefix?: string }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayed(value);
        clearInterval(timer);
      } else {
        setDisplayed(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span className="tabular-nums">
      {prefix}{displayed.toLocaleString()}{suffix}
    </span>
  );
}

function formatFundingShort(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `$${(amount / 1_000_000_000).toFixed(0)}B+`;
  }
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(0)}M+`;
  }
  return `$${amount}`;
}

export default function Hero({ companyCount, segmentCount, layerCount, totalFunding }: HeroProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 bg-glow" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-glow-center opacity-50" />

      {/* Floating orbs - subtle background elements */}
      <div className="absolute top-20 left-[15%] w-64 h-64 rounded-full bg-accent/5 blur-3xl animate-float" />
      <div className="absolute bottom-32 right-[10%] w-96 h-96 rounded-full bg-accent/3 blur-3xl animate-float" style={{ animationDelay: '-3s' }} />

      <div className="relative z-10 max-w-5xl mx-auto px-8 text-center">
        {/* Eyebrow */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border/50 mb-8 transition-all duration-700 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-sm text-text-secondary">The definitive AI + Finance index</span>
        </div>

        {/* Main headline */}
        <h1
          className={`text-display mb-6 transition-all duration-700 delay-100 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          The AI + Finance{' '}
          <span className="text-gradient">Landscape</span>
        </h1>

        {/* Subheadline */}
        <p
          className={`text-xl sm:text-2xl text-text-secondary max-w-2xl mx-auto mb-12 leading-relaxed transition-all duration-700 delay-200 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          Explore {companyCount} companies building the future of financial services with artificial intelligence
        </p>

        {/* Stats row */}
        <div
          className={`flex flex-wrap justify-center gap-8 sm:gap-12 mb-12 transition-all duration-700 delay-300 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="text-center">
            <div className="text-4xl sm:text-5xl font-bold text-text-primary mb-1">
              {mounted ? <AnimatedNumber value={companyCount} /> : '0'}
            </div>
            <div className="text-sm text-text-muted uppercase tracking-wide">Companies</div>
          </div>
          <div className="text-center">
            <div className="text-4xl sm:text-5xl font-bold text-text-primary mb-1">
              {mounted ? <AnimatedNumber value={segmentCount} /> : '0'}
            </div>
            <div className="text-sm text-text-muted uppercase tracking-wide">Segments</div>
          </div>
          <div className="text-center">
            <div className="text-4xl sm:text-5xl font-bold text-text-primary mb-1">
              {mounted ? <AnimatedNumber value={layerCount} /> : '0'}
            </div>
            <div className="text-sm text-text-muted uppercase tracking-wide">Tech Layers</div>
          </div>
          <div className="text-center">
            <div className="text-4xl sm:text-5xl font-bold text-accent mb-1">
              {formatFundingShort(totalFunding)}
            </div>
            <div className="text-sm text-text-muted uppercase tracking-wide">Total Raised</div>
          </div>
        </div>

        {/* CTAs */}
        <div
          className={`flex flex-wrap justify-center gap-4 transition-all duration-700 delay-400 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <Link
            href="/directory"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-accent text-white font-semibold rounded-xl hover:bg-accent-hover transition-all duration-200 shadow-glow hover:shadow-[0_0_30px_-5px_rgba(13,148,136,0.5)]"
          >
            Explore Directory
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 px-8 py-4 bg-surface border border-border text-text-primary font-semibold rounded-xl hover:bg-surface-2 hover:border-border transition-all duration-200"
          >
            Submit a Company
          </Link>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
