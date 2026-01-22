/**
 * Funding Data Scraper
 *
 * This script manages funding data collection from web searches.
 * Results are stored in results.json and can be reviewed before applying.
 *
 * Usage:
 *   node scraper.js status     - Show progress
 *   node scraper.js remaining  - List companies not yet searched
 *   node scraper.js review     - Generate review file
 *   node scraper.js apply      - Apply approved changes to projects.json
 */

const fs = require('fs');
const path = require('path');

const RESULTS_PATH = path.join(__dirname, 'results.json');
const PROJECTS_PATH = path.join(__dirname, '..', '..', 'src', 'data', 'projects.json');
const REVIEW_PATH = path.join(__dirname, 'review.json');

// Load data
function loadResults() {
  return JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'));
}

function loadProjects() {
  return JSON.parse(fs.readFileSync(PROJECTS_PATH, 'utf8'));
}

function saveResults(results) {
  fs.writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2));
}

// Parse funding amount from string
function parseFunding(str) {
  if (!str) return null;

  const cleaned = str.replace(/[,$]/g, '').trim().toUpperCase();

  // Match patterns like "1.5B", "500M", "50K", "1,500,000"
  const match = cleaned.match(/(\d+\.?\d*)\s*(B|BILLION|M|MILLION|K|THOUSAND)?/i);
  if (!match) return null;

  let amount = parseFloat(match[1]);
  const unit = (match[2] || '').toUpperCase();

  if (unit.startsWith('B')) amount *= 1_000_000_000;
  else if (unit.startsWith('M')) amount *= 1_000_000;
  else if (unit.startsWith('K') || unit.startsWith('T')) amount *= 1_000;
  else if (amount < 1000) amount *= 1_000_000; // Assume millions if no unit

  return Math.round(amount);
}

// Format funding for display
function formatFunding(amount) {
  if (!amount) return 'N/A';
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(0)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount}`;
}

// Add a search result
function addResult(slug, data) {
  const results = loadResults();
  results.companies[slug] = {
    ...data,
    searched_at: new Date().toISOString()
  };
  results.metadata.searched = Object.keys(results.companies).length;
  results.metadata.found = Object.values(results.companies).filter(c => c.funding_found).length;
  saveResults(results);
}

// Commands
function showStatus() {
  const results = loadResults();
  const projects = loadProjects();

  console.log('\n=== Funding Scraper Status ===\n');
  console.log(`Total companies: ${projects.length}`);
  console.log(`Searched: ${results.metadata.searched}`);
  console.log(`Found funding: ${results.metadata.found}`);
  console.log(`Remaining: ${projects.length - results.metadata.searched}`);
  console.log(`Progress: ${((results.metadata.searched / projects.length) * 100).toFixed(1)}%\n`);
}

function showRemaining(limit = 50) {
  const results = loadResults();
  const projects = loadProjects();

  const searched = new Set(Object.keys(results.companies));
  const remaining = projects.filter(p => !searched.has(p.slug));

  console.log(`\n=== Remaining Companies (${remaining.length} total, showing ${Math.min(limit, remaining.length)}) ===\n`);
  remaining.slice(0, limit).forEach(p => {
    console.log(`- ${p.slug}: ${p.name}`);
  });
}

function generateReview() {
  const results = loadResults();
  const projects = loadProjects();
  const projectMap = Object.fromEntries(projects.map(p => [p.slug, p]));

  const review = {
    generated: new Date().toISOString(),
    summary: {
      total: 0,
      updates_suggested: 0,
      new_funding: 0,
      changed_funding: 0,
      no_change: 0
    },
    companies: []
  };

  for (const [slug, data] of Object.entries(results.companies)) {
    const project = projectMap[slug];
    if (!project) continue;

    const current = project.funding || null;
    const found = data.funding_found || null;

    let action = 'keep';
    let reason = '';

    if (!found && !current) {
      action = 'skip';
      reason = 'No funding data found or needed';
    } else if (found && !current) {
      action = 'add';
      reason = 'New funding data found';
      review.summary.new_funding++;
    } else if (found && current && Math.abs(found - current) / current > 0.1) {
      action = 'update';
      reason = `Difference: ${formatFunding(current)} → ${formatFunding(found)}`;
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
      source: data.source || 'web search',
      confidence: data.confidence || 'medium',
      suggested_action: action,
      reason,
      approved: action === 'keep' || action === 'skip' ? true : null // Auto-approve no-change
    });

    review.summary.total++;
    if (action === 'add' || action === 'update') {
      review.summary.updates_suggested++;
    }
  }

  fs.writeFileSync(REVIEW_PATH, JSON.stringify(review, null, 2));
  console.log(`\nReview file generated: ${REVIEW_PATH}`);
  console.log(`\nSummary:`);
  console.log(`  Total reviewed: ${review.summary.total}`);
  console.log(`  New funding found: ${review.summary.new_funding}`);
  console.log(`  Changed funding: ${review.summary.changed_funding}`);
  console.log(`  No change needed: ${review.summary.no_change}`);
  console.log(`  Updates suggested: ${review.summary.updates_suggested}`);
}

function applyApproved() {
  if (!fs.existsSync(REVIEW_PATH)) {
    console.log('No review file found. Run "node scraper.js review" first.');
    return;
  }

  const review = JSON.parse(fs.readFileSync(REVIEW_PATH, 'utf8'));
  const projects = loadProjects();

  let applied = 0;

  for (const company of review.companies) {
    if (company.approved !== true) continue;
    if (company.suggested_action === 'keep' || company.suggested_action === 'skip') continue;

    const project = projects.find(p => p.slug === company.slug);
    if (!project) continue;

    if (company.suggested_action === 'add' || company.suggested_action === 'update') {
      project.funding = company.found_funding;
      applied++;
      console.log(`Updated ${project.name}: ${company.current_formatted} → ${company.found_formatted}`);
    }
  }

  if (applied > 0) {
    fs.writeFileSync(PROJECTS_PATH, JSON.stringify(projects, null, 2));
    console.log(`\nApplied ${applied} updates to projects.json`);
  } else {
    console.log('No approved updates to apply.');
  }
}

// CLI
const command = process.argv[2];

switch (command) {
  case 'status':
    showStatus();
    break;
  case 'remaining':
    showRemaining(parseInt(process.argv[3]) || 50);
    break;
  case 'review':
    generateReview();
    break;
  case 'apply':
    applyApproved();
    break;
  default:
    console.log(`
Funding Data Scraper

Commands:
  node scraper.js status     - Show progress
  node scraper.js remaining  - List companies not yet searched
  node scraper.js review     - Generate review file
  node scraper.js apply      - Apply approved changes to projects.json
    `);
}

// Export for use in other scripts
module.exports = { addResult, parseFunding, formatFunding, loadProjects, loadResults };
