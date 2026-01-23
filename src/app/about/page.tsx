import Link from 'next/link';

export default function ThesisPage() {
  return (
    <div className="max-w-2xl mx-auto px-8 py-14">
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
