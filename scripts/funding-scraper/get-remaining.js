const projects = require('../../src/data/projects.json');
const results = require('./results.json');

const searched = new Set(Object.keys(results.companies));
const remaining = projects.filter(p => !searched.has(p.slug));

const limit = parseInt(process.argv[2]) || 30;

remaining.slice(0, limit).forEach(p => {
  console.log(p.slug + '|' + p.name + '|' + (p.funding || 0));
});

console.log('---');
console.log('Searched:', searched.size);
console.log('Remaining:', remaining.length);
