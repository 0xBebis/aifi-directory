/**
 * EDGAR Match Validator
 *
 * Automatically classifies EDGAR matches as valid or false-positive,
 * reverts incorrect dates, and generates a clean review.
 *
 * Usage:
 *   node validate-edgar.js           - Run validation, show report
 *   node validate-edgar.js apply     - Apply: revert bad dates, update matches confidence
 */

const fs = require('fs');
const path = require('path');

const MATCHES_PATH = path.join(__dirname, 'edgar-matches.json');
const RESULTS_PATH = path.join(__dirname, 'results.json');
const PROJECTS_PATH = path.join(__dirname, '..', '..', 'src', 'data', 'projects.json');

function loadJSON(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }

// ─── Classification Rules ────────────────────────────────────────────

// Words in entity name indicating a completely different industry
const WRONG_INDUSTRY_PATTERNS = [
  /\btherapeutic/i, /\bpharma/i, /\bbiotech/i, /\bbio\b/i, /\bbioph/i,
  /\bsurgical/i, /\bsport/i, /\bapartment/i, /\borthoped/i,
  /\breal estate/i, /\bqueen\b/i, /\butilities\b/i, /\blifescience/i,
  /\bhealth\b/i,
];

// Specific known false-positive entity names (manual overrides)
const KNOWN_FALSE_POSITIVES = {
  'alloy': 'Alloy Therapeutics (biotech, not identity platform)',
  'upstart': 'Upstart Power Holdings (energy, not lending)',
  'stripe': 'Stripe Milton LLC (unknown, not Stripe Inc)',
  'ramp': 'RAMp Sports LLC (sports, not corporate cards)',
  'natural': 'Natural Systems Utilities (not Natural AI)',
  'goldfinch': 'Goldfinch BioPharma (pharma, not DeFi lending)',
  'titan': 'TITAN INTERNATIONAL INC (industrial wheels, not investing app)',
  'salient': 'SALIENT SURGICAL TECHNOLOGIES (medical, not analytics)',
  'january': 'January Therapeutics (pharma, not debt collection)',
  'entera': 'Entera Bio Ltd. (biotech, not real estate)',
  'kin': 'KINETIC TECHNOLOGIES (electronics, not insurance)',
  'ridley': 'Ridley Apartments (real estate, not AI)',
  'vero': 'Vero Biotech (biotech, not mortgage)',
  'slate': 'Slate Pharmaceuticals (pharma, not trading agent)',
  'grass': 'Grass Queen (unrelated, not crypto)',
  'allora': 'Allora Health (health, not crypto AI)',
  'mx': 'MX Orthopedics (medical, not financial data)',
  'brex': 'BREX Briggs MF DST (real estate trust, not Brex fintech)',
  'affirm': 'Affirm Logic Corp (logic/security, not Affirm BNPL)',
  'coalition': 'Coalition POW LLC (not Coalition Insurance)',
  'harvey': 'Harvey SPV1 LLC (unrelated SPV from 2011)',
  'vicarious': 'Vicarious FPC Inc (different company)',
  'lulo': 'Lulo Ventures Inc. (VC firm, not Lulo lending)',
  'anthropic': 'Anthropic Capital Fund LP (investment fund, not Anthropic AI venture raise)',
  'vana': 'Vana & Sons LLC (family business, not Vana data company)',
  'pilot': 'Pilot Parent Holdings LP (PE acquisition vehicle, not venture funding)',
  'openspace': 'Openspace Ventures IV LP (VC firm, not construction tech)',
  'watershed': 'Watershed Capital Partners (fund, not ESG platform)',
  'wayfinder': 'Wayfinder Ventures LP (VC firm, not crypto agent)',
  'orbit': 'Orbit Fund LP (fund, not DeFi agent)',
  'ritual': 'Ritual Capital I LP (fund, not crypto infrastructure)',
  'albert': 'Albert Investment Associates LP (different company)',
  'jerry': 'JERRY JERRY Ltd LIABILITY Co (not Jerry insurance app)',
  'together-ai': 'Get Together AI Inc (not Together Computer / Together AI)',
  'axal': 'CC Axal Ltd (unclear entity, likely different company)',
  'campfire': 'Campfire Fund LLC (fund entity, not the company)',
  'pond': 'Center Pond Partners LP (different fund)',
  'truenorth': 'TrueNorth Lifesciences SPV (lifesciences, not trading)',
  'sphera': 'Sphera Small Cap Fund (fund, not ESG platform)',
};

