import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-4">
          Error 404
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary mb-3">
          Page Not Found
        </h1>
        <p className="text-text-muted mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/directory"
            className="px-5 py-2.5 bg-accent text-white text-sm font-medium rounded-md hover:bg-accent-muted transition-colors"
          >
            Browse Directory
          </Link>
          <Link
            href="/"
            className="px-5 py-2.5 bg-surface-2 border border-border text-text-secondary text-sm font-medium rounded-md hover:bg-surface-3 hover:text-text-primary transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
