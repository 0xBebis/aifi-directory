/**
 * Apply Web-Sourced Enrichment Data
 *
 * Reads web-enrichment.json and applies dates/funding to projects.json.
 *
 * Usage:
 *   node apply-enrichment.js           - Dry run (show what would change)
 *   node apply-enrichment.js apply     - Apply changes to projects.json
 */

const fs = require('fs');
const path = require('path');

const ENRICHMENT_PATH = path.join(__dirname, 'web-enrichment.json');
const PROJECTS_PATH = path.join(__dirname, '..', '..', 'src', 'data', 'projects.json');

function loadJSON(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }

function run(applyChanges) {
  const enrichment = loadJSON(ENRICHMENT_PATH);
  const projects = loadJSON(PROJECTS_PATH);
  const pMap = {};
  projects.forEach(p => pMap[p.slug] = p);

  const changes = { dates_added: 0, dates_updated: 0, funding_updated: 0, skipped: 0 };
  const log = [];

  for (const entry of enrichment.enrichments) {
    const project = pMap[entry.slug];
    if (!project) {
      log.push(`  SKIP  ${entry.slug.padEnd(30)} Not found in projects.json`);
      changes.skipped++;
      continue;
    }

    let changed = false;

    // Apply last_funding_date
    if (entry.last_funding_date) {
      const existing = project.last_funding_date;
      if (!existing) {
        log.push(`  +DATE ${entry.slug.padEnd(30)} ${entry.last_funding_date}  (${entry.note})`);
        if (applyChanges) project.last_funding_date = entry.last_funding_date;
        changes.dates_added++;
        changed = true;
      } else if (entry.last_funding_date > existing) {
        log.push(`  ↑DATE ${entry.slug.padEnd(30)} ${existing} → ${entry.last_funding_date}  (${entry.note})`);
        if (applyChanges) project.last_funding_date = entry.last_funding_date;
        changes.dates_updated++;
        changed = true;
      } else {
        log.push(`  =DATE ${entry.slug.padEnd(30)} ${existing} (existing is same or newer)`);
      }
    }

    // Apply funding amount (only if explicitly provided and different)
    if (entry.funding && entry.funding !== project.funding) {
      const old = project.funding;
      log.push(`  $FUND ${entry.slug.padEnd(30)} ${old || 'none'} → ${entry.funding}  (${entry.note})`);
      if (applyChanges) project.funding = entry.funding;
      changes.funding_updated++;
      changed = true;
    }
  }

  console.log('\n=== Web Enrichment Report ===\n');
  console.log(`Source:           ${enrichment.metadata.source}`);
  console.log(`Entries:          ${enrichment.enrichments.length}`);
  console.log(`Dates added:      ${changes.dates_added}`);
  console.log(`Dates updated:    ${changes.dates_updated}`);
  console.log(`Funding updated:  ${changes.funding_updated}`);
  console.log(`Skipped:          ${changes.skipped}`);

  console.log('\n--- Changes ---');
  for (const l of log) console.log(l);

  if (applyChanges) {
    fs.writeFileSync(PROJECTS_PATH, JSON.stringify(projects, null, 2));
    console.log('\n✓ Changes applied to projects.json');
  } else {
    console.log('\nDry run. Use "node apply-enrichment.js apply" to apply.');
  }
}

const command = process.argv[2];
run(command === 'apply');
