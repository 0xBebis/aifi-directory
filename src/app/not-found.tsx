import Link from 'next/link';
import { Building2, BarChart3, Clock, BookOpen, Bot, FileText } from 'lucide-react';

const popularPages = [
  { href: '/directory', label: 'Company Directory', description: 'Browse all AI + Finance companies', icon: Building2 },
  { href: '/stats', label: 'Statistics', description: 'Funding, segments, and AI type breakdowns', icon: BarChart3 },
  { href: '/recent', label: 'Recently Funded', description: 'Latest funding rounds', icon: Clock },
  { href: '/agents', label: 'AI Agents', description: 'Autonomous agents in financial services', icon: Bot },
  { href: '/glossary', label: 'Glossary', description: 'Key terms and definitions', icon: BookOpen },
  { href: '/about', label: 'Thesis', description: 'The history and future of financial AI', icon: FileText },
];

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-8 py-16">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <p className="label-refined mb-4 text-accent">
            Error 404
          </p>
          <h1 className="headline-display mb-4">
            Page Not Found
          </h1>
          <p className="text-lg text-text-muted mb-10 max-w-sm mx-auto leading-relaxed">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/directory"
              className="px-6 py-3 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent-muted transition-all duration-200"
            >
              Browse Directory
            </Link>
            <Link
              href="/"
              className="px-6 py-3 bg-surface-2 border border-border text-text-secondary text-sm font-medium rounded-lg hover:bg-surface-3 hover:text-text-primary transition-all duration-200"
            >
              Go Home
            </Link>
          </div>
        </div>

        {/* Popular Pages */}
        <div className="border-t border-border/30 pt-8">
          <p className="text-sm text-text-faint text-center mb-6">Popular pages you might be looking for</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {popularPages.map((page) => {
              const Icon = page.icon;
              return (
                <Link
                  key={page.href}
                  href={page.href}
                  className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-surface border border-border hover:border-accent/30 transition-all"
                >
                  <div className="w-9 h-9 rounded-lg bg-surface-2 flex items-center justify-center text-text-muted group-hover:text-accent transition-colors shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">{page.label}</p>
                    <p className="text-xs text-text-muted truncate">{page.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
