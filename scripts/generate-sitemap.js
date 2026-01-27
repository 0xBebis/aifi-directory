/**
 * Build-time sitemap generator.
 * Reads projects.json and agents.json to produce a static sitemap.xml in /public.
 * Run via: node scripts/generate-sitemap.js
 */

const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://aifimap.com';

const projects = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/projects.json'), 'utf-8')
);
const agents = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/agents.json'), 'utf-8')
);
const segments = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/segments.json'), 'utf-8')
);
const layers = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/layers.json'), 'utf-8')
);
const aiTypes = ['llm', 'predictive-ml', 'computer-vision', 'graph-analytics', 'reinforcement-learning', 'agentic', 'data-platform', 'infrastructure'];
const regions = ['americas', 'emea', 'apac'];

const today = new Date().toISOString().split('T')[0];

function url(loc, priority, changefreq = 'weekly', lastmod = today) {
  return `  <url>
    <loc>${SITE_URL}${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

const urls = [
  // Core pages
  url('/', '1.0', 'weekly'),
  url('/directory', '1.0', 'weekly'),
  url('/agents', '1.0', 'weekly'),
  url('/about', '0.9', 'monthly'),
  url('/submit', '0.5', 'monthly'),

  // Company detail pages
  ...projects.map(p => url(`/p/${p.slug}`, '0.8', 'monthly')),

  // Agent detail pages
  ...agents.map(a => {
    const slug = a.id.replace(':', '-');
    return url(`/agents/${slug}`, '0.7', 'monthly');
  }),

  // Taxonomy pages — segments
  ...segments.map(s => url(`/segments/${s.slug}`, '0.8', 'weekly')),

  // Taxonomy pages — AI types
  ...aiTypes.map(t => url(`/ai-types/${t}`, '0.8', 'weekly')),

  // Taxonomy pages — layers
  ...layers.map(l => url(`/layers/${l.slug}`, '0.8', 'weekly')),

  // Taxonomy pages — regions
  ...regions.map(r => url(`/regions/${r}`, '0.8', 'weekly')),

  // Stats page
  url('/stats', '0.7', 'weekly'),

  // Content enrichment pages
  url('/glossary', '0.7', 'weekly'),
  url('/recent', '0.7', 'weekly'),

  // Cross-dimensional pages (segment × AI type, where 3+ companies)
  ...(() => {
    const crossPages = [];
    for (const s of segments) {
      for (const t of aiTypes) {
        const count = projects.filter(p => {
          const matchSeg = p.segment === s.slug || (p.segments && p.segments.includes(s.slug));
          const matchAI = p.ai_types && p.ai_types.includes(t);
          return matchSeg && matchAI;
        }).length;
        if (count >= 3) {
          crossPages.push(url(`/segments/${s.slug}/ai-types/${t}`, '0.7', 'weekly'));
        }
      }
    }
    return crossPages;
  })(),

  // Update pages (low priority, but indexable)
  ...projects.map(p => url(`/submit/update/${p.slug}`, '0.2', 'monthly')),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

const outPath = path.join(__dirname, '../public/sitemap.xml');
fs.writeFileSync(outPath, sitemap, 'utf-8');
console.log(`Sitemap generated: ${urls.length} URLs → public/sitemap.xml`);
