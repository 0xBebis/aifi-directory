// ── Finance Classifier ──
// Scores agents for finance relevance and assigns a category.

const {
  FINANCE_KEYWORDS,
  FINANCE_OASF_DOMAINS,
  FINANCE_THRESHOLD,
  WEIGHTS,
  CATEGORY_KEYWORDS,
} = require('./config');

/**
 * Count how many keywords from `keywords` appear in `text` (case-insensitive).
 * Each keyword is matched as a whole-word substring.
 */
function countKeywordMatches(text, keywords) {
  if (!text) return 0;
  const lower = text.toLowerCase();
  let count = 0;
  for (const kw of keywords) {
    if (lower.includes(kw.toLowerCase())) count++;
  }
  return count;
}

/**
 * Check if any item in `items` matches any entry in `targets` (case-insensitive).
 */
function hasOverlap(items, targets) {
  if (!items || items.length === 0) return false;
  const targetSet = new Set(targets.map(t => t.toLowerCase()));
  return items.some(item => targetSet.has(item.toLowerCase()));
}

/**
 * Score an agent for finance relevance.
 * Returns a number between 0 and 1.
 *
 * @param {object} agent - Raw agent from subgraph with registrationFile
 * @returns {{ score: number, signals: object }}
 */
function scoreFinanceRelevance(agent) {
  const reg = agent.registrationFile || {};
  const name = reg.name || '';
  const description = reg.description || '';
  const oasfDomains = reg.oasfDomains || [];
  const oasfSkills = reg.oasfSkills || [];
  const a2aSkills = reg.a2aSkills || [];
  const mcpTools = reg.mcpTools || [];
  const mcpPrompts = reg.mcpPrompts || [];
  const mcpResources = reg.mcpResources || [];

  // 1. Name score: 1.0 if any keyword appears, 0.0 otherwise
  const nameMatches = countKeywordMatches(name, FINANCE_KEYWORDS);
  const nameScore = nameMatches > 0 ? 1.0 : 0.0;

  // 2. Description score: density — min(1.0, matchCount / 3)
  //    3 matches = max score; avoids rewarding keyword-stuffed descriptions
  const descMatches = countKeywordMatches(description, FINANCE_KEYWORDS);
  const descScore = Math.min(1.0, descMatches / 3);

  // 3. Domain score:
  //    1.0 if any OASF domain matches finance list
  //    0.5 if any OASF skill or A2A skill has a finance keyword
  //    0.0 otherwise
  let domainScore = 0.0;
  if (hasOverlap(oasfDomains, FINANCE_OASF_DOMAINS)) {
    domainScore = 1.0;
  } else {
    const allSkills = [...oasfSkills, ...a2aSkills];
    const skillMatches = countKeywordMatches(allSkills.join(' '), FINANCE_KEYWORDS);
    if (skillMatches > 0) domainScore = 0.5;
  }

  // 4. Tool score: 1.0 if any MCP tool/prompt/resource or A2A skill name matches
  const allTools = [...mcpTools, ...mcpPrompts, ...mcpResources, ...a2aSkills];
  const toolMatches = countKeywordMatches(allTools.join(' '), FINANCE_KEYWORDS);
  const toolScore = toolMatches > 0 ? 1.0 : 0.0;

  const score =
    (nameScore * WEIGHTS.name) +
    (descScore * WEIGHTS.description) +
    (domainScore * WEIGHTS.domains) +
    (toolScore * WEIGHTS.tools);

  return {
    score: Math.round(score * 1000) / 1000, // 3 decimal places
    signals: {
      nameScore,
      nameMatches,
      descScore,
      descMatches,
      domainScore,
      toolScore,
      toolMatches,
    },
  };
}

/**
 * Assign a finance category based on keyword cluster matching.
 * Checks name + description + skills/tools against each category's keyword set.
 * The category with the highest match count wins.
 *
 * @param {object} agent - Raw agent from subgraph
 * @returns {string} FinanceCategory
 */
function assignCategory(agent) {
  const reg = agent.registrationFile || {};
  const text = [
    reg.name || '',
    reg.description || '',
    ...(reg.oasfDomains || []),
    ...(reg.oasfSkills || []),
    ...(reg.a2aSkills || []),
    ...(reg.mcpTools || []),
  ].join(' ');

  let bestCategory = 'general-finance';
  let bestCount = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const count = countKeywordMatches(text, keywords);
    if (count > bestCount) {
      bestCount = count;
      bestCategory = category;
    }
  }

  return bestCategory;
}

/**
 * Determine which protocols an agent supports based on its endpoints.
 * @param {object} reg - registrationFile
 * @returns {string[]}
 */
function detectProtocols(reg) {
  const protocols = [];
  if (reg.mcpEndpoint) protocols.push('mcp');
  if (reg.a2aEndpoint) protocols.push('a2a');
  if (reg.oasfEndpoint) protocols.push('oasf');
  if (reg.webEndpoint) protocols.push('web');
  if (reg.emailEndpoint) protocols.push('email');
  return protocols;
}

module.exports = {
  scoreFinanceRelevance,
  assignCategory,
  detectProtocols,
  FINANCE_THRESHOLD,
};
