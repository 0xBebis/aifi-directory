'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Search } from 'lucide-react';

export default function Nav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDirectory = pathname === '/directory' || pathname?.startsWith('/p/');
  const isAgents = pathname === '/agents' || pathname?.startsWith('/agents/');

  const navLinks = [
    { href: '/directory', label: 'Directory', active: isDirectory },
    { href: '/agents', label: 'Agents', active: isAgents },
    { href: '/about', label: 'Thesis', active: pathname === '/about' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/30 bg-background/95 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center group-hover:bg-accent/25 group-hover:shadow-glow transition-all duration-200">
              <span className="text-accent font-bold text-sm tracking-tight">AI</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-text-primary">
              AIFI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium tracking-wide transition-all duration-200 ${
                  link.active
                    ? 'text-accent bg-accent/10'
                    : 'text-text-muted hover:text-text-primary hover:bg-surface-2'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => window.dispatchEvent(new Event('open-search'))}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
              <kbd className="hidden lg:inline-flex px-1.5 py-0.5 text-2xs text-text-faint bg-surface-2 border border-border rounded font-mono">
                Ctrl K
              </kbd>
            </button>
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
        <div className="md:hidden border-t border-border/30 bg-background/98 backdrop-blur-xl">
          <div className="px-8 py-4 space-y-1">
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
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  link.active
                    ? 'text-accent bg-accent/10'
                    : 'text-text-muted hover:text-text-primary hover:bg-surface-2'
                }`}
              >
                {link.label}
              </Link>
            ))}
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
        </div>
      )}
    </header>
  );
}
