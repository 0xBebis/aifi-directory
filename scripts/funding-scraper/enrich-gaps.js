/**
 * Funding Gap Analysis & Enrichment Tool
 *
 * Analyzes funding data coverage and generates reports with links
 * for manual enrichment via Tracxn Lite and Dealroom.
 *
 * Usage:
 *   node enrich-gaps.js report  - Generate funding-gaps.md (readable report)
 *   node enrich-gaps.js export  - Generate funding-gaps.csv (for manual enrichment)
 */

const fs = require('fs');
const path = require('path');

// Paths
const PROJECTS_PATH = path.join(__dirname, '..', '..', 'src', 'data', 'projects.json');
const MATCHES_PATH = path.join(__dirname, 'edgar-matches.json');
const RESULTS_PATH = path.join(__dirname, 'results.json');
const REPORT_PATH = path.join(__dirname, 'funding-gaps.md');
const CSV_PATH = path.join(__dirname, 'funding-gaps.csv');

// ─── Data Loading ────────────────────────────────────────────────────

function loadProjects() {
  return JSON.parse(fs.readFileSync(PROJECTS_PATH, 'utf8'));
}

function loadMatches() {
  if (!fs.existsSync(MATCHES_PATH)) return { matches: {}, unmatched: [] };
  return JSON.parse(fs.readFileSync(MATCHES_PATH, 'utf8'));
}

function loadResults() {
  if (!fs.existsSync(RESULTS_PATH)) return { metadata: {}, companies: {} };
  return JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'));
}

function formatFunding(amount) {
  if (!amount) return 'N/A';
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(0)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount}`;
}

// ─── Search URL Generators ───────────────────────────────────────────

function tracxnUrl(name) {
  return `https://tracxn.com/d/companies/__search?q=${encodeURIComponent(name)}`;
}

function dealroomUrl(name) {
  return `https://app.dealroom.co/companies?q=${encodeURIComponent(name)}`;
}

// ─── Gap Classification ─────────────────────────────────────────────

function classifyGaps(projects, matches, results) {
  const gaps = {
    noFunding: [],         // No funding amount at all
    noDate: [],            // Has funding but no last_funding_date
    intlNoEdgar: [],       // International companies (EDGAR doesn't cover)
    lowConfidence: [],     // EDGAR match was uncertain
    edgarMiss: [],         // US company, no EDGAR match
    allCovered: [],        // Has both funding and date
  };

  for (const p of projects) {
    const isUS = p.hq_country === 'US' || p.hq_country === 'USA' || !p.hq_country;
    const hasFunding = p.funding && p.funding > 0;
    const hasDate = !!p.last_funding_date;
    const edgarMatch = matches.matches?.[p.slug];
    const edgarResult = results.companies?.[p.slug];
    const isIntl = !isUS;

    const entry = {
      slug: p.slug,
      name: p.name,
      country: p.hq_country || '??',
      segment: p.segment || '',
      funding_stage: p.funding_stage || '',
      funding: p.funding || null,
      fundingDisplay: formatFunding(p.funding),
      last_funding_date: p.last_funding_date || '',
      hasFunding,
      hasDate,
      edgarConfidence: edgarMatch?.confidence || 'none',
    };

    if (hasFunding && hasDate) {
      gaps.allCovered.push(entry);
    } else if (!hasFunding) {
      gaps.noFunding.push(entry);

      // Sub-classify
      if (isIntl) {
        gaps.intlNoEdgar.push(entry);
      } else if (edgarMatch && edgarMatch.confidence === 'low') {
        gaps.lowConfidence.push(entry);
      } else if (!edgarMatch) {
        gaps.edgarMiss.push(entry);
      }
    } else if (hasFunding && !hasDate) {
      gaps.noDate.push(entry);
    }
  }

  return gaps;
}

// ─── Markdown Report ─────────────────────────────────────────────────

