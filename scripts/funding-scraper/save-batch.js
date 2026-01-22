const fs = require('fs');
const resultsPath = './scripts/funding-scraper/results.json';

// Read current results
const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));

// Get updates from command line argument (JSON string)
const updatesJson = process.argv[2];
if (!updatesJson) {
  console.log('Usage: node save-batch.js \'{"slug": {"funding_found": 123, "source": "...", "confidence": "high", "notes": "..."}}\'');
  process.exit(1);
}

const updates = JSON.parse(updatesJson);

for (const [slug, data] of Object.entries(updates)) {
  results.companies[slug] = { ...data, searched_at: new Date().toISOString() };
}

results.metadata.searched = Object.keys(results.companies).length;
results.metadata.found = Object.values(results.companies).filter(c => c.funding_found).length;
fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));

console.log('Saved', Object.keys(updates).length, 'results. Total searched:', results.metadata.searched);
