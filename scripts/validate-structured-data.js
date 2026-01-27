/**
 * Structured data validation script.
 * Scans the built HTML output for JSON-LD scripts and validates them.
 * Run after build: node scripts/validate-structured-data.js
 */

const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '../out');

// Recursively find all .html files in the output directory
function findHtmlFiles(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findHtmlFiles(fullPath));
    } else if (entry.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }
  return files;
}

// Extract JSON-LD scripts from HTML content
function extractJsonLd(html) {
  const regex = /<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  const results = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1]);
      results.push({ valid: true, data });
    } catch (e) {
      results.push({ valid: false, error: e.message, raw: match[1].slice(0, 200) });
    }
  }
  return results;
}

// Validate a single JSON-LD object
function validateJsonLd(data, filePath) {
  const issues = [];

  if (!data['@context']) {
    issues.push('Missing @context');
  } else if (data['@context'] !== 'https://schema.org') {
    issues.push(`Unexpected @context: ${data['@context']}`);
  }

  if (!data['@type']) {
    issues.push('Missing @type');
  }

  const type = data['@type'];

  // Type-specific validation
  switch (type) {
    case 'Organization':
      if (!data.name) issues.push('Organization missing name');
      if (!data.description) issues.push('Organization missing description');
      break;

    case 'FAQPage':
      if (!data.mainEntity || !Array.isArray(data.mainEntity)) {
        issues.push('FAQPage missing mainEntity array');
      } else {
        data.mainEntity.forEach((q, i) => {
          if (!q.name) issues.push(`FAQ question ${i} missing name`);
          if (!q.acceptedAnswer?.text) issues.push(`FAQ question ${i} missing answer text`);
        });
      }
      break;

    case 'BreadcrumbList':
      if (!data.itemListElement || !Array.isArray(data.itemListElement)) {
        issues.push('BreadcrumbList missing itemListElement array');
      } else {
        data.itemListElement.forEach((item, i) => {
          if (!item.name) issues.push(`Breadcrumb item ${i} missing name`);
          if (typeof item.position !== 'number') issues.push(`Breadcrumb item ${i} missing position`);
        });
      }
      break;

    case 'ItemList':
      if (!data.itemListElement || !Array.isArray(data.itemListElement)) {
        issues.push('ItemList missing itemListElement array');
      }
      break;

    case 'Article':
      if (!data.headline) issues.push('Article missing headline');
      if (!data.author) issues.push('Article missing author');
      break;

    case 'SoftwareApplication':
      if (!data.name) issues.push('SoftwareApplication missing name');
      break;

    case 'DefinedTermSet':
      if (!data.hasDefinedTerm || !Array.isArray(data.hasDefinedTerm)) {
        issues.push('DefinedTermSet missing hasDefinedTerm array');
      }
      break;
  }

  return issues;
}

// Main
console.log('Validating structured data in build output...\n');

if (!fs.existsSync(OUT_DIR)) {
  console.error(`Error: Build output directory not found at ${OUT_DIR}`);
  console.error('Run "npm run build" first.');
  process.exit(1);
}

const htmlFiles = findHtmlFiles(OUT_DIR);
console.log(`Found ${htmlFiles.length} HTML files\n`);

let totalSchemas = 0;
let validSchemas = 0;
let invalidSchemas = 0;
let parseErrors = 0;
const typeCounts = {};
const issuesByFile = [];

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf-8');
  const schemas = extractJsonLd(html);
  const relativePath = path.relative(OUT_DIR, file);

  for (const schema of schemas) {
    totalSchemas++;

    if (!schema.valid) {
      parseErrors++;
      issuesByFile.push({
        file: relativePath,
        issues: [`JSON parse error: ${schema.error}`],
      });
      continue;
    }

    const type = schema.data['@type'] || 'Unknown';
    typeCounts[type] = (typeCounts[type] || 0) + 1;

    const issues = validateJsonLd(schema.data, relativePath);
    if (issues.length > 0) {
      invalidSchemas++;
      issuesByFile.push({ file: relativePath, type, issues });
    } else {
      validSchemas++;
    }
  }
}

// Report
console.log('=== Structured Data Validation Report ===\n');
console.log(`Total schemas found: ${totalSchemas}`);
console.log(`  Valid: ${validSchemas}`);
console.log(`  Invalid: ${invalidSchemas}`);
console.log(`  Parse errors: ${parseErrors}`);
console.log('');

console.log('Schema types:');
Object.entries(typeCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });
console.log('');

// Pages with JSON-LD
const pagesWithSchema = new Set();
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf-8');
  if (html.includes('application/ld+json')) {
    pagesWithSchema.add(path.relative(OUT_DIR, file));
  }
}
console.log(`Pages with structured data: ${pagesWithSchema.size} / ${htmlFiles.length}`);
console.log('');

// Pages WITHOUT structured data (that probably should have it)
const pagesWithoutSchema = htmlFiles
  .map(f => path.relative(OUT_DIR, f))
  .filter(f => !pagesWithSchema.has(f))
  .filter(f => !f.includes('submit') && !f.includes('_not-found') && !f.includes('404'));

if (pagesWithoutSchema.length > 0 && pagesWithoutSchema.length <= 20) {
  console.log('Pages without structured data (may need attention):');
  pagesWithoutSchema.forEach(f => console.log(`  ${f}`));
  console.log('');
} else if (pagesWithoutSchema.length > 20) {
  console.log(`Pages without structured data: ${pagesWithoutSchema.length} (showing first 10)`);
  pagesWithoutSchema.slice(0, 10).forEach(f => console.log(`  ${f}`));
  console.log('  ...');
  console.log('');
}

// Issues
if (issuesByFile.length > 0) {
  console.log('=== Issues Found ===\n');
  issuesByFile.forEach(({ file, type, issues }) => {
    console.log(`${file}${type ? ` (${type})` : ''}:`);
    issues.forEach(issue => console.log(`  - ${issue}`));
    console.log('');
  });
}

// Summary
if (invalidSchemas === 0 && parseErrors === 0) {
  console.log('All structured data is valid!');
} else {
  console.log(`Found ${invalidSchemas + parseErrors} issue(s). Fix these before submitting to Google Rich Results Test.`);
  process.exit(1);
}
