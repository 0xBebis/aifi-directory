/**
 * Generates Open Graph images for all pages at build time.
 * Uses satori (JSX → SVG) + @resvg/resvg-js (SVG → PNG).
 *
 * Output: public/og/default.png, public/og/p/{slug}.png, public/og/agents/{id}.png
 */

const React = require('react');
const satori = require('satori').default;
const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const path = require('path');

const projects = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/projects.json'), 'utf8')
);
const agents = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/agents.json'), 'utf8')
);

const OUTPUT_DIR = path.join(__dirname, '../public/og');

// Design tokens matching globals.css
const BG = '#0a0a0b';
const SURFACE = '#141416';
const BORDER = '#2a2a2e';
const TEXT = '#fafafa';
const MUTED = '#a1a1aa';
const ACCENT = '#3b82f6';
const POSITIVE = '#22c55e';
const TEAL = '#14b8a6';

// Helpers
const e = React.createElement;

function formatFunding(amount) {
  if (!amount) return null;
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(0)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount}`;
}

function truncate(str, max) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max - 3) + '...' : str;
}

// ── OG Image Templates ──

function createDefaultOG() {
  return e('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100%',
      background: BG,
      padding: '60px',
    }
  },
    e('div', {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '80px',
        height: '80px',
        borderRadius: '16px',
        background: `${ACCENT}22`,
        marginBottom: '32px',
      }
    }, e('span', { style: { fontSize: '32px', fontWeight: 700, color: ACCENT } }, 'AI')),
    e('div', {
      style: {
        display: 'flex',
        fontSize: '64px',
        fontWeight: 700,
        color: TEXT,
        lineHeight: 1.1,
        textAlign: 'center',
      }
    }, 'The Financial AI Landscape'),
    e('div', {
      style: {
        display: 'flex',
        fontSize: '24px',
        color: MUTED,
        marginTop: '20px',
      }
    }, `${projects.length} companies \u00b7 ${agents.length} agents`),
    e('div', {
      style: {
        display: 'flex',
        fontSize: '18px',
        color: ACCENT,
        marginTop: '40px',
      }
    }, 'aifimap.com'),
  );
}

function createCompanyOG(project) {
  const funding = formatFunding(project.funding);

  return e('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',
      background: BG,
      padding: '60px',
    }
  },
    // Top bar: AIFI brand + funding
    e('div', {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '48px',
      }
    },
      e('div', {
        style: { display: 'flex', alignItems: 'center', gap: '12px' }
      },
        e('div', {
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: `${ACCENT}22`,
          }
        }, e('span', { style: { fontSize: '16px', fontWeight: 700, color: ACCENT } }, 'AI')),
        e('span', { style: { fontSize: '18px', fontWeight: 600, color: MUTED } }, 'AIFI Directory'),
      ),
      funding ? e('div', {
        style: {
          display: 'flex',
          fontSize: '20px',
          fontWeight: 600,
          color: POSITIVE,
        }
      }, `Raised ${funding}`) : null,
    ),
    // Company name
    e('div', {
      style: {
        display: 'flex',
        fontSize: project.name.length > 24 ? '48px' : '56px',
        fontWeight: 700,
        color: TEXT,
        lineHeight: 1.15,
      }
    }, truncate(project.name, 40)),
    // Tagline
    e('div', {
      style: {
        display: 'flex',
        fontSize: '24px',
        color: MUTED,
        lineHeight: 1.4,
        marginTop: '16px',
        maxWidth: '960px',
      }
    }, truncate(project.tagline, 120)),
    // Bottom: metadata
    e('div', {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        marginTop: 'auto',
      }
    },
      project.founded ? e('div', {
        style: { display: 'flex', fontSize: '16px', color: MUTED }
      }, `Founded ${project.founded}`) : null,
      project.hq_city && project.hq_country ? e('div', {
        style: { display: 'flex', fontSize: '16px', color: MUTED }
      }, `${project.hq_city}, ${project.hq_country}`) : null,
    ),
    // URL
    e('div', {
      style: {
        display: 'flex',
        fontSize: '16px',
        color: `${ACCENT}99`,
        marginTop: '16px',
      }
    }, `aifimap.com/p/${project.slug}`),
  );
}

function createAgentOG(agent) {
  const desc = (agent.description || '').split('\n')[0];

  return e('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',
      background: BG,
      padding: '60px',
    }
  },
    // Top bar
    e('div', {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '48px',
      }
    },
      e('div', {
        style: { display: 'flex', alignItems: 'center', gap: '12px' }
      },
        e('div', {
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: `${ACCENT}22`,
          }
        }, e('span', { style: { fontSize: '16px', fontWeight: 700, color: ACCENT } }, 'AI')),
        e('span', { style: { fontSize: '18px', fontWeight: 600, color: MUTED } }, 'AIFI Agent Registry'),
      ),
      e('div', {
        style: {
          display: 'flex',
          fontSize: '14px',
          fontWeight: 600,
          color: TEAL,
          padding: '6px 14px',
          borderRadius: '8px',
          border: `1px solid ${TEAL}33`,
          background: `${TEAL}0d`,
        }
      }, 'EIP-8004'),
    ),
    // Agent name
    e('div', {
      style: {
        display: 'flex',
        fontSize: agent.name.length > 24 ? '48px' : '56px',
        fontWeight: 700,
        color: TEXT,
        lineHeight: 1.15,
      }
    }, truncate(agent.name, 40)),
    // Description
    e('div', {
      style: {
        display: 'flex',
        fontSize: '22px',
        color: MUTED,
        lineHeight: 1.4,
        marginTop: '16px',
        maxWidth: '960px',
      }
    }, truncate(desc, 120)),
    // Protocols
    e('div', {
      style: {
        display: 'flex',
        gap: '10px',
        marginTop: 'auto',
      }
    }, ...agent.protocols.map(p =>
      e('div', {
        key: p,
        style: {
          display: 'flex',
          fontSize: '14px',
          fontWeight: 600,
          color: MUTED,
          padding: '6px 14px',
          borderRadius: '8px',
          background: SURFACE,
          border: `1px solid ${BORDER}`,
          textTransform: 'uppercase',
        }
      }, p)
    )),
    // URL
    e('div', {
      style: {
        display: 'flex',
        fontSize: '16px',
        color: `${ACCENT}99`,
        marginTop: '16px',
      }
    }, `aifimap.com/agents/${agent.chainId}-${agent.agentId}`),
  );
}

// ── Main ──

async function main() {
  // Ensure output directories
  fs.mkdirSync(path.join(OUTPUT_DIR, 'p'), { recursive: true });
  fs.mkdirSync(path.join(OUTPUT_DIR, 'agents'), { recursive: true });

  // Load fonts (Inter via fontsource CDN)
  const [fontRegular, fontBold] = await Promise.all([
    fetch('https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.woff')
      .then(r => r.arrayBuffer()),
    fetch('https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.woff')
      .then(r => r.arrayBuffer()),
  ]);

  const fonts = [
    { name: 'Inter', data: fontRegular, weight: 400, style: 'normal' },
    { name: 'Inter', data: fontBold, weight: 700, style: 'normal' },
  ];

  const renderOpts = { width: 1200, height: 630, fonts };

  async function generate(element, filename) {
    const svg = await satori(element, renderOpts);
    const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
    const pngData = resvg.render();
    fs.writeFileSync(path.join(OUTPUT_DIR, filename), pngData.asPng());
  }

  // 1. Default brand image
  await generate(createDefaultOG(), 'default.png');
  process.stdout.write('  default.png\n');

  // 2. Company images
  let count = 0;
  for (const project of projects) {
    await generate(createCompanyOG(project), `p/${project.slug}.png`);
    count++;
    if (count % 50 === 0) {
      process.stdout.write(`  ${count}/${projects.length} company images...\n`);
    }
  }
  process.stdout.write(`  ${projects.length} company images\n`);

  // 3. Agent images
  for (const agent of agents) {
    await generate(createAgentOG(agent), `agents/${agent.chainId}-${agent.agentId}.png`);
  }
  process.stdout.write(`  ${agents.length} agent images\n`);

  console.log(`OG images generated: 1 default + ${projects.length} companies + ${agents.length} agents → public/og/`);
}

main().catch(err => {
  console.error('OG image generation failed:', err);
  process.exit(1);
});
