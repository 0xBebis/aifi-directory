import { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';
import ShareButtons from '@/components/ShareButtons';
import ReadingProgress from '@/components/ReadingProgress';
import { BUILD_DATE_ISO } from '@/lib/data';

export const metadata: Metadata = {
  title: 'A Brief History of Financial AI | AIFI',
  description: 'From statistical arbitrage to autonomous agents: the 5 eras of AI in financial services, from 1982 to 2026. Timeline of key milestones.',
  openGraph: {
    title: 'A Brief History of Financial AI',
    description: 'From statistical arbitrage to autonomous agents: the 5 eras of AI in financial services, from 1982 to 2026.',
    type: 'article',
    siteName: 'AIFI',
    images: [{ url: '/og/default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'A Brief History of Financial AI',
    description: 'From statistical arbitrage to autonomous agents: the 5 eras of AI in financial services.',
    images: ['/og/default.png'],
  },
};

// Era definitions
const eras = [
  { id: 'quant', label: 'Quant Era', start: 1982, end: 2011, color: '#60a5fa', description: 'Statistical arbitrage and systematic trading' },
  { id: 'deep-learning', label: 'Deep Learning', start: 2012, end: 2018, color: '#a78bfa', description: 'Neural networks transform credit and fraud' },
  { id: 'nlp', label: 'NLP Era', start: 2019, end: 2022, color: '#4ade80', description: 'Language models read financial text' },
  { id: 'foundation', label: 'Foundation Models', start: 2023, end: 2024, color: '#f59e0b', description: 'LLMs enter the enterprise' },
  { id: 'emergence', label: 'Emergence', start: 2025, end: 2026, color: '#14b8a6', description: 'AI makes consequential decisions', featured: true },
];

// Milestones grouped by era - focused on AI + Finance intersection
// Every entry verified via web search with source
const milestones = [
  // Quant Era (1982-2011)
  { year: 1982, event: 'Renaissance Technologies', detail: 'Jim Simons founds quantitative trading pioneer', era: 'quant', source: { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Renaissance_Technologies' } },
  { year: 1988, event: 'Medallion Fund', detail: 'Launches with 66% avg annual returns before fees', era: 'quant', source: { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Renaissance_Technologies#Medallion_Fund' } },
  { year: 1988, event: 'D.E. Shaw', detail: 'David Shaw founds computational finance pioneer', era: 'quant', source: { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/D._E._Shaw_%26_Co.' } },
  { year: 2001, event: 'Two Sigma', detail: 'Overdeck and Siegel found ML-native hedge fund', era: 'quant', source: { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Two_Sigma' } },

  // Deep Learning Era (2012-2018)
  { year: 2012, event: 'Upstart founded', detail: 'Ex-Googlers pioneer deep learning for credit decisions', era: 'deep-learning', source: { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Upstart_Holdings' } },
  { year: 2015, event: 'PayPal ML fraud', detail: 'Fraud rate drops below 0.3% using neural networks', era: 'deep-learning', source: { label: 'Harvard', url: 'https://d3.harvard.edu/platform-rctom/submission/paypals-use-of-machine-learning-to-enhance-fraud-detection-and-more/' } },
  { year: 2016, event: 'Deep learning fraud research', detail: 'Fu et al. apply CNNs to 260M bank transactions', era: 'deep-learning', source: { label: 'Springer', url: 'https://link.springer.com/chapter/10.1007/978-3-319-46675-0_8' } },
  { year: 2018, event: 'S&P acquires Kensho', detail: '$550M for AI analytics—largest AI deal at the time', era: 'deep-learning', source: { label: 'TechCrunch', url: 'https://techcrunch.com/2018/03/07/sp-global-snares-kensho-for-550-million/' } },

  // NLP Era (2019-2022)
  { year: 2019, event: 'FinBERT released', detail: 'First finance-specific language model (Araci)', era: 'nlp', source: { label: 'arXiv', url: 'https://arxiv.org/abs/1908.10063' } },
  { year: 2020, event: 'GPT-3 sentiment trading', detail: 'LLM-based strategies outperform traditional NLP', era: 'nlp', source: { label: 'ScienceDirect', url: 'https://www.sciencedirect.com/science/article/pii/S1544612324002575' } },
  { year: 2022, event: 'NLP adoption accelerates', detail: 'Hedge funds deploy transformer models at scale', era: 'nlp', source: { label: 'LSE', url: 'https://eprints.lse.ac.uk/122592/' } },

  // Foundation Models Era (2023-2024)
  { year: 2023, event: 'BloombergGPT', detail: '50B params trained on 363B financial tokens', era: 'foundation', source: { label: 'Bloomberg', url: 'https://www.bloomberg.com/company/press/bloomberggpt-50-billion-parameter-llm-tuned-finance/' } },
  { year: 2023, event: 'Morgan Stanley + OpenAI', detail: 'GPT-4 deployed to 16,000 wealth advisors', era: 'foundation', source: { label: 'Morgan Stanley', url: 'https://www.morganstanley.com/press-releases/key-milestone-in-innovation-journey-with-openai' } },
  { year: 2023, event: 'FinGPT open source', detail: 'AI4Finance releases open financial LLM', era: 'foundation', source: { label: 'arXiv', url: 'https://arxiv.org/abs/2306.06031' } },
  { year: 2024, event: 'JPMorgan LLM Suite', detail: 'AI assistant deployed to 60,000+ employees', era: 'foundation', source: { label: 'CNBC', url: 'https://www.cnbc.com/2024/08/09/jpmorgan-chase-ai-artificial-intelligence-assistant-chatgpt-openai.html' } },

  // Emergence (2025-2026)
  {
    year: 2025,
    event: 'Labs target finance',
    detail: 'OpenAI and Anthropic invest in financial pre-training & build RLHF pipelines. Financial capabilities start to accelerate.',
    era: 'emergence',
    sources: [
      { label: 'OpenAI Finance', url: 'https://openai.com/solutions/industries/financial-services/' },
      { label: 'Claude for Finance', url: 'https://www.anthropic.com/news/claude-for-financial-services' },
      { label: 'LSEG + OpenAI', url: 'https://www.lseg.com/en/media-centre/press-releases/2025/lseg-announces-new-collaboration-with-openai' },
      { label: 'Project Mercury', url: 'https://qz.com/openai-project-mercury-automate-wall-street-investment-banking' },
    ]
  },
  {
    year: 2026,
    event: 'The race begins',
    detail: 'AI systems start making consequential decisions across lending, trading, and risk management.',
    era: 'emergence',
    tagline: 'The firms building now will shape capital flows for decades.',
    featured: true
  },
];

export default function HistoryPage() {
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'A Brief History of Financial AI',
    description: 'From statistical arbitrage to autonomous agents: the 5 eras of AI in financial services, from 1982 to 2026.',
    author: { '@type': 'Organization', name: 'AIFI', url: 'https://aifimap.com' },
    publisher: { '@type': 'Organization', name: 'AIFI', url: 'https://aifimap.com' },
    datePublished: '2025-01-01',
    dateModified: BUILD_DATE_ISO,
    articleSection: 'History',
    mainEntityOfPage: 'https://aifimap.com/about/history',
  };

  return (
    <>
    <JsonLd data={articleJsonLd} />
    <ReadingProgress />
    <div className="max-w-4xl mx-auto px-8 py-14">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[
        { label: 'Thesis', href: '/about' },
        { label: 'History' },
      ]} />

      {/* Share (top) */}
      <div className="mb-8">
        <ShareButtons url="/about/history" title="A Brief History of Financial AI" description="From statistical arbitrage to autonomous agents: the 5 eras of AI in financial services, from 1982 to 2026." />
      </div>

      {/* Timeline Section */}
      <section className="mb-16">
        <p className="label-refined mb-4 text-accent">
          Evolution
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tighter text-text-primary leading-[1.1] mb-2">
          A Brief History of Financial AI
        </h1>
        <p className="text-text-muted text-sm mb-8">
          From statistical arbitrage to financial emergence
        </p>

        {/* Timeline - Grouped by Era */}
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          {eras.map((era) => {
            const eraMilestones = milestones.filter(m => m.era === era.id);
            const isFeatured = 'featured' in era && era.featured;
            return (
              <div
                key={era.id}
                className={`border-b border-border last:border-b-0 ${isFeatured ? 'border-l-2 border-l-accent' : ''}`}
              >
                {/* Era Header */}
                <div
                  className="flex items-center gap-3 px-5 py-3"
                  style={{ backgroundColor: `${era.color}12` }}
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: era.color }}
                  />
                  <span className={`font-semibold text-sm ${isFeatured ? 'text-accent' : 'text-text-primary'}`}>{era.label}</span>
                  <span className={`text-xs font-mono ${isFeatured ? 'text-accent/70' : 'text-text-muted'}`}>{era.start}–{era.end === 2026 ? 'Now' : era.end}</span>
                  <span className={`text-xs ml-auto hidden sm:block ${isFeatured ? 'text-text-secondary' : 'text-text-muted'}`}>{era.description}</span>
                </div>
                {/* Milestones */}
                <div className="px-5 py-3 space-y-1.5">
                  {eraMilestones.map((m, i) => {
                    const hasSources = 'sources' in m && m.sources;
                    const hasTagline = 'tagline' in m && m.tagline;
                    const hasSource = 'source' in m && m.source;

                    return (
                      <div key={i} className="group/row">
                        {/* Standard row - same for all eras */}
                        <div className="flex items-start gap-3">
                          <span className={`text-xs font-mono w-10 flex-shrink-0 mt-0.5 ${isFeatured ? 'text-accent font-semibold' : 'text-text-muted'}`}>{m.year}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-medium ${isFeatured ? 'text-text-primary' : 'text-text-primary'}`}>{m.event}</span>
                              {/* Single source - hover reveal */}
                              {hasSource && (
                                <a
                                  href={m.source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="opacity-0 group-hover/row:opacity-100 text-xs text-text-faint hover:text-accent transition-all flex-shrink-0"
                                >
                                  [{m.source.label}]
                                </a>
                              )}
                            </div>
                            <span className={`text-xs block mt-0.5 ${isFeatured ? 'text-text-secondary' : 'text-text-muted'}`}>{m.detail}</span>
                            {/* Multiple sources - displayed as button row underneath */}
                            {hasSources && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {m.sources.map((source: { label: string; url: string }, j: number) => (
                                  <a
                                    key={j}
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-text-muted bg-surface-2/50 border border-border/50 rounded-md hover:text-accent hover:border-accent/30 hover:bg-accent/5 transition-colors"
                                  >
                                    {source.label}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Tagline - the big conclusion */}
                        {hasTagline && (
                          <div className="flex gap-3 mt-4 pt-4 border-t border-accent/20">
                            <span className="w-10 flex-shrink-0" />
                            <p className="text-base sm:text-lg font-bold bg-gradient-to-r from-accent to-teal-400 bg-clip-text text-transparent tracking-tight">
                              {m.tagline}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Share (bottom) */}
      <div className="flex justify-center mb-10">
        <ShareButtons url="/about/history" title="A Brief History of Financial AI" description="From statistical arbitrage to autonomous agents: the 5 eras of AI in financial services, from 1982 to 2026." />
      </div>

      {/* Where to Go Next */}
      <div className="pt-8 border-t border-border/30">
        <p className="label-refined text-accent mb-3">Continue Reading</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/about"
            className="group bg-surface border border-border rounded-xl p-5 hover:border-accent/30 transition-all"
          >
            <p className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors mb-1">Read the Thesis</p>
            <p className="text-xs text-text-muted">The future of financial AI</p>
          </Link>
          <Link
            href="/directory"
            className="group bg-surface border border-border rounded-xl p-5 hover:border-accent/30 transition-all"
          >
            <p className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors mb-1">Browse the Directory</p>
            <p className="text-xs text-text-muted">All companies in the AI + Finance landscape</p>
          </Link>
        </div>
      </div>
    </div>
    </>
  );
}
