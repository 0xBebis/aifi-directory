/**
 * Data Validation Script
 * Run with: node scripts/validate-data.js
 *
 * Checks:
 * - All project slugs are unique
 * - All segment/layer references are valid
 * - Required fields are present
 * - Data types are correct
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../src/data');

const projects = JSON.parse(fs.readFileSync(path.join(dataDir, 'projects.json'), 'utf8'));
const segments = JSON.parse(fs.readFileSync(path.join(dataDir, 'segments.json'), 'utf8'));
const layers = JSON.parse(fs.readFileSync(path.join(dataDir, 'layers.json'), 'utf8'));

const segmentSlugs = new Set(segments.map(s => s.slug));
const layerSlugs = new Set(layers.map(l => l.slug));

let errors = [];
let warnings = [];

console.log('Validating AIFI data...\n');

// Check segments
console.log(`Segments: ${segments.length}`);
segments.forEach((segment, i) => {
  if (!segment.slug) errors.push(`Segment ${i}: missing slug`);
  if (!segment.name) errors.push(`Segment ${segment.slug || i}: missing name`);
  if (!segment.description) warnings.push(`Segment ${segment.slug}: missing description`);
  if (!segment.color) warnings.push(`Segment ${segment.slug}: missing color`);
});

// Check layers
console.log(`Layers: ${layers.length}`);
layers.forEach((layer, i) => {
  if (!layer.slug) errors.push(`Layer ${i}: missing slug`);
  if (!layer.name) errors.push(`Layer ${layer.slug || i}: missing name`);
  if (typeof layer.position !== 'number') errors.push(`Layer ${layer.slug}: position must be a number`);
  if (!layer.description) warnings.push(`Layer ${layer.slug}: missing description`);
  if (!layer.color) warnings.push(`Layer ${layer.slug}: missing color`);
});

// Check projects
console.log(`Projects: ${projects.length}`);
const projectSlugs = new Set();

projects.forEach((project, i) => {
  const id = project.slug || `index-${i}`;

  // Required fields
  if (!project.slug) {
    errors.push(`Project ${i}: missing slug`);
  } else if (projectSlugs.has(project.slug)) {
    errors.push(`Project ${id}: duplicate slug "${project.slug}"`);
  } else {
    projectSlugs.add(project.slug);
  }

  if (!project.name) errors.push(`Project ${id}: missing name`);
  if (!project.tagline) errors.push(`Project ${id}: missing tagline`);
  if (!project.segment) errors.push(`Project ${id}: missing segment`);
  if (!project.layer) errors.push(`Project ${id}: missing layer`);

  // Valid references
  if (project.segment && !segmentSlugs.has(project.segment)) {
    errors.push(`Project ${id}: invalid segment "${project.segment}"`);
  }
  if (project.layer && !layerSlugs.has(project.layer)) {
    errors.push(`Project ${id}: invalid layer "${project.layer}"`);
  }

  // Secondary segments/layers
  if (project.segments) {
    project.segments.forEach(s => {
      if (!segmentSlugs.has(s)) {
        errors.push(`Project ${id}: invalid secondary segment "${s}"`);
      }
    });
  }
  if (project.layers) {
    project.layers.forEach(l => {
      if (!layerSlugs.has(l)) {
        errors.push(`Project ${id}: invalid secondary layer "${l}"`);
      }
    });
  }

  // Type checks
  if (project.funding && typeof project.funding !== 'number') {
    errors.push(`Project ${id}: funding must be a number, got "${typeof project.funding}"`);
  }
  if (project.founded && typeof project.founded !== 'number') {
    errors.push(`Project ${id}: founded must be a number, got "${typeof project.founded}"`);
  }

  // Warnings for optional but recommended fields
  if (!project.website) warnings.push(`Project ${id}: missing website`);
  if (!project.description) warnings.push(`Project ${id}: missing description`);

  // Tagline length
  if (project.tagline && project.tagline.length > 140) {
    warnings.push(`Project ${id}: tagline exceeds 140 chars (${project.tagline.length})`);
  }
});

// Results
console.log('\n' + '='.repeat(50));

if (errors.length === 0 && warnings.length === 0) {
  console.log('\n✓ All data valid!\n');
  process.exit(0);
}

if (errors.length > 0) {
  console.log(`\n✗ ${errors.length} ERROR(S):\n`);
  errors.forEach(e => console.log(`  - ${e}`));
}

if (warnings.length > 0) {
  console.log(`\n⚠ ${warnings.length} WARNING(S):\n`);
  warnings.slice(0, 10).forEach(w => console.log(`  - ${w}`));
  if (warnings.length > 10) {
    console.log(`  ... and ${warnings.length - 10} more`);
  }
}

console.log('');
process.exit(errors.length > 0 ? 1 : 0);
