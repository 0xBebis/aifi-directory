const fs = require('fs');
const path = require('path');

// Load data files
const results = require('./results.json');
const projectsPath = path.join(__dirname, '../../src/data/projects.json');
const projects = require(projectsPath);

let updated = 0;
let unchanged = 0;
let notFound = 0;

// Track changes for summary
const changes = [];

// Update each project with funding data from results
projects.forEach(project => {
  const slug = project.slug;
  const result = results.companies[slug];

  if (result && result.funding_found !== null) {
    const currentFunding = project.funding || null;
    const newFunding = result.funding_found;

    // Only update if there's a meaningful difference (>5% or new funding)
    if (currentFunding === null || currentFunding === undefined || currentFunding === 0) {
      if (newFunding > 0) {
        changes.push({
          slug,
          name: project.name,
          old: currentFunding,
          new: newFunding,
          action: 'NEW'
        });
        project.funding = newFunding;
        updated++;
      } else {
        unchanged++;
      }
    } else if (Math.abs(currentFunding - newFunding) / currentFunding > 0.05) {
      // More than 5% difference - update
      changes.push({
        slug,
        name: project.name,
        old: currentFunding,
        new: newFunding,
        action: 'UPDATE'
      });
      project.funding = newFunding;
      updated++;
    } else {
      unchanged++;
    }
  } else if (result && result.funding_found === null) {
    // Result exists but no funding found - keep existing
    unchanged++;
  } else {
    notFound++;
  }
});

// Write updated projects
fs.writeFileSync(projectsPath, JSON.stringify(projects, null, 2));

// Output summary
console.log('\n=== Projects.json Update Summary ===\n');
console.log(`Total projects: ${projects.length}`);
console.log(`Updated: ${updated}`);
console.log(`Unchanged: ${unchanged}`);
console.log(`Not in results: ${notFound}`);

if (changes.length > 0) {
  console.log('\n=== Changes Made ===\n');
  changes.forEach(c => {
    const oldFormatted = c.old ? `$${(c.old / 1000000).toFixed(1)}M` : 'N/A';
    const newFormatted = `$${(c.new / 1000000).toFixed(1)}M`;
    console.log(`${c.action}: ${c.name} (${c.slug})`);
    console.log(`  ${oldFormatted} → ${newFormatted}`);
  });
}

console.log('\nDone!');
