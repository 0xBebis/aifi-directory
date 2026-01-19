import { segments, layers } from '@/lib/data';
import { STAGE_LABELS } from '@/types';

export default function SubmitPage() {
  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold mb-2">Submit a Project</h1>
      <p className="text-text-muted text-sm mb-8">
        Know a company building AI + Finance products? Help us grow the directory.
      </p>

      <form className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1.5">
            Company Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full px-3 py-2 bg-surface border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-accent"
            placeholder="Acme AI"
          />
        </div>

        <div>
          <label htmlFor="website" className="block text-sm font-medium mb-1.5">
            Website *
          </label>
          <input
            type="url"
            id="website"
            name="website"
            required
            className="w-full px-3 py-2 bg-surface border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-accent"
            placeholder="https://example.com"
          />
        </div>

        <div>
          <label htmlFor="tagline" className="block text-sm font-medium mb-1.5">
            One-Line Description *
          </label>
          <input
            type="text"
            id="tagline"
            name="tagline"
            required
            maxLength={140}
            className="w-full px-3 py-2 bg-surface border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-accent"
            placeholder="AI-powered trading platform for retail investors"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="segment" className="block text-sm font-medium mb-1.5">
              Primary Segment *
            </label>
            <select
              id="segment"
              name="segment"
              required
              className="w-full px-3 py-2 bg-surface border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">Select...</option>
              {segments.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="layer" className="block text-sm font-medium mb-1.5">
              Primary Layer *
            </label>
            <select
              id="layer"
              name="layer"
              required
              className="w-full px-3 py-2 bg-surface border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">Select...</option>
              {layers.map((l) => (
                <option key={l.slug} value={l.slug}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="stage" className="block text-sm font-medium mb-1.5">
            Funding Stage
          </label>
          <select
            id="stage"
            name="stage"
            className="w-full px-3 py-2 bg-surface border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="">Select...</option>
            {Object.entries(STAGE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1.5">
            Your Email (optional)
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="w-full px-3 py-2 bg-surface border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-accent"
            placeholder="you@example.com"
          />
          <p className="text-xs text-text-muted mt-1">
            In case we have questions about your submission
          </p>
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2.5 bg-accent text-white rounded font-medium text-sm hover:bg-accent/90 transition-colors"
        >
          Submit Project
        </button>

        <p className="text-xs text-text-muted text-center">
          Submissions are reviewed before being added.
        </p>
      </form>
    </div>
  );
}
