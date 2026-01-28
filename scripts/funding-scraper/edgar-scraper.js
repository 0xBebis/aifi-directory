/**
 * SEC EDGAR Form D Scraper
 *
 * Searches SEC EDGAR for Form D filings filed by US companies in the AIFI directory,
 * extracts funding data from the filings, and stores results for review.
 *
 * Usage:
 *   node edgar-scraper.js search              - Search EDGAR for all US companies
 *   node edgar-scraper.js search --slug=brex  - Search a single company
 *   node edgar-scraper.js fetch               - Fetch Form D data for matched companies
 *   node edgar-scraper.js fetch --slug=brex   - Fetch a single company
 *   node edgar-scraper.js status              - Show match/fetch progress
 *   node edgar-scraper.js apply-dates         - Write last_funding_date to projects.json
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Paths
const MATCHES_PATH = path.join(__dirname, 'edgar-matches.json');
const RESULTS_PATH = path.join(__dirname, 'results.json');
const PROJECTS_PATH = path.join(__dirname, '..', '..', 'src', 'data', 'projects.json');
const ERROR_LOG_PATH = path.join(__dirname, 'edgar-errors.log');

// SEC EDGAR requires a User-Agent with contact info
const USER_AGENT = 'AIFI Directory admin@aifimap.com';
const RATE_LIMIT_MS = 200; // 5 req/sec, well under SEC's 10 req/sec limit

// Company name suffixes to strip for matching
const NAME_SUFFIXES = /\b(inc\.?|incorporated|llc|llp|l\.l\.c\.?|l\.l\.p\.?|corp\.?|corporation|ltd\.?|limited|co\.?|company|lp|l\.p\.?|plc|group|holdings?|technologies|technology|tech|labs?|ai|software|solutions|services|financial|finance|capital|ventures?|partners?|systems?)\b/gi;

// ─── Utility Functions ───────────────────────────────────────────────

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function logError(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFileSync(ERROR_LOG_PATH, line);
  console.error(`  ERROR: ${msg}`);
}

function fetchUrl(url, accept = 'application/json') {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': accept,
      },
    };

    https.get(url, options, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        // Follow redirect
        const redirectUrl = res.headers.location;
        if (redirectUrl) {
          fetchUrl(redirectUrl.startsWith('http') ? redirectUrl : `https://${new URL(url).host}${redirectUrl}`, accept)
            .then(resolve)
            .catch(reject);
          return;
        }
      }

      if (res.statusCode === 429) {
        reject(new Error('RATE_LIMIT'));
        return;
      }

      if (res.statusCode === 403) {
        reject(new Error(`HTTP 403 Forbidden: ${url}`));
        return;
      }

      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: ${url}`));
        return;
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function fetchJSON(url) {
  const data = await fetchUrl(url, 'application/json');
  return JSON.parse(data);
}

async function fetchText(url) {
  return fetchUrl(url, 'text/xml');
}

async function fetchWithRetry(fetchFn, url, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fetchFn(url);
    } catch (err) {
      if (err.message === 'RATE_LIMIT' && attempt < retries) {
        console.log(`  Rate limited, backing off 5s (attempt ${attempt}/${retries})...`);
        await sleep(5000);
        continue;
      }
      throw err;
    }
  }
}

// ─── Name Matching ───────────────────────────────────────────────────

function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(NAME_SUFFIXES, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function jaccardSimilarity(a, b) {
  const setA = new Set(a.split(' '));
  const setB = new Set(b.split(' '));
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
}

function matchScore(ourName, edgarName) {
  const normOur = normalizeName(ourName);
  const normEdgar = normalizeName(edgarName);

  if (!normOur || !normEdgar) return { match: false, confidence: 'none' };

  // Exact match on normalized names
  if (normOur === normEdgar) {
    return { match: true, confidence: 'high' };
  }

  const wordsOur = normOur.split(' ').filter(Boolean);
  const wordsEdgar = normEdgar.split(' ').filter(Boolean);
  const wordCountRatio = Math.min(wordsOur.length, wordsEdgar.length) / Math.max(wordsOur.length, wordsEdgar.length);

  // One name starts with the other (e.g., "Plaid" matches "Plaid Technologies")
  if (normOur.length > 2 && normEdgar.length > 2) {
    if (normEdgar.startsWith(normOur) || normOur.startsWith(normEdgar)) {
      // Only high confidence if word counts are close (prevents "Brex" matching "Brex Briggs MF DST")
      if (wordCountRatio >= 0.5) {
        return { match: true, confidence: 'high' };
      }
      return { match: true, confidence: 'medium' };
    }

    // One name contains the other — only match if word counts are similar
    if (normEdgar.includes(normOur) || normOur.includes(normEdgar)) {
      if (wordCountRatio >= 0.5) {
        return { match: true, confidence: 'medium' };
      }
      return { match: true, confidence: 'low' };
    }
  }

  // Jaccard word similarity
  const similarity = jaccardSimilarity(normOur, normEdgar);
  if (similarity >= 0.6) {
    return { match: true, confidence: 'high' };
  }
  if (similarity > 0.4) {
    return { match: true, confidence: 'medium' };
  }
  if (similarity > 0.25) {
    return { match: true, confidence: 'low' };
  }

  return { match: false, confidence: 'none' };
}

// ─── Data Loading ────────────────────────────────────────────────────

function loadProjects() {
  return JSON.parse(fs.readFileSync(PROJECTS_PATH, 'utf8'));
}

function loadMatches() {
  if (!fs.existsSync(MATCHES_PATH)) {
    return {
      metadata: { searched: 0, matched: 0, unmatched: 0, last_run: null },
      matches: {},
      unmatched: [],
    };
  }
  return JSON.parse(fs.readFileSync(MATCHES_PATH, 'utf8'));
}

function saveMatches(matches) {
  fs.writeFileSync(MATCHES_PATH, JSON.stringify(matches, null, 2));
}

function loadResults() {
  if (!fs.existsSync(RESULTS_PATH)) {
    return { metadata: { searched: 0, found: 0 }, companies: {} };
  }
  return JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'));
}

function saveResults(results) {
  fs.writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2));
}

// ─── EDGAR Search (Phase 1) ─────────────────────────────────────────

function extractEntityName(displayName) {
  // display_names format: "BREX INC  (CIK 0002083653)" or "Stripe, Inc.  (STRIPE)  (CIK 0001234567)"
  // Strip the (CIK ...) suffix and any ticker symbols
  return displayName
    .replace(/\s*\(CIK\s+\d+\)\s*$/, '')
    .replace(/\s*\([A-Z0-9, -]+\)\s*$/, '') // Strip ticker symbols like (STRIPE)
    .trim();
}

async function searchCompany(slug, name) {
  // Use EDGAR full-text search (EFTS)
  // Only use forms=D (not D/A, which causes 500 due to slash)
  const query = encodeURIComponent(`"${name}"`);
  const url = `https://efts.sec.gov/LATEST/search-index?q=${query}&forms=D&dateRange=custom&startdt=2010-01-01&enddt=2026-12-31&from=0&size=40`;

  const data = await fetchWithRetry(fetchJSON, url);

  if (!data.hits || !data.hits.hits || data.hits.hits.length === 0) {
    return null;
  }

  // Try to match entity names from results
  let bestMatch = null;
  let bestConfidence = 'none';
  const confidenceRank = { high: 3, medium: 2, low: 1, none: 0 };

  // Group filings by CIK (unique entity) to find the best matching entity
  // EFTS response: _source has display_names[], ciks[], file_date, root_forms[], adsh
  const entityFilings = new Map(); // keyed by CIK

  for (const hit of data.hits.hits) {
    const source = hit._source || {};
    const displayNames = source.display_names || [];
    const ciks = source.ciks || [];
    const fileDate = source.file_date || '';
    const rootForms = source.root_forms || ['D'];

    // Extract accession from _id (format: "0002083653-25-000003:primary_doc.xml")
    const accession = (hit._id || '').split(':')[0] || source.adsh || '';

    const cik = ciks[0] || '';
    const rawDisplayName = displayNames[0] || '';
    const entityName = extractEntityName(rawDisplayName);

    if (!cik || !entityName) continue;

    if (!entityFilings.has(cik)) {
      entityFilings.set(cik, { entityName, cik, filings: [] });
    }
    entityFilings.get(cik).filings.push({
      accession,
      date: fileDate,
      form: rootForms[0] || 'D',
    });
  }

  for (const [cik, entity] of entityFilings) {
    const score = matchScore(name, entity.entityName);
    if (score.match && confidenceRank[score.confidence] > confidenceRank[bestConfidence]) {
      // Sort filings by date descending
      entity.filings.sort((a, b) => b.date.localeCompare(a.date));

      bestMatch = {
        entity_name: entity.entityName,
        cik: cik,
        confidence: score.confidence,
        filings: entity.filings.slice(0, 10), // Keep up to 10 most recent filings
        searched_at: new Date().toISOString(),
      };
      bestConfidence = score.confidence;
    }
  }

  return bestMatch;
}

async function runSearch(targetSlug) {
  const projects = loadProjects();
  const matches = loadMatches();

  // Filter to US companies (or specific slug)
  let companies;
  if (targetSlug) {
    companies = projects.filter(p => p.slug === targetSlug);
    if (companies.length === 0) {
      console.log(`Company not found: ${targetSlug}`);
      return;
    }
  } else {
    companies = projects.filter(p =>
      (p.hq_country === 'US' || p.hq_country === 'USA' || !p.hq_country) &&
      !matches.matches[p.slug] &&
      !matches.unmatched.includes(p.slug)
    );
  }

  console.log(`\n=== EDGAR Search ===\n`);
  console.log(`Companies to search: ${companies.length}`);
  console.log(`Already matched: ${Object.keys(matches.matches).length}`);
  console.log(`Already unmatched: ${matches.unmatched.length}\n`);

  let searched = 0;
  let matched = 0;
  let failed = 0;

  for (const company of companies) {
    searched++;
    process.stdout.write(`[${searched}/${companies.length}] Searching: ${company.name}... `);

    try {
      const result = await searchCompany(company.slug, company.name);

      if (result) {
        matches.matches[company.slug] = result;
        matched++;
        console.log(`MATCH (${result.confidence}) → ${result.entity_name} [${result.filings.length} filings]`);
      } else {
        if (!matches.unmatched.includes(company.slug)) {
          matches.unmatched.push(company.slug);
        }
        console.log(`no match`);
      }
    } catch (err) {
      failed++;
      logError(`Search failed for ${company.slug}: ${err.message}`);

      if (err.message.includes('403')) {
        console.log(`\nABORTING: Got 403 Forbidden. Check User-Agent header.`);
        break;
      }
    }

    // Rate limiting
    await sleep(RATE_LIMIT_MS);

    // Save progress periodically
    if (searched % 20 === 0) {
      matches.metadata = {
        searched: Object.keys(matches.matches).length + matches.unmatched.length,
        matched: Object.keys(matches.matches).length,
        unmatched: matches.unmatched.length,
        last_run: new Date().toISOString(),
      };
      saveMatches(matches);
    }
  }

  // Final save
  matches.metadata = {
    searched: Object.keys(matches.matches).length + matches.unmatched.length,
    matched: Object.keys(matches.matches).length,
    unmatched: matches.unmatched.length,
    last_run: new Date().toISOString(),
  };
  saveMatches(matches);

  console.log(`\n=== Search Complete ===`);
  console.log(`Searched: ${searched}`);
  console.log(`Matched: ${matched}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total matched: ${matches.metadata.matched}`);
  console.log(`Total unmatched: ${matches.metadata.unmatched}\n`);
}

// ─── Form D Fetch (Phase 2) ─────────────────────────────────────────

function parseFormDXml(xml) {
  const extract = (tag) => {
    const regex = new RegExp(`<${tag}>([^<]*)</${tag}>`, 'i');
    const match = xml.match(regex);
    return match ? match[1].trim() : null;
  };

  const extractNum = (tag) => {
    const val = extract(tag);
    if (!val) return null;
    const num = parseFloat(val.replace(/[,$]/g, ''));
    return isNaN(num) ? null : num;
  };

  // dateOfFirstSale is nested: <dateOfFirstSale><value>2025-08-15</value></dateOfFirstSale>
  const dateMatch = xml.match(/<dateOfFirstSale>\s*<value>([^<]*)<\/value>\s*<\/dateOfFirstSale>/i);
  const dateFirstSale = dateMatch ? dateMatch[1].trim() : extract('dateOfFirstSale');

  return {
    totalOffering: extractNum('totalOfferingAmount'),
    totalSold: extractNum('totalAmountSold'),
    totalRemaining: extractNum('totalRemaining'),
    dateFirstSale,
    issuerName: extract('entityName') || extract('nameOfIssuer'),
  };
}

async function fetchFormD(cik, accession, filingDate) {
  // Format accession for URL: remove dashes
  const accessionClean = accession.replace(/-/g, '');

  // Try the primary_doc.xml path first
  const urls = [
    `https://www.sec.gov/Archives/edgar/data/${parseInt(cik)}/${accessionClean}/primary_doc.xml`,
    `https://www.sec.gov/Archives/edgar/data/${parseInt(cik)}/${accessionClean}/0${accession}.txt`,
  ];

  for (const url of urls) {
    try {
      const text = await fetchWithRetry(fetchText, url);
      const parsed = parseFormDXml(text);

      // Use totalAmountSold as funding (this is actual money raised)
      const funding = parsed.totalSold || parsed.totalAmountSold || null;

      return {
        funding,
        totalOffering: parsed.totalOffering,
        totalRemaining: parsed.totalRemaining,
        dateFirstSale: parsed.dateFirstSale,
        issuerName: parsed.issuerName,
        filingDate,
        url,
      };
    } catch (err) {
      if (err.message.includes('403') || err.message.includes('404')) {
        continue; // Try next URL format
      }
      throw err;
    }
  }

  return null;
}

async function runFetch(targetSlug) {
  const matches = loadMatches();
  const results = loadResults();

  // Filter to matched companies with high/medium confidence
  let slugs;
  if (targetSlug) {
    if (!matches.matches[targetSlug]) {
      console.log(`No EDGAR match found for: ${targetSlug}. Run search first.`);
      return;
    }
    slugs = [targetSlug];
  } else {
    slugs = Object.entries(matches.matches)
      .filter(([slug, m]) =>
        m.confidence !== 'low' &&
        m.filings && m.filings.length > 0 &&
        !results.companies[slug]?.edgar_data // Skip if already fetched
      )
      .map(([slug]) => slug);
  }

  console.log(`\n=== EDGAR Fetch ===\n`);
  console.log(`Companies to fetch: ${slugs.length}\n`);

  let fetched = 0;
  let withFunding = 0;
  let failed = 0;

  for (const slug of slugs) {
    const match = matches.matches[slug];
    const mostRecentFiling = match.filings[0]; // Already sorted by date desc
    fetched++;

    process.stdout.write(`[${fetched}/${slugs.length}] Fetching: ${slug} (${match.entity_name})... `);

    try {
      const formData = await fetchFormD(match.cik, mostRecentFiling.accession, mostRecentFiling.date);

      if (formData && formData.funding && formData.funding > 0) {
        // Store in results.json format
        results.companies[slug] = {
          funding_found: formData.funding,
          source: 'sec-edgar-form-d',
          confidence: match.confidence,
          edgar_data: {
            cik: match.cik,
            accession: mostRecentFiling.accession,
            filing_date: mostRecentFiling.date,
            total_offering: formData.totalOffering,
            total_sold: formData.funding,
            total_remaining: formData.totalRemaining,
            date_first_sale: formData.dateFirstSale,
          },
          searched_at: new Date().toISOString(),
        };
        withFunding++;
        console.log(`$${(formData.funding / 1_000_000).toFixed(1)}M (filed ${mostRecentFiling.date})`);
      } else if (formData) {
        // Filing found but no dollar amounts
        results.companies[slug] = {
          funding_found: null,
          source: 'sec-edgar-form-d',
          confidence: 'none',
          edgar_data: {
            cik: match.cik,
            accession: mostRecentFiling.accession,
            filing_date: mostRecentFiling.date,
            total_offering: formData.totalOffering,
            total_sold: null,
            date_first_sale: formData.dateFirstSale,
          },
          notes: 'Form D found but no dollar amounts',
          searched_at: new Date().toISOString(),
        };
        console.log(`no funding amounts in filing`);
      } else {
        console.log(`could not fetch filing`);
      }
    } catch (err) {
      failed++;
      logError(`Fetch failed for ${slug}: ${err.message}`);

      if (err.message.includes('403')) {
        console.log(`\nABORTING: Got 403 Forbidden. Check User-Agent header.`);
        break;
      }
    }

    await sleep(RATE_LIMIT_MS);

    // Save progress periodically
    if (fetched % 10 === 0) {
      results.metadata.searched = Object.keys(results.companies).length;
      results.metadata.found = Object.values(results.companies).filter(c => c.funding_found).length;
      saveResults(results);
    }
  }

  // Final save
  results.metadata.searched = Object.keys(results.companies).length;
  results.metadata.found = Object.values(results.companies).filter(c => c.funding_found).length;
  saveResults(results);

  console.log(`\n=== Fetch Complete ===`);
  console.log(`Fetched: ${fetched}`);
  console.log(`With funding: ${withFunding}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total in results: ${results.metadata.searched}\n`);
}

// ─── Apply Dates (Phase 3) ───────────────────────────────────────────

function runApplyDates() {
  const matches = loadMatches();
  const projects = loadProjects();
  const projectMap = new Map(projects.map(p => [p.slug, p]));

  let updated = 0;
  let skipped = 0;

  console.log(`\n=== Apply Funding Dates from EDGAR ===\n`);

  for (const [slug, match] of Object.entries(matches.matches)) {
    const project = projectMap.get(slug);
    if (!project) continue;
    if (!match.filings || match.filings.length === 0) continue;
    if (match.confidence !== 'high') continue; // Only apply dates from high-confidence matches

    // Take the most recent filing date
    const latestDate = match.filings[0].date; // Format: YYYY-MM-DD
    if (!latestDate) continue;

    // Format as YYYY-MM
    const formattedDate = latestDate.substring(0, 7); // "2024-03-15" → "2024-03"

    // Only update if missing or older
    const existing = project.last_funding_date;
    if (existing && existing >= formattedDate) {
      skipped++;
      continue;
    }

    const oldVal = existing || '(none)';
    project.last_funding_date = formattedDate;
    updated++;
    console.log(`  ${project.name}: ${oldVal} → ${formattedDate}`);
  }

  if (updated > 0) {
    fs.writeFileSync(PROJECTS_PATH, JSON.stringify(projects, null, 2));
    console.log(`\nUpdated ${updated} companies in projects.json`);
  } else {
    console.log(`No updates needed.`);
  }
  console.log(`Skipped ${skipped} (already have equal or newer date)\n`);
}

// ─── Status ──────────────────────────────────────────────────────────

function showStatus() {
  const projects = loadProjects();
  const matches = loadMatches();
  const results = loadResults();

  const usCompanies = projects.filter(p => p.hq_country === 'US' || p.hq_country === 'USA' || !p.hq_country);
  const intlCompanies = projects.filter(p => p.hq_country && p.hq_country !== 'US' && p.hq_country !== 'USA');

  const withFunding = projects.filter(p => p.funding && p.funding > 0);
  const withDate = projects.filter(p => p.last_funding_date);

  const edgarResults = Object.entries(results.companies || {}).filter(([, c]) => c.source === 'sec-edgar-form-d');
  const edgarWithFunding = edgarResults.filter(([, c]) => c.funding_found && c.funding_found > 0);

  const highConf = Object.values(matches.matches || {}).filter(m => m.confidence === 'high').length;
  const medConf = Object.values(matches.matches || {}).filter(m => m.confidence === 'medium').length;
  const lowConf = Object.values(matches.matches || {}).filter(m => m.confidence === 'low').length;

  console.log(`\n=== EDGAR Scraper Status ===\n`);
  console.log(`Project Coverage:`);
  console.log(`  Total companies:       ${projects.length}`);
  console.log(`  US / unspecified:      ${usCompanies.length}`);
  console.log(`  International:         ${intlCompanies.length}`);
  console.log(`  With funding amount:   ${withFunding.length} (${((withFunding.length / projects.length) * 100).toFixed(1)}%)`);
  console.log(`  With funding date:     ${withDate.length} (${((withDate.length / projects.length) * 100).toFixed(1)}%)`);
  console.log();
  console.log(`EDGAR Search:`);
  console.log(`  Searched:              ${matches.metadata.searched || 0}`);
  console.log(`  Matched:               ${matches.metadata.matched || 0} (high: ${highConf}, medium: ${medConf}, low: ${lowConf})`);
  console.log(`  Unmatched:             ${matches.metadata.unmatched || 0}`);
  console.log(`  Last run:              ${matches.metadata.last_run || 'never'}`);
  console.log();
  console.log(`EDGAR Fetch:`);
  console.log(`  Results in file:       ${edgarResults.length}`);
  console.log(`  With funding data:     ${edgarWithFunding.length}`);
  console.log(`  Total results.json:    ${Object.keys(results.companies || {}).length}`);
  console.log();
}

// ─── CLI ─────────────────────────────────────────────────────────────

const command = process.argv[2];
const slugArg = process.argv.find(a => a.startsWith('--slug='));
const targetSlug = slugArg ? slugArg.split('=')[1] : null;

switch (command) {
  case 'search':
    runSearch(targetSlug).catch(err => {
      console.error('Search failed:', err.message);
      logError(`Search crashed: ${err.message}`);
      process.exit(1);
    });
    break;

  case 'fetch':
    runFetch(targetSlug).catch(err => {
      console.error('Fetch failed:', err.message);
      logError(`Fetch crashed: ${err.message}`);
      process.exit(1);
    });
    break;

  case 'status':
    showStatus();
    break;

  case 'apply-dates':
    runApplyDates();
    break;

  default:
    console.log(`
SEC EDGAR Form D Scraper

Commands:
  node edgar-scraper.js search              Search EDGAR for all US companies
  node edgar-scraper.js search --slug=brex  Search a single company
  node edgar-scraper.js fetch               Fetch Form D data for matched companies
  node edgar-scraper.js fetch --slug=brex   Fetch a single company
  node edgar-scraper.js status              Show match/fetch progress
  node edgar-scraper.js apply-dates         Write last_funding_date to projects.json
    `);
}
