/**
 * Generates Open Graph images for all pages at build time.
 * Uses satori (JSX → SVG) + @resvg/resvg-js (SVG → PNG).
 *
 * Output: public/og/default.png, public/og/p/{slug}.png, public/og/agents/{id}.png,
 *         public/og/segments/{slug}.png, public/og/ai-types/{slug}.png,
 *         public/og/layers/{slug}.png, public/og/regions/{slug}.png,
 *         public/og/compare/{slug}.png, public/og/content/{slug}.png
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
const segments = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/segments.json'), 'utf8')
);
const layers = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/layers.json'), 'utf8')
);

const AI_TYPE_LABELS = {
  'llm': 'Large Language Models',
  'predictive-ml': 'Predictive ML',
  'computer-vision': 'Computer Vision',
  'graph-analytics': 'Graph Analytics',
  'reinforcement-learning': 'Reinforcement Learning',
  'agentic': 'Agentic AI',
  'data-platform': 'Data Platforms',
  'infrastructure': 'AI Infrastructure',
};

const AI_TYPE_COLORS = {
  'llm': '#3b82f6',
  'predictive-ml': '#22c55e',
  'computer-vision': '#a855f7',
  'graph-analytics': '#06b6d4',
  'reinforcement-learning': '#f59e0b',
  'agentic': '#ec4899',
  'data-platform': '#14b8a6',
  'infrastructure': '#64748b',
};

const REGION_LABELS = {
  'americas': 'Americas',
  'emea': 'EMEA',
  'apac': 'Asia-Pacific',
};

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

// ── Taxonomy OG Templates ──

function createTaxonomyOG(title, subtitle, color, count, urlPath) {
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
    // Top bar: AIFI brand + badge
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
        e('span', { style: { fontSize: '18px', fontWeight: 600, color: MUTED } }, 'AIFI Map'),
      ),
      e('div', {
        style: {
          display: 'flex',
          fontSize: '16px',
          fontWeight: 600,
          color: color,
          padding: '6px 16px',
          borderRadius: '8px',
          border: `1px solid ${color}33`,
          background: `${color}0d`,
        }
      }, `${count} Companies`),
    ),
    // Color accent bar
    e('div', {
      style: {
        display: 'flex',
        width: '64px',
        height: '6px',
        borderRadius: '3px',
        background: color,
        marginBottom: '24px',
      }
    }),
    // Title
    e('div', {
      style: {
        display: 'flex',
        fontSize: title.length > 28 ? '48px' : '56px',
        fontWeight: 700,
        color: TEXT,
        lineHeight: 1.15,
      }
    }, truncate(title, 50)),
    // Subtitle
    e('div', {
      style: {
        display: 'flex',
        fontSize: '22px',
        color: MUTED,
        lineHeight: 1.4,
        marginTop: '16px',
        maxWidth: '960px',
      }
    }, truncate(subtitle, 120)),
    // URL
    e('div', {
      style: {
        display: 'flex',
        fontSize: '16px',
        color: `${ACCENT}99`,
        marginTop: 'auto',
      }
    }, `aifimap.com${urlPath}`),
  );
}

function createCompareOG(labelA, labelB, countA, countB) {
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
        e('span', { style: { fontSize: '18px', fontWeight: 600, color: MUTED } }, 'AIFI Map — Comparison'),
      ),
    ),
    // VS layout
    e('div', {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '32px',
        flex: 1,
      }
    },
      // Left side
      e('div', {
        style: {
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          padding: '24px',
          borderRadius: '12px',
          background: SURFACE,
          border: `1px solid ${BORDER}`,
        }
      },
        e('div', { style: { display: 'flex', fontSize: '32px', fontWeight: 700, color: TEXT, lineHeight: 1.2 } }, truncate(labelA, 24)),
        e('div', { style: { display: 'flex', fontSize: '18px', color: MUTED, marginTop: '8px' } }, `${countA} companies`),
      ),
      // VS divider
      e('div', {
        style: {
          display: 'flex',
          fontSize: '24px',
          fontWeight: 700,
          color: MUTED,
        }
      }, 'vs'),
      // Right side
      e('div', {
        style: {
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          padding: '24px',
          borderRadius: '12px',
          background: SURFACE,
          border: `1px solid ${BORDER}`,
        }
      },
        e('div', { style: { display: 'flex', fontSize: '32px', fontWeight: 700, color: TEXT, lineHeight: 1.2 } }, truncate(labelB, 24)),
        e('div', { style: { display: 'flex', fontSize: '18px', color: MUTED, marginTop: '8px' } }, `${countB} companies`),
      ),
    ),
    // URL
    e('div', {
      style: {
        display: 'flex',
        fontSize: '16px',
        color: `${ACCENT}99`,
        marginTop: '24px',
      }
    }, 'aifimap.com/compare'),
  );
}

function createContentOG(title, subtitle) {
  return e('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
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
        alignItems: 'center',
        gap: '12px',
        marginBottom: '48px',
      }
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
      e('span', { style: { fontSize: '18px', fontWeight: 600, color: MUTED } }, 'AIFI Map'),
    ),
    // Title
    e('div', {
      style: {
        display: 'flex',
        fontSize: title.length > 35 ? '44px' : '52px',
        fontWeight: 700,
        color: TEXT,
        lineHeight: 1.15,
        maxWidth: '960px',
      }
    }, title),
    // Subtitle
    e('div', {
      style: {
        display: 'flex',
        fontSize: '22px',
        color: MUTED,
        lineHeight: 1.4,
        marginTop: '20px',
        maxWidth: '860px',
      }
    }, subtitle),
    // URL
    e('div', {
      style: {
        display: 'flex',
        fontSize: '18px',
        color: ACCENT,
        marginTop: 'auto',
      }
    }, 'aifimap.com'),
  );
}

// ── Main ──

async function main() {
  // Ensure output directories
  fs.mkdirSync(path.join(OUTPUT_DIR, 'p'), { recursive: true });
  fs.mkdirSync(path.join(OUTPUT_DIR, 'agents'), { recursive: true });
  fs.mkdirSync(path.join(OUTPUT_DIR, 'segments'), { recursive: true });
  fs.mkdirSync(path.join(OUTPUT_DIR, 'ai-types'), { recursive: true });
  fs.mkdirSync(path.join(OUTPUT_DIR, 'layers'), { recursive: true });
  fs.mkdirSync(path.join(OUTPUT_DIR, 'regions'), { recursive: true });
  fs.mkdirSync(path.join(OUTPUT_DIR, 'compare'), { recursive: true });
  fs.mkdirSync(path.join(OUTPUT_DIR, 'content'), { recursive: true });

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

  // 4. Segment images
  for (const seg of segments) {
    const segCount = projects.filter(p => p.segment === seg.slug || (p.segments && p.segments.includes(seg.slug))).length;
    await generate(
      createTaxonomyOG(seg.name, seg.description, seg.color, segCount, `/segments/${seg.slug}`),
      `segments/${seg.slug}.png`
    );
  }
  process.stdout.write(`  ${segments.length} segment images\n`);

  // 5. AI type images
  const aiTypeKeys = Object.keys(AI_TYPE_LABELS);
  for (const t of aiTypeKeys) {
    const typeCount = projects.filter(p => p.ai_types && p.ai_types.includes(t)).length;
    await generate(
      createTaxonomyOG(AI_TYPE_LABELS[t], `AI technology used by ${typeCount} financial companies`, AI_TYPE_COLORS[t], typeCount, `/ai-types/${t}`),
      `ai-types/${t}.png`
    );
  }
  process.stdout.write(`  ${aiTypeKeys.length} AI type images\n`);

  // 6. Layer images
  for (const lay of layers) {
    const layCount = projects.filter(p => p.layer === lay.slug || (p.layers && p.layers.includes(lay.slug))).length;
    await generate(
      createTaxonomyOG(`${lay.name} Layer`, lay.description, lay.color, layCount, `/layers/${lay.slug}`),
      `layers/${lay.slug}.png`
    );
  }
  process.stdout.write(`  ${layers.length} layer images\n`);

  // 7. Region images
  const regionColors = { americas: '#3b82f6', emea: '#f59e0b', apac: '#ec4899' };
  for (const r of Object.keys(REGION_LABELS)) {
    const regionCount = projects.filter(p => p.region === r).length;
    await generate(
      createTaxonomyOG(`Financial AI in ${REGION_LABELS[r]}`, `${regionCount} AI + Finance companies in the ${REGION_LABELS[r]} region`, regionColors[r], regionCount, `/regions/${r}`),
      `regions/${r}.png`
    );
  }
  process.stdout.write(`  ${Object.keys(REGION_LABELS).length} region images\n`);

  // 8. Comparison images (AI type pairs with >=5 companies each)
  const viableTypes = aiTypeKeys.filter(t => projects.filter(p => p.ai_types && p.ai_types.includes(t)).length >= 5);
  let compareCount = 0;
  for (let i = 0; i < viableTypes.length; i++) {
    for (let j = i + 1; j < viableTypes.length; j++) {
      const a = viableTypes[i];
      const b = viableTypes[j];
      const countA = projects.filter(p => p.ai_types && p.ai_types.includes(a)).length;
      const countB = projects.filter(p => p.ai_types && p.ai_types.includes(b)).length;
      const slug = `${a}-vs-${b}`;
      await generate(createCompareOG(AI_TYPE_LABELS[a], AI_TYPE_LABELS[b], countA, countB), `compare/${slug}.png`);
      compareCount++;
    }
  }
  process.stdout.write(`  ${compareCount} comparison images\n`);

  // 9. Content page images
  await generate(
    createContentOG('What is Financial AI?', 'Definition, technologies, and companies building at the intersection of AI and finance'),
    'content/what-is-financial-ai.png'
  );
  await generate(
    createContentOG('Financial AI Market Report', `State of the industry: ${projects.length} companies, funding trends, and AI technology adoption`),
    'content/market-report.png'
  );
  await generate(
    createContentOG('AI Technology Comparisons', 'Side-by-side analysis of AI technologies used in financial services'),
    'content/compare.png'
  );
  process.stdout.write('  3 content page images\n');

  const taxonomyTotal = segments.length + aiTypeKeys.length + layers.length + Object.keys(REGION_LABELS).length + compareCount + 3;
  console.log(`OG images generated: 1 default + ${projects.length} companies + ${agents.length} agents + ${taxonomyTotal} taxonomy/content → public/og/`);
}

main().catch(err => {
  console.error('OG image generation failed:', err);
  process.exit(1);
});
