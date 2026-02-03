// ── EIP-8004 Agent Pipeline ──
// Queries the subgraph, filters for finance-relevant agents,
// fetches reputation data, and writes src/data/agents.json.
//
// Usage:
//   node scripts/agent-pipeline/fetch-agents.js
//   node scripts/agent-pipeline/fetch-agents.js --verbose
//   node scripts/agent-pipeline/fetch-agents.js --include-all
//   node scripts/agent-pipeline/fetch-agents.js --key CUSTOM_API_KEY

const https = require('https');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const {
  CHAINS,
  GRAPH_GATEWAY,
  BATCH_SIZE,
  RATE_LIMIT_MS,
  MAX_RECENT_FEEDBACK,
} = require('./config');

const {
  scoreFinanceRelevance,
  assignCategory,
  detectProtocols,
  FINANCE_THRESHOLD,
} = require('./finance-classifier');

const {
  checkAgent,
  deduplicateAgents,
} = require('./spam-filter');

const AGENTS_OUTPUT = path.join(__dirname, '../../src/data/agents.json');
const RESULTS_OUTPUT = path.join(__dirname, 'results.json');
const OVERRIDES_PATH = path.join(__dirname, 'overrides.json');

// ── CLI Args ──
const args = process.argv.slice(2);
const verbose = args.includes('--verbose');
const includeAll = args.includes('--include-all');

// API key: --key <value>, GRAPH_API_KEY env var, or the public agent0-ts SDK default.
// The default key is a free, publicly distributed key from the agent0-ts SDK — not a secret.
const keyIdx = args.indexOf('--key');
const API_KEY = keyIdx !== -1 ? args[keyIdx + 1]
  : (process.env.GRAPH_API_KEY || '7fd2e7d89ce3ef24cd0d4590298f0b2c');

// ── Helpers ──

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Parse a value as integer, defaulting to 0 on NaN. */
function toInt(val) {
  return parseInt(val, 10) || 0;
}

/** Parse a value as float, defaulting to null on NaN. */
function toFloat(val) {
  const n = parseFloat(val);
  return Number.isNaN(n) ? null : n;
}

/** Extract agent display name from subgraph data. */
function getAgentName(reg, fallbackId) {
  return (reg && reg.name) || `Agent #${fallbackId}`;
}

/** Build subgraph URL for a chain. */
function subgraphUrl(subgraphId) {
  return `${GRAPH_GATEWAY}/${API_KEY}/subgraphs/id/${subgraphId}`;
}

/** Default reputation fields when data is unavailable. */
const DEFAULT_REPUTATION = {
  reputationScore: null,
  feedbackCount: 0,
  validationCount: 0,
  completedValidations: 0,
  recentFeedback: [],
};

/**
 * Execute a GraphQL query against a subgraph URL.
 */
function querySubgraph(url, query, variables = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const body = JSON.stringify({ query, variables });

    const options = {
      hostname: parsed.hostname,
      port: 443,
      path: parsed.pathname + parsed.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
      timeout: 30000,
    };

    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf8');
        try {
          const json = JSON.parse(raw);
          if (json.errors) {
            reject(new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`));
          } else {
            resolve(json.data);
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${raw.slice(0, 200)}`));
        }
      });
      res.on('error', reject);
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
    req.write(body);
    req.end();
  });
}

// ── Queries ──

const AGENTS_QUERY = `
  query FetchAgents($first: Int!, $lastCreatedAt: BigInt) {
    agents(
      first: $first
      orderBy: createdAt
      orderDirection: desc
      where: { createdAt_lt: $lastCreatedAt }
    ) {
      id
      chainId
      agentId
      agentURI
      owner
      agentWallet
      createdAt
      updatedAt
      totalFeedback
      lastActivity
      registrationFile {
        name
        description
        image
        active
        x402Support
        supportedTrusts
        mcpEndpoint
        mcpVersion
        mcpTools
        mcpPrompts
        mcpResources
        a2aEndpoint
        a2aVersion
        a2aSkills
        oasfEndpoint
        oasfVersion
        oasfSkills
        oasfDomains
        webEndpoint
        emailEndpoint
        ens
        did
      }
    }
  }
`;

