import SubmitForm from './SubmitForm';

const webPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Submit a Company — AIFI Map',
  description: 'Submit a financial AI company to the AIFI Map directory. Help us track the companies building AI for financial services.',
  url: 'https://aifimap.com/submit',
  isPartOf: { '@type': 'WebSite', name: 'AIFI Map', url: 'https://aifimap.com' },
};

export default function SubmitPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <div className="max-w-2xl mx-auto px-8 py-14">
        {/* Eyebrow */}
        <p className="label-refined mb-4 text-accent">
          Contribute
        </p>

        <h1 className="headline-display mb-4">
          Submit a Company
        </h1>
        <p className="text-lg text-text-muted mb-6 leading-relaxed">
          Know a company building AI + Finance products? Help us grow the directory by submitting it here.
        </p>

        <div className="mb-10 p-4 rounded-lg border border-accent/20 bg-accent/5">
          <p className="text-sm text-text-secondary">
            <span className="font-semibold text-accent">Note:</span> Submissions are processed via GitHub. You&apos;ll need a{' '}
            <a href="https://github.com/signup" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">GitHub account</a>{' '}
            to complete this form. No GitHub?{' '}
            <a href="mailto:submit@aifimap.com?subject=AIFI%20Map%20Company%20Submission" className="text-accent hover:underline">Email us instead</a>.
          </p>
        </div>

        <SubmitForm />
      </div>
    </>
  );
}
