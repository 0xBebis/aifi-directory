'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ── Types ──

interface NavLink {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

interface DirectLink {
  href: string;
  label: string;
}

interface MobileNavProps {
  pathname: string | null;
  directLinks: DirectLink[];
  insightLinks: NavLink[];
  browseLinks: NavLink[];
  aboutLinks: NavLink[];
  isDirectActive: (href: string) => boolean | string | undefined;
  isInsightActive: (href: string) => boolean | string | undefined;
  isBrowseActive: (href: string) => boolean | string | undefined;
  onClose: () => void;
}

// ── Component ──

export default function MobileNav({
  pathname,
  directLinks,
  insightLinks,
  browseLinks,
  aboutLinks,
  isDirectActive,
  isInsightActive,
  isBrowseActive,
  onClose,
}: MobileNavProps) {
  return (
    <nav className="md:hidden border-t border-border/30 bg-background/98 backdrop-blur-xl" aria-label="Mobile navigation">
      <div className="px-6 py-4 space-y-1">
        {/* Search */}
        <button
          onClick={() => {
            onClose();
            window.dispatchEvent(new Event('open-search'));
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
        >
          <Search className="w-4 h-4" />
          Search
        </button>

        {/* Direct links */}
        {directLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              isDirectActive(link.href)
                ? 'text-accent bg-accent/10'
                : 'text-text-muted hover:text-text-primary hover:bg-surface-2'
            }`}
          >
            {link.label}
          </Link>
        ))}

        {/* Insights */}
        <p className="px-3 pt-4 pb-1.5 text-2xs font-semibold uppercase tracking-wider text-text-faint">
          Insights
        </p>
        {insightLinks.map((link) => (
          <MobileItem
            key={link.href}
            link={link}
            active={!!isInsightActive(link.href)}
            onNavigate={onClose}
          />
        ))}

        {/* Browse */}
        <p className="px-3 pt-4 pb-1.5 text-2xs font-semibold uppercase tracking-wider text-text-faint">
          Browse
        </p>
        {browseLinks.map((link) => (
          <MobileItem
            key={link.href}
            link={link}
            active={!!isBrowseActive(link.href)}
            onNavigate={onClose}
          />
        ))}

        {/* About */}
        <p className="px-3 pt-4 pb-1.5 text-2xs font-semibold uppercase tracking-wider text-text-faint">
          About
        </p>
        {aboutLinks.map((link) => (
          <MobileItem
            key={link.href}
            link={link}
            active={pathname === link.href}
            onNavigate={onClose}
          />
        ))}

        {/* Submit */}
        <div className="pt-3">
          <Link
            href="/submit"
            onClick={onClose}
            className={`block px-4 py-3 rounded-lg text-sm font-semibold transition-colors border ${
              pathname === '/submit'
                ? 'text-accent border-accent/30 bg-accent/10'
                : 'text-accent border-accent/20 bg-accent/5'
            }`}
          >
            Submit a Company
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ── Mobile menu item ──

function MobileItem({
  link,
  active,
  onNavigate,
}: {
  link: NavLink;
  active: boolean;
  onNavigate: () => void;
}) {
  const Icon = link.icon;
  return (
    <Link
      href={link.href}
      onClick={onNavigate}
      className={`flex items-start gap-3 px-3 py-3 mx-1 rounded-lg transition-all duration-150 ${
        active
          ? 'bg-accent/[0.08]'
          : 'hover:bg-surface-2'
      }`}
    >
      <div
        className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-150 ${
          active
            ? 'bg-accent/15 text-accent'
            : 'bg-surface-2 text-text-muted'
        }`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0 pt-px">
        <div
          className={`text-sm font-medium leading-tight ${
            active ? 'text-accent' : 'text-text-primary'
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
