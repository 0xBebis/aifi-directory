import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-accent mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
        <p className="text-text-muted mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/"
            className="px-6 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/directory"
            className="px-6 py-3 border border-border rounded-lg font-medium hover:bg-surface-2 transition-colors"
          >
            Browse Directory
          </Link>
        </div>
      </div>
    </div>
  );
}
