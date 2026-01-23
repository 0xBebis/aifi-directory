import Link from 'next/link';

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

export default function ThesisPage() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-14">
      {/* Timeline Section */}
      <section className="mb-20">
        <p className="label-refined mb-4 text-accent">
          Evolution
        </p>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tighter text-text-primary leading-[1.1] mb-2">
          A Brief History of Financial AI
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
          This is already underway. Machine learning took over credit underwriting.<sup className="text-accent cursor-pointer hover:text-accent-hover"><a href="#fn1">1</a></sup> Fraud detection runs on neural networks.<sup className="text-accent cursor-pointer hover:text-accent-hover"><a href="#fn2">2</a></sup> Trading algorithms execute millions of decisions daily without a person in sight.<sup className="text-accent cursor-pointer hover:text-accent-hover"><a href="#fn3">3</a></sup> The humans who remain handle exceptions. The real work moved.
        </p>

        <p>
          Traditional ML has a fatal flaw though. It decays. Models trained on historical patterns lose their grip as markets evolve. Regimes shift. Correlations break.
        </p>

        <p>
          Long-Term Capital Management had Nobel laureates and the most sophisticated models of its era. It still blew a $4.6 billion hole in the financial system when correlations moved against them.<sup className="text-accent cursor-pointer hover:text-accent-hover"><a href="#fn4">4</a></sup> Knight Capital lost $440 million in 45 minutes.<sup className="text-accent cursor-pointer hover:text-accent-hover"><a href="#fn5">5</a></sup> The quant funds that crashed in August 2007 all held similar positions because they'd learned from the same history.<sup className="text-accent cursor-pointer hover:text-accent-hover"><a href="#fn6">6</a></sup>
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
          Run the story forward and something interesting happens. Autonomous vehicles promise to engineer human error out of driving. Financial AI offers something similar for the economy. Human judgment gave us 2008,<sup className="text-accent cursor-pointer hover:text-accent-hover"><a href="#fn7">7</a></sup> bank runs, pension shortfalls, savings destroyed by risks the experts missed.
        </p>

        <p>
          AI-mediated finance could be safer. Risk priced right. Bubbles spotted early. Crises contained.
        </p>

        <p>
          The result is a flattening. Alpha vanishes because mispricings correct instantly. Volatility dampens because risk gets managed continuously across the whole system. Finance becomes infrastructure. Boring and reliable. The edge stops going to whoever is smartest. It goes to whoever is most connected.
        </p>

        <p>
          Every platform shift creates new giants. Finance has resisted. The same names dominate now that dominated thirty years ago.<sup className="text-accent cursor-pointer hover:text-accent-hover"><a href="#fn8">8</a></sup> AI breaks that. The firms built in the next few years will shape capital flows for the next fifty.
        </p>

        <p>
          The race isn't to build the best model. It's to build the machine that builds the best models.
        </p>

        <p className="text-lg text-text-primary">
          The decisions that matter most now are the ones that take us to the finish line.
        </p>
      </article>

      {/* Footnotes */}
      <aside className="mt-12 pt-8 border-t border-border/30">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-4">References</h3>
        <ol className="space-y-2 text-xs text-text-muted">
          <li id="fn1" className="flex gap-2">
            <span className="text-accent font-medium">1.</span>
            <span>Upstart's AI-native lending model approves 27% more borrowers with 16% lower APRs. <a href="https://www.upstart.com/about" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors">Upstart</a></span>
          </li>
          <li id="fn2" className="flex gap-2">
            <span className="text-accent font-medium">2.</span>
            <span>PayPal reduced fraud rates to under 0.3% using deep learning models. <a href="https://d3.harvard.edu/platform-rctom/submission/paypals-use-of-machine-learning-to-enhance-fraud-detection-and-more/" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors">Harvard Digital Initiative</a></span>
          </li>
          <li id="fn3" className="flex gap-2">
            <span className="text-accent font-medium">3.</span>
            <span>Algorithmic trading accounts for 60-75% of overall trading volume in US equity markets. <a href="https://www.wsj.com/articles/the-quants-run-wall-street-now-1495389108" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors">Wall Street Journal</a></span>
          </li>
          <li id="fn4" className="flex gap-2">
            <span className="text-accent font-medium">4.</span>
            <span>LTCM's collapse required a $3.6B bailout coordinated by the Federal Reserve. <a href="https://en.wikipedia.org/wiki/Long-Term_Capital_Management" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors">Wikipedia</a></span>
          </li>
          <li id="fn5" className="flex gap-2">
            <span className="text-accent font-medium">5.</span>
            <span>Knight Capital's trading glitch resulted in a $440M loss and near-bankruptcy. <a href="https://www.sec.gov/litigation/admin/2013/34-70694.pdf" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors">SEC Filing</a></span>
          </li>
          <li id="fn6" className="flex gap-2">
            <span className="text-accent font-medium">6.</span>
            <span>The August 2007 "Quant Quake" saw quantitative funds lose billions as crowded trades unwound simultaneously. <a href="https://www.aqr.com/Insights/Research/Journal-Article/What-Happened-to-the-Quants-in-August-2007" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors">AQR Research</a></span>
          </li>
          <li id="fn7" className="flex gap-2">
            <span className="text-accent font-medium">7.</span>
            <span>The 2008 financial crisis caused $10+ trillion in global losses and the worst recession since the 1930s. <a href="https://www.federalreservehistory.org/essays/great-recession-and-its-aftermath" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors">Federal Reserve History</a></span>
          </li>
          <li id="fn8" className="flex gap-2">
            <span className="text-accent font-medium">8.</span>
            <span>JPMorgan, Goldman Sachs, and Morgan Stanley have dominated investment banking for over three decades. <a href="https://www.ft.com/content/9f7a582e-c9e8-4c8b-8e33-5b6c5f7e8c8f" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors">Financial Times</a></span>
          </li>
        </ol>
      </aside>

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

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-16" />

      {/* REVISED THESIS */}
      <header className="mb-12">
        <p className="label-refined mb-4 text-amber-500">
          Revised Draft
        </p>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tighter text-text-primary leading-[1.1]">
          The Case for Financial AI
        </h1>
      </header>

      <article className="space-y-5 text-text-secondary leading-relaxed">
        <p className="text-lg text-text-primary">
          Sometime in the next decade, a human will make the last consequential financial decision. Not the last transaction. People will still click buttons and sign papers. But the last one where human judgment was genuinely better than what a machine could do.
        </p>

        <p>
          The first wave of financial AI proved both the promise and the limits. Machine learning now dominates credit underwriting. AI-native lenders like Upstart approve 27% more borrowers at 16% lower rates.<sup className="text-accent cursor-pointer hover:text-accent-hover"><a href="#fn2-1">1</a></sup> Neural networks run fraud detection. PayPal cut fraud below 0.3%.<sup className="text-accent cursor-pointer hover:text-accent-hover"><a href="#fn2-2">2</a></sup> Algorithmic trading accounts for 60-75% of US equity volume.<sup className="text-accent cursor-pointer hover:text-accent-hover"><a href="#fn2-3">3</a></sup> The automation is real, and it works.
        </p>

        <p>
          But traditional ML has a fatal flaw: it's fragile. Models trained on historical patterns degrade as markets evolve. Researchers call this concept drift.<sup className="text-accent cursor-pointer hover:text-accent-hover"><a href="#fn2-4">4</a></sup> The quant funds that crashed in August 2007 held similar positions because they'd learned from the same history.<sup className="text-accent cursor-pointer hover:text-accent-hover"><a href="#fn2-5">5</a></sup> Knight Capital lost $440 million in 45 minutes when its algorithms hit conditions they weren't built for.<sup className="text-accent cursor-pointer hover:text-accent-hover"><a href="#fn2-6">6</a></sup> Long-Term Capital Management had Nobel laureates and still blew a $4.6 billion hole in the system.<sup className="text-accent cursor-pointer hover:text-accent-hover"><a href="#fn2-7">7</a></sup>
        </p>

        <p>
          This is why traditional ML needs humans. Not because humans are smarter. In data-rich domains, they're not. But ML systems can't handle the unprecedented. They ask: have I seen this before? When the answer is no, they fail. Humans stayed in the loop as a backstop against novelty.
        </p>

        <p>
          Large language models change this equation. They reason across domains, interpret ambiguity, and adapt to contexts they've never explicitly seen. Where traditional ML pattern-matches, LLMs understand. They ask: what is this and what should I do?
        </p>

        <p>
          The early concerns were valid. First-generation financial LLMs hallucinated frequently. Early studies found error rates up to 41% on finance queries.<sup className="text-accent cursor-pointer hover:text-accent-hover"><a href="#fn2-8">8</a></sup> But production systems have largely solved this through retrieval-augmented generation, domain-specific fine-tuning, and multi-model consensus architectures.<sup className="text-accent cursor-pointer hover:text-accent-hover"><a href="#fn2-9">9</a></sup> Morgan Stanley deployed GPT-4 to 16,000 wealth advisors.<sup className="text-accent cursor-pointer hover:text-accent-hover"><a href="#fn2-10">10</a></sup> JPMorgan's LLM suite now serves 60,000+ employees.<sup className="text-accent cursor-pointer hover:text-accent-hover"><a href="#fn2-11">11</a></sup> Bloomberg built a 50-billion parameter model trained on 363 billion financial tokens.<sup className="text-accent cursor-pointer hover:text-accent-hover"><a href="#fn2-12">12</a></sup> These aren't experiments. They're infrastructure.
        </p>

        <p>
          The implications are profound. Traditional ML automated the routine and left humans to handle exceptions. LLMs can handle the exceptions too. They read earnings calls, parse regulatory filings, synthesize market sentiment, and explain their reasoning. Tasks that required expensive human analysts. The constraint that kept humans in the loop is dissolving.
        </p>

        <p>
          The competitive dynamics are already shifting. Fintech revenues grew 21% in 2024 versus 6% for incumbents.<sup className="text-accent cursor-pointer hover:text-accent-hover"><a href="#fn2-13">13</a></sup> Digital distribution cuts cost-to-serve by up to 85%.<sup className="text-accent cursor-pointer hover:text-accent-hover"><a href="#fn2-14">14</a></sup> But the real gap is opening in intelligence, not just efficiency. AI-native firms don't just serve customers cheaper. They understand them better. Every interaction generates signal. Better models attract more users. More users generate more data. The flywheel spins.
        </p>

        <p>
          Agentic AI accelerates this further. Gartner predicts 15% of day-to-day work decisions will be made autonomously by AI agents by 2028, up from zero in 2024.<sup className="text-accent cursor-pointer hover:text-accent-hover"><a href="#fn2-15">15</a></sup> One financial services firm already runs 60 autonomous agents in production with plans for 200 more by 2026.<sup className="text-accent cursor-pointer hover:text-accent-hover"><a href="#fn2-16">16</a></sup> Citi Research calls 2025 "the year of Agentic AI" and predicts it will have a bigger impact on finance than the internet.<sup className="text-accent cursor-pointer hover:text-accent-hover"><a href="#fn2-17">17</a></sup>
        </p>

        <p>
          The risks are real but manageable. Concentration could create correlated failures, what researchers call "risk monoculture."<sup className="text-accent cursor-pointer hover:text-accent-hover"><a href="#fn2-18">18</a></sup> Speed could amplify crises.<sup className="text-accent cursor-pointer hover:text-accent-hover"><a href="#fn2-19">19</a></sup> But these are engineering problems, not fundamental limits. The same was said about algorithmic trading, and we developed circuit breakers and safeguards. Financial AI will evolve the same way. Through deployment, learning, and iteration.
        </p>

        <p>
          The talent constraint is temporary. Yes, 73% of financial services leaders cite AI talent scarcity as critical today.<sup className="text-accent cursor-pointer hover:text-accent-hover"><a href="#fn2-20">20</a></sup> But the tools are democratizing rapidly. Fine-tuning costs dropped 99% in two years. Open-source financial models like FinGPT are proliferating.<sup className="text-accent cursor-pointer hover:text-accent-hover"><a href="#fn2-21">21</a></sup> The barrier is shifting from "can you build it" to "can you deploy it responsibly."
        </p>

        <p>
          Every platform shift creates new giants. The PC era created Microsoft. The internet created Google. Mobile created Apple's modern incarnation. Finance has resisted. The same names dominate now that dominated thirty years ago. AI breaks that. The firms built in the next few years will shape capital flows for the next fifty.
        </p>

        <p>
          Run the story forward. AI-mediated finance could be genuinely safer. Risk priced right. Bubbles spotted early. Crises contained. Human judgment gave us 2008.<sup className="text-accent cursor-pointer hover:text-accent-hover"><a href="#fn2-22">22</a></sup> The experts missed the risks that destroyed trillions in savings. AI systems that learn from every decision, improve continuously, and operate without ego or fatigue offer something different. Not perfection, but systematic improvement at scale.
        </p>

        <p>
          The race isn't to build the best model. It's to build the machine that builds the best models. And to deploy it before incumbents wake up.
        </p>

        <p className="text-lg text-text-primary">
          The firms building now will shape capital flows for decades. The rest will be their customers.
        </p>
      </article>

      {/* Revised Thesis Footnotes */}
      <aside className="mt-12 pt-8 border-t border-border/30">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-4">References</h3>
        <ol className="space-y-2 text-xs text-text-muted">
          <li id="fn2-1" className="flex gap-2">
            <span className="text-accent font-medium">1.</span>
            <span>Upstart's AI approves 27% more borrowers with 16% lower APRs. <a href="https://www.upstart.com/about" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors">Upstart</a></span>
          </li>
          <li id="fn2-2" className="flex gap-2">
            <span className="text-accent font-medium">2.</span>
            <span>PayPal reduced fraud rates to under 0.3% using deep learning. <a href="https://d3.harvard.edu/platform-rctom/submission/paypals-use-of-machine-learning-to-enhance-fraud-detection-and-more/" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors">Harvard Digital Initiative</a></span>
          </li>
          <li id="fn2-3" className="flex gap-2">
            <span className="text-accent font-medium">3.</span>
            <span>Algorithmic trading accounts for 60-75% of US equity volume. <a href="https://www.wsj.com/articles/the-quants-run-wall-street-now-1495389108" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors">Wall Street Journal</a></span>
          </li>
          <li id="fn2-4" className="flex gap-2">
            <span className="text-accent font-medium">4.</span>
            <span>Concept drift causes ML model performance to degrade over time. <a href="https://en.wikipedia.org/wiki/Concept_drift" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors">Wikipedia</a></span>
          </li>
          <li id="fn2-5" className="flex gap-2">
            <span className="text-accent font-medium">5.</span>
            <span>August 2007 "Quant Quake" saw funds lose billions from crowded trades. <a href="https://www.aqr.com/Insights/Research/Journal-Article/What-Happened-to-the-Quants-in-August-2007" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors">AQR Research</a></span>
          </li>
          <li id="fn2-6" className="flex gap-2">
            <span className="text-accent font-medium">6.</span>
            <span>Knight Capital lost $440M in 45 minutes from algorithmic failure. <a href="https://www.sec.gov/litigation/admin/2013/34-70694.pdf" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors">SEC Filing</a></span>
          </li>
          <li id="fn2-7" className="flex gap-2">
            <span className="text-accent font-medium">7.</span>
            <span>LTCM's collapse required a $3.6B bailout coordinated by the Federal Reserve. <a href="https://en.wikipedia.org/wiki/Long-Term_Capital_Management" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors">Wikipedia</a></span>
          </li>
          <li id="fn2-8" className="flex gap-2">
            <span className="text-accent font-medium">8.</span>
            <span>Early LLMs hallucinated on up to 41% of finance-related queries. <a href="https://biztechmagazine.com/article/2025/08/llm-hallucinations-what-are-implications-financial-institutions" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors">BizTech Magazine</a></span>
          </li>
          <li id="fn2-9" className="flex gap-2">
            <span className="text-accent font-medium">9.</span>
            <span>RAG and multi-model consensus greatly reduce hallucination in production. <a href="https://blog.chain.link/the-trust-dilemma/" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors">Chainlink Blog</a></span>
          </li>
          <li id="fn2-10" className="flex gap-2">
            <span className="text-accent font-medium">10.</span>
            <span>Morgan Stanley deployed GPT-4 to 16,000 wealth advisors. <a href="https://www.morganstanley.com/press-releases/key-milestone-in-innovation-journey-with-openai" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors">Morgan Stanley</a></span>
          </li>
          <li id="fn2-11" className="flex gap-2">
            <span className="text-accent font-medium">11.</span>
            <span>JPMorgan's AI assistant deployed to 60,000+ employees. <a href="https://www.cnbc.com/2024/08/09/jpmorgan-chase-ai-artificial-intelligence-assistant-chatgpt-openai.html" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors">CNBC</a></span>
          </li>
          <li id="fn2-12" className="flex gap-2">
            <span className="text-accent font-medium">12.</span>
            <span>BloombergGPT: 50B parameters trained on 363B financial tokens. <a href="https://www.bloomberg.com/company/press/bloomberggpt-50-billion-parameter-llm-tuned-finance/" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors">Bloomberg</a></span>
          </li>
          <li id="fn2-13" className="flex gap-2">
            <span className="text-accent font-medium">13.</span>
            <span>Fintech revenues grew 21% in 2024 vs 6% for incumbents. <a href="https://www.bcg.com/publications/2025/fintechs-scaled-winners-emerging-disruptors" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors">BCG</a></span>
          </li>
          <li id="fn2-14" className="flex gap-2">
            <span className="text-accent font-medium">14.</span>
            <span>Digital distribution cuts cost-to-serve by up to 85% (Nubank). <a href="https://www.qedinvestors.com/blog/fintechs-next-chapter-scaled-winners-and-emerging-disruptors-2" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors">QED Investors</a></span>
          </li>
          <li id="fn2-15" className="flex gap-2">
            <span className="text-accent font-medium">15.</span>
            <span>Gartner: 15% of work decisions will be made by AI agents by 2028. <a href="https://aws.amazon.com/blogs/awsmarketplace/agentic-ai-solutions-in-financial-services/" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors">AWS</a></span>
          </li>
          <li id="fn2-16" className="flex gap-2">
            <span className="text-accent font-medium">16.</span>
            <span>One financial firm has 60 AI agents in production, plans 200 more by 2026. <a href="https://www.jbs.cam.ac.uk/2025/from-automation-to-autonomy-the-agentic-ai-era-of-financial-services/" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors">Cambridge Judge Business School</a></span>
          </li>
          <li id="fn2-17" className="flex gap-2">
            <span className="text-accent font-medium">17.</span>
            <span>Citi Research: 2025 is "the year of Agentic AI" with bigger impact than the internet. <a href="https://www.citiwarrants.com/home/upload/citi_research/rsch_pdf_30305836.pdf" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors">Citi Research</a></span>
          </li>
          <li id="fn2-18" className="flex gap-2">
            <span className="text-accent font-medium">18.</span>
            <span>AI concentration creates "risk monoculture" with correlated failures. <a href="https://cepr.org/voxeu/columns/ai-financial-crises" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors">CEPR</a></span>
          </li>
          <li id="fn2-19" className="flex gap-2">
            <span className="text-accent font-medium">19.</span>
            <span>IMF: AI could amplify financial crises. <a href="https://www.imf.org/en/blogs/articles/2024/10/15/artificial-intelligence-can-make-markets-more-efficient-and-more-volatile" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors">IMF Blog</a></span>
          </li>
          <li id="fn2-20" className="flex gap-2">
            <span className="text-accent font-medium">20.</span>
            <span>73% of financial services leaders cite AI talent scarcity as critical. <a href="https://www.weforum.org/stories/2024/12/agentic-ai-financial-services-autonomy-efficiency-and-inclusion/" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors">World Economic Forum</a></span>
          </li>
          <li id="fn2-21" className="flex gap-2">
            <span className="text-accent font-medium">21.</span>
            <span>FinGPT: Open-source financial LLM released by AI4Finance. <a href="https://arxiv.org/abs/2306.06031" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors">arXiv</a></span>
          </li>
          <li id="fn2-22" className="flex gap-2">
            <span className="text-accent font-medium">22.</span>
            <span>The 2008 financial crisis caused $10+ trillion in global losses. <a href="https://www.federalreservehistory.org/essays/great-recession-and-its-aftermath" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors">Federal Reserve History</a></span>
          </li>
        </ol>
      </aside>
    </div>
  );
}
