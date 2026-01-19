import { segments, layers } from '@/lib/data';
import { STAGE_LABELS } from '@/types';

export default function SubmitPage() {
  const inputStyles = "w-full px-4 py-2.5 bg-surface-2 border border-border rounded-md text-sm text-text-primary placeholder:text-text-faint focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors";
  const selectStyles = "w-full px-4 py-2.5 bg-surface-2 border border-border rounded-md text-sm text-text-secondary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors cursor-pointer";
  const labelStyles = "block text-sm font-medium text-text-secondary mb-2";

  return (
    <div className="max-w-lg mx-auto px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-text-primary mb-2">
        Submit a Company
      </h1>
      <p className="text-text-muted mb-8">
        Know a company building AI + Finance products? Help us grow the directory.
      </p>

      <form className="space-y-6">
        <div>
          <label htmlFor="name" className={labelStyles}>
            Company Name <span className="text-accent">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className={inputStyles}
            placeholder="Acme AI"
          />
        </div>

        <div>
          <label htmlFor="website" className={labelStyles}>
            Website <span className="text-accent">*</span>
          </label>
          <input
            type="url"
            id="website"
            name="website"
            required
            className={inputStyles}
            placeholder="https://example.com"
          />
        </div>

        <div>
          <label htmlFor="tagline" className={labelStyles}>
            One-Line Description <span className="text-accent">*</span>
          </label>
          <input
            type="text"
            id="tagline"
            name="tagline"
            required
            maxLength={140}
            className={inputStyles}
            placeholder="AI-powered trading platform for retail investors"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="segment" className={labelStyles}>
              Primary Segment <span className="text-accent">*</span>
            </label>
            <select
              id="segment"
              name="segment"
              required
              className={selectStyles}
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
            <label htmlFor="layer" className={labelStyles}>
              Primary Layer <span className="text-accent">*</span>
            </label>
            <select
              id="layer"
              name="layer"
              required
              className={selectStyles}
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
          <label htmlFor="stage" className={labelStyles}>
            Funding Stage
          </label>
          <select
            id="stage"
            name="stage"
            className={selectStyles}
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
          <label htmlFor="email" className={labelStyles}>
            Your Email <span className="text-text-faint">(optional)</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className={inputStyles}
            placeholder="you@example.com"
          />
          <p className="text-xs text-text-faint mt-2">
            In case we have questions about your submission
          </p>
        </div>

        <button
          type="submit"
          className="w-full px-4 py-3 bg-accent text-white text-sm font-medium rounded-md hover:bg-accent-muted transition-colors"
        >
          Submit Company
        </button>

        <p className="text-xs text-text-faint text-center">
          Submissions are reviewed before being added to the directory.
        </p>
      </form>
    </div>
  );
}
