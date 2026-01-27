import Link from 'next/link';
import { ArrowRight, Building2, Bot, FileText } from 'lucide-react';
import { formatFunding } from '@/lib/data';

interface SiteNavProps {
  companyCount: number;
  segmentCount: number;
  layerCount: number;
  totalFunding: number;
  agentCount: number;
  activeAgentCount: number;
  totalCapabilities: number;
}

export default function SiteNav({
  companyCount,
  segmentCount,
  layerCount,
  totalFunding,
  agentCount,
  activeAgentCount,
  totalCapabilities,
}: SiteNavProps) {
  return (
    <section className="px-6 sm:px-8 pb-24">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Directory Card */}
          <Link
            href="/directory"
            className="group relative bg-surface border border-border rounded-2xl p-8 card-hover-glow animate-fade-in-up-slow animate-fill-both"
            style={{ animationDelay: '0ms' }}
          >
            {/* Accent line */}
            <div className="absolute top-0 left-8 right-8 h-[2px] rounded-full bg-accent/60 group-hover:bg-accent transition-colors" />

            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <Building2 className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold text-text-primary group-hover:text-accent transition-colors">
                Directory
              </h2>
            </div>

            <p className="text-sm text-text-secondary leading-relaxed mb-6">
              Browse {companyCount} companies across {segmentCount} market segments
              and {layerCount} technology layers. Interactive market map, AI type
              taxonomy, and full search.
            </p>

            {/* Stats */}
            <div className="flex items-center gap-4 mb-6 text-xs text-text-faint">
              <span><span className="text-text-primary font-semibold">{companyCount}</span> companies</span>
              <span className="text-border">·</span>
              <span><span className="text-accent font-semibold">{formatFunding(totalFunding)}</span> raised</span>
            </div>

            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted group-hover:text-accent transition-colors">
              Explore Directory
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>

          {/* Agents Card */}
          <Link
            href="/agents"
            className="group relative bg-surface border border-border rounded-2xl p-8 card-hover-glow animate-fade-in-up-slow animate-fill-both"
            style={{ animationDelay: '100ms' }}
          >
            {/* Accent line */}
            <div className="absolute top-0 left-8 right-8 h-[2px] rounded-full bg-teal-500/60 group-hover:bg-teal-500 transition-colors" />

            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                <Bot className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold text-text-primary group-hover:text-teal-400 transition-colors">
                Agents
              </h2>
            </div>

            <p className="text-sm text-text-secondary leading-relaxed mb-6">
              Autonomous AI agents operating in financial services.
              Verified capabilities, live activity tracking, and open
              communication protocols.
            </p>

            {/* Stats */}
            <div className="flex items-center gap-4 mb-6 text-xs text-text-faint">
              <span><span className="text-text-primary font-semibold">{agentCount}</span> agents</span>
              <span className="text-border">·</span>
              <span><span className="text-positive font-semibold">{activeAgentCount}</span> active</span>
              <span className="text-border">·</span>
              <span><span className="text-text-primary font-semibold">{totalCapabilities}</span> capabilities</span>
            </div>

            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted group-hover:text-teal-400 transition-colors">
              Browse Agents
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>

          {/* Thesis Card */}
          <Link
            href="/about"
            className="group relative bg-surface border border-border rounded-2xl p-8 card-hover-glow animate-fade-in-up-slow animate-fill-both"
            style={{ animationDelay: '200ms' }}
          >
            {/* Accent line */}
            <div className="absolute top-0 left-8 right-8 h-[2px] rounded-full bg-amber-500/60 group-hover:bg-amber-500 transition-colors" />

            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold text-text-primary group-hover:text-amber-400 transition-colors">
                Thesis
              </h2>
            </div>

            <p className="text-sm text-text-secondary leading-relaxed mb-6">
              From statistical arbitrage to autonomous agents -- a history of
              financial AI and our thesis on why the firms building now will
              shape capital flows for decades.
            </p>

            {/* Stats */}
            <div className="flex items-center gap-4 mb-6 text-xs text-text-faint">
              <span><span className="text-text-primary font-semibold">1982</span>–<span className="text-amber-500 font-semibold">2026</span></span>
              <span className="text-border">·</span>
              <span>5 eras of financial AI</span>
            </div>

            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted group-hover:text-amber-400 transition-colors">
              Read the Thesis
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
