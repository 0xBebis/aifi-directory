# AIFI Development Guide

Architectural constraints, conventions, and reference for the AIFI codebase. All changes must follow these rules.

---

## Project Identity

**AIFI** is a curated directory and market map of AI + Finance companies and AI agents. It combines:

1. **Company Directory** — ~450 companies classified by market segment, tech layer, and AI type
2. **Market Matrix** — Interactive heatmap showing company density at segment × layer intersections
3. **Agent Registry** — EIP-8004 AI agents filtered by finance category and protocol

### Core Principles

1. **Simplicity over features** — Resist adding complexity. Every feature must justify its existence.
2. **Data as the source of truth** — All content comes from `/src/data/*.json`. No hardcoded content in components.
3. **Static first** — The site builds to static HTML. No runtime server required.
4. **Zero external services** — No databases, no APIs, no auth providers. Everything runs client-side.

---

## Architecture

### Tech Stack

| Layer | Technology | Version | Reason |
|-------|------------|---------|--------|
| Framework | Next.js (App Router) | 14 | Static export, file-based routing |
| Styling | Tailwind CSS | 3 | Utility-first, no CSS files to manage |
| Search | Fuse.js | 7 | Client-side fuzzy search, no backend |
| Icons | Lucide React | 0.441 | Lightweight, tree-shakeable |
| Types | TypeScript | 5 | Type safety, better DX |

### What We DON'T Use

- **No database** — Data lives in JSON files
- **No CMS** — Edit JSON directly
- **No authentication** — Public read-only site
- **No analytics services** — Add only if explicitly requested
- **No state management libraries** — React `useState` is sufficient
- **No CSS-in-JS** — Tailwind only
- **No API routes** — Static export doesn't support them

### Forbidden Patterns

- Server components that fetch external data at runtime
- Environment variables for runtime config
- Dynamic imports for data files
- `localStorage` for persistent state
- External image hosts (use local `/public`)
- `getServerSideProps` (incompatible with static export)

---

## File Organization

```
src/
├── app/                              # Pages (minimal logic)
│   ├── page.tsx                      # / — Homepage
│   ├── layout.tsx                    # Root layout (Nav, footer)
│   ├── globals.css                   # Tailwind imports + scrollbar
│   ├── not-found.tsx                 # 404 page
│   ├── about/page.tsx                # /about — Thesis & methodology
│   ├── directory/page.tsx            # /directory — Company directory + market matrix
│   ├── p/[slug]/page.tsx             # /p/:slug — Company detail
│   ├── agents/page.tsx               # /agents — Agent registry
│   ├── agents/[id]/page.tsx          # /agents/:id — Agent detail
│   ├── submit/page.tsx               # /submit — Submit a new company
│   └── submit/update/[slug]/
│       ├── page.tsx                  # /submit/update/:slug — Update existing company
│       └── UpdateForm.tsx            # Client component for update form
│
├── components/                       # Reusable UI
│   ├── Nav.tsx                       # Site navigation
│   ├── ProjectTable.tsx              # Sortable/filterable company table
│   ├── CompanyLogo.tsx               # Logo with fallback
│   ├── MarketMatrix.tsx              # Interactive segment × layer heatmap
│   ├── AgentCard.tsx                 # Agent card for listing
│   ├── AgentFilters.tsx              # Category/protocol filter bar
│   ├── AgentImage.tsx                # Agent avatar with fallback
│   ├── ProtocolBadge.tsx             # Protocol tag (MCP, A2A, etc.)
│   ├── CapabilitySection.tsx         # Collapsible tools/skills list
│   ├── ReputationBadge.tsx           # Score display with color coding
│   ├── EndpointList.tsx              # Agent endpoint URLs
│   ├── ui/index.tsx                  # Shared UI primitives
│   └── home/                         # Homepage-specific components
│       ├── Hero.tsx                  # Hero section with stats
│       ├── SegmentShowcase.tsx       # Segment cards grid
│       ├── TechStack.tsx             # Layer visualization
│       ├── FeaturedCompanies.tsx     # Top-funded companies
│       └── CallToAction.tsx          # CTA banner
│
├── data/                             # JSON data files (source of truth)
│   ├── projects.json                 # ~450 companies
│   ├── segments.json                 # 9 market segments
│   ├── layers.json                   # 5 tech layers
│   └── agents.json                   # EIP-8004 agents (from pipeline)
│
├── lib/
│   └── data.ts                       # All data loading, helpers, formatting
│
└── types/
    └── index.ts                      # All TypeScript interfaces and enums

scripts/
├── validate-data.js                  # Data integrity validator
├── funding-scraper/                  # One-off: scraped funding data
│   ├── scraper.js                    # Main scraper
│   ├── review.json                   # Manual review queue
│   ├── show-updates.js               # Display pending updates
│   ├── get-remaining.js              # Find unscraped projects
│   ├── save-batch.js                 # Save scraper results
│   ├── add-remaining.js              # Add new projects
│   ├── update-projects.js            # Apply updates to projects.json
│   └── classify-ai-type.js           # AI type classification
├── logo-downloader/                  # One-off: downloaded company logos
│   ├── download-logos.js             # Download logos to /public/logos/
│   ├── update-projects.js            # Update logo paths in projects.json
│   └── generate-review.js            # Generate review of downloads
└── agent-pipeline/                   # Active: EIP-8004 agent ingestion
    ├── fetch-agents.js               # Fetch from The Graph subgraph
    ├── finance-classifier.js         # Score + categorize for finance relevance
    ├── spam-filter.js                # Remove test/spam agents, deduplicate
    ├── config.js                     # Keywords, thresholds, weights
    └── overrides.json                # Manual include/exclude overrides
```

