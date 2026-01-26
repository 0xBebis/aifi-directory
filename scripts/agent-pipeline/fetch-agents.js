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
  SUBGRAPH_ID,
  GRAPH_GATEWAY,
  BATCH_SIZE,
  RATE_LIMIT_MS,
  MAX_RECENT_FEEDBACK,
  CHAIN_ID,
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

// API key: --key <value>, GRAPH_API_KEY env var, or default from agent0-ts SDK
const keyIdx = args.indexOf('--key');
const DEFAULT_KEY = '00a452ad3cd1900273ea62c1bf283f93'; // agent0-ts SDK public key
const API_KEY = keyIdx !== -1 ? args[keyIdx + 1] : (process.env.GRAPH_API_KEY || DEFAULT_KEY);

const SUBGRAPH_URL = `${GRAPH_GATEWAY}/${API_KEY}/subgraphs/id/${SUBGRAPH_ID}`;

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

/** Default reputation fields when data is unavailable. */
const DEFAULT_REPUTATION = {
  reputationScore: null,
  feedbackCount: 0,
  validationCount: 0,
  completedValidations: 0,
  recentFeedback: [],
};

/**
 * Execute a GraphQL query against the subgraph.
 */
function querySubgraph(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(SUBGRAPH_URL);
    const body = JSON.stringify({ query, variables });

    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
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
  query FetchAgents($skip: Int!, $first: Int!) {
    agents(
      first: $first
      skip: $skip
      orderBy: createdAt
      orderDirection: desc
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

async function fetchAllAgents() {
  const allAgents = [];
  let skip = 0;
  let hasMore = true;

  console.log('Fetching agents from subgraph...');

  while (hasMore) {
    const data = await querySubgraph(AGENTS_QUERY, { skip, first: BATCH_SIZE });
    const batch = data.agents || [];
    allAgents.push(...batch);

    if (verbose) {
      console.log(`  Batch: skip=${skip}, got ${batch.length} agents`);
    }

    if (batch.length < BATCH_SIZE) {
      hasMore = false;
    } else {
      skip += BATCH_SIZE;
      await sleep(RATE_LIMIT_MS);
    }
  }

  console.log(`Fetched ${allAgents.length} total agents from subgraph.`);
  return allAgents;
}

async function fetchReputationData(agentSubgraphId) {
  try {
    const [statsData, feedbackData] = await Promise.all([
      querySubgraph(REPUTATION_QUERY, { agentId: agentSubgraphId }),
      querySubgraph(FEEDBACK_QUERY, {
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

  // Step 1: Fetch all agents
  const rawAgents = await fetchAllAgents();

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

  // Step 4: Fetch reputation data for each finance agent
  console.log('\nFetching reputation data...');
  const agentEntries = [];

  for (let i = 0; i < financeAgents.length; i++) {
    const { raw, score, category } = financeAgents[i];
    const subgraphId = raw.id;

    process.stdout.write(`  [${i + 1}/${financeAgents.length}] ${getAgentName(raw.registrationFile, raw.agentId)} ... `);

    const reputation = await fetchReputationData(subgraphId);
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
      totalInRegistry: rawAgents.length,
      withMetadata: withMetadata.length,
      spamRejected: spamRejected.length,
      passedSpamFilter: spamFiltered.length,
      passedFinanceFilter: scored.filter(s => s.score >= FINANCE_THRESHOLD || s.forceInclude).length,
      duplicatesRemoved: dupeRemoved.length,
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
  console.log(`Total in registry:  ${rawAgents.length}`);
  console.log(`With metadata:      ${withMetadata.length}`);
  console.log(`Spam rejected:      ${spamRejected.length}`);
  console.log(`After spam filter:  ${spamFiltered.length}`);
  console.log(`Passed finance:     ${financeAgents.length}`);
  console.log(`Dupes removed:      ${dupeRemoved.length}`);
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
}

main().catch(err => {
  console.error('Pipeline failed:', err);
  process.exit(1);
});
