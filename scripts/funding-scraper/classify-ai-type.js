const fs = require('fs');
const path = require('path');

const projectsPath = path.join(__dirname, '../../src/data/projects.json');
const projects = require(projectsPath);

// Manual overrides for known companies (most accurate)
// Values can be a single string or an array for multi-type companies
const manualClassifications = {
  // Foundation model / multi-type providers
  'openai': ['llm', 'computer-vision', 'reinforcement-learning'],
  'anthropic': ['llm'],
  'google-deepmind': ['llm', 'reinforcement-learning'],
  'databricks': ['data-platform', 'llm'],
  'c3ai': ['predictive-ml', 'llm'],

  // LLM-focused applications
  'kasisto': 'llm',
  'harvey': 'llm',
  'alphasense': 'llm',
  'hebbia': 'llm',
  'cleo': 'llm',
  'albert': 'llm',
  'tegus': 'llm',
  'finpilot': 'llm',
  'taxgpt': 'llm',
  'reducto': 'llm',
  'chatgpt': 'llm',
  'perplexity': 'llm',
  'sentieo-now-alphasense': 'llm',
  'truenorth': 'llm',
  'elfa-ai': 'llm',
  'gigabrain': 'llm',
  'aixbt': 'llm',
  'chaingpt': 'llm',
  'kaito-ai': 'llm',

  // Predictive ML (fraud, credit, risk scoring)
  'feedzai': 'predictive-ml',
  'sardine': 'predictive-ml',
  'hawk-ai': 'predictive-ml',
  'resistant-ai': 'predictive-ml',
  'flagright': 'predictive-ml',
  'tookitaki': 'predictive-ml',
  'alloy': 'predictive-ml',
  'socure': 'predictive-ml',
  'unit21': 'predictive-ml',
  'upstart': 'predictive-ml',
  'zest-ai': 'predictive-ml',
  'scienaptic-ai': 'predictive-ml',
  'pagaya': 'predictive-ml',
  'lendbuzz': 'predictive-ml',
  'credolab': 'predictive-ml',
  'heron-finance': 'predictive-ml',
  'lemonade': 'predictive-ml',
  'akur8': 'predictive-ml',
  'corvus-travelers': 'predictive-ml',
  'next-insurance': 'predictive-ml',
  'coterie-insurance': 'predictive-ml',
  'hippo': 'predictive-ml',
  'marshmallow': 'predictive-ml',
  'clearcover': 'predictive-ml',
  'cowbell-cyber': 'predictive-ml',
  'kin': 'predictive-ml',
  'gauntlet': 'predictive-ml',
  'chaos-labs': 'predictive-ml',
  'risk-harbor': 'predictive-ml',
  'credora': 'predictive-ml',
  'numerai': 'predictive-ml',
  'quantexa': 'predictive-ml',
  'complyadvantage': 'predictive-ml',
  'napier-ai': 'predictive-ml',
  'silent-eight': 'predictive-ml',
  'lucinity': 'predictive-ml',
  'hummingbird': 'predictive-ml',
  'personetics': 'predictive-ml',

  // Computer Vision / Document Processing
  'ocrolus': 'computer-vision',
  'tractable': 'computer-vision',
  'au10tix': 'computer-vision',
  'onfido': 'computer-vision',
  'jumio': 'computer-vision',
  'veriff': 'computer-vision',
  'sumsub': 'computer-vision',
  'idnow': 'computer-vision',
  'iproov': 'computer-vision',
  'incode': 'computer-vision',
  'shufti-pro': 'computer-vision',
  'idenfy': 'computer-vision',
  'didit': 'computer-vision',
  'identomat': 'computer-vision',
  'hyperscience': 'computer-vision',
  'instabase': 'computer-vision',
  'nanonets': 'computer-vision',
  'veryfi': 'computer-vision',
  'mindee': 'computer-vision',
  'klippa': 'computer-vision',
  'rossum': 'computer-vision',
  'eigen-technologies': 'computer-vision',
  'cape-analytics': 'computer-vision',
  'arturo': 'computer-vision',
  'openspace': 'computer-vision',
  'pibitai': 'computer-vision',

  // Graph Analytics (blockchain, fraud networks, AML)
  'chainalysis': 'graph-analytics',
  'trm-labs': 'graph-analytics',
  'elliptic': 'graph-analytics',
  'nansen': 'graph-analytics',
  'arkham': 'graph-analytics',
  'messari': 'graph-analytics',
  'dune': 'graph-analytics',
  'glassnode': 'graph-analytics',
  'merkle-science': 'graph-analytics',
  'scorechain': 'graph-analytics',
  'coinfirm': 'graph-analytics',
  'crystalblockchain': 'graph-analytics',
  'elementus': 'graph-analytics',
  'lunarcrush': 'graph-analytics',
  'santiment': 'graph-analytics',
  'pond': 'graph-analytics',

  // Reinforcement Learning (trading, optimization)
  'quantconnect': 'reinforcement-learning',
  'composer': 'reinforcement-learning',
  'trade-ideas': 'reinforcement-learning',
  'tickeron': 'reinforcement-learning',
  'trendspider': 'reinforcement-learning',
  'quantopian-closed': 'reinforcement-learning',
  'sigfig': 'reinforcement-learning',
  'riskalyze': 'reinforcement-learning',
  'trumid': 'reinforcement-learning',
  'kvants-ai': 'reinforcement-learning',
  'almanak': 'reinforcement-learning',

  // Agentic AI (autonomous agents)
  'ai16zelizaos': 'agentic',
  'virtuals-protocol-virtual': 'agentic',
  'vaderai': 'agentic',
  'autonolas-olas': 'agentic',
  'greenlite': 'agentic',
  'giza-arma-giza-tech-arma': 'agentic',
  'bankr': 'agentic',
  'hey-anon': 'agentic',
  'orbit': 'agentic',
  'neur': 'agentic',
  'heyelsa': 'agentic',
  'cod3x': 'agentic',
  'project-plutus': 'agentic',
  'wayfinder': 'agentic',
  'axal': 'agentic',
  'morpheus-mor': 'agentic',
  'fetch-ai': 'agentic',
  'fetchai-fet': 'agentic',
  'singularitynet-agixfet': 'agentic',
  'griffain': 'agentic',
  'hotkeyswap': 'agentic',
  'moby-ai': 'agentic',
  'agentfunai': 'agentic',
  'mamo-lending-agent': 'agentic',
  'sail-ai-agents': 'agentic',

  // Data Platforms (aggregation, enrichment)
  'mx': 'data-platform',
  'plaid': 'data-platform',
  'yipitdata': 'data-platform',
  'earnest-research': 'data-platform',
  'thinknum': 'data-platform',
  'quandl-nasdaq': 'data-platform',
  'visible-alpha': 'data-platform',
  'koyfin': 'data-platform',
  'daloopa': 'data-platform',
  'dataminr': 'data-platform',
  'orbital-insight': 'data-platform',
  'quiver-quantitative': 'data-platform',
  'atom-finance': 'data-platform',
  'cherre': 'data-platform',
  'compstak': 'data-platform',
  'mapped': 'data-platform',
  'rentlytics': 'data-platform',
  '9fin': 'data-platform',
  'factset': 'data-platform',
  'refinitiv-eikon': 'data-platform',
  'bloomberg-treasury': 'data-platform',
  'sp-capital-iq': 'data-platform',
  'equifax-workforce-solutions': 'data-platform',

  // Infrastructure (compute, networks, tooling)
  'stripe': 'infrastructure',
  'natural': 'infrastructure',
  'catena-labs': 'infrastructure',
  'bittensor-tao': 'infrastructure',
  'gensyn': 'infrastructure',
  'together-ai': 'infrastructure',
  'prime-intellect': 'infrastructure',
  'ionet': 'infrastructure',
  'render-render': 'infrastructure',
  'akash-network': 'infrastructure',
  'grass': 'infrastructure',
  '0g-labs': 'infrastructure',
  'ritual': 'infrastructure',
  'modulus-labs': 'infrastructure',
  'aligned-layer': 'infrastructure',
  'phala-network': 'infrastructure',
  'flockio': 'infrastructure',
  'sahara-ai': 'infrastructure',
  'vana': 'infrastructure',
  'masa': 'infrastructure',
  'allora': 'infrastructure',
  'eqty-lab': 'infrastructure',
  'near-protocol': 'infrastructure',
  'internet-computer-icp': 'infrastructure',
  'ocean-protocol-oceanfet': 'infrastructure',
  'targon-compute-sn4': 'infrastructure',
  'hippius': 'infrastructure',
  'yuma': 'infrastructure',
  'mode-network': 'infrastructure',
  'hermes-subquery': 'infrastructure',
  'cambrian-network': 'infrastructure',
  'chutes': 'infrastructure',

  // Robo-advisors (predictive-ml based)
  'betterment': 'predictive-ml',
  'wealthfront': 'predictive-ml',
  'portfoliopilot': 'predictive-ml',
  'titan': 'predictive-ml',
  'personal-capital': 'predictive-ml',
  'blooom': 'predictive-ml',

  // Specific corrections
  'workfusion': 'llm',
  'kensho-sp-global': 'llm',
  'palantir': ['data-platform', 'llm'],
};