### Naming Conventions

- **Routes**: kebab-case directories (`submit/update`)
- **Components**: PascalCase (`ProjectTable.tsx`)
- **Utilities**: camelCase functions (`formatFunding`, `getAgent`)
- **Types**: PascalCase (`Project`, `Agent`, `FinanceCategory`)
- **Slugs**: lowercase-with-hyphens (`two-sigma`, `11155111-462`)

---

## Data Model

### Project

Every company in the directory. ~30 fields, 5 required.

```typescript
interface Project {
  // Required
  slug: string;              // Unique URL identifier
  name: string;              // Display name
  tagline: string;           // Max ~140 chars
  segment: string;           // Primary segment slug
  layer: string;             // Primary tech layer slug

  // Classification
  segments?: string[];       // Additional segment slugs
  layers?: string[];         // Additional layer slugs
  ai_type?: AIType;          // AI/ML technology classification
  crypto?: boolean;          // Web3/crypto flag

  // Company info
  logo?: string;             // Path relative to /public/
  description?: string;      // Long-form description
  summary?: string;          // Editorial summary
  website?: string;
  twitter?: string;
  linkedin?: string;
  founded?: number;          // Year (e.g. 2019)
  hq_country?: string;       // ISO 3166-1 alpha-2
  hq_city?: string;
  defunct?: boolean;          // No longer in business

  // Financial
  company_type?: CompanyType;    // private | public | acquired | token
  funding_stage?: FundingStage;  // pre-seed | seed | early | growth | late | public | fair-launch | undisclosed
  region?: Region;               // americas | emea | apac
  funding?: number;              // Total funding in USD (raw number)
  stage?: Stage;                 // Legacy — deprecated in favor of funding_stage
  valuation?: number;            // Latest known valuation in USD
  revenue?: number;              // Annual revenue/ARR in USD
  last_funding_date?: string;    // Year or YYYY-MM
  acquirer?: string;             // Acquiring company name
  acquired_date?: string;        // Year or YYYY-MM

  // People
  employees?: EmployeeRange;     // '1-10' | '11-50' | ... | '5000+'
  founders?: Founder[];          // Key executives
  team?: TeamMember[];           // Legacy team members
  customers?: string[];          // Key customer names
  job_openings?: number;         // Current open positions
}
```

### Agent (EIP-8004)

AI agents from the on-chain registry. Fetched via The Graph subgraph and classified by the agent pipeline.

