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
      <body className="min-h-screen bg-background text-text-primary">
        <Nav />
        <main className="pb-16">{children}</main>
        <footer className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/80 backdrop-blur-sm">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>AIFI - AI Finance Index</span>
              <div className="flex items-center gap-4">
                <a href="/about" className="hover:text-text-primary transition-colors">
                  About
                </a>
                <a href="/submit" className="hover:text-text-primary transition-colors">
                  Submit
                </a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
