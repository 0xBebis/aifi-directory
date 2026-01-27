'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, ExternalLink } from 'lucide-react';

interface AgentHeroProps {
  agentCount: number;
  activeCount: number;
  protocolCount: number;
  capabilityCount: number;
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

  return <span className="tabular-nums">{count}</span>;
}

export default function AgentHero({ agentCount, activeCount, protocolCount, capabilityCount }: AgentHeroProps) {
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
            EIP-8004 Registry
          </p>

          {/* Main headline */}
          <h1
            className={`mb-6 transition-all duration-1000 ease-out ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <span className="block text-[clamp(2.5rem,7vw,5.5rem)] font-extrabold leading-[1.05] tracking-[-0.035em] text-text-primary">
              The Agent
            </span>
            <span className="block text-[clamp(2.5rem,7vw,5.5rem)] font-extrabold leading-[1.05] tracking-[-0.035em]">
              <span className="bg-gradient-to-r from-accent to-teal-400 bg-clip-text text-transparent pr-[0.05em]">
                Registry
              </span>
            </span>
          </h1>

          {/* Subheadline */}
          <p
            className={`text-lg sm:text-xl text-text-muted max-w-2xl leading-relaxed mb-10 transition-all duration-1000 delay-100 ease-out ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            Autonomous AI agents registered on-chain via the{' '}
            <a
              href="https://eips.ethereum.org/EIPS/eip-8004"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent-hover transition-colors"
            >
              EIP-8004
            </a>{' '}
            Trustless Agent Registry. Verified identities, declared capabilities, open protocols.
          </p>

          {/* Stats */}
          <div
            className={`flex items-center gap-6 sm:gap-8 mb-12 text-sm sm:text-base text-text-muted transition-all duration-1000 delay-200 ease-out ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-text-primary font-semibold text-lg sm:text-xl">
                {mounted ? <Counter value={agentCount} duration={1500} /> : '0'}
              </span>
              <span>agents</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-positive font-semibold text-lg sm:text-xl">
                {mounted ? <Counter value={activeCount} duration={1500} /> : '0'}
              </span>
              <span>active</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-text-primary font-semibold text-lg sm:text-xl">
                {mounted ? <Counter value={protocolCount} duration={1500} /> : '0'}
              </span>
              <span>protocols</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-accent font-semibold text-lg sm:text-xl">
                {mounted ? <Counter value={capabilityCount} duration={1500} /> : '0'}
              </span>
              <span>capabilities</span>
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
              <span className="relative">Browse Agents</span>
              <ArrowRight className="relative w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
            </a>

            <a
              href="https://eips.ethereum.org/EIPS/eip-8004"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-medium text-text-secondary hover:text-text-primary transition-colors duration-200"
            >
              Learn about EIP-8004
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
