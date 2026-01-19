import type { Metadata } from 'next';
import './globals.css';
import Nav from '@/components/Nav';

export const metadata: Metadata = {
  title: 'AIFI - AI Finance Index',
  description: 'The directory of companies building at the intersection of AI and Finance',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-text-primary flex flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border/30 mt-auto">
          <div className="max-w-7xl mx-auto px-8 py-12">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-8">
              {/* Brand */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
                    <span className="text-accent font-bold text-xs">AI</span>
                  </div>
                  <span className="font-semibold text-text-primary">AIFI</span>
                </div>
                <p className="text-sm text-text-muted max-w-xs leading-relaxed">
                  The definitive index of companies building at the intersection of AI and Finance.
                </p>
              </div>

              {/* Links */}
              <div className="flex items-center gap-8 text-sm">
                <a
                  href="/about"
                  className="text-text-muted hover:text-text-primary transition-colors tracking-wide"
                >
                  About
                </a>
                <a
                  href="/submit"
                  className="text-text-muted hover:text-text-primary transition-colors tracking-wide"
                >
                  Submit
                </a>
                <a
                  href="https://github.com/0xBebis/aifi-directory"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-muted hover:text-text-primary transition-colors tracking-wide"
                >
                  GitHub
                </a>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="mt-10 pt-6 border-t border-border/20 flex items-center justify-between">
              <span className="text-xs text-text-faint">
                2024 AIFI. All rights reserved.
              </span>
              <span className="text-xs text-text-faint">
                Built for the AI + Finance ecosystem
              </span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