// SPV / third-party investment vehicles (not the company itself)
const SPV_PATTERNS = [
  /\bgaingels\b/i,
  /\bparty round\b/i,
  /\bscop spv\b/i,
  /\bseries of .+ llc/i,
  /\batomizer spv\b/i,
  /\bcoinvestors?\b/i,
  /\bfifth era\b/i,
  /\bcap table coalition\b/i,
  /\blinqto\b/i,
];

// Trading/quant segment — fund filings represent AUM, not venture funding
const TRADING_SEGMENTS = new Set(['trading', 'wealth']);

// For trading companies matched to fund entities, the data is AUM not venture funding
const FUND_ENTITY_PATTERNS = [
  /\bfund\b/i, /\bcapital\b/i, /\bpartners?\b/i, /\bventures?\b/i,
  /\b[Ll]\.?[Pp]\.?\b/, /\bspv\b/i, /\bdst\b/i, /\bportfolio\b/i,
  /\bswap dealer\b/i,
];

function classifyMatch(slug, match, project) {
  const entityName = match.entity_name || '';
  const entityLower = entityName.toLowerCase();
  const segment = project.segment || '';

  // 1. Known false positives (manual overrides)
  if (KNOWN_FALSE_POSITIVES[slug]) {
    return { status: 'false_positive', reason: KNOWN_FALSE_POSITIVES[slug] };
  }

  // 2. Wrong industry keywords in entity name
  for (const pattern of WRONG_INDUSTRY_PATTERNS) {
    if (pattern.test(entityName)) {
      return { status: 'false_positive', reason: `Industry mismatch: ${entityName}` };
    }
  }

  // 3. SPV / third-party investment vehicle
  for (const pattern of SPV_PATTERNS) {
    if (pattern.test(entityName)) {
      return { status: 'false_positive', reason: `Third-party SPV: ${entityName}` };
    }
  }

  // 4. Trading company matched to fund entity → AUM not venture funding
  if (TRADING_SEGMENTS.has(segment)) {
    const isFundEntity = FUND_ENTITY_PATTERNS.some(p => p.test(entityName));
    if (isFundEntity) {
      return { status: 'fund_aum', reason: `Fund AUM (not venture funding): ${entityName}` };
    }
  }

  // 5. Medium/low confidence → needs review
  if (match.confidence === 'low') {
    return { status: 'false_positive', reason: `Low confidence match: ${entityName}` };
  }

  if (match.confidence === 'medium') {
    // Medium confidence that didn't hit any other filter — flag for review
    return { status: 'needs_review', reason: `Medium confidence: ${entityName}` };
  }

  // 6. Non-trading company matched to a fund-pattern entity
  const isFundEntity = FUND_ENTITY_PATTERNS.some(p => p.test(entityName));
  if (isFundEntity) {
    // Check if the entity name is close enough to be the actual company's holding entity
    // e.g., "Betterment Holdings, Inc." is valid, "Watershed Capital Partners" is not
    const ourNameLower = project.name.toLowerCase().replace(/[^a-z]/g, '');
    const entityClean = entityLower.replace(/[^a-z]/g, '');
    if (entityClean.startsWith(ourNameLower) || ourNameLower.startsWith(entityClean.split(/capital|fund|partner|venture/)[0].trim())) {
      // Name starts with our company name → likely the company's own entity
      return { status: 'valid', reason: `Company holding entity: ${entityName}` };
    }
    return { status: 'false_positive', reason: `Fund/capital entity: ${entityName}` };
  }

  // 7. Passes all checks → valid
  return { status: 'valid', reason: `Matched: ${entityName}` };
}

