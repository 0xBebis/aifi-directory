#!/usr/bin/env node

/**
 * AIFI Weekly Data Scrape Orchestrator
 *
 * Runs all automated data refresh pipelines in sequence:
 * 1. Agent pipeline (The Graph)
 * 2. EDGAR funding scraper (SEC)
 * 3. EDGAR validator (clean false positives)
 * 4. AI type classification
 * 5. Data validation
 *
 * Usage:
 *   node scripts/weekly-scrape.js           # Run full pipeline
 *   node scripts/weekly-scrape.js --dry-run # Preview what would run
 *   node scripts/weekly-scrape.js agents    # Run only agent pipeline
 *   node scripts/weekly-scrape.js edgar     # Run only EDGAR pipeline
 *   node scripts/weekly-scrape.js classify  # Run only AI classification
 *
 * Exit codes:
 *   0 = Success
 *   1 = Pipeline error (check logs)
 *   2 = Validation failed (data issues)
 */

const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const FUNDING_DIR = path.join(__dirname, 'funding-scraper');
const AGENT_DIR = path.join(__dirname, 'agent-pipeline');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

function log(msg, color = '') {
  const timestamp = new Date().toISOString().slice(11, 19);
  console.log(`${colors.dim}[${timestamp}]${colors.reset} ${color}${msg}${colors.reset}`);
}

function header(msg) {
  console.log(`\n${colors.bright}${colors.cyan}═══ ${msg} ═══${colors.reset}\n`);
}

function success(msg) {
  log(`✓ ${msg}`, colors.green);
}

function warn(msg) {
  log(`⚠ ${msg}`, colors.yellow);
}

function error(msg) {
  log(`✗ ${msg}`, colors.red);
}

function runCommand(cmd, cwd = ROOT, options = {}) {
  const { silent = false, allowFail = false } = options;

  log(`Running: ${cmd}`, colors.dim);

  try {
    const output = execSync(cmd, {
      cwd,
      encoding: 'utf-8',
      stdio: silent ? 'pipe' : 'inherit',
      timeout: 600000, // 10 min timeout
    });
    return { success: true, output };
  } catch (err) {
    if (allowFail) {
      warn(`Command failed (allowed): ${cmd}`);
      return { success: false, error: err.message };
    }
    throw err;
  }
}

// Pipeline steps
const pipelines = {
  agents: {
    name: 'Agent Pipeline',
    description: 'Fetch EIP-8004 agents from The Graph',
    run: () => {
      header('Agent Pipeline');
      runCommand('node fetch-agents.js', AGENT_DIR);
      success('Agent data refreshed');
    },
  },

  edgar: {
    name: 'EDGAR Funding',
    description: 'Scrape SEC Form D filings for funding data',
    run: () => {
      header('EDGAR Funding Scraper');

      log('Phase 1/3: Searching EDGAR for company matches...');
      runCommand('node edgar-scraper.js search', FUNDING_DIR, { allowFail: true });

      log('Phase 2/3: Fetching Form D data...');
      runCommand('node edgar-scraper.js fetch', FUNDING_DIR, { allowFail: true });

      log('Phase 3/3: Validating matches and cleaning false positives...');
      runCommand('node validate-edgar.js apply', FUNDING_DIR, { allowFail: true });

      log('Applying validated dates to projects...');
      runCommand('node edgar-scraper.js apply-dates', FUNDING_DIR, { allowFail: true });

      success('EDGAR pipeline complete');
    },
  },

  classify: {
    name: 'AI Type Classification',
    description: 'Classify companies by AI technology type',
    run: () => {
      header('AI Type Classification');
      runCommand('node classify-ai-type.js', FUNDING_DIR);
      success('AI types classified');
    },
  },

  validate: {
    name: 'Data Validation',
    description: 'Validate data integrity',
    run: () => {
      header('Data Validation');
      runCommand('npm run validate', ROOT);
      success('Data validation passed');
    },
  },

  build: {
    name: 'Build Test',
    description: 'Verify project builds successfully',
    run: () => {
      header('Build Test');
      runCommand('npm run build', ROOT);
      success('Build successful');
    },
  },
};

// Parse arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const specificPipeline = args.find(a => !a.startsWith('--'));

function showHelp() {
  console.log(`
${colors.bright}AIFI Weekly Scrape Orchestrator${colors.reset}

Usage:
  node scripts/weekly-scrape.js [pipeline] [options]

Pipelines:
  agents    Fetch agent registry from The Graph
  edgar     Scrape SEC EDGAR for funding data
  classify  Classify companies by AI type
  validate  Run data validation
  build     Test production build

Options:
  --dry-run   Show what would run without executing
  --help      Show this help

Examples:
  node scripts/weekly-scrape.js           # Run full weekly pipeline
  node scripts/weekly-scrape.js agents    # Run only agent pipeline
  node scripts/weekly-scrape.js --dry-run # Preview full pipeline
`);
}

async function main() {
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }

  const startTime = Date.now();

  console.log(`
${colors.bright}${colors.cyan}
╔═══════════════════════════════════════════════════════════╗
║           AIFI Weekly Data Scrape                         ║
║           ${new Date().toISOString().slice(0, 10)}                                      ║
╚═══════════════════════════════════════════════════════════╝
${colors.reset}`);

  // Determine which pipelines to run
  let pipelinesToRun;
  if (specificPipeline) {
    if (!pipelines[specificPipeline]) {
      error(`Unknown pipeline: ${specificPipeline}`);
      showHelp();
      process.exit(1);
    }
    pipelinesToRun = [specificPipeline];
  } else {
    // Full weekly pipeline order
    pipelinesToRun = ['agents', 'edgar', 'classify', 'validate', 'build'];
  }

  if (isDryRun) {
    log('DRY RUN - showing what would execute:\n', colors.yellow);
    pipelinesToRun.forEach((key, i) => {
      const p = pipelines[key];
      console.log(`  ${i + 1}. ${colors.bright}${p.name}${colors.reset}`);
      console.log(`     ${colors.dim}${p.description}${colors.reset}\n`);
    });
    process.exit(0);
  }

  // Run pipelines
  let failed = false;
  for (const key of pipelinesToRun) {
    const pipeline = pipelines[key];
    try {
      pipeline.run();
    } catch (err) {
      error(`Pipeline "${pipeline.name}" failed: ${err.message}`);
      failed = true;
      if (key === 'validate' || key === 'build') {
        // Critical failures - stop here
        break;
      }
      // Non-critical - continue with next pipeline
      warn('Continuing with next pipeline...');
    }
  }

  // Summary
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  header('Summary');

  if (failed) {
    error(`Completed with errors in ${duration}s`);
    console.log(`\n${colors.yellow}Review the output above for details.${colors.reset}`);
    console.log(`${colors.dim}Run specific pipeline to retry: node scripts/weekly-scrape.js <pipeline>${colors.reset}\n`);
    process.exit(1);
  } else {
    success(`All pipelines completed successfully in ${duration}s`);
    console.log(`
${colors.dim}Next steps:
  1. Review changes: git diff src/data/
  2. Check gap report: cat scripts/funding-scraper/funding-gaps.md | head -50
  3. Commit if satisfied: git add -A && git commit -m "Weekly data refresh"
${colors.reset}`);
    process.exit(0);
  }
}

main().catch(err => {
  error(`Fatal error: ${err.message}`);
  process.exit(1);
});
