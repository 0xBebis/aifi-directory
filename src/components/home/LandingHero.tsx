'use client';

import { useEffect, useState } from 'react';

export default function LandingHero() {
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
            className={`text-lg sm:text-xl text-text-muted max-w-2xl leading-relaxed mb-4 transition-all duration-1000 delay-100 ease-out ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            A curated index of companies and autonomous agents building
            the future of finance with artificial intelligence.
          </p>
        </div>
      </div>
    </section>
  );
}
