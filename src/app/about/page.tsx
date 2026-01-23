import Link from 'next/link';

// Timeline focused on AI/ML technology evolution in finance
const timeline = {
  eras: [
    {
      id: 'quant',
      label: 'Quant Era',
      range: '1982–2011',
      description: 'Statistical models and early ML. Renaissance, D.E. Shaw, Two Sigma pioneer systematic trading.',
      color: 'text-blue-400',
    },
    {
      id: 'deep-learning',
      label: 'Deep Learning',
      range: '2012–2017',
      description: 'Neural networks take over. Credit scoring, fraud detection, and trading transformed.',
      color: 'text-purple-400',
    },
    {
      id: 'transformers',
      label: 'Transformers',
      range: '2017–2022',
      description: 'Attention mechanisms enable NLP breakthroughs. FinBERT brings language models to finance.',
      color: 'text-green-400',
    },
    {
      id: 'foundation',
      label: 'Foundation Models',
      range: '2023–Now',
      description: 'Labs race to finance. OpenAI and Anthropic train on financial data, hire quants, and ship vertical products.',
      color: 'text-accent',
    },
  ],
  milestones: [
    { year: 1982, event: 'Renaissance founded', detail: 'Quant trading pioneers' },
    { year: 2001, event: 'Two Sigma founded', detail: 'ML-native hedge fund' },
    { year: 2012, event: 'AlexNet wins ImageNet', detail: 'Deep learning era begins' },
    { year: 2017, event: 'Transformers published', detail: 'Attention architecture' },
    { year: 2019, event: 'FinBERT released', detail: 'Finance-specific NLP' },
    { year: 2022, event: 'ChatGPT launches', detail: '100M users in 60 days' },
    { year: 2023, event: 'BloombergGPT ships', detail: '50B param finance LLM' },
    { year: 2024, event: 'AI agents emerge', detail: 'Autonomous finance' },
  ],
  recentMilestones: [
    {
      year: 2025,
      event: 'Labs target finance',
      detail: 'OpenAI and Anthropic invest heavily in financial pre-training data and post-training for financial reasoning. Models begin to understand markets, risk, and capital allocation at expert level.',
      sources: [
        { label: 'OpenAI Financial Services', url: 'https://openai.com/solutions/industries/financial-services/' },
        { label: 'Claude for Finance', url: 'https://www.anthropic.com/news/claude-for-financial-services' },
        { label: 'LSEG Partnership', url: 'https://www.lseg.com/en/media-centre/press-releases/2025/lseg-announces-new-collaboration-with-openai' },
        { label: 'Project Mercury', url: 'https://qz.com/openai-project-mercury-automate-wall-street-investment-banking' },
      ]
    },
    {
      year: 2026,
      event: 'The race begins',
      detail: 'Financial emergence accelerates. AI systems start making consequential decisions across lending, trading, and risk management.',
      tagline: 'The firms building now will shape capital flows for decades.'
    },
  ],
  breakthroughs: [
    { name: 'Medallion Fund', stat: '66%', context: 'Avg annual return (before fees) using ML' },
    { name: 'Deep Learning', stat: '20%', context: 'Improvement in credit scoring vs FICO' },
    { name: 'ChatGPT', stat: '35%', context: 'Better sentiment analysis than FinBERT' },
    { name: 'Quant Share', stat: '60%', context: 'Of daily US equity volume is algorithmic' },
  ],
};

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
        <p className="text-text-muted text-sm mb-10">
          From statistical arbitrage to foundation models
        </p>

        {/* Eras */}
        <div className="grid grid-cols-4 gap-3 mb-10">
          {timeline.eras.map((era) => (
            <div key={era.id} className="bg-surface border border-border rounded-lg p-4">
              <p className={`text-xs font-semibold tracking-wide mb-1 ${era.color}`}>{era.range}</p>
              <p className="text-sm font-semibold text-text-primary mb-2">{era.label}</p>
              <p className="text-xs text-text-muted leading-relaxed">{era.description}</p>
            </div>
          ))}
        </div>

        {/* Milestones */}
        <div className="bg-surface border border-border rounded-lg p-5 mb-4">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-4">Key Milestones</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
            {timeline.milestones.map((m, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-accent font-mono w-9 shrink-0">{m.year}</span>
                <span className="text-sm text-text-primary whitespace-nowrap">{m.event}</span>
                <span className="text-xs text-text-muted truncate">{m.detail}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Milestones - Emphasized */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {timeline.recentMilestones.map((m) => (
            <div
              key={m.year}
              className={`border rounded-lg p-5 transition-all ${
                m.year === 2026
                  ? 'border-accent bg-accent/10'
                  : 'bg-surface border-border'
              }`}
              style={m.year === 2026 ? {
                animation: 'glow-pulse 3s ease-in-out infinite',
              } : undefined}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-lg font-bold font-mono ${m.year === 2026 ? 'text-accent' : 'text-text-primary'}`}>
                  {m.year}
                </span>
                <span className={`text-sm font-semibold ${m.year === 2026 ? 'text-accent' : 'text-text-primary'}`}>
                  {m.event}
                </span>
              </div>
              <p className={`text-sm leading-relaxed ${m.year === 2026 ? 'text-text-primary' : 'text-text-secondary'}`}>{m.detail}</p>
              {m.tagline && (
                <p className="mt-5 pt-4 border-t border-accent/20 text-base font-semibold text-text-primary leading-snug">
                  {m.tagline}
                </p>
              )}
              {m.sources && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {m.sources.map((source, i) => (
                    <a
                      key={i}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-text-muted bg-surface-2 hover:bg-surface-3 hover:text-text-primary border border-border/50 rounded-md transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      {source.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Breakthroughs */}
        <div className="bg-surface border border-border rounded-lg p-5">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-4">Performance Breakthroughs</p>
          <div className="grid grid-cols-4 gap-4">
            {timeline.breakthroughs.map((b) => (
              <div key={b.name} className="text-center">
                <p className="text-xl font-bold text-accent">{b.stat}</p>
                <p className="text-sm text-text-primary font-medium">{b.name}</p>
                <p className="text-xs text-text-muted mt-1">{b.context}</p>
              </div>
            ))}
          </div>
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
