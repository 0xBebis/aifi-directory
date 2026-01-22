const review = require('./review.json');

console.log('=== Suggested Funding Updates ===\n');

const updates = review.companies.filter(c =>
  c.suggested_action === 'update' || c.suggested_action === 'add'
);

if (updates.length === 0) {
  console.log('No updates suggested.');
} else {
  updates.forEach(c => {
    console.log(c.name + ': ' + c.current_formatted + ' -> ' + c.found_formatted);
    console.log('  Source: ' + c.source);
    console.log('  Reason: ' + c.reason);
    console.log('');
  });
}

console.log('Total updates suggested:', updates.length);
