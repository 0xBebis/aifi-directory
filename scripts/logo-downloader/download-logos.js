const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

// ── Config ──
const PROJECTS_PATH = path.join(__dirname, '../../src/data/projects.json');
const LOGOS_DIR = path.join(__dirname, '../../public/logos');
const RESULTS_PATH = path.join(__dirname, 'results.json');
const OVERRIDES_DIR = path.join(__dirname, 'overrides');
const RATE_LIMIT_MS = 250;
const MAX_RETRIES = 2;
const MIN_FILE_SIZE = 400; // bytes - reject tiny placeholders

// ── Parse CLI args ──
const args = process.argv.slice(2);
let apiKey = null;
let resumeMode = false;
let onlySlugs = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--key' && args[i + 1]) { apiKey = args[++i]; }
  if (args[i] === '--resume') { resumeMode = true; }
  if (args[i] === '--only' && args[i + 1]) { onlySlugs = args[++i].split(','); }
}

// ── Helpers ──
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function extractDomain(websiteUrl) {
  try {
    const parsed = new URL(websiteUrl);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

function fetchBuffer(url, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const req = proto.get(url, { timeout: timeoutMs }, (res) => {
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchBuffer(res.headers.location, timeoutMs).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve({
          buffer,
          contentType: res.headers['content-type'] || '',
          size: buffer.length,
        });
      });
      res.on('error', reject);
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

async function downloadWithRetry(url, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await fetchBuffer(url);
      if (result.size < MIN_FILE_SIZE) return null; // too small, likely placeholder
      if (!result.contentType.includes('image') && !result.contentType.includes('octet-stream')) return null;
      return result;
    } catch (err) {
      if (attempt === retries) return null;
      await sleep(1000 * Math.pow(2, attempt - 1));
    }
  }
  return null;
}

// ── Sources ──
function logoDevUrl(domain) {
  if (!apiKey) return null;
  return `https://img.logo.dev/${domain}?token=${apiKey}&size=128&format=png`;
}

function googleFaviconUrl(domain) {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

// ── Main ──
async function main() {
  const projects = JSON.parse(fs.readFileSync(PROJECTS_PATH, 'utf8'));
  fs.mkdirSync(LOGOS_DIR, { recursive: true });
  fs.mkdirSync(OVERRIDES_DIR, { recursive: true });

  // Load or init results
  let results = { meta: {}, companies: {} };
  if (resumeMode && fs.existsSync(RESULTS_PATH)) {
    results = JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'));
  }
  results.meta.started = results.meta.started || new Date().toISOString();
  results.meta.lastRun = new Date().toISOString();

  // Filter projects
  let toProcess = projects;
  if (onlySlugs) {
    toProcess = projects.filter(p => onlySlugs.includes(p.slug));
  }

  let success = 0;
  let failed = 0;
  let skipped = 0;
  let overridden = 0;

  for (let i = 0; i < toProcess.length; i++) {
    const project = toProcess[i];
    const slug = project.slug;

    // Skip if already done in resume mode
    if (resumeMode && results.companies[slug]?.status === 'success') {
      skipped++;
      continue;
    }

    // Check for manual override
    const overridePath = path.join(OVERRIDES_DIR, `${slug}.png`);
    if (fs.existsSync(overridePath)) {
      const dest = path.join(LOGOS_DIR, `${slug}.png`);
      fs.copyFileSync(overridePath, dest);
      results.companies[slug] = {
        source: 'override',
        filename: `${slug}.png`,
        fileSize: fs.statSync(dest).size,
        status: 'success',
        downloadedAt: new Date().toISOString(),
      };
      overridden++;
      success++;
      continue;
    }

    const domain = extractDomain(project.website);
    if (!domain) {
      results.companies[slug] = { source: null, status: 'failed', error: 'No valid domain' };
      failed++;
      continue;
    }

    process.stdout.write(`[${i + 1}/${toProcess.length}] ${slug} (${domain}) ... `);

    const attempts = [];
    let downloaded = null;
    let source = null;

    // Try Logo.dev
    const ldUrl = logoDevUrl(domain);
    if (ldUrl) {
      downloaded = await downloadWithRetry(ldUrl);
      if (downloaded) {
        source = 'logo.dev';
      } else {
        attempts.push('logo.dev:failed');
      }
      await sleep(RATE_LIMIT_MS);
    }

    // Fallback: Google Favicon
    if (!downloaded) {
      const gfUrl = googleFaviconUrl(domain);
      downloaded = await downloadWithRetry(gfUrl);
      if (downloaded) {
        source = 'google-favicon';
      } else {
        attempts.push('google-favicon:failed');
      }
      await sleep(RATE_LIMIT_MS);
    }

    if (downloaded) {
      const dest = path.join(LOGOS_DIR, `${slug}.png`);
      fs.writeFileSync(dest, downloaded.buffer);
      results.companies[slug] = {
        source,
        filename: `${slug}.png`,
        fileSize: downloaded.size,
        contentType: downloaded.contentType,
        status: 'success',
        downloadedAt: new Date().toISOString(),
      };
      success++;
      const sizeKb = (downloaded.size / 1024).toFixed(1);
      console.log(`✓ ${source} (${sizeKb}KB)`);
    } else {
      results.companies[slug] = {
        source: null,
        status: 'failed',
        error: 'All sources failed',
        attempts,
      };
      failed++;
      console.log('✗ all sources failed');
    }

    // Save results periodically (every 20 projects)
    if ((i + 1) % 20 === 0) {
      results.meta.completed = success;
      results.meta.failed = failed;
      results.meta.skipped = skipped;
      fs.writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2));
    }
  }

  // Final save
  results.meta.completed = success;
  results.meta.failed = failed;
  results.meta.skipped = skipped;
  results.meta.overridden = overridden;
  results.meta.finishedAt = new Date().toISOString();
  fs.writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2));

  console.log('\n=== Download Summary ===');
  console.log(`Total processed: ${toProcess.length}`);
  console.log(`Success:         ${success}`);
  console.log(`Failed:          ${failed}`);
  console.log(`Skipped (resume):${skipped}`);
  console.log(`Overrides:       ${overridden}`);
  console.log(`Results saved to: ${RESULTS_PATH}`);
  console.log(`Logos saved to:   ${LOGOS_DIR}`);

  if (!apiKey) {
    console.log('\n⚠  No Logo.dev API key provided (--key pk_XXXX).');
    console.log('   Only Google Favicon fallback was used.');
    console.log('   For higher quality logos, sign up at https://logo.dev');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
