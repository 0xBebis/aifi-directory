import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-8">
      <div className="text-center">
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
    </div>
  );
}
