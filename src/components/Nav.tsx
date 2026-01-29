'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Search, ChevronDown } from 'lucide-react';

const directLinks = [
  { href: '/directory', label: 'Directory' },
  { href: '/agents', label: 'Agents' },
];

const exploreLinks = [
  { href: '/stats', label: 'Statistics' },
  { href: '/recent', label: 'Recently Funded' },
  { href: '/glossary', label: 'Glossary' },
  { href: '/segments/trading', label: 'Segments' },
  { href: '/ai-types/llm', label: 'AI Types' },
];

const aboutLinks = [
  { href: '/about', label: 'Thesis' },
  { href: '/about/history', label: 'History' },
];

export default function Nav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isDirectActive = (href: string) => {
    if (href === '/directory') return pathname === '/directory' || pathname?.startsWith('/p/');
    if (href === '/agents') return pathname === '/agents' || pathname?.startsWith('/agents/');
    return pathname === href;
  };

  const isExploreActive =
    pathname === '/stats' ||
    pathname === '/recent' ||
    pathname === '/glossary' ||
    pathname?.startsWith('/segments/') ||
    pathname?.startsWith('/ai-types/') ||
    pathname?.startsWith('/layers/');

  const isAboutActive = pathname === '/about' || pathname?.startsWith('/about/');

  const linkClass = (active: boolean) =>
    `px-5 py-2.5 rounded-lg text-sm font-medium tracking-wide transition-all duration-200 ${
      active
        ? 'text-accent bg-accent/10'
        : 'text-text-muted hover:text-text-primary hover:bg-surface-2'
    }`;

  const dropdownLinkClass = (active: boolean) =>
    `block px-4 py-2.5 rounded-lg text-sm transition-colors ${
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
                className={linkClass(isDirectActive(link.href))}
              >
                {link.label}
              </Link>
            ))}

            {/* Explore dropdown */}
            <div className="relative group/explore">
              <button
                className={`flex items-center gap-1.5 ${linkClass(isExploreActive)}`}
                aria-expanded="false"
                aria-haspopup="true"
              >
                Explore
                <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-hover/explore:rotate-180" />
              </button>
              <div className="invisible opacity-0 group-hover/explore:visible group-hover/explore:opacity-100 group-focus-within/explore:visible group-focus-within/explore:opacity-100 transition-all duration-200 absolute top-full left-0 mt-1 min-w-[200px] py-2 bg-surface-3 border border-border rounded-xl shadow-elevated z-50">
                {exploreLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={dropdownLinkClass(pathname === link.href || (link.href !== '/stats' && link.href !== '/recent' && link.href !== '/glossary' && pathname?.startsWith(link.href.split('/').slice(0, 2).join('/') + '/')))}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* About dropdown */}
            <div className="relative group/about">
              <button
                className={`flex items-center gap-1.5 ${linkClass(isAboutActive)}`}
                aria-expanded="false"
                aria-haspopup="true"
              >
                About
                <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-hover/about:rotate-180" />
              </button>
              <div className="invisible opacity-0 group-hover/about:visible group-hover/about:opacity-100 group-focus-within/about:visible group-focus-within/about:opacity-100 transition-all duration-200 absolute top-full left-0 mt-1 min-w-[180px] py-2 bg-surface-3 border border-border rounded-xl shadow-elevated z-50">
                {aboutLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={dropdownLinkClass(pathname === link.href)}
                  >
                    {link.label}
                  </Link>
                ))}
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

      {/* Mobile menu */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-border/30 bg-background/98 backdrop-blur-xl" aria-label="Mobile navigation">
          <div className="px-8 py-4 space-y-1">
            {/* Search */}
            <button
              onClick={() => {
                setMobileOpen(false);
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
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isDirectActive(link.href)
                    ? 'text-accent bg-accent/10'
                    : 'text-text-muted hover:text-text-primary hover:bg-surface-2'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Explore section */}
            <p className="px-4 pt-3 pb-1 text-2xs font-semibold uppercase tracking-wider text-text-faint">Explore</p>
            {exploreLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href || pathname?.startsWith(link.href.split('/').slice(0, 2).join('/') + '/')
                    ? 'text-accent bg-accent/10'
                    : 'text-text-muted hover:text-text-primary hover:bg-surface-2'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* About section */}
            <p className="px-4 pt-3 pb-1 text-2xs font-semibold uppercase tracking-wider text-text-faint">About</p>
            {aboutLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'text-accent bg-accent/10'
                    : 'text-text-muted hover:text-text-primary hover:bg-surface-2'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Submit */}
            <Link
              href="/submit"
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-3 rounded-lg text-sm font-semibold transition-colors border ${
                pathname === '/submit'
                  ? 'text-accent border-accent/30 bg-accent/10'
                  : 'text-accent border-accent/20 bg-accent/5'
              }`}
            >
              Submit a Company
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
