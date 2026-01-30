// ── Spam & Quality Filter ──
// Removes test agents, duplicates, and low-quality entries
// that slip past the finance keyword filter.

const { SPAM_NAME_PATTERNS, SPAM_DESC_PATTERNS, MIN_DESCRIPTION_LENGTH } = require('./config');

/**
 * Test text against an array of patterns (strings or RegExps).
 * Returns the first matching pattern description, or null if none match.
 * @param {string} text - lowercased text to test
 * @param {Array<string|RegExp>} patterns
 * @returns {string | null} description of the matching pattern, or null
 */
function matchesAnyPattern(text, patterns) {
  for (const pattern of patterns) {
    if (pattern instanceof RegExp) {
      if (pattern.test(text)) return `matches pattern: ${pattern}`;
    } else if (text.includes(pattern.toLowerCase())) {
      return `contains "${pattern}"`;
    }
  }
  return null;
}

/**
 * Check if an agent's name matches known spam/test patterns.
 * @param {string} name
 * @returns {{ isSpam: boolean, reason: string | null }}
 */
function isSpamName(name) {
  const match = matchesAnyPattern(name.toLowerCase().trim(), SPAM_NAME_PATTERNS);
  return match
    ? { isSpam: true, reason: `name ${match}` }
    : { isSpam: false, reason: null };
}

/**
 * Check if description is low-quality boilerplate.
 * @param {string} description
 * @returns {{ isSpam: boolean, reason: string | null }}
 */
function isSpamDescription(description) {
  if (!description || description.trim().length < MIN_DESCRIPTION_LENGTH) {
    return { isSpam: true, reason: `description too short (${(description || '').trim().length} < ${MIN_DESCRIPTION_LENGTH} chars)` };
  }

  // Strip technical tokens before pattern matching — URLs, hex addresses, and
  // protocol URIs contain long non-space runs and consonant/digit sequences
  // that trigger gibberish detectors as false positives.
  const stripped = description
    .replace(/https?:\/\/\S+/gi, ' ')       // URLs
    .replace(/\S+:\/\/\S+/gi, ' ')          // other protocol URIs
    .replace(/0x[0-9a-f]{10,}/gi, ' ')       // Ethereum hex addresses
    .replace(/\S+\/\S+\/\S+/g, ' ');         // slash-separated paths (a/b/c)

  const match = matchesAnyPattern(stripped.toLowerCase(), SPAM_DESC_PATTERNS);
  return match
    ? { isSpam: true, reason: `description ${match}` }
    : { isSpam: false, reason: null };
}

/**
 * Run all spam checks on a single agent.
 * @param {object} agent - Raw agent with registrationFile
 * @returns {{ isSpam: boolean, reasons: string[] }}
 */
function checkAgent(agent) {
  const reg = agent.registrationFile || {};
  const name = reg.name || '';
  const description = reg.description || '';
  const reasons = [];

  const nameCheck = isSpamName(name);
  if (nameCheck.isSpam) reasons.push(nameCheck.reason);

  const descCheck = isSpamDescription(description);
  if (descCheck.isSpam) reasons.push(descCheck.reason);

  return { isSpam: reasons.length > 0, reasons };
}

/**
 * Deduplicate agents by name + description.
 * When duplicates exist, keep only the most recently created one.
 * @param {object[]} agents - Array of { raw, agentId, ... } scored entries
 * @returns {{ kept: object[], removed: object[] }}
 */
function deduplicateAgents(agents) {
  const groups = new Map();

  for (const entry of agents) {
    const reg = entry.raw.registrationFile || {};
    // Truncate description to 100 chars for dedup key — avoids false negatives from long unique suffixes
    const key = `${(reg.name || '').trim().toLowerCase()}::${(reg.description || '').trim().toLowerCase().slice(0, 100)}`;

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(entry);
  }

  const kept = [];
  const removed = [];

  for (const [, group] of groups) {
    // Sort by createdAt descending, keep the newest
    group.sort((a, b) => parseInt(b.raw.createdAt, 10) - parseInt(a.raw.createdAt, 10));
    kept.push(group[0]);
    removed.push(...group.slice(1));
  }

  return { kept, removed };
}

module.exports = {
  checkAgent,
  deduplicateAgents,
  isSpamName,
  isSpamDescription,
};