function generateReport() {
  const projects = loadProjects();
  const matches = loadMatches();
  const results = loadResults();
  const gaps = classifyGaps(projects, matches, results);

  const totalProjects = projects.length;
  const withFunding = projects.filter(p => p.funding && p.funding > 0).length;
  const withDate = projects.filter(p => p.last_funding_date).length;
  const edgarMatched = Object.keys(matches.matches || {}).length;
  const edgarResults = Object.entries(results.companies || {}).filter(([, c]) => c.source === 'sec-edgar-form-d').length;

  let md = `# Funding Data Gaps Report\n`;
  md += `Generated: ${new Date().toISOString().split('T')[0]}\n\n`;

  // Summary
  md += `## Summary\n\n`;
  md += `| Metric | Count | % |\n`;
  md += `|--------|------:|--:|\n`;
  md += `| Total companies | ${totalProjects} | 100% |\n`;
  md += `| With funding amount | ${withFunding} | ${((withFunding / totalProjects) * 100).toFixed(1)}% |\n`;
  md += `| With last_funding_date | ${withDate} | ${((withDate / totalProjects) * 100).toFixed(1)}% |\n`;
  md += `| EDGAR matched | ${edgarMatched} | ${((edgarMatched / totalProjects) * 100).toFixed(1)}% |\n`;
  md += `| EDGAR results fetched | ${edgarResults} | ${((edgarResults / totalProjects) * 100).toFixed(1)}% |\n`;
  md += `| **Missing funding** | **${gaps.noFunding.length}** | ${((gaps.noFunding.length / totalProjects) * 100).toFixed(1)}% |\n`;
  md += `| **Missing date only** | **${gaps.noDate.length}** | ${((gaps.noDate.length / totalProjects) * 100).toFixed(1)}% |\n`;
  md += `| Fully covered | ${gaps.allCovered.length} | ${((gaps.allCovered.length / totalProjects) * 100).toFixed(1)}% |\n\n`;

  // Missing Funding — US companies (no EDGAR match)
  if (gaps.edgarMiss.length > 0) {
    md += `## Missing Funding — US Companies (No EDGAR Match)\n\n`;
    md += `These companies are US-based but had no Form D filing found in EDGAR. They may not have filed, or the name didn't match.\n\n`;
    md += `| # | Company | Segment | Stage | Tracxn | Dealroom |\n`;
    md += `|--:|---------|---------|-------|--------|----------|\n`;
    gaps.edgarMiss.forEach((g, i) => {
      md += `| ${i + 1} | ${g.name} | ${g.segment} | ${g.funding_stage} | [Search](${tracxnUrl(g.name)}) | [Search](${dealroomUrl(g.name)}) |\n`;
    });
    md += `\n`;
  }

  // Missing Funding — International companies
  const intlNoFunding = gaps.noFunding.filter(g => {
    const isUS = g.country === 'US' || g.country === 'USA' || g.country === '??';
    return !isUS;
  });
  if (intlNoFunding.length > 0) {
    md += `## Missing Funding — International Companies\n\n`;
    md += `EDGAR only covers US filings. These international companies need manual enrichment.\n\n`;
    md += `| # | Company | Country | Segment | Stage | Tracxn | Dealroom |\n`;
    md += `|--:|---------|---------|---------|-------|--------|----------|\n`;
    intlNoFunding.forEach((g, i) => {
      md += `| ${i + 1} | ${g.name} | ${g.country} | ${g.segment} | ${g.funding_stage} | [Search](${tracxnUrl(g.name)}) | [Search](${dealroomUrl(g.name)}) |\n`;
    });
    md += `\n`;
  }

  // Low confidence EDGAR matches
  if (gaps.lowConfidence.length > 0) {
    md += `## Low Confidence EDGAR Matches\n\n`;
    md += `These companies had a possible EDGAR match but with low confidence. Verify manually.\n\n`;
    md += `| # | Company | EDGAR Entity | Segment | Tracxn | Dealroom |\n`;
    md += `|--:|---------|-------------|---------|--------|----------|\n`;
    gaps.lowConfidence.forEach((g, i) => {
      const edgarEntity = matches.matches[g.slug]?.entity_name || '?';
      md += `| ${i + 1} | ${g.name} | ${edgarEntity} | ${g.segment} | [Search](${tracxnUrl(g.name)}) | [Search](${dealroomUrl(g.name)}) |\n`;
    });
    md += `\n`;
  }

  // Missing Date (has funding, no date)
  if (gaps.noDate.length > 0) {
    md += `## Missing Last Funding Date\n\n`;
    md += `These companies have funding amounts but no \`last_funding_date\`. Look up their most recent round date.\n\n`;
    md += `| # | Company | Funding | Country | Tracxn | Dealroom |\n`;
    md += `|--:|---------|--------:|---------|--------|----------|\n`;
    gaps.noDate.forEach((g, i) => {
      md += `| ${i + 1} | ${g.name} | ${g.fundingDisplay} | ${g.country} | [Search](${tracxnUrl(g.name)}) | [Search](${dealroomUrl(g.name)}) |\n`;
    });
    md += `\n`;
  }

  // Priority list (top 30 by funding amount, missing date)
  const priorityNoDate = gaps.noDate
    .filter(g => g.funding)
    .sort((a, b) => (b.funding || 0) - (a.funding || 0))
    .slice(0, 30);

  if (priorityNoDate.length > 0) {
    md += `## Priority: Top Funded Companies Missing Date\n\n`;
    md += `These are the highest-funded companies still missing a \`last_funding_date\`.\n\n`;
    md += `| # | Company | Funding | Country | Tracxn | Dealroom |\n`;
    md += `|--:|---------|--------:|---------|--------|----------|\n`;
    priorityNoDate.forEach((g, i) => {
      md += `| ${i + 1} | ${g.name} | ${g.fundingDisplay} | ${g.country} | [Search](${tracxnUrl(g.name)}) | [Search](${dealroomUrl(g.name)}) |\n`;
    });
    md += `\n`;
  }

  fs.writeFileSync(REPORT_PATH, md);
  console.log(`\nReport generated: ${REPORT_PATH}`);
  console.log(`\nGap Summary:`);
  console.log(`  Missing funding:       ${gaps.noFunding.length}`);
  console.log(`    US (no EDGAR match): ${gaps.edgarMiss.length}`);
  console.log(`    International:       ${intlNoFunding.length}`);
  console.log(`    Low confidence:      ${gaps.lowConfidence.length}`);
  console.log(`  Missing date only:     ${gaps.noDate.length}`);
  console.log(`  Fully covered:         ${gaps.allCovered.length}`);
  console.log();
}

