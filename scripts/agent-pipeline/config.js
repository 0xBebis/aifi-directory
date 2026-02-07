// ── Agent Pipeline Configuration ──
// Subgraph endpoints, finance keyword lists, scoring thresholds

module.exports = {
  // ── Subgraph ──
  CHAINS: [
    { id: 1, name: 'Ethereum', subgraphId: 'FV6RR6y13rsnCxBAicKuQEwDp8ioEGiNaWaZUmvr1F8k' },
    { id: 11155111, name: 'Sepolia', subgraphId: '6wQRC7geo9XYAhckfmfo8kbMRLeWU8KQd3XsJqFKmZLT' },
    { id: 137, name: 'Polygon', subgraphId: '9q16PZv1JudvtnCAf44cBoxg82yK9SSsFvrjCY9xnneF' },
  ],
  GRAPH_GATEWAY: 'https://gateway.thegraph.com/api',
  BATCH_SIZE: 100,       // subgraph pagination limit
  RATE_LIMIT_MS: 200,    // delay between subgraph requests

  // ── Contract Addresses (deterministic across chains) ──
  IDENTITY_REGISTRY: '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432',
  REPUTATION_REGISTRY: '0x8004BAa17C55a88189AE136b182e5fdA19dE9b63',

  // ── Finance Filtering ──
  FINANCE_THRESHOLD: 0.10,  // agents scoring below this are excluded (0–1 scale)

  // Signal weights
  WEIGHTS: {
    name: 0.20,
    description: 0.30,
    domains: 0.25,
    tools: 0.15,
    // manual overrides bypass scoring entirely (weight = 1.0)
  },

  // ── Finance Keywords ──
  // Used for name/description substring matching (case-insensitive).
  // Auto-derived from CATEGORY_KEYWORDS (below) plus extra terms that
  // don't belong to any single category. Avoids drift between the two lists.
  //
  // NOTE: This field is populated at the bottom of this file after
  // CATEGORY_KEYWORDS is defined. See the derivation logic below.
  FINANCE_KEYWORDS: null, // set after module definition

  // ── Finance OASF Domains ──
  // Exact match against agent's declared oasfDomains
  FINANCE_OASF_DOMAINS: [
    'finance', 'banking', 'trading', 'insurance', 'payments',
    'lending', 'risk-management', 'compliance', 'accounting',
    'cryptocurrency', 'defi', 'wealth-management',
    'investment', 'portfolio-management', 'market-analysis',
  ],

  // ── Category Keywords ──
  // Each category has its own keyword set for classification.
  // The category with the highest keyword match count wins.
  CATEGORY_KEYWORDS: {
    'trading': [
      'trading', 'trade', 'trader', 'market making', 'order execution',
      'quant', 'quantitative', 'alpha', 'signal', 'backtest',
      'hedge fund', 'prop trading', 'arbitrage', 'derivatives',
      'options', 'futures', 'forex', 'equities', 'fixed income',
      'dex', 'amm',
    ],
    'risk-compliance': [
      'risk', 'compliance', 'aml', 'kyc', 'fraud', 'sanctions',
      'anti-money', 'identity verification', 'regulatory',
      'suspicious', 'detection', 'monitoring',
    ],
    'payments': [
      'payment', 'payments', 'transaction', 'transfer', 'banking', 'bank',
      'neobank', 'remittance', 'settlement', 'clearing',
      'fintech', 'money',
    ],
    'lending': [
      'lending', 'loan', 'loans', 'credit', 'underwriting', 'mortgage',
      'borrowing', 'interest rate', 'debt', 'collections',
    ],
    'wealth': [
      'wealth', 'portfolio', 'investment', 'invest', 'asset management',
      'robo-advisor', 'financial planning', 'retirement',
      'allocation', 'rebalancing',
    ],
    'insurance': [
      'insurance', 'insure', 'actuarial', 'claims', 'underwrite',
      'policyholder', 'premium', 'coverage',
    ],
    'research': [
      'market data', 'price feed', 'oracle', 'bloomberg', 'research',
      'financial data', 'economic data', 'earnings', 'sec filing',
      'analytics', 'analysis', 'data provider', 'alternative data',
    ],
    'defi': [
      'defi', 'decentralized finance', 'yield', 'liquidity',
      'swap', 'vault', 'staking', 'restaking', 'bridge', 'cross-chain',
      'token', 'nft marketplace', 'protocol', 'smart contract',
      'web3', 'blockchain', 'ethereum', 'solana',
      'rebalancer', 'rebalancing',
    ],
  },

  // ── Reputation ──
  MAX_RECENT_FEEDBACK: 5,  // how many feedback entries to store per agent

  // ── Spam & Quality Filters ──
  // Agents matching any of these patterns are excluded regardless of finance score.
  // Strings are case-insensitive substring matches. RegExp patterns are also supported.

  MIN_DESCRIPTION_LENGTH: 50,  // chars; shorter descriptions are treated as spam

  SPAM_NAME_PATTERNS: [
    'test agent',
    'example agent',
    'demo agent',
    'my agent',
    'my ai assistant',
    'hello world',
    'untitled',
    /^agent$/i,                     // exactly "agent" with no other text
    /^agent\s*#?\d+$/i,             // "Agent #42", "agent 7"
    /^agent\s+test/i,               // "agent test"
    /^test[\s-]/i,                  // "test chain", "test-q1", "test 5"
    /test\s*\d+/i,                  // "Test 1205", "test123"
    /\bsample\b/i,                  // "Sample Agent"
    /\bdummy\b/i,                   // "Dummy Agent"
    /\bplaceholder\b/i,             // "Placeholder Agent"
    /^[a-z]{1,5}$/i,               // very short names: "Bob", "test"
    /^[^aeiou\s]{4,}$/i,           // no vowels = keyboard mash: "asdcghj", "sfasfsd"
    /\.8004-agent\.eth$/i,          // .8004-agent.eth test entries
    /^[a-z]+_[a-f0-9]+$/i,            // generated "Agent_339e", "NovaByte_6939", "PrimeMind_643", "UltraFlow_3" pattern
    /^agents?\s+\d+$/i,              // "Agents 18598", "Agent 7"
  ],

  SPAM_DESC_PATTERNS: [
    'created by the transfer example',
    'testing transfer functionality',
    'testing purposes',
    'this is a test',
    'this is an agent test',
    'test description',
    'example description',
    'lorem ipsum',
    'placeholder',
    /^an?\s+agent\s+(for|created)\s+test/i,   // "An agent for testing..."
    /^an?\s+agent\s+created\s+by\s+the\s/i,   // "An agent created by the..."
    /^test\b/i,                                // description starts with "test"
    /^[^aeiou\s]{8,}/i,                        // gibberish: starts with consonant run
    /[b-df-hj-np-tv-xz]{10,}/i,                // gibberish: 10+ consecutive consonant letters (ignores digits, symbols, punctuation)
    /(.{5,}?)\1{3,}/i,                         // repeated phrases 3+ times
    /^\S{20,}$/,                               // entire description is one unbroken word (no spaces), 20+ chars
    /\S{30,}/,                                 // any single token 30+ chars without spaces (embedded gibberish)
  ],
};

// ── Derive FINANCE_KEYWORDS from CATEGORY_KEYWORDS ──
// Flatten all per-category keyword lists into a single deduplicated array,
// then add cross-category terms that don't fit any single category.
const EXTRA_FINANCE_KEYWORDS = [
  'finance', 'financial', 'fintech',
  'accounting', 'audit', 'treasury', 'revenue', 'invoice',
];

const derived = new Set(EXTRA_FINANCE_KEYWORDS);
for (const keywords of Object.values(module.exports.CATEGORY_KEYWORDS)) {
  for (const kw of keywords) derived.add(kw);
}
module.exports.FINANCE_KEYWORDS = [...derived];
