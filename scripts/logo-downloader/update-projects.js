const fs = require('fs');
const path = require('path');

const RESULTS_PATH = path.join(__dirname, 'results.json');
const PROJECTS_PATH = path.join(__dirname, '../../src/data/projects.json');

if (!fs.existsSync(RESULTS_PATH)) {
  console.error('No results.json found. Run download-logos.js first.');
  process.exit(1);
}

const results = JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'));
const projects = JSON.parse(fs.readFileSync(PROJECTS_PATH, 'utf8'));

let updated = 0;
let skipped = 0;
let removed = 0;

projects.forEach(project => {
  const result = results.companies[project.slug];

  if (result && result.status === 'success') {
    const logoPath = `/logos/${result.filename}`;
    if (project.logo !== logoPath) {
      project.logo = logoPath;
      updated++;
    } else {
      skipped++;
    }
  } else {
    // Remove logo field if download failed and it was previously set
    if (project.logo) {
      delete project.logo;
      removed++;
    } else {
      skipped++;
    }
  }
});

fs.writeFileSync(PROJECTS_PATH, JSON.stringify(projects, null, 2) + '\n');

console.log('\n=== projects.json Update Summary ===');
console.log(`Total projects:  ${projects.length}`);
console.log(`Logo added:      ${updated}`);
console.log(`Unchanged:       ${skipped}`);
console.log(`Logo removed:    ${removed}`);
console.log('Done!');