// ─── CSV Export ──────────────────────────────────────────────────────

function generateCSV() {
  const projects = loadProjects();
  const matches = loadMatches();
  const results = loadResults();
  const gaps = classifyGaps(projects, matches, results);

  // Combine all gap entries
  const allGaps = [
    ...gaps.noFunding.map(g => ({ ...g, gap_type: 'no_funding' })),
    ...gaps.noDate.map(g => ({ ...g, gap_type: 'no_date' })),
  ];

  // Deduplicate by slug
  const seen = new Set();
  const deduped = allGaps.filter(g => {
    if (seen.has(g.slug)) return false;
    seen.add(g.slug);
    return true;
  });

  const header = 'slug,name,country,segment,funding_stage,has_funding,has_date,gap_type,edgar_confidence,tracxn_url,dealroom_url';
  const rows = deduped.map(g => {
    const fields = [
      g.slug,
      `"${g.name.replace(/"/g, '""')}"`,
      g.country,
      g.segment,
      g.funding_stage,
      g.hasFunding ? 'yes' : 'no',
      g.hasDate ? 'yes' : 'no',
      g.gap_type || '',
      g.edgarConfidence,
      tracxnUrl(g.name),
      dealroomUrl(g.name),
    ];
    return fields.join(',');
  });

  const csv = [header, ...rows].join('\n');
  fs.writeFileSync(CSV_PATH, csv);

  console.log(`\nCSV exported: ${CSV_PATH}`);
  console.log(`Total gap entries: ${deduped.length}`);
  console.log(`  No funding: ${gaps.noFunding.length}`);
  console.log(`  No date:    ${gaps.noDate.length}\n`);
}

// ─── CLI ─────────────────────────────────────────────────────────────

const command = process.argv[2];

switch (command) {
  case 'report':
    generateReport();
    break;
  case 'export':
    generateCSV();
    break;
  default:
    console.log(`
Funding Gap Analysis Tool

Commands:
  node enrich-gaps.js report  - Generate funding-gaps.md (readable report)
  node enrich-gaps.js export  - Generate funding-gaps.csv (for manual enrichment)
    `);
}