// Keyword-based classification rules (fallback)
function classifyByKeywords(project) {
  const text = `${project.name} ${project.tagline} ${project.description || ''} ${project.segment} ${project.layer}`.toLowerCase();

  // Agentic indicators (check first - most specific)
  if (text.includes('agent') || text.includes('agentic') || text.includes('autonomous') ||
      text.includes('dao') || text.includes('execute') || text.includes('copilot')) {
    if (text.includes('trading') || text.includes('defi') || text.includes('swap') ||
        text.includes('portfolio') || text.includes('yield')) {
      return 'agentic';
    }
  }

  // Infrastructure indicators
  if (project.layer === 'infrastructure' ||
      text.includes('compute') || text.includes('network') || text.includes('protocol') ||
      text.includes('subnet') || text.includes('gpu') || text.includes('decentralized ai') ||
      text.includes('layer 1') || text.includes('layer 2') || text.includes('l2') ||
      text.includes('blockchain infrastructure')) {
    return 'infrastructure';
  }

  // LLM indicators
  if (text.includes('llm') || text.includes('gpt') || text.includes('chatbot') ||
      text.includes('conversational') || text.includes('natural language') ||
      text.includes('nlp') || text.includes('language model') || text.includes('chat') ||
      text.includes('assistant') || text.includes('copilot') || text.includes('summariz')) {
    return 'llm';
  }

  // Computer vision indicators
  if (text.includes('ocr') || text.includes('document processing') || text.includes('image') ||
      text.includes('vision') || text.includes('photo') || text.includes('video') ||
      text.includes('identity verification') || text.includes('kyc') || text.includes('biometric') ||
      text.includes('facial') || text.includes('scan')) {
    return 'computer-vision';
  }

  // Graph analytics indicators
  if (text.includes('blockchain analytic') || text.includes('on-chain') || text.includes('onchain') ||
      text.includes('graph') || text.includes('network analysis') || text.includes('crypto intelligence') ||
      text.includes('wallet') || text.includes('transaction monitor') || text.includes('crypto compliance')) {
    return 'graph-analytics';
  }

  // Reinforcement learning indicators
  if (text.includes('algorithmic trading') || text.includes('quant') || text.includes('trading signal') ||
      text.includes('backtest') || text.includes('trading strateg') || text.includes('algo')) {
    return 'reinforcement-learning';
  }

  // Data platform indicators
  if (project.layer === 'data' || text.includes('data platform') || text.includes('data provider') ||
      text.includes('market data') || text.includes('alternative data') || text.includes('aggregat') ||
      text.includes('analytics platform') || text.includes('research platform')) {
    return 'data-platform';
  }

  // Predictive ML (fraud, credit, risk - most common default)
  if (text.includes('fraud') || text.includes('aml') || text.includes('credit') ||
      text.includes('risk') || text.includes('underwriting') || text.includes('scoring') ||
      text.includes('detection') || text.includes('compliance') || text.includes('lending') ||
      text.includes('insurance') || text.includes('predict')) {
    return 'predictive-ml';
  }

  // Default based on layer
  if (project.layer === 'models') return 'predictive-ml';
  if (project.layer === 'automation') return 'llm';
  if (project.layer === 'applications') return 'predictive-ml';

  return 'predictive-ml'; // Safe default
}

