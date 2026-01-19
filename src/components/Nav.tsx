'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { projects } from '@/lib/data';

export default function Nav() {
  const pathname = usePathname();
  const isDirectory = pathname === '/directory' || pathname?.startsWith('/p/');

  return (
    <header className="border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-lg font-bold text-accent">
              AIFI
            </Link>
            <nav className="flex items-center gap-1">
              <Link
                href="/directory"
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  isDirectory
                    ? 'bg-accent/10 text-accent'
                    : 'text-text-muted hover:text-text-primary hover:bg-surface-2'
                }`}
              >
                Directory
              </Link>
              <Link
                href="/about"
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  pathname === '/about'
                    ? 'bg-accent/10 text-accent'
                    : 'text-text-muted hover:text-text-primary hover:bg-surface-2'
                }`}
              >
                About
              </Link>
            </nav>
          </div>
          <div className="text-xs text-text-muted">
            {projects.length} projects indexed
          </div>
        </div>
      </div>
    </header>
  );
}
