import { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';
import ShareButtons from '@/components/ShareButtons';
import ReadingProgress from '@/components/ReadingProgress';
import { BUILD_DATE_ISO } from '@/lib/data';

export const metadata: Metadata = {
  title: 'The Future of Financial AI — Thesis | AIFI Map',
  description: 'Why AI will reshape financial services: from LLMs to autonomous agents. A thesis on how AI replaces human judgment in lending, trading, and risk management.',
  openGraph: {
    title: 'The Future of Financial AI — Thesis',
    description: 'Why AI will reshape financial services: from LLMs to autonomous agents.',
    type: 'article',
    siteName: 'AIFI Map',
    images: [{ url: '/og/default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Future of Financial AI — Thesis',
    description: 'Why AI will reshape financial services: from LLMs to autonomous agents.',
    images: ['/og/default.png'],
  },
};

export default function ThesisPage() {
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'The Future of Financial AI',
    description: 'Why AI will reshape financial services: from LLMs to autonomous agents. A thesis on how AI replaces human judgment in lending, trading, and risk management.',
    author: { '@type': 'Organization', name: 'AIFI Map', url: 'https://aifimap.com' },
    publisher: { '@type': 'Organization', name: 'AIFI Map', url: 'https://aifimap.com' },
    datePublished: '2025-01-01',
    dateModified: BUILD_DATE_ISO,
    articleSection: 'Thesis',
    mainEntityOfPage: 'https://aifimap.com/about',
  };

  return (
    <>
    <JsonLd data={articleJsonLd} />
    <ReadingProgress />
    <div className="max-w-4xl mx-auto px-8 py-14">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[
        { label: 'Thesis' },
      ]} />

      {/* Share (top) */}
      <div className="mb-8">
        <ShareButtons url="/about" title="The Future of Financial AI" description="Why AI will reshape financial services: from LLMs to autonomous agents." />
      </div>

      {/* Thesis Header */}
      <header className="mb-12">
        <p className="label-refined mb-4 text-accent">
          Thesis
        </p>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tighter text-text-primary leading-[1.1]">
          The Future of Financial AI
        </h1>
      </header>

      <article className="space-y-5 text-text-secondary leading-relaxed">
        <p className="text-lg text-text-primary">
          Sometime in the next decade, a human will make the last consequential financial decision. People will still click buttons and sign papers, but the areas where a human's judgment was better than machine's are becoming fewer and further between.
        </p>

        <p>
          The first wave of financial AI proved both the promise and the limits. Machine learning now dominates credit underwriting. AI-native lenders like Upstart approve 27% more borrowers at 16% lower rates.<sup className="text-accent cursor-pointer hover:text-accent-hover"><a href="#fn-1">1</a></sup> Neural networks run fraud detection. PayPal cut fraud below 0.3%.<sup className="text-accent cursor-pointer hover:text-accent-hover"><a href="#fn-2">2</a></sup> Algorithmic trading accounts for 60-75% of US equity volume.<sup className="text-accent cursor-pointer hover:text-accent-hover"><a href="#fn-3">3</a></sup>.
        </p>

        <p>
          But traditional ML has a fatal flaw: it's fragile. Models trained on historical patterns degrade as markets evolve. Researchers call this concept drift.<sup className="text-accent cursor-pointer hover:text-accent-hover"><a href="#fn-4">4</a></sup> The quant funds that crashed in August 2007 held similar positions because they'd learned from the same history.<sup className="text-accent cursor-pointer hover:text-accent-hover"><a href="#fn-5">5</a></sup> Knight Capital lost $440 million in 45 minutes when its algorithms hit conditions they weren't built for.<sup className="text-accent cursor-pointer hover:text-accent-hover"><a href="#fn-6">6</a></sup> Long-Term Capital Management had Nobel laureates and still blew a $4.6 billion hole in the system.<sup className="text-accent cursor-pointer hover:text-accent-hover"><a href="#fn-7">7</a></sup>
        </p>

        <p>
          This is why traditional ML needs humans today. Not because humans are smarter; in data-rich domains, they're not. But ML systems can't handle the unprecedented. They ask: have I seen this before? When the answer is no, they fail. Humans stayed in the loop as a backstop against novelty.
        </p>

        <p>
          Large language models change this equation. They reason across domains, interpret ambiguity, and adapt to contexts they've never explicitly seen. Where traditional ML pattern-matches, LLMs understand. They ask: what is this and what should I do?
        </p>

        <p>
          In 2026, production systems have largely solved problems like hallucination through context engineering, domain-specific fine-tuning, and multi-model consensus architectures.<sup className="text-accent cursor-pointer hover:text-accent-hover"><a href="#fn-8">8</a></sup> Morgan Stanley deployed GPT-4 to 16,000 wealth advisors.<sup className="text-accent cursor-pointer hover:text-accent-hover"><a href="#fn-9">9</a></sup> JPMorgan's LLM suite now serves 60,000+ employees.<sup className="text-accent cursor-pointer hover:text-accent-hover"><a href="#fn-10">10</a></sup> Bloomberg built a 50-billion parameter model trained on 363 billion financial tokens.<sup className="text-accent cursor-pointer hover:text-accent-hover"><a href="#fn-11">11</a></sup> Financial LLMs are quickly moving beyond experimentation.
        </p>

        <p>
          The implications are profound. Traditional ML automated the routine and left humans to handle exceptions. LLMs can handle these exceptions too, but faster and at a greater scale. They read earnings calls, parse regulatory filings, synthesize market sentiment, and can share their reasoning across myriad systems and stakeholders within seconds. The constraints separating human and machine intelligence are dissolving.
        </p>

        <p>
          Agentic AI accelerates this further. Gartner predicts 15% of day-to-day work decisions will be made autonomously by AI agents by 2028, up from zero in 2024.<sup className="text-accent cursor-pointer hover:text-accent-hover"><a href="#fn-12">12</a></sup> One financial services firm already runs 60 autonomous agents in production with plans for 200 more by 2026.<sup className="text-accent cursor-pointer hover:text-accent-hover"><a href="#fn-13">13</a></sup> Citi Research predicts Agentic AI will have a bigger impact on finance than the internet.<sup className="text-accent cursor-pointer hover:text-accent-hover"><a href="#fn-14">14</a></sup>
        </p>

        <p>
          The risks are real but manageable. Concentration could create correlated failures, what researchers call "risk monoculture."<sup className="text-accent cursor-pointer hover:text-accent-hover"><a href="#fn-15">15</a></sup> Speed could amplify crises.<sup className="text-accent cursor-pointer hover:text-accent-hover"><a href="#fn-16">16</a></sup> But these are engineering problems, not fundamental limits. The same was said about algorithmic trading, and we developed circuit breakers and safeguards. Financial AI will evolve the same way. Through deployment, learning, and iteration.
        </p>

        <p>
          Every platform shift creates new giants. The PC era created Microsoft. The internet created Google. Mobile created Apple's modern incarnation. Finance has resisted. The same names dominate now that dominated thirty years ago. AI breaks that. The firms built in the next few years will shape capital flows for the next fifty.
        </p>

        <p>
          Run the story forward. AI-mediated finance could be genuinely safer. Risk priced right. Bubbles spotted early. Crises contained. Human judgment gave us 2008.<sup className="text-accent cursor-pointer hover:text-accent-hover"><a href="#fn-17">17</a></sup> The experts missed the risks that destroyed trillions in savings. AI systems that learn from every decision, improve continuously, and operate without ego or fatigue offer something different. Not perfection, but systematic improvement at scale.
        </p>

        <p>
          The race isn't to build the best model. It's to build the machine that builds the best models. And to deploy it before incumbents wake up.
        </p>

        <p className="text-lg text-text-primary">
          The firms building now will shape capital flows for decades. The rest will be their customers.
        </p>
      </article>

      {/* Footnotes */}
      <aside className="mt-12 pt-8 border-t border-border/30">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-4">References</h3>
        <ol className="space-y-2 text-xs text-text-muted">
          <li id="fn-1" className="flex gap-2">
            <span className="text-accent font-medium">1.</span>
            <span>Upstart's AI approves 27% more borrowers with 16% lower APRs. <a href="https://www.upstart.com/about" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors">Upstart</a></span>
          </li>
          <li id="fn-2" className="flex gap-2">
            <span className="text-accent font-medium">2.</span>
            <span>PayPal reduced fraud rates to under 0.3% using deep learning. <a href="https://d3.harvard.edu/platform-rctom/submission/paypals-use-of-machine-learning-to-enhance-fraud-detection-and-more/" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors">Harvard Digital Initiative</a></span>
          </li>
          <li id="fn-3" className="flex gap-2">
            <span className="text-accent font-medium">3.</span>
            <span>Algorithmic trading accounts for 60-75% of US equity volume. <a href="https://www.wsj.com/articles/the-quants-run-wall-street-now-1495389108" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors">Wall Street Journal</a></span>
          </li>
          <li id="fn-4" className="flex gap-2">
            <span className="text-accent font-medium">4.</span>
            <span>Concept drift causes ML model performance to degrade over time. <a href="https://en.wikipedia.org/wiki/Concept_drift" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors">Wikipedia</a></span>
          </li>
          <li id="fn-5" className="flex gap-2">
            <span className="text-accent font-medium">5.</span>
            <span>August 2007 "Quant Quake" saw funds lose billions from crowded trades. <a href="https://www.aqr.com/Insights/Research/Journal-Article/What-Happened-to-the-Quants-in-August-2007" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors">AQR Research</a></span>
          </li>
          <li id="fn-6" className="flex gap-2">
            <span className="text-accent font-medium">6.</span>
            <span>Knight Capital lost $440M in 45 minutes from algorithmic failure. <a href="https://www.sec.gov/litigation/admin/2013/34-70694.pdf" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors">SEC Filing</a></span>
          </li>
          <li id="fn-7" className="flex gap-2">
            <span className="text-accent font-medium">7.</span>
            <span>LTCM's collapse required a $3.6B bailout coordinated by the Federal Reserve. <a href="https://en.wikipedia.org/wiki/Long-Term_Capital_Management" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors">Wikipedia</a></span>
          </li>
          <li id="fn-8" className="flex gap-2">
            <span className="text-accent font-medium">8.</span>
            <span>RAG and multi-model consensus greatly reduce hallucination in production. <a href="https://blog.chain.link/the-trust-dilemma/" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors">Chainlink Blog</a></span>
          </li>
          <li id="fn-9" className="flex gap-2">
            <span className="text-accent font-medium">9.</span>
            <span>Morgan Stanley deployed GPT-4 to 16,000 wealth advisors. <a href="https://www.morganstanley.com/press-releases/key-milestone-in-innovation-journey-with-openai" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors">Morgan Stanley</a></span>
          </li>
          <li id="fn-10" className="flex gap-2">
            <span className="text-accent font-medium">10.</span>
            <span>JPMorgan's AI assistant deployed to 60,000+ employees. <a href="https://www.cnbc.com/2024/08/09/jpmorgan-chase-ai-artificial-intelligence-assistant-chatgpt-openai.html" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors">CNBC</a></span>
          </li>
          <li id="fn-11" className="flex gap-2">
            <span className="text-accent font-medium">11.</span>
            <span>BloombergGPT: 50B parameters trained on 363B financial tokens. <a href="https://www.bloomberg.com/company/press/bloomberggpt-50-billion-parameter-llm-tuned-finance/" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors">Bloomberg</a></span>
          </li>
          <li id="fn-12" className="flex gap-2">
            <span className="text-accent font-medium">12.</span>
            <span>Gartner: 15% of work decisions will be made by AI agents by 2028. <a href="https://aws.amazon.com/blogs/awsmarketplace/agentic-ai-solutions-in-financial-services/" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors">AWS</a></span>
          </li>
          <li id="fn-13" className="flex gap-2">
            <span className="text-accent font-medium">13.</span>
            <span>One financial firm has 60 AI agents in production, plans 200 more by 2026. <a href="https://www.jbs.cam.ac.uk/2025/from-automation-to-autonomy-the-agentic-ai-era-of-financial-services/" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors">Cambridge Judge Business School</a></span>
          </li>
          <li id="fn-14" className="flex gap-2">
            <span className="text-accent font-medium">14.</span>
            <span>Citi Research: 2025 is "the year of Agentic AI" with bigger impact than the internet. <a href="https://www.citiwarrants.com/home/upload/citi_research/rsch_pdf_30305836.pdf" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors">Citi Research</a></span>
          </li>
          <li id="fn-15" className="flex gap-2">
            <span className="text-accent font-medium">15.</span>
            <span>AI concentration creates "risk monoculture" with correlated failures. <a href="https://cepr.org/voxeu/columns/ai-financial-crises" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors">CEPR</a></span>
          </li>
          <li id="fn-16" className="flex gap-2">
            <span className="text-accent font-medium">16.</span>
            <span>IMF: AI could amplify financial crises. <a href="https://www.imf.org/en/blogs/articles/2024/10/15/artificial-intelligence-can-make-markets-more-efficient-and-more-volatile" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors">IMF Blog</a></span>
          </li>
          <li id="fn-17" className="flex gap-2">
            <span className="text-accent font-medium">17.</span>
            <span>The 2008 financial crisis caused $10+ trillion in global losses. <a href="https://www.federalreservehistory.org/essays/great-recession-and-its-aftermath" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors">Federal Reserve History</a></span>
          </li>
        </ol>
      </aside>

      {/* Share (bottom) */}
      <div className="mt-10 flex justify-center">
        <ShareButtons url="/about" title="The Future of Financial AI" description="Why AI will reshape financial services: from LLMs to autonomous agents." />
      </div>

      {/* Where to Go Next */}
      <div className="mt-14 pt-8 border-t border-border/30">
        <p className="label-refined text-accent mb-3">Where to Go Next</p>
        <p className="text-text-muted text-sm mb-6">
          Explore the companies, technologies, and data behind this thesis.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/about/history"
            className="group bg-surface border border-border rounded-xl p-5 hover:border-accent/30 transition-all"
          >
            <p className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors mb-1">History of Financial AI</p>
            <p className="text-xs text-text-muted">Timeline from 1982 to present</p>
          </Link>
          <Link
            href="/directory"
            className="group bg-surface border border-border rounded-xl p-5 hover:border-accent/30 transition-all"
          >
            <p className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors mb-1">Browse the Directory</p>
            <p className="text-xs text-text-muted">All companies in the AI + Finance landscape</p>
          </Link>
          <Link
            href="/segments/trading"
            className="group bg-surface border border-border rounded-xl p-5 hover:border-accent/30 transition-all"
          >
            <p className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors mb-1">Trading Companies</p>
            <p className="text-xs text-text-muted">AI-powered trading and market-making</p>
          </Link>
          <Link
            href="/ai-types/llm"
            className="group bg-surface border border-border rounded-xl p-5 hover:border-accent/30 transition-all"
          >
            <p className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors mb-1">LLM Companies</p>
            <p className="text-xs text-text-muted">How large language models are used in finance</p>
          </Link>
          <Link
            href="/ai-types/agentic"
            className="group bg-surface border border-border rounded-xl p-5 hover:border-accent/30 transition-all"
          >
            <p className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors mb-1">Agentic AI</p>
            <p className="text-xs text-text-muted">Autonomous agents in financial services</p>
          </Link>
          <Link
            href="/stats"
            className="group bg-surface border border-border rounded-xl p-5 hover:border-accent/30 transition-all"
          >
            <p className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors mb-1">Market Statistics</p>
            <p className="text-xs text-text-muted">Funding, segments, AI types, and regions</p>
          </Link>
          <Link
            href="/glossary"
            className="group bg-surface border border-border rounded-xl p-5 hover:border-accent/30 transition-all"
          >
            <p className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors mb-1">Glossary</p>
            <p className="text-xs text-text-muted">Key terms in AI and financial technology</p>
          </Link>
        </div>
      </div>
    </div>
    </>
  );
}
