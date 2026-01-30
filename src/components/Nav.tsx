'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  Menu, X, Search, ChevronDown,
  BarChart3, TrendingUp, SlidersHorizontal, BookOpen, Clock, FileText,
  Grid3X3, Brain, Layers, Globe, Lightbulb,
} from 'lucide-react';
import MobileNav from '@/components/MobileNav';

// ── Link definitions ──

interface NavLink {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

const directLinks = [
  { href: '/directory', label: 'Directory' },
  { href: '/agents', label: 'Agents' },
  { href: '/blog', label: 'Blog' },
];

const insightLinks: NavLink[] = [
  { href: '/stats', label: 'Statistics', description: 'Key funding & company metrics', icon: BarChart3 },
  { href: '/market-report', label: 'Market Report', description: 'Industry trends & analysis', icon: TrendingUp },
  { href: '/compare', label: 'Comparisons', description: 'Side-by-side AI tech analysis', icon: SlidersHorizontal },
  { href: '/what-is-financial-ai', label: 'What is Financial AI?', description: 'Definition & comprehensive guide', icon: BookOpen },
  { href: '/recent', label: 'Recently Funded', description: 'Latest funding rounds', icon: Clock },
  { href: '/glossary', label: 'Glossary', description: 'Key terms & definitions', icon: FileText },
];

const browseLinks: NavLink[] = [
  { href: '/segments/trading', label: 'Segments', description: '9 market categories', icon: Grid3X3 },
  { href: '/ai-types/llm', label: 'AI Types', description: '8 AI technology classes', icon: Brain },
  { href: '/layers/applications', label: 'Layers', description: '5 tech stack positions', icon: Layers },
  { href: '/regions/americas', label: 'Regions', description: '3 global markets', icon: Globe },
];

const aboutLinks: NavLink[] = [
  { href: '/about', label: 'Thesis', description: 'Our vision for financial AI', icon: Lightbulb },
  { href: '/about/history', label: 'History', description: 'Evolution of AI in finance', icon: Clock },
];

// ── Component ──

export default function Nav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Active-state helpers
  const isDirectActive = (href: string) => {
    if (href === '/directory') return pathname === '/directory' || pathname?.startsWith('/p/');
    if (href === '/agents') return pathname === '/agents' || pathname?.startsWith('/agents/');
    if (href === '/blog') return pathname === '/blog' || pathname?.startsWith('/blog/');
    return pathname === href;
  };

  const isExploreActive =
    pathname === '/stats' ||
    pathname === '/market-report' ||
    pathname === '/what-is-financial-ai' ||
    pathname === '/recent' ||
    pathname === '/glossary' ||
    pathname?.startsWith('/compare') ||
    pathname?.startsWith('/segments/') ||
    pathname?.startsWith('/ai-types/') ||
    pathname?.startsWith('/layers/') ||
    pathname?.startsWith('/regions/');

  const isAboutActive = pathname === '/about' || pathname?.startsWith('/about/');

  const isInsightActive = (href: string) =>
    pathname === href || pathname?.startsWith(href + '/');

  const isBrowseActive = (href: string) =>
    pathname?.startsWith(href.split('/').slice(0, 2).join('/') + '/');