const REPUTATION_QUERY = `
  query AgentReputation($agentId: ID!) {
    agentStats(id: $agentId) {
      totalFeedback
      averageFeedbackValue
      totalValidations
      completedValidations
      averageValidationScore
    }
  }
`;

const FEEDBACK_QUERY = `
  query AgentFeedback($agentId: String!, $first: Int!) {
    feedbacks(
      where: { agent: $agentId, isRevoked: false }
      orderBy: createdAt
      orderDirection: desc
      first: $first
    ) {
      value
      tag1
      tag2
      clientAddress
      createdAt
      feedbackFile {
        text
      }
    }
  }
`;

// ── Main Pipeline ──

async function fetchAllAgentsForChain(chainSubgraphUrl, chainName) {
  const allAgents = [];
  // Use cursor-based pagination (createdAt_lt) to avoid The Graph's skip limit of 5000.
  // Start with a far-future timestamp so the first query returns everything.
  let lastCreatedAt = '99999999999';
  let hasMore = true;
  let batchNum = 0;

  console.log(`Fetching agents from ${chainName} subgraph...`);

  while (hasMore) {
    const variables = { first: BATCH_SIZE, lastCreatedAt };
    const data = await querySubgraph(chainSubgraphUrl, AGENTS_QUERY, variables);
    const batch = data.agents || [];
    allAgents.push(...batch);

    if (verbose) {
      console.log(`  Batch ${batchNum}: got ${batch.length} agents (cursor: ${lastCreatedAt || 'start'})`);
    }

    if (batch.length < BATCH_SIZE) {
      hasMore = false;
    } else {
      // Use the last agent's createdAt as cursor for the next page
      lastCreatedAt = batch[batch.length - 1].createdAt;
      batchNum++;
      await sleep(RATE_LIMIT_MS);
    }
  }

  console.log(`Fetched ${allAgents.length} agents from ${chainName}.`);
  return allAgents;
}

async function fetchReputationData(chainSubgraphUrl, agentSubgraphId) {
  try {
    const [statsData, feedbackData] = await Promise.all([
      querySubgraph(chainSubgraphUrl, REPUTATION_QUERY, { agentId: agentSubgraphId }),
      querySubgraph(chainSubgraphUrl, FEEDBACK_QUERY, {
        agentId: agentSubgraphId,
        first: MAX_RECENT_FEEDBACK,
      }),
    ]);

    const stats = statsData.agentStats;
    const feedbacks = feedbackData.feedbacks || [];

    if (!stats) return { ...DEFAULT_REPUTATION };

    return {
      reputationScore: toFloat(stats.averageFeedbackValue),
      feedbackCount: toInt(stats.totalFeedback),
      validationCount: toInt(stats.totalValidations),
      completedValidations: toInt(stats.completedValidations),
      recentFeedback: feedbacks.map(fb => ({
        score: parseFloat(fb.value),
        tag1: fb.tag1 || null,
        tag2: fb.tag2 || null,
        reviewer: fb.clientAddress,
        text: fb.feedbackFile?.text || null,
        createdAt: toInt(fb.createdAt),
      })),
    };
  } catch (err) {
    if (verbose) console.log(`    Reputation fetch failed: ${err.message}`);
    return { ...DEFAULT_REPUTATION };
  }
}

