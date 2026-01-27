import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import './globals.css';
import Nav from '@/components/Nav';
import JsonLd from '@/components/JsonLd';
import GlobalSearch from '@/components/GlobalSearch';
import ScrollToTop from '@/components/ScrollToTop';
import NewsletterForm from '@/components/NewsletterForm';
import { getSearchableItems } from '@/lib/data';

export const metadata: Metadata = {
  metadataBase: new URL('https://aifimap.com'),
  title: 'AIFI — The Financial AI Landscape',
  description: 'The definitive directory of companies and autonomous AI agents building at the intersection of artificial intelligence and financial services.',
  openGraph: {
    siteName: 'AIFI',
    type: 'website',
    images: [{ url: '/og/default.png', width: 1200, height: 630, alt: 'AIFI — The Financial AI Landscape' }],
  },
  alternates: {
    canonical: './',
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
  // Search engine verification — replace with actual codes after registering
  verification: {
    google: 'GOOGLE_SITE_VERIFICATION_CODE',
    yandex: 'YANDEX_VERIFICATION_CODE',
    other: {
      'msvalidate.01': 'BING_SITE_VERIFICATION_CODE',
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-text-primary flex flex-col">
        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'AIFI',
          url: 'https://aifimap.com',
          description: 'The definitive directory of companies and autonomous AI agents building at the intersection of artificial intelligence and financial services.',
          sameAs: ['https://github.com/0xBebis/aifi-directory'],
        }} />
        <Nav />
        <GlobalSearch items={getSearchableItems()} />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border/30 mt-auto">
          <div className="max-w-7xl mx-auto px-8 py-12">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
              {/* Brand */}
              <div className="col-span-2 sm:col-span-1">
                <Link href="/" className="flex items-center gap-3 mb-3 group">
                  <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center group-hover:bg-accent/25 transition-colors">
                    <span className="text-accent font-bold text-xs">AI</span>
                  </div>
                  <span className="font-semibold text-text-primary">AIFI</span>
                </Link>
                <p className="text-sm text-text-muted max-w-xs leading-relaxed">
                  The definitive index of companies building at the intersection of AI and Finance.
                </p>
              </div>

              {/* Explore */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-text-faint mb-3">Explore</p>
                <div className="flex flex-col gap-2 text-sm">
                  <Link href="/directory" className="text-text-muted hover:text-text-primary transition-colors">Directory</Link>
                  <Link href="/agents" className="text-text-muted hover:text-text-primary transition-colors">Agents</Link>
                  <Link href="/stats" className="text-text-muted hover:text-text-primary transition-colors">Statistics</Link>
                  <Link href="/recent" className="text-text-muted hover:text-text-primary transition-colors">Recently Funded</Link>
                </div>
              </div>

              {/* Learn */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-text-faint mb-3">Learn</p>
                <div className="flex flex-col gap-2 text-sm">
                  <Link href="/about" className="text-text-muted hover:text-text-primary transition-colors">Thesis</Link>
                  <Link href="/glossary" className="text-text-muted hover:text-text-primary transition-colors">Glossary</Link>
                  <Link href="/segments/trading" className="text-text-muted hover:text-text-primary transition-colors">Segments</Link>
                  <Link href="/ai-types/llm" className="text-text-muted hover:text-text-primary transition-colors">AI Types</Link>
                </div>
              </div>

              {/* Community */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-text-faint mb-3">Community</p>
                <div className="flex flex-col gap-2 text-sm">
                  <Link href="/submit" className="text-text-muted hover:text-text-primary transition-colors">Submit a Company</Link>
                  <a href="https://github.com/0xBebis/aifi-directory" target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-text-primary transition-colors">GitHub</a>
                  <Link href="/feed.xml" className="text-text-muted hover:text-text-primary transition-colors">RSS Feed</Link>
                </div>
              </div>
            </div>

            {/* Newsletter */}
            <div className="mt-8 pt-8 border-t border-border/20">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-text-primary">Stay Updated</p>
                  <p className="text-xs text-text-muted mt-0.5">Weekly digest of AI + Finance</p>
                </div>
                <div className="sm:max-w-sm w-full">
                  <NewsletterForm variant="inline" />
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="mt-8 pt-6 border-t border-border/20 flex items-center justify-between">
              <span className="text-xs text-text-faint">
                2025 AIFI. All rights reserved.
              </span>
              <span className="text-xs text-text-faint">
                Built for the AI + Finance ecosystem
              </span>
            </div>
          </div>
        </footer>
        <ScrollToTop />
        <Script
          defer
          data-domain="aifimap.com"
          src="https://plausible.io/js/script.outbound-links.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