  // Style helpers
  const topLinkClass = (active: boolean) =>
    `px-5 py-2.5 rounded-lg text-sm font-medium tracking-wide transition-all duration-200 ${
      active
        ? 'text-accent bg-accent/10'
        : 'text-text-muted hover:text-text-primary hover:bg-surface-2'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-border/30 bg-background/95 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group"
            aria-label="AIFI Map Home"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt=""
              className="h-8 w-auto group-hover:opacity-80 transition-opacity duration-200"
            />
            <span className="text-xl font-bold tracking-tight text-text-primary">
              AIFI Map
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {/* Direct links */}
            {directLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={topLinkClass(isDirectActive(link.href))}
              >
                {link.label}
              </Link>
            ))}

            {/* ── Explore mega menu ── */}
            <div className="relative group/explore">
              <button
                className={`flex items-center gap-1.5 ${topLinkClass(isExploreActive)}`}
                aria-expanded="false"
                aria-haspopup="true"
              >
                Explore
                <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-hover/explore:rotate-180" />
              </button>

              <div className="invisible opacity-0 group-hover/explore:visible group-hover/explore:opacity-100 group-focus-within/explore:visible group-focus-within/explore:opacity-100 transition-all duration-200 absolute top-full left-1/2 -translate-x-1/2 mt-2 p-4 bg-surface-3 border border-border rounded-xl shadow-elevated z-50">
                <div className="flex gap-6" style={{ width: 520 }}>
                  {/* Insights column */}
                  <div className="flex-1 space-y-0.5">
                    <p className="px-3 pb-2 text-2xs font-semibold uppercase tracking-wider text-text-faint">
                      Insights
                    </p>
                    {insightLinks.map((link) => {
                      const active = isInsightActive(link.href);
                      return (
                        <DropdownItem key={link.href} link={link} active={active} />
                      );
                    })}
                  </div>

                  {/* Divider */}
                  <div className="w-px bg-border/40 my-1" />

                  {/* Browse column */}
                  <div className="flex-1 space-y-0.5">
                    <p className="px-3 pb-2 text-2xs font-semibold uppercase tracking-wider text-text-faint">
                      Browse
                    </p>
                    {browseLinks.map((link) => {
                      const active = isBrowseActive(link.href);
                      return (
                        <DropdownItem key={link.href} link={link} active={active} />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* ── About dropdown ── */}
            <div className="relative group/about">
              <button
                className={`flex items-center gap-1.5 ${topLinkClass(isAboutActive)}`}
                aria-expanded="false"
                aria-haspopup="true"
              >
                About
                <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-hover/about:rotate-180" />
              </button>

              <div className="invisible opacity-0 group-hover/about:visible group-hover/about:opacity-100 group-focus-within/about:visible group-focus-within/about:opacity-100 transition-all duration-200 absolute top-full right-0 mt-2 w-[280px] p-3 bg-surface-3 border border-border rounded-xl shadow-elevated z-50">
                <div className="space-y-0.5">
                  {aboutLinks.map((link) => {
                    const active = pathname === link.href;
                    return (
                      <DropdownItem key={link.href} link={link} active={active} />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Search */}
            <button
              onClick={() => window.dispatchEvent(new Event('open-search'))}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
              <kbd className="hidden lg:inline-flex px-1.5 py-0.5 text-2xs text-text-faint bg-surface-2 border border-border rounded font-mono" translate="no">
                Ctrl K
              </kbd>
            </button>

            {/* Submit CTA */}
            <Link
              href="/submit"
              className={`ml-3 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 border ${
                pathname === '/submit'
                  ? 'text-accent border-accent/30 bg-accent/10'
                  : 'text-accent border-accent/20 bg-accent/5 hover:bg-accent hover:text-white hover:border-accent'
              }`}
            >
              Submit
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <MobileNav
          pathname={pathname}
          directLinks={directLinks}
          insightLinks={insightLinks}
          browseLinks={browseLinks}
          aboutLinks={aboutLinks}
          isDirectActive={isDirectActive}
          isInsightActive={isInsightActive}
          isBrowseActive={isBrowseActive}
          onClose={() => setMobileOpen(false)}
        />
      )}
    </header>
  );
}

// ── Desktop dropdown item ──

function DropdownItem({ link, active }: { link: NavLink; active: boolean }) {
  const Icon = link.icon;
  return (
    <Link
      href={link.href}
      className={`group/item flex items-start gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
        active
          ? 'bg-accent/[0.08]'
          : 'hover:bg-surface-2'
      }`}
    >
      <div
        className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150 ${
          active
            ? 'bg-accent/15 text-accent'
            : 'bg-surface-2 text-text-muted group-hover/item:bg-accent/10 group-hover/item:text-accent'
        }`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0 pt-px">
        <div
          className={`text-sm font-medium leading-tight transition-colors duration-150 ${
            active
              ? 'text-accent'
              : 'text-text-primary group-hover/item:text-accent'
          }`}
        >
          {link.label}
        </div>
        <div className="text-xs text-text-faint mt-0.5 leading-snug">
          {link.description}
        </div>
      </div>
    </Link>
  );
}
