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
        <footer className="border-t border-border/50 mt-auto">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-accent/10 flex items-center justify-center">
                  <span className="text-accent font-bold text-2xs">AI</span>
                </div>
                <span className="text-sm text-text-muted">
                  AI Finance Index
                </span>
              </div>
              <div className="flex items-center gap-6 text-sm text-text-muted">
                <a
                  href="/about"
                  className="hover:text-text-primary transition-colors"
                >
                  About
                </a>
                <a
                  href="/submit"
                  className="hover:text-text-primary transition-colors"
                >
                  Submit
                </a>
                <a
                  href="https://github.com/0xBebis/aifi-directory"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-text-primary transition-colors"
                >
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
