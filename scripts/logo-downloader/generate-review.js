const fs = require('fs');
const path = require('path');

const RESULTS_PATH = path.join(__dirname, 'results.json');
const PROJECTS_PATH = path.join(__dirname, '../../src/data/projects.json');
const LOGOS_DIR = path.join(__dirname, '../../public/logos');
const OUTPUT_PATH = path.join(__dirname, 'review.html');

if (!fs.existsSync(RESULTS_PATH)) {
  console.error('No results.json found. Run download-logos.js first.');
  process.exit(1);
}

const results = JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'));
const projects = JSON.parse(fs.readFileSync(PROJECTS_PATH, 'utf8'));

const rows = projects.map(p => {
  const r = results.companies[p.slug];
  const logoFile = path.join(LOGOS_DIR, `${p.slug}.png`);
  const hasFile = fs.existsSync(logoFile);
  const fileSize = hasFile ? (fs.statSync(logoFile).size / 1024).toFixed(1) : '—';
  const source = r?.source || '—';
  const status = r?.status || 'missing';

  return {
    slug: p.slug,
    name: p.name,
    website: p.website || '',
    hasFile,
    fileSize,
    source,
    status,
  };
});

const successCount = rows.filter(r => r.status === 'success').length;
const failedCount = rows.filter(r => r.status !== 'success').length;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>AIFI Logo Review — ${successCount} logos, ${failedCount} missing</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, system-ui, sans-serif; background: #09090b; color: #fafafa; padding: 24px; }
  h1 { font-size: 24px; margin-bottom: 8px; }
  .stats { color: #a1a1aa; margin-bottom: 24px; font-size: 14px; }
  .filter-bar { margin-bottom: 16px; display: flex; gap: 8px; }
  .filter-bar button {
    padding: 6px 14px; border-radius: 6px; border: 1px solid #27272a;
    background: #111113; color: #d4d4d8; cursor: pointer; font-size: 13px;
  }
  .filter-bar button.active { background: #0d9488; color: white; border-color: #0d9488; }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px;
  }
  .card {
    background: #111113; border: 1px solid #27272a; border-radius: 10px;
    padding: 16px; text-align: center; transition: border-color 0.2s;
  }
  .card:hover { border-color: #0d9488; }
  .card.failed { border-color: #ef4444; opacity: 0.6; }
  .logo-wrap {
    width: 64px; height: 64px; margin: 0 auto 10px;
    background: white; border-radius: 10px; padding: 6px;
    display: flex; align-items: center; justify-content: center;
    border: 1px solid #27272a33;
  }
  .logo-wrap img { max-width: 100%; max-height: 100%; object-fit: contain; }
  .logo-wrap.no-logo { background: #18181b; }
  .logo-wrap.no-logo::after {
    content: '?'; font-size: 24px; font-weight: bold; color: #71717a;
  }
  .name { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .meta { font-size: 11px; color: #71717a; margin-top: 4px; }
  .source { font-size: 10px; color: #0d9488; margin-top: 2px; }
</style>
</head>
<body>
<h1>AIFI Logo Review</h1>
<p class="stats">${successCount} logos downloaded, ${failedCount} missing/failed. Total: ${rows.length} projects.</p>
<div class="filter-bar">
  <button class="active" onclick="filter('all')">All (${rows.length})</button>
  <button onclick="filter('success')">Has Logo (${successCount})</button>
  <button onclick="filter('failed')">Missing (${failedCount})</button>
  <button onclick="filter('small')">Small &lt;2KB</button>
</div>
<div class="grid" id="grid">
${rows.map(r => {
  const sizeNum = parseFloat(r.fileSize) || 0;
  return `  <div class="card ${r.status !== 'success' ? 'failed' : ''}" data-status="${r.status}" data-size="${sizeNum}">
    <div class="logo-wrap ${r.hasFile ? '' : 'no-logo'}">
      ${r.hasFile ? `<img src="../../public/logos/${r.slug}.png" alt="${r.name}" loading="lazy">` : ''}
    </div>
    <div class="name" title="${r.name}">${r.name}</div>
    <div class="meta">${r.slug} · ${r.fileSize}KB</div>
    <div class="source">${r.source}</div>
  </div>`;
}).join('\n')}
</div>
<script>
function filter(mode) {
  document.querySelectorAll('.filter-bar button').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  document.querySelectorAll('.card').forEach(card => {
    const status = card.dataset.status;
    const size = parseFloat(card.dataset.size);
    let show = true;
    if (mode === 'success') show = status === 'success';
    if (mode === 'failed') show = status !== 'success';
    if (mode === 'small') show = status === 'success' && size < 2;
    card.style.display = show ? '' : 'none';
  });
}
</script>
</body>
</html>`;

fs.writeFileSync(OUTPUT_PATH, html);
console.log(`Review page generated: ${OUTPUT_PATH}`);
console.log(`Open in browser to visually scan all ${rows.length} logos.`);
console.log(`${successCount} have logos, ${failedCount} are missing.`);