// ─── Main ────────────────────────────────────────────────────────────

function validate(applyChanges) {
  const matches = loadJSON(MATCHES_PATH);
  const results = loadJSON(RESULTS_PATH);
  const projects = loadJSON(PROJECTS_PATH);
  const pMap = {};
  projects.forEach(p => pMap[p.slug] = p);

  const classifications = { valid: [], false_positive: [], fund_aum: [], needs_review: [] };
  const datesToRevert = [];

  for (const [slug, match] of Object.entries(matches.matches)) {
    const project = pMap[slug];
    if (project === undefined) continue;

    const result = classifyMatch(slug, match, project);
    const entry = {
      slug,
      name: project.name,
      entity: match.entity_name,
      confidence: match.confidence,
      status: result.status,
      reason: result.reason,
      filingDate: match.filings[0] ? match.filings[0].date : null,
    };

    classifications[result.status] = classifications[result.status] || [];
    classifications[result.status].push(entry);

    // Track dates that need reverting (applied from false positives)
    if (result.status !== 'valid' && project.last_funding_date && match.filings[0]) {
      const edgarDate = match.filings[0].date.substring(0, 7);
      if (project.last_funding_date === edgarDate) {
        datesToRevert.push({
          slug,
          name: project.name,
          badDate: project.last_funding_date,
          entity: match.entity_name,
        });
      }
    }
  }

  // ─── Report ──────────────────────────────────────────────────

  console.log('\n=== EDGAR Validation Report ===\n');
  console.log(`Valid matches:      ${classifications.valid.length}`);
  console.log(`False positives:    ${classifications.false_positive.length}`);
  console.log(`Fund AUM (skip):    ${classifications.fund_aum.length}`);
  console.log(`Needs review:       ${classifications.needs_review.length}`);
  console.log(`Dates to revert:    ${datesToRevert.length}`);

  console.log('\n--- VALID MATCHES ---');
  for (const e of classifications.valid) {
    console.log(`  ✓ ${e.slug.padEnd(25)} ${e.entity}`);
  }

  console.log('\n--- FALSE POSITIVES ---');
  for (const e of classifications.false_positive) {
    console.log(`  ✗ ${e.slug.padEnd(25)} ${e.reason}`);
  }

  console.log('\n--- FUND AUM (trading companies, not venture funding) ---');
  for (const e of classifications.fund_aum) {
    console.log(`  $ ${e.slug.padEnd(25)} ${e.reason}`);
  }

  if (classifications.needs_review.length > 0) {
    console.log('\n--- NEEDS REVIEW ---');
    for (const e of classifications.needs_review) {
      console.log(`  ? ${e.slug.padEnd(25)} ${e.reason}`);
    }
  }

  if (datesToRevert.length > 0) {
    console.log('\n--- DATES TO REVERT ---');
    for (const d of datesToRevert) {
      console.log(`  ← ${d.slug.padEnd(25)} ${d.badDate} (from ${d.entity})`);
    }
  }

  // ─── Apply Changes ────────────────────────────────────────────

  if (applyChanges) {
    console.log('\n=== Applying Changes ===\n');

    // 1. Revert dates from false positives
    let datesReverted = 0;
    for (const d of datesToRevert) {
      const project = projects.find(p => p.slug === d.slug);
      if (project) {
        delete project.last_funding_date;
        datesReverted++;
        console.log(`  Reverted date: ${d.name} (removed ${d.badDate})`);
      }
    }

    // 2. Downgrade false positives in matches to 'rejected'
    let matchesDowngraded = 0;
    const invalidSlugs = new Set([
      ...classifications.false_positive.map(e => e.slug),
      ...classifications.fund_aum.map(e => e.slug),
    ]);
    for (const slug of invalidSlugs) {
      if (matches.matches[slug]) {
        matches.matches[slug].validated = 'rejected';
        matchesDowngraded++;
      }
    }

    // 3. Mark valid matches
    for (const e of classifications.valid) {
      if (matches.matches[e.slug]) {
        matches.matches[e.slug].validated = 'approved';
      }
    }

    // 4. Mark needs-review
    for (const e of (classifications.needs_review || [])) {
      if (matches.matches[e.slug]) {
        matches.matches[e.slug].validated = 'needs_review';
      }
    }

    // 5. Remove rejected entries from results.json
    let resultsRemoved = 0;
    for (const slug of invalidSlugs) {
      if (results.companies[slug]) {
        delete results.companies[slug];
        resultsRemoved++;
      }
    }
    results.metadata.searched = Object.keys(results.companies).length;
    results.metadata.found = Object.values(results.companies).filter(c => c.funding_found).length;

    // Save
    fs.writeFileSync(PROJECTS_PATH, JSON.stringify(projects, null, 2));
    fs.writeFileSync(MATCHES_PATH, JSON.stringify(matches, null, 2));
    fs.writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2));

    console.log(`\nDates reverted:     ${datesReverted}`);
    console.log(`Matches downgraded: ${matchesDowngraded}`);
    console.log(`Results removed:    ${resultsRemoved}`);
    console.log(`Valid results:      ${Object.keys(results.companies).length}`);

    // 6. Re-generate review.json with only valid results
    const { addResult, parseFunding, formatFunding, loadProjects } = require('./scraper.js');
    const reviewProjects = loadProjects();
    const projectMap = {};
    reviewProjects.forEach(p => projectMap[p.slug] = p);

    const review = {
      generated: new Date().toISOString(),
      summary: { total: 0, updates_suggested: 0, new_funding: 0, changed_funding: 0, no_change: 0 },
      companies: [],
    };

    for (const [slug, data] of Object.entries(results.companies)) {
      const project = projectMap[slug];
      if (project === undefined) continue;

      const current = project.funding || null;
      const found = data.funding_found || null;

      let action = 'keep';
      let reason = '';

      if (found === null && current === null) {
        action = 'skip';
        reason = 'No funding data found';
      } else if (found && current === null) {
        action = 'add';
        reason = 'New funding data found';
        review.summary.new_funding++;
      } else if (found && current && Math.abs(found - current) / current > 0.1) {
        action = 'update';
        reason = 'Difference: ' + formatFunding(current) + ' → ' + formatFunding(found);
        review.summary.changed_funding++;
      } else {
        action = 'keep';
        reason = 'Values match or within 10%';
        review.summary.no_change++;
      }

      review.companies.push({
        slug,
        name: project.name,
        current_funding: current,
        current_formatted: formatFunding(current),
        found_funding: found,
        found_formatted: formatFunding(found),
        source: data.source || 'sec-edgar-form-d',
        confidence: data.confidence || 'high',
        suggested_action: action,
        reason,
        approved: action === 'keep' || action === 'skip' ? true : null,
      });

      review.summary.total++;
      if (action === 'add' || action === 'update') {
        review.summary.updates_suggested++;
      }
    }

    const REVIEW_PATH = path.join(__dirname, 'review.json');
    fs.writeFileSync(REVIEW_PATH, JSON.stringify(review, null, 2));

    console.log(`\nClean review generated:`);
    console.log(`  Total:      ${review.summary.total}`);
    console.log(`  New:        ${review.summary.new_funding}`);
    console.log(`  Changed:    ${review.summary.changed_funding}`);
    console.log(`  No change:  ${review.summary.no_change}`);
    console.log(`  Suggested:  ${review.summary.updates_suggested}`);
  } else {
    console.log('\nRun with "apply" to execute changes:');
    console.log('  node validate-edgar.js apply');
  }
}

const command = process.argv[2];
validate(command === 'apply');
