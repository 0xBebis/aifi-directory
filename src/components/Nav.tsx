'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Nav() {
  const pathname = usePathname();
  const isDirectory = pathname === '/directory' || pathname?.startsWith('/p/');

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <span className="text-accent font-bold text-sm">AI</span>
            </div>
            <span className="text-lg font-semibold tracking-tight text-text-primary">
              AIFI
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            <Link
              href="/directory"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isDirectory
                  ? 'text-accent bg-accent/10'
                  : 'text-text-muted hover:text-text-primary hover:bg-surface-2'
              }`}
            >
              Directory
            </Link>
            <Link
              href="/about"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === '/about'
                  ? 'text-accent bg-accent/10'
                  : 'text-text-muted hover:text-text-primary hover:bg-surface-2'
              }`}
            >
              About
            </Link>
            <Link
              href="/submit"
              className={`ml-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                pathname === '/submit'
                  ? 'text-accent border-accent/30 bg-accent/10'
                  : 'text-text-muted border-border hover:text-text-primary hover:border-border hover:bg-surface-2'
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
