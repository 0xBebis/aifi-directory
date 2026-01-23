import Link from 'next/link';

// Era definitions
const eras = [
  { id: 'quant', label: 'Quant Era', start: 1982, end: 2011, color: '#60a5fa', description: 'Statistical arbitrage and systematic trading' },
  { id: 'deep-learning', label: 'Deep Learning', start: 2012, end: 2018, color: '#a78bfa', description: 'Neural networks transform credit and fraud' },
  { id: 'nlp', label: 'NLP Era', start: 2019, end: 2022, color: '#4ade80', description: 'Language models read financial text' },
  { id: 'foundation', label: 'Foundation Models', start: 2023, end: 2024, color: '#14b8a6', description: 'LLMs enter the enterprise' },
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
    detail: 'OpenAI and Anthropic invest in financial pre-training. Models understand markets, risk, and capital allocation at expert level.',
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

export default function ThesisPage() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-14">
      {/* Timeline Section */}
      <section className="mb-20">
        <p className="label-refined mb-4 text-accent">
          Evolution
        </p>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tighter text-text-primary leading-[1.1] mb-2">
          AI in Finance: A Technical History
        </h2>
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
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-mono w-10 flex-shrink-0 ${isFeatured ? 'text-accent font-semibold' : 'text-text-muted'}`}>{m.year}</span>
                          <span className={`text-sm font-medium ${isFeatured ? 'text-text-primary' : 'text-text-primary'}`}>{m.event}</span>
                          <span className="text-xs text-text-muted hidden sm:block">—</span>
                          <span className={`text-xs hidden sm:block flex-1 ${isFeatured ? 'text-text-secondary' : 'text-text-muted'}`}>{m.detail}</span>
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
                          {/* Multiple sources - always visible, subtle */}
                          {hasSources && (
                            <div className="flex gap-1.5 flex-shrink-0">
                              {m.sources.map((source: { label: string; url: string }, j: number) => (
                                <a
                                  key={j}
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-text-faint hover:text-accent transition-colors"
                                >
                                  [{source.label}]
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                        {/* Tagline - simple emphasized line */}
                        {hasTagline && (
                          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/50">
                            <span className="w-10 flex-shrink-0" />
                            <span className="text-sm font-semibold text-accent">{m.tagline}</span>
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

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-16" />

      {/* Header */}
      <header className="mb-12">
        <p className="label-refined mb-4 text-accent">
          Thesis
        </p>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tighter text-text-primary leading-[1.1]">
          Toward Financial Emergence
        </h1>
      </header>

      {/* Essay Content */}
      <article className="space-y-5 text-text-secondary leading-relaxed">
        <p className="text-lg text-text-primary">
          Sometime in the next decade, a human will make the last consequential financial decision. Not the last transaction. People will still sign papers and shake hands. But the last one where human judgment was the critical input rather than ceremony.
        </p>

        <p>
          This is already underway. Machine learning took over credit underwriting. Fraud detection runs on neural networks. Trading algorithms execute millions of decisions daily without a person in sight. The humans who remain handle exceptions. The real work moved.
        </p>

        <p>
          Traditional ML has a fatal flaw though. It decays. Models trained on historical patterns lose their grip as markets evolve. Regimes shift. Correlations break.
        </p>

        <p>
          Long-Term Capital Management had Nobel laureates and the most sophisticated models of its era. It still blew a $4.6 billion hole in the financial system when correlations moved against them. Knight Capital lost $440 million in 45 minutes. The quant funds that crashed in August 2007 all held similar positions because they'd learned from the same history.
        </p>

        <p>
          Entropy eats every static model. The question is not if, but when.
        </p>

        <p>
          LLMs are different. They reason across domains, interpret ambiguity, adapt without retraining. Traditional ML asks: have I seen this before? LLMs ask: what is this and what should I do? Previous automation handled routine. This generation handles the unprecedented.
        </p>

        <p>
          Finance is just decision-making under uncertainty. Every role exists because someone must decide how risk moves between parties. For decades humans made these calls with better and better tools. But the human stayed in the loop.
        </p>

        <p>
          That's ending. Properly built AI doesn't just automate decisions. It improves by making them. Every loan, every trade, every claim generates signal. The system learns from thousands of decisions daily. Humans make dozens yearly. The gap widens until human judgment becomes a bottleneck.
        </p>

        <p>
          Most AI efforts stall at the model. A model without distribution is an experiment. With distribution, every decision becomes training. Better performance attracts capital. More capital means more decisions. More decisions mean faster learning. Once this flywheel spins up, you cannot catch it from outside.
        </p>

        <p>
          The constraint is trust. Financial automation fails spectacularly and people remember. AI earns trust slowly by operating within limits and building a track record through crisis. Whoever cracks this owns something nearly impossible to replicate.
        </p>

        <p>
          Run the story forward and something interesting happens. Autonomous vehicles promise to engineer human error out of driving. Financial AI offers something similar for the economy. Human judgment gave us 2008, bank runs, pension shortfalls, savings destroyed by risks the experts missed.
        </p>

        <p>
          AI-mediated finance could be safer. Risk priced right. Bubbles spotted early. Crises contained.
        </p>

        <p>
          The result is a flattening. Alpha vanishes because mispricings correct instantly. Volatility dampens because risk gets managed continuously across the whole system. Finance becomes infrastructure. Boring and reliable. The edge stops going to whoever is smartest. It goes to whoever is most connected.
        </p>

        <p>
          Every platform shift creates new giants. Finance has resisted. The same names dominate now that dominated thirty years ago. AI breaks that. The firms built in the next few years will shape capital flows for the next fifty.
        </p>

        <p>
          The race isn't to build the best model. It's to build the machine that builds the best models.
        </p>

        <p className="text-lg text-text-primary">
          The decisions that matter most now are the ones that take us to the finish line.
        </p>
      </article>

      {/* Footer CTA */}
      <div className="mt-14 pt-8 border-t border-border/30">
        <p className="text-text-muted text-sm mb-5">
          Explore the companies building this future.
        </p>
        <Link
          href="/directory"
          className="inline-flex items-center px-6 py-3 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent-muted transition-all duration-200"
        >
          Browse the Directory
        </Link>
      </div>
    </div>
  );
}