function buildAgentEntry(raw, scoring, reputation) {
  const reg = raw.registrationFile || {};
  const protocols = detectProtocols(reg);

  return {
    // Identity
    id: `${raw.chainId}:${raw.agentId}`,
    agentId: toInt(raw.agentId),
    chainId: toInt(raw.chainId),
    name: getAgentName(reg, raw.agentId),
    description: reg.description || '',
    image: reg.image || null,
    owner: raw.owner,
    agentWallet: raw.agentWallet || null,

    // Status
    active: reg.active !== false, // default true if not specified
    x402Support: reg.x402Support === true,

    // Protocols & Endpoints
    protocols,
    mcpEndpoint: reg.mcpEndpoint || null,
    mcpTools: reg.mcpTools || [],
    mcpPrompts: reg.mcpPrompts || [],
    mcpResources: reg.mcpResources || [],
    a2aEndpoint: reg.a2aEndpoint || null,
    a2aSkills: reg.a2aSkills || [],
    oasfEndpoint: reg.oasfEndpoint || null,
    oasfSkills: reg.oasfSkills || [],
    oasfDomains: reg.oasfDomains || [],
    webEndpoint: reg.webEndpoint || null,
    ens: reg.ens || null,
    did: reg.did || null,

    // Trust & Reputation
    supportedTrust: reg.supportedTrusts || [],
    ...reputation,

    // Classification
    financeCategory: scoring.category,
    financeScore: scoring.score,

    // Timestamps
    createdAt: toInt(raw.createdAt),
    updatedAt: toInt(raw.updatedAt),
    lastActivity: toInt(raw.lastActivity || raw.updatedAt),
  };
}