// Classify all projects
const stats = {};
let classified = 0;

projects.forEach(project => {
  let aiTypes;

  // Check manual overrides first
  if (manualClassifications[project.slug]) {
    const override = manualClassifications[project.slug];
    aiTypes = Array.isArray(override) ? override : [override];
  } else {
    // Use keyword-based classification (returns single type)
    aiTypes = [classifyByKeywords(project)];
  }

  project.ai_types = aiTypes;
  delete project.ai_type; // Remove legacy field if present
  for (const t of aiTypes) {
    stats[t] = (stats[t] || 0) + 1;
  }
  classified++;
});

// Write updated projects
fs.writeFileSync(projectsPath, JSON.stringify(projects, null, 2));

// Output summary
console.log('\n=== AI Type Classification Summary ===\n');
console.log(`Total projects classified: ${classified}\n`);
console.log('Distribution (projects may appear in multiple types):');
Object.entries(stats)
  .sort((a, b) => b[1] - a[1])
  .forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });

// Show samples of each type
console.log('\n=== Samples by Type ===\n');
const types = ['llm', 'predictive-ml', 'computer-vision', 'graph-analytics', 'reinforcement-learning', 'agentic', 'data-platform', 'infrastructure'];
types.forEach(type => {
  const samples = projects.filter(p => p.ai_types?.includes(type)).slice(0, 5);
  if (samples.length > 0) {
    console.log(`${type}:`);
    samples.forEach(p => console.log(`  - ${p.name}`));
    console.log('');
  }
});

console.log('Done!');
