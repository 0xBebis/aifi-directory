import { Metadata } from 'next';
import Link from 'next/link';
import {
  segments,
  layers,
  projects,
  agents,
  AI_TYPE_LABELS,
  AI_TYPE_COLORS,
  AI_TYPE_DESCRIPTIONS,
} from '@/lib/data';
import { AIType } from '@/types';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Financial AI Glossary — Key Terms & Definitions | AIFI',
  description: 'Glossary of financial AI terms: LLMs, agentic AI, EIP-8004, MCP, predictive ML, and more. Definitions for AI technologies, market segments, and protocols used in finance.',
  openGraph: {
    title: 'Financial AI Glossary — Key Terms & Definitions',
    description: 'Glossary of financial AI terms: LLMs, agentic AI, EIP-8004, MCP, and more.',
    type: 'website',
    siteName: 'AIFI',
    images: [{ url: '/og/default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Financial AI Glossary — Key Terms & Definitions',
    description: 'Glossary of financial AI terms: LLMs, agentic AI, EIP-8004, MCP, and more.',
    images: ['/og/default.png'],
  },
};

interface GlossaryEntry {
  term: string;
  slug: string;
  definition: string;
  category: 'ai-technology' | 'market-segment' | 'tech-layer' | 'protocol' | 'concept';
  link?: string;
}

const glossaryEntries: GlossaryEntry[] = [
  // AI Technologies
  {
    term: 'Large Language Model (LLM)',
    slug: 'llm',
    definition: 'A type of artificial intelligence trained on vast text corpora that can understand and generate human language. In finance, LLMs power document analysis, sentiment extraction from earnings calls, conversational banking, automated report writing, and financial research copilots. LLMs are the most widely adopted AI technology in the AIFI directory.',
    category: 'ai-technology',
    link: '/ai-types/llm',
  },
  {
    term: 'Predictive ML',
    slug: 'predictive-ml',
    definition: 'Traditional machine learning algorithms — including classification, regression, gradient boosting, and ensemble models — used for prediction tasks. In finance, predictive ML powers credit scoring, fraud detection, churn prediction, and market forecasting. These models are typically trained on structured tabular data and optimized for accuracy and interpretability.',
    category: 'ai-technology',
    link: '/ai-types/predictive-ml',
  },
  {
    term: 'Computer Vision',
    slug: 'computer-vision',
    definition: 'AI systems that extract information from images and video. In finance, computer vision is used for document OCR and extraction (invoices, checks, IDs), damage assessment in insurance claims, satellite imagery analysis for alternative data, and facial recognition for identity verification.',
    category: 'ai-technology',
    link: '/ai-types/computer-vision',
  },
  {
    term: 'Graph Analytics',
    slug: 'graph-analytics',
    definition: 'AI techniques that analyze relationships and networks between entities. In finance, graph analytics detects money laundering by tracing transaction flows, identifies beneficial ownership structures, maps supply chain risks, and powers knowledge graphs that connect companies, executives, and investors.',
    category: 'ai-technology',
    link: '/ai-types/graph-analytics',
  },
  {
    term: 'Reinforcement Learning (RL)',
    slug: 'reinforcement-learning',
    definition: 'A type of machine learning where an agent learns optimal behavior through trial and error, receiving rewards or penalties for actions. In finance, RL is applied to dynamic portfolio optimization, algorithmic trading strategy development, order execution optimization, and market making.',
    category: 'ai-technology',
    link: '/ai-types/reinforcement-learning',
  },
  {
    term: 'Agentic AI',
    slug: 'agentic-ai',
    definition: 'Autonomous AI systems that can independently plan, decide, and execute multi-step tasks. Unlike traditional AI that responds to single queries, agentic AI can decompose complex goals, use tools, interact with APIs, and take actions in the real world. In finance, agentic AI executes trades, manages portfolios, processes claims, and conducts research autonomously.',
    category: 'ai-technology',
    link: '/ai-types/agentic',
  },
  {
    term: 'Data Platform',
    slug: 'data-platform',
    definition: 'Platforms that aggregate, clean, enrich, and deliver financial data with minimal machine learning. In finance, data platforms provide alternative data feeds, market data aggregation, entity resolution, and data infrastructure that other AI systems consume. They form the foundation layer that enables more sophisticated AI applications like predictive models and LLM-powered analysis.',
    category: 'ai-technology',
    link: '/ai-types/data-platform',
  },
  {
    term: 'AI Infrastructure',
    slug: 'ai-infrastructure',
    definition: 'The compute, tooling, and platform layer that enables AI/ML development and deployment. In financial services, AI infrastructure includes GPU compute networks, model training platforms, MLOps tooling, feature stores, and deployment pipelines. These companies provide the foundational technology that financial AI applications are built on.',
    category: 'ai-technology',
    link: '/ai-types/infrastructure',
  },
  // Protocols
  {
    term: 'EIP-8004',
    slug: 'eip-8004',
    definition: 'Ethereum Improvement Proposal 8004 defines a standard for on-chain AI agent registration. It provides a decentralized registry where AI agents declare their capabilities, protocols, and endpoints, enabling discovery and interoperability. The AIFI Agent Registry uses EIP-8004 to catalog financial AI agents.',
    category: 'protocol',
    link: '/agents',
  },
  {
    term: 'Model Context Protocol (MCP)',
    slug: 'mcp',
    definition: 'An open protocol that provides a structured interface for AI models to access external tools, data sources, and prompts. MCP enables AI agents to interact with financial APIs, databases, and services through a standardized tool-calling mechanism. It defines tools (functions the agent can call), resources (data the agent can read), and prompts (templates for interaction).',
    category: 'protocol',
    link: '/agents',
  },
  {
    term: 'Agent-to-Agent Protocol (A2A)',
    slug: 'a2a',
    definition: 'A peer-to-peer communication protocol that enables AI agents to discover each other, negotiate capabilities, and collaborate on tasks. A2A allows financial agents to delegate subtasks, share information, and compose complex workflows — for example, a portfolio management agent delegating risk analysis to a specialized compliance agent.',
    category: 'protocol',
    link: '/agents',
  },
  {
    term: 'Open Agent Skill Framework (OASF)',
    slug: 'oasf',
    definition: 'A taxonomy and discovery framework for AI agent capabilities. OASF defines standardized skill categories and domain classifications, making it possible to search for agents by what they can do. In financial AI, OASF domains include trading, risk management, payments, and lending.',
    category: 'protocol',
    link: '/agents',
  },
  // Concepts
  {
    term: 'Alternative Data',
    slug: 'alternative-data',
    definition: 'Non-traditional data sources used to gain investment insights beyond conventional financial data. Examples include satellite imagery of parking lots (retail foot traffic), web scraping of product reviews, social media sentiment, credit card transaction aggregates, and weather data. AI processes these signals into structured investment signals.',
    category: 'concept',
  },
  {
    term: 'Algorithmic Trading',
    slug: 'algorithmic-trading',
    definition: 'The use of computer algorithms to automatically execute trading strategies. AI-powered algorithmic trading goes beyond simple rule-based systems by using machine learning to identify patterns, adapt to market conditions, and optimize execution. Sub-categories include high-frequency trading (HFT), statistical arbitrage, and systematic macro.',
    category: 'concept',
    link: '/segments/trading',
  },
  {
    term: 'Know Your Customer (KYC)',
    slug: 'kyc',
    definition: 'Regulatory requirements for financial institutions to verify the identity of their customers. AI automates KYC through document verification (OCR and computer vision), facial recognition, database checks, and risk scoring. AI-powered KYC reduces onboarding time from days to minutes while improving accuracy.',
    category: 'concept',
    link: '/segments/risk',
  },
  {
    term: 'Anti-Money Laundering (AML)',
    slug: 'aml',
    definition: 'Regulations and processes to prevent the use of financial systems for laundering criminal proceeds. AI improves AML by analyzing complex transaction networks using graph analytics, reducing false positive rates from 95%+ (with rule-based systems) to under 50%, and detecting sophisticated laundering patterns that rules miss.',
    category: 'concept',
    link: '/segments/risk',
  },
  {
    term: 'Robo-Advisor',
    slug: 'robo-advisor',
    definition: 'A digital platform that provides automated, algorithm-driven financial planning and investment management. Robo-advisors use AI to construct diversified portfolios, rebalance allocations, harvest tax losses, and provide personalized recommendations — typically at a fraction of the cost of human financial advisors.',
    category: 'concept',
    link: '/segments/wealth',
  },
  {
    term: 'Embedded Finance',
    slug: 'embedded-finance',
    definition: 'The integration of financial services (payments, lending, insurance, banking) directly into non-financial platforms and applications. AI enables embedded finance by powering real-time credit decisions, fraud scoring, and personalized financial products at the point of need, without requiring users to visit a bank.',
    category: 'concept',
    link: '/segments/banking',
  },
  {
    term: 'Insurtech',
    slug: 'insurtech',
    definition: 'Technology companies innovating in insurance. AI-powered insurtechs use computer vision for damage assessment, predictive ML for risk pricing, NLP for claims processing, and telematics for usage-based insurance. The sector includes both full-stack carriers and B2B platforms selling AI to incumbent insurers.',
    category: 'concept',
    link: '/segments/insurance',
  },
  {
    term: 'Decentralized Finance (DeFi)',
    slug: 'defi',
    definition: 'Financial services built on blockchain smart contracts that operate without traditional intermediaries. AI enhances DeFi through automated yield optimization, smart contract risk assessment, liquidity provision strategies, and MEV (Maximal Extractable Value) extraction. AI agents are increasingly used to autonomously interact with DeFi protocols.',
    category: 'concept',
    link: '/segments/crypto',
  },
  // Market Segments (as definitions)
  ...segments.map(s => ({
    term: s.name,
    slug: `segment-${s.slug}`,
    definition: `${s.description}. ${s.long_description ? s.long_description.split('\n\n')[0] : `One of the nine market segments tracked in the AIFI directory of AI + finance companies.`}`,
    category: 'market-segment' as const,
    link: `/segments/${s.slug}`,
  })),
  // Tech Layers (as definitions)
  ...layers.map(l => ({
    term: `${l.name} Layer`,
    slug: `layer-${l.slug}`,
    definition: `${l.description}. Position ${l.position} in the financial AI technology stack. The ${l.name.toLowerCase()} layer encompasses companies that provide ${l.description.toLowerCase()} for financial services.`,
    category: 'tech-layer' as const,
    link: `/layers/${l.slug}`,
  })),
];

// Sort alphabetically
const sortedEntries = [...glossaryEntries].sort((a, b) => a.term.localeCompare(b.term));

// Group by first letter
const grouped: Record<string, GlossaryEntry[]> = {};
sortedEntries.forEach(entry => {
  const letter = entry.term[0].toUpperCase();
  if (!grouped[letter]) grouped[letter] = [];
  grouped[letter].push(entry);
});

const CATEGORY_LABELS: Record<string, string> = {
  'ai-technology': 'AI Technology',
  'market-segment': 'Market Segment',
  'tech-layer': 'Tech Layer',
  'protocol': 'Protocol',
  'concept': 'Concept',
};

const CATEGORY_COLORS: Record<string, string> = {
  'ai-technology': '#8b5cf6',
  'market-segment': '#3b82f6',
  'tech-layer': '#22c55e',
  'protocol': '#f97316',
  'concept': '#64748b',
};

export default function GlossaryPage() {
  const letters = Object.keys(grouped).sort();

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: glossaryEntries.slice(0, 10).map(entry => ({
      '@type': 'Question',
      name: `What is ${entry.term}?`,
      acceptedAnswer: { '@type': 'Answer', text: entry.definition },
    })),
  };

  const definedTermJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    name: 'Financial AI Glossary',
    description: 'Definitions of key terms in artificial intelligence applied to financial services.',
    hasDefinedTerm: glossaryEntries.map(entry => ({
      '@type': 'DefinedTerm',
      name: entry.term,
      description: entry.definition,
    })),
  };

  return (
    <>
    <JsonLd data={faqJsonLd} />
    <JsonLd data={definedTermJsonLd} />
    <div className="max-w-5xl mx-auto px-6 sm:px-8 py-8">
      <p className="label-refined mb-2 text-accent">Reference</p>
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary mb-3">
        Financial AI Glossary
      </h1>
      <p className="text-text-secondary text-[0.9375rem] leading-relaxed max-w-3xl mb-6">
        Definitions of key terms in AI-powered financial services. Covers AI technologies, market segments,
        infrastructure layers, agent protocols, and industry concepts tracked across the {projects.length} companies
        and {agents.length} agents in the AIFI directory.
      </p>

      {/* Letter navigation */}
      <div className="flex flex-wrap gap-1.5 mb-8">
        {letters.map(letter => (
          <a
            key={letter}
            href={`#letter-${letter}`}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface border border-border text-sm font-medium text-text-secondary hover:text-accent hover:border-accent/30 transition-colors"
          >
            {letter}
          </a>
        ))}
      </div>

      {/* Glossary entries */}
      <div className="space-y-10">
        {letters.map(letter => (
          <section key={letter} id={`letter-${letter}`}>
            <h2 className="text-2xl font-bold text-text-primary mb-4 border-b border-border/30 pb-2">{letter}</h2>
            <div className="space-y-6">
              {grouped[letter].map(entry => (
                <div key={entry.slug} id={entry.slug} className="scroll-mt-20">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <h3 className="text-[0.9375rem] font-semibold text-text-primary">{entry.term}</h3>
                        <span
                          className="text-2xs px-2 py-0.5 rounded-full font-medium border"
                          style={{
                            color: CATEGORY_COLORS[entry.category],
                            borderColor: `${CATEGORY_COLORS[entry.category]}33`,
                            background: `${CATEGORY_COLORS[entry.category]}0d`,
                          }}
                        >
                          {CATEGORY_LABELS[entry.category]}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary leading-relaxed">{entry.definition}</p>
                      {entry.link && (
                        <Link
                          href={entry.link}
                          className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent-hover transition-colors mt-2"
                        >
                          Learn more →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-10 pt-8 border-t border-border/30">
        <Link
          href="/directory"
          className="inline-flex items-center px-6 py-3 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent-muted transition-all duration-200"
        >
          Browse the Full Directory
        </Link>
      </div>
    </div>
    </>
  );
}
