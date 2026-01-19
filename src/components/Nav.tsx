'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Nav() {
  const pathname = usePathname();
  const isDirectory = pathname === '/directory' || pathname?.startsWith('/p/');

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

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            <Link
              href="/directory"
              className={`px-5 py-2.5 rounded-lg text-sm font-medium tracking-wide transition-all duration-200 ${
                isDirectory
                  ? 'text-accent bg-accent/10'
                  : 'text-text-muted hover:text-text-primary hover:bg-surface-2'
              }`}
            >
              Directory
            </Link>
            <Link
              href="/about"
              className={`px-5 py-2.5 rounded-lg text-sm font-medium tracking-wide transition-all duration-200 ${
                pathname === '/about'
                  ? 'text-accent bg-accent/10'
                  : 'text-text-muted hover:text-text-primary hover:bg-surface-2'
              }`}
            >
              About
            </Link>
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
        </div>
      </div>
    </header>
  );
}
