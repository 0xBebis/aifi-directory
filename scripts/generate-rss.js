/**
 * Build-time RSS feed generator.
 * Reads projects.json and generates an RSS 2.0 feed of recently funded companies.
 * Run via: node scripts/generate-rss.js
 */

const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://aifimap.com';

const projects = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/projects.json'), 'utf-8')
);

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Get recently funded companies sorted by funding date
const recentProjects = projects
  .filter(p => p.last_funding_date)
  .sort((a, b) => (b.last_funding_date || '').localeCompare(a.last_funding_date || ''))
  .slice(0, 50);

const now = new Date().toUTCString();

const items = recentProjects.map(p => {
  const link = `${SITE_URL}/p/${p.slug}`;
  const desc = escapeXml(p.tagline);
  const title = escapeXml(p.name);

  // Convert funding date to RFC 822
  let pubDate = now;
  if (p.last_funding_date) {
    const parts = p.last_funding_date.split('-');
    const year = parseInt(parts[0]);
    const month = parts.length > 1 ? parseInt(parts[1]) - 1 : 0;
    pubDate = new Date(year, month, 1).toUTCString();
  }

  return `    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid>${link}</guid>
      <description>${desc}</description>
      <pubDate>${pubDate}</pubDate>
    </item>`;
});

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>AIFI — The Financial AI Landscape</title>
    <link>${SITE_URL}</link>
    <description>Recently funded companies at the intersection of AI and financial services.</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items.join('\n')}
  </channel>
</rss>`;

const outPath = path.join(__dirname, '../public/feed.xml');
fs.writeFileSync(outPath, rss, 'utf-8');
console.log(`RSS feed generated: ${items.length} items → public/feed.xml`);