async function main() {
  const startTime = Date.now();

  // Load overrides
  let overrides = { include: [], exclude: [] };
  if (fs.existsSync(OVERRIDES_PATH)) {
    overrides = JSON.parse(fs.readFileSync(OVERRIDES_PATH, 'utf8'));
  }
  const includeSet = new Set(overrides.include || []);
  const excludeSet = new Set(overrides.exclude || []);

  // Step 1: Fetch agents from all chains
  const rawAgents = [];
  const chainCounts = {};
  // Map chainId → subgraph URL for reputation lookups later
  const chainSubgraphUrls = {};

  for (const chain of CHAINS) {
    const url = subgraphUrl(chain.subgraphId);
    chainSubgraphUrls[chain.id] = url;
    const agents = await fetchAllAgentsForChain(url, chain.name);
    chainCounts[chain.name] = agents.length;
    rawAgents.push(...agents);
  }
  console.log(`Fetched ${rawAgents.length} total agents across ${CHAINS.length} chains.`);

  // Step 2: Filter to agents with registration files (name + description required)
  const withMetadata = rawAgents.filter(a => {
    const reg = a.registrationFile;
    return reg && reg.name && reg.name.trim().length > 0;
  });
  console.log(`${withMetadata.length} agents have registration metadata.`);

  // Step 2b: Spam & quality filter
  const spamFiltered = [];
  const spamRejected = [];
  for (const agent of withMetadata) {
    const agentId = `${agent.chainId}:${agent.agentId}`;
    // Manual include overrides skip spam checks
    if (includeSet.has(agentId)) {
      spamFiltered.push(agent);
      continue;
    }
    const { isSpam, reasons } = checkAgent(agent);
    if (isSpam) {
      spamRejected.push({ agentId, name: agent.registrationFile?.name, reasons });
    } else {
      spamFiltered.push(agent);
    }
  }
  console.log(`${spamFiltered.length} agents pass spam filter (${spamRejected.length} rejected).`);
  if (verbose && spamRejected.length > 0) {
    console.log('\nSpam-rejected agents:');
    spamRejected.slice(0, 15).forEach(s => {
      console.log(`  ${s.agentId} "${s.name}" — ${s.reasons.join('; ')}`);
    });
    if (spamRejected.length > 15) {
      console.log(`  ... and ${spamRejected.length - 15} more`);
    }
  }

  // Step 3: Score and filter for finance relevance
  const scored = spamFiltered.map(agent => {
    const agentId = `${agent.chainId}:${agent.agentId}`;
    const { score, signals } = scoreFinanceRelevance(agent);
    const category = assignCategory(agent);

    return {
      raw: agent,
      agentId,
      score,
      signals,
      category,
      forceInclude: includeSet.has(agentId),
      forceExclude: excludeSet.has(agentId),
    };
  });

  let financeAgents;
  if (includeAll) {
    financeAgents = scored.filter(s => !s.forceExclude);
    console.log(`--include-all mode: keeping ${financeAgents.length} agents (${scored.length - financeAgents.length} excluded).`);
  } else {
    financeAgents = scored.filter(s => {
      if (s.forceExclude) return false;
      if (s.forceInclude) return true;
      return s.score >= FINANCE_THRESHOLD;
    });
    console.log(`${financeAgents.length} agents pass finance filter (threshold: ${FINANCE_THRESHOLD}).`);
  }

  if (verbose) {
    // Show top-10 scored agents that didn't pass for debugging
    const rejected = scored
      .filter(s => !s.forceExclude && !s.forceInclude && s.score < FINANCE_THRESHOLD)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    if (rejected.length > 0) {
      console.log('\nTop rejected agents (near threshold):');
      rejected.forEach(s => {
        console.log(`  ${s.agentId} "${getAgentName(s.raw.registrationFile, s.raw.agentId)}" score=${s.score} signals=${JSON.stringify(s.signals)}`);
      });
    }

    console.log('\nAccepted agents:');
    financeAgents.forEach(s => {
      const flag = s.forceInclude ? ' [OVERRIDE]' : '';
      console.log(`  ${s.agentId} "${getAgentName(s.raw.registrationFile, s.raw.agentId)}" score=${s.score} category=${s.category}${flag}`);
    });
  }

  // Step 3b: Deduplicate (same name + description → keep newest)
  const { kept: dedupedAgents, removed: dupeRemoved } = deduplicateAgents(financeAgents);
  if (dupeRemoved.length > 0) {
    console.log(`Deduplicated: ${financeAgents.length} → ${dedupedAgents.length} (${dupeRemoved.length} duplicates removed).`);
    if (verbose) {
      dupeRemoved.forEach(s => {
        console.log(`  removed dupe: ${s.agentId} "${getAgentName(s.raw.registrationFile, s.raw.agentId)}"`);
      });
    }
  }
  financeAgents = dedupedAgents;

  // Step 3c: Remove agents with no interaction endpoints
  const beforeEndpoint = financeAgents.length;
  financeAgents = financeAgents.filter(({ raw }) => {
    const reg = raw.registrationFile || {};
    return reg.mcpEndpoint || reg.a2aEndpoint || reg.oasfEndpoint || reg.webEndpoint;
  });
  const endpointRemoved = beforeEndpoint - financeAgents.length;
  if (endpointRemoved > 0) {
    console.log(`Endpoint filter: ${beforeEndpoint} → ${financeAgents.length} (${endpointRemoved} agents with no endpoints removed).`);
  }

  // Step 4: Fetch reputation data for each finance agent
  console.log('\nFetching reputation data...');
  const agentEntries = [];

  for (let i = 0; i < financeAgents.length; i++) {
    const { raw, score, category } = financeAgents[i];
    const subgraphId = raw.id;
    const chainUrl = chainSubgraphUrls[toInt(raw.chainId)];

    process.stdout.write(`  [${i + 1}/${financeAgents.length}] ${getAgentName(raw.registrationFile, raw.agentId)} ... `);

    const reputation = await fetchReputationData(chainUrl, subgraphId);
    const entry = buildAgentEntry(raw, { score, category }, reputation);
    agentEntries.push(entry);

    const repStr = reputation.reputationScore !== null
      ? `rep=${reputation.reputationScore.toFixed(1)}`
      : 'no rep';
    console.log(`${repStr}, ${reputation.feedbackCount} feedback`);

    if (i < financeAgents.length - 1) {
      await sleep(RATE_LIMIT_MS);
    }
  }

  // Step 5: Sort by reputation (highest first), then by activity
  agentEntries.sort((a, b) => {
    // Active agents first
    if (a.active !== b.active) return a.active ? -1 : 1;
    // Then by reputation (non-null first, then higher)
    if (a.reputationScore !== null && b.reputationScore !== null) {
      return b.reputationScore - a.reputationScore;
    }
    if (a.reputationScore !== null) return -1;
    if (b.reputationScore !== null) return 1;
    // Then by last activity (most recent first)
    return b.lastActivity - a.lastActivity;
  });

  // Step 6: Write output
  fs.writeFileSync(AGENTS_OUTPUT, JSON.stringify(agentEntries, null, 2) + '\n');
  console.log(`\nWrote ${agentEntries.length} agents to ${AGENTS_OUTPUT}`);

  // Write pipeline results for debugging
  const results = {
    meta: {
      fetchedAt: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      chains: chainCounts,
      totalInRegistry: rawAgents.length,
      withMetadata: withMetadata.length,
      spamRejected: spamRejected.length,
      passedSpamFilter: spamFiltered.length,
      passedFinanceFilter: scored.filter(s => s.score >= FINANCE_THRESHOLD || s.forceInclude).length,
      duplicatesRemoved: dupeRemoved.length,
      noEndpointsRemoved: endpointRemoved,
      outputCount: agentEntries.length,
      threshold: FINANCE_THRESHOLD,
      includeAllMode: includeAll,
    },
    agents: Object.fromEntries(
      scored.map(s => [
        s.agentId,
        {
          name: s.raw.registrationFile?.name || null,
          score: s.score,
          category: s.category,
          included: financeAgents.some(f => f.agentId === s.agentId),
          signals: s.signals,
          forceInclude: s.forceInclude,
          forceExclude: s.forceExclude,
        },
      ])
    ),
  };
  fs.writeFileSync(RESULTS_OUTPUT, JSON.stringify(results, null, 2));
  console.log(`Pipeline results saved to ${RESULTS_OUTPUT}`);

  // Summary
  console.log('\n=== Pipeline Summary ===');
  for (const chain of CHAINS) {
    console.log(`${chain.name} agents:  ${chainCounts[chain.name] || 0}`);
  }
  console.log(`Total in registry:  ${rawAgents.length}`);
  console.log(`With metadata:      ${withMetadata.length}`);
  console.log(`Spam rejected:      ${spamRejected.length}`);
  console.log(`After spam filter:  ${spamFiltered.length}`);
  console.log(`Passed finance:     ${financeAgents.length + endpointRemoved}`);
  console.log(`Dupes removed:      ${dupeRemoved.length}`);
  console.log(`No endpoints:       ${endpointRemoved}`);
  console.log(`Output agents:      ${agentEntries.length}`);
  console.log(`Duration:           ${((Date.now() - startTime) / 1000).toFixed(1)}s`);

  // Category breakdown
  const catCounts = {};
  agentEntries.forEach(a => {
    catCounts[a.financeCategory] = (catCounts[a.financeCategory] || 0) + 1;
  });
  if (Object.keys(catCounts).length > 0) {
    console.log('\nCategory breakdown:');
    Object.entries(catCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count]) => {
        console.log(`  ${cat}: ${count}`);
      });
  }

  // Chain breakdown
  const chainBreakdown = {};
  agentEntries.forEach(a => {
    const name = CHAINS.find(c => c.id === a.chainId)?.name || `Chain ${a.chainId}`;
    chainBreakdown[name] = (chainBreakdown[name] || 0) + 1;
  });
  if (Object.keys(chainBreakdown).length > 1) {
    console.log('\nChain breakdown:');
    Object.entries(chainBreakdown)
      .sort((a, b) => b[1] - a[1])
      .forEach(([chain, count]) => {
        console.log(`  ${chain}: ${count}`);
      });
  }
}

main().catch(err => {
  console.error('Pipeline failed:', err);
  process.exit(1);
});