```typescript
interface Agent {
  id: string;                    // "{chainId}:{agentId}" (e.g. "11155111:462")
  agentId: number;               // On-chain numeric ID
  chainId: number;               // EVM chain ID (11155111 = Sepolia)
  name: string;
  description: string;
  image: string | null;
  owner: string;                 // Ethereum address
  agentWallet: string | null;    // Agent's own wallet address
  active: boolean;
  x402Support: boolean;          // HTTP 402 payment support

  // Protocols & Endpoints
  protocols: AgentProtocol[];    // ['mcp', 'a2a', 'oasf', 'web', 'email']
  mcpEndpoint: string | null;
  mcpTools: string[];
  mcpPrompts: string[];
  mcpResources: string[];
  a2aEndpoint: string | null;
  a2aSkills: string[];
  oasfEndpoint: string | null;
  oasfSkills: string[];
  oasfDomains: string[];
  webEndpoint: string | null;

  // Identity
  ens: string | null;            // ENS name
  did: string | null;            // Decentralized identifier
  supportedTrust: string[];      // Trust framework references

  // Reputation
  reputationScore: number | null;
  feedbackCount: number;
  validationCount: number;
  completedValidations: number;
  recentFeedback: FeedbackEntry[];

  // Classification (assigned by pipeline)
  financeCategory: FinanceCategory;
  financeScore: number;          // 0–1 relevance score

  // Timestamps (Unix seconds)
  createdAt: number;
  updatedAt: number;
  lastActivity: number;
}
```

### Segment

9 market segments defining where in finance a company operates.

| Slug | Name | Color |
|------|------|-------|
| `trading` | Trading & Markets | `#3b82f6` |
| `banking` | Banking & Payments | `#ec4899` |
| `lending` | Lending & Credit | `#06b6d4` |
| `wealth` | Wealth Management | `#8b5cf6` |
| `insurance` | Insurance | `#10b981` |
| `risk` | Risk & Compliance | `#f59e0b` |
| `enterprise` | Enterprise Finance | `#84cc16` |
| `crypto` | Crypto & Web3 | `#f97316` |
| `research` | Research & Data | `#14b8a6` |

### Layer

5 tech layers defining what kind of technology a company builds.

| Slug | Name | Position | Color |
|------|------|----------|-------|
| `infrastructure` | Infrastructure | 1 | `#64748b` |
| `data` | Data | 2 | `#0ea5e9` |
| `models` | Models | 3 | `#a855f7` |
| `automation` | Automation | 4 | `#22c55e` |
| `applications` | Applications | 5 | `#3b82f6` |

### Enum Types

**AIType** (9 values): `llm`, `predictive-ml`, `computer-vision`, `graph-analytics`, `reinforcement-learning`, `agentic`, `multi-modal`, `data-platform`, `infrastructure`

**CompanyType** (4 values): `private`, `public`, `acquired`, `token`

**FundingStage** (8 values): `pre-seed`, `seed`, `early`, `growth`, `late`, `public`, `fair-launch`, `undisclosed`

**Region** (3 values): `americas`, `emea`, `apac`

**EmployeeRange** (7 values): `1-10`, `11-50`, `51-200`, `201-500`, `501-1000`, `1001-5000`, `5000+`

**FinanceCategory** (9 values): `trading`, `risk-compliance`, `payments`, `lending`, `wealth`, `insurance`, `research`, `defi`, `general-finance`

**AgentProtocol** (5 values): `mcp`, `a2a`, `oasf`, `web`, `email`

### Validation Rules

1. Every `slug` must be unique across all projects
2. Every `segment` and `layer` must reference a valid slug from their respective JSON files
3. `funding`, `valuation`, `revenue` are raw numbers (e.g. `170000000` not `"$170M"`)
4. `founded` is a 4-digit year
5. Agent `id` format: `{chainId}:{agentId}` (e.g. `11155111:462`)

---

## Component Patterns

### Pages fetch, components render

```typescript
// Page: thin, data at the top, delegates to components
export default function AgentsPage() {
  return <AgentDirectoryView agents={agents} />;
}

// Component: props in, JSX out
export default function AgentCard({ agent }: { agent: Agent }) {
  return <div>...</div>;
}
```

### Client components are leaf-level

Only use `'use client'` when necessary (`useState`, `useEffect`, event handlers, browser APIs). Keep client components small and at the leaf level. Never make a page component a client component if avoidable.

### Data loading

All data is imported from JSON at build time via `src/lib/data.ts`. No runtime fetching. No loading states needed.

---

## Styling

### Design Tokens

