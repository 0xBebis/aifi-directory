import Link from 'next/link';
import { Plus, ArrowRight } from 'lucide-react';

export default function CallToAction() {
  return (
    <section className="py-24 px-8">
      <div className="max-w-4xl mx-auto">
        <div className="relative overflow-hidden bg-surface border border-border rounded-2xl p-12 text-center">
          {/* Background glow */}
          <div className="absolute inset-0 bg-glow-center opacity-50" />

          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 text-accent mb-6">
              <Plus className="w-8 h-8" />
            </div>

            <h2 className="headline-section mb-4">
              Know a company we&apos;re missing?
            </h2>

            <p className="text-lg text-text-secondary max-w-xl mx-auto mb-8">
              Help us build the most comprehensive index of AI + Finance companies. Submissions are reviewed and added within 48 hours.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/submit"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-accent text-white font-semibold rounded-xl hover:bg-accent-hover transition-all duration-200"
              >
                Submit a Company
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-8 py-4 bg-surface-2 border border-border text-text-secondary font-semibold rounded-xl hover:text-text-primary hover:border-border transition-all duration-200"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