Use semantic token names from `tailwind.config.js`, never raw hex values.

| Token | Value | Usage |
|-------|-------|-------|
| `background` | `#09090b` | Page background |
| `surface` | `#111113` | Card background |
| `surface-2` | `#18181b` | Hover/secondary surface |
| `surface-3` | `#1f1f23` | Elevated surface |
| `border` | `#27272a` | Borders |
| `border-subtle` | `#1e1e21` | Subtle dividers |
| `text-primary` | `#fafafa` | Main text |
| `text-secondary` | `#d4d4d8` | Secondary text |
| `text-muted` | `#a1a1aa` | Muted text |
| `text-faint` | `#71717a` | Faintest text |
| `accent` | `#0d9488` | Interactive elements (teal) |
| `accent-hover` | `#14b8a6` | Hover state |
| `positive` | `#22c55e` | Success/positive |
| `negative` | `#ef4444` | Error/negative |
| `warning` | `#f59e0b` | Warning |

### Rules

- Group Tailwind classes: layout > spacing > typography > colors > effects
- Desktop-first; use `md:`, `lg:` responsive prefixes as needed
- No `.module.css` files; `globals.css` is for fonts and scrollbar only
- Prefer semantic tokens (`bg-surface`) over raw values (`bg-[#111113]`)

---

## Agent Pipeline

The agent pipeline (`scripts/agent-pipeline/`) fetches EIP-8004 agents from The Graph and produces `src/data/agents.json`.

### How it works

1. **fetch-agents.js** — Queries the subgraph (paginated), downloads all registered agents
2. **spam-filter.js** — Removes test/spam agents using name/description pattern matching and deduplication
3. **finance-classifier.js** — Scores each agent for finance relevance (0–1) using keyword matching across name, description, domains, and tools. Assigns a `FinanceCategory` based on the best-matching keyword cluster.
4. **config.js** — Central configuration: subgraph ID, finance keywords, category keyword sets, scoring weights, spam patterns

### Running the pipeline

```bash
node scripts/agent-pipeline/fetch-agents.js
```

This writes to `src/data/agents.json`. The output `results.json` is gitignored.

### Configuration

- **Finance threshold**: 0.25 (agents scoring below are excluded)
- **Scoring weights**: name (0.20), description (0.30), domains (0.25), tools (0.15)
- **Chain**: Ethereum Sepolia (chain ID 11155111) — only deployment as of now
- **Manual overrides**: `overrides.json` can force-include or force-exclude agents

---

## Build & Quality

### Commands

```bash
npm run dev       # Development server (localhost:3000)
npm run build     # Production build (static export to /out)
npm run start     # Serve production build
npm run lint      # ESLint
npm run validate  # Data integrity checks (slugs, refs, required fields)
```

### Quality Checklist

Before considering any change complete:

- [ ] `npm run build` passes (no TypeScript errors)
- [ ] `npm run validate` passes (data integrity)
- [ ] No hardcoded data in components
- [ ] No console errors or warnings
- [ ] No dead code or unused imports
- [ ] All slugs unique, all segment/layer references valid
- [ ] All links work, filters clear properly, 404 shows for invalid routes

### Adding a New Project

1. Edit `src/data/projects.json`
2. Include required fields: `slug`, `name`, `tagline`, `segment`, `layer`
3. Verify segment/layer slugs exist in their JSON files
4. Run `npm run build`

### Extending the Data Model

1. Add field to TypeScript interface in `src/types/index.ts`
2. Add helper functions in `src/lib/data.ts` if needed
3. Update components to display the field
4. Update this file to document

---

## Key Files

| File | Purpose |
|------|---------|
| `src/data/projects.json` | All company data (~450 entries) |
| `src/data/segments.json` | 9 market segments |
| `src/data/layers.json` | 5 tech layers |
| `src/data/agents.json` | EIP-8004 agents |
| `src/types/index.ts` | All TypeScript interfaces and enums |
| `src/lib/data.ts` | Data loading, helpers, formatting |
| `tailwind.config.js` | Design tokens and theme |
| `next.config.js` | Static export config (`output: 'export'`) |
| `scripts/validate-data.js` | Data integrity validator |
| `scripts/agent-pipeline/` | Agent ingestion pipeline |
