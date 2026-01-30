# AIFI Development Guide

Architectural constraints, conventions, and reference for the AIFI codebase. All changes must follow these rules.

---

## Project Identity

**AIFI** is a curated directory and market map of AI + Finance companies and AI agents. It combines:

1. **Company Directory** — ~450 companies classified by market segment, tech layer, and AI type
2. **Market Matrix** — Interactive heatmap showing company density at segment × layer intersections
3. **Agent Registry** — EIP-8004 AI agents filtered by finance category and protocol
4. **Blog** — Editorial content: analysis, company spotlights, market reports, and industry news

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
| Markdown | marked | — | Blog post body rendering (markdown → HTML) |
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
│   ├── globals.css                   # Tailwind imports, :root tokens, scrollbar
│   ├── not-found.tsx                 # 404 page
│   ├── about/
│   │   ├── page.tsx                  # /about — Thesis & methodology
│   │   └── history/page.tsx          # /about/history — History of financial AI
│   ├── directory/page.tsx            # /directory — Company directory + market matrix
│   ├── p/[slug]/page.tsx             # /p/:slug — Company detail
│   ├── agents/
│   │   ├── page.tsx                  # /agents — Agent registry
│   │   └── [id]/page.tsx             # /agents/:id — Agent detail
│   ├── blog/
│   │   ├── page.tsx                  # /blog — Blog index
│   │   ├── [slug]/page.tsx           # /blog/:slug — Article detail
│   │   ├── category/[category]/page.tsx  # /blog/category/:cat — Category listing
│   │   └── author/[slug]/page.tsx    # /blog/author/:slug — Author profile
│   ├── segments/
│   │   ├── [slug]/page.tsx           # /segments/:slug — Segment detail
│   │   └── [slug]/ai-types/[aiType]/page.tsx  # Cross-dimensional page
│   ├── layers/[slug]/page.tsx        # /layers/:slug — Layer detail
│   ├── ai-types/[slug]/page.tsx      # /ai-types/:slug — AI type detail
│   ├── regions/[slug]/page.tsx       # /regions/:slug — Region detail
│   ├── compare/
│   │   ├── page.tsx                  # /compare — Comparison hub
│   │   └── [slug]/page.tsx           # /compare/:slug — AI type comparison
│   ├── stats/page.tsx                # /stats — Statistics dashboard
│   ├── recent/page.tsx               # /recent — Recently funded companies
│   ├── glossary/page.tsx             # /glossary — Key terms
│   ├── what-is-financial-ai/page.tsx # /what-is-financial-ai — Pillar content
│   ├── market-report/page.tsx        # /market-report — Market report
│   └── submit/
│       ├── layout.tsx                # Submit layout
│       ├── page.tsx                  # /submit — Submit company (server)
│       ├── SubmitForm.tsx            # Client component for submit form
│       ├── blog/page.tsx             # /submit/blog — Submit blog post
│       └── update/[slug]/
│           ├── page.tsx              # /submit/update/:slug — Update company
│           └── UpdateForm.tsx        # Client component for update form
│
├── components/                       # Reusable UI
│   ├── Nav.tsx                       # Site navigation (desktop)
│   ├── MobileNav.tsx                 # Mobile navigation overlay
│   ├── GlobalSearch.tsx              # Fuzzy search overlay
│   ├── ProjectTable.tsx              # Sortable/filterable company table
│   ├── CompanyLogo.tsx               # Logo with fallback
│   ├── DirectoryBrowser.tsx          # Directory page layout
│   ├── MarketMatrix.tsx              # Interactive segment × layer heatmap
│   ├── FilteredCompanyGrid.tsx       # Generic filtered company grid
│   ├── SegmentFilteredContent.tsx    # Segment-specific filter wrapper
│   ├── AITypeFilteredContent.tsx     # AI type-specific filter wrapper
│   ├── AgentCard.tsx                 # Agent card for listing
│   ├── AgentFilters.tsx              # Category/protocol filter bar
│   ├── AgentImage.tsx                # Agent avatar with fallback
│   ├── ProtocolBadge.tsx             # Protocol tag (MCP, A2A, etc.)
│   ├── CapabilitySection.tsx         # Collapsible tools/skills list
│   ├── ReputationBadge.tsx           # Score display with color coding
│   ├── EndpointList.tsx              # Agent endpoint URLs
│   ├── BlogCard.tsx                  # Blog post card
│   ├── BlogCategoryTabs.tsx          # Blog category filter tabs
│   ├── AuthorByline.tsx              # Blog author byline
│   ├── AuthorCard.tsx                # Blog author card
│   ├── RelatedPosts.tsx              # Related blog posts grid
│   ├── MarkdownRenderer.tsx          # Markdown → HTML (uses marked)
│   ├── ReadingProgress.tsx           # Scroll progress bar
│   ├── ShareButtons.tsx              # Social share buttons
│   ├── Breadcrumbs.tsx               # Breadcrumb navigation
│   ├── JsonLd.tsx                    # Structured data injection
│   ├── BackButton.tsx                # Navigation back button
│   ├── ErrorBoundary.tsx             # React error boundary
│   ├── NewsletterForm.tsx            # Newsletter signup
│   ├── ScrollToTop.tsx               # Scroll-to-top button
│   ├── ui/index.tsx                  # Shared UI primitives
│   ├── home/                         # Homepage-specific
│   │   ├── Hero.tsx                  # Hero section with stats
│   │   ├── LandingHero.tsx           # Landing page hero variant
│   │   ├── SegmentShowcase.tsx       # Segment cards grid
│   │   ├── TechStack.tsx             # Layer visualization
│   │   ├── FeaturedCompanies.tsx     # Top-funded companies
│   │   ├── RecentActivity.tsx        # Recent activity feed
│   │   ├── SiteNav.tsx               # Homepage navigation
│   │   └── CallToAction.tsx          # CTA banner
│   ├── agents/
│   │   └── FeaturedAgent.tsx         # Featured agent spotlight
│   ├── directory/
│   │   └── TopCompanies.tsx          # Top companies ranking
│   └── stats/                        # Stats page components
│       ├── StatsDashboard.tsx        # Dashboard layout
│       ├── HeroStats.tsx             # Hero stat counters
│       ├── AnimatedCounter.tsx       # Animated number counter
│       ├── FundingLandscape.tsx      # Funding visualization
│       ├── MarketBreakdown.tsx       # Segment/layer breakdown
│       ├── GeographicDistribution.tsx # Region distribution
│       ├── FoundedTimeline.tsx       # Company founding timeline
│       └── FAQAccordion.tsx          # Collapsible FAQ section
│
├── data/                             # JSON data files (source of truth)
│   ├── projects.json                 # ~450 companies
│   ├── segments.json                 # 9 market segments
│   ├── layers.json                   # 5 tech layers
│   ├── agents.json                   # EIP-8004 agents (from pipeline)
│   ├── posts.json                    # Blog posts (body is markdown)
│   ├── authors.json                  # Blog authors
│   └── constants.json                # Shared constants (SITE_URL, labels, colors)
│
├── lib/
│   └── data.ts                       # All data loading, helpers, formatting (~1,600 lines)
│
└── types/
    └── index.ts                      # All TypeScript interfaces and enums

scripts/
├── generate-sitemap.js               # Build-time sitemap.xml generator
├── generate-og-images.js             # Build-time OG image generator
├── generate-rss.js                   # Build-time RSS feed generator
├── validate-data.js                  # Data integrity validator
├── validate-structured-data.js       # Structured data (JSON-LD) validator
├── weekly-scrape.js                  # Weekly data refresh
├── funding-scraper/                  # One-off: scraped funding data
│   ├── scraper.js                    # Main scraper
│   └── (supporting scripts)          # review, classify, update scripts
├── logo-downloader/                  # One-off: downloaded company logos
│   └── (supporting scripts)          # download, review, update scripts
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
  ai_types?: AIType[];        // AI/ML technologies used (supports multiple)
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
  stage?: Stage;                 // DEPRECATED — use funding_stage instead
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

### BlogPost

Blog articles stored in `posts.json`. Body is markdown rendered via `marked`.

```typescript
interface BlogPost {
  slug: string;                  // URL identifier
  title: string;                 // Article title
  excerpt: string;               // Short summary for cards
  body: string;                  // Markdown content
  category: BlogCategory;        // analysis | spotlight | report | news | guest
  author_slug: string;           // References authors.json
  published_date: string;        // YYYY-MM-DD
  updated_date?: string;         // YYYY-MM-DD
  tags?: string[];               // Freeform topic tags
  related_companies?: string[];  // Project slugs
  related_segments?: string[];   // Segment slugs
  related_ai_types?: AIType[];   // AI type references
  related_agents?: string[];     // Agent IDs
  featured?: boolean;            // Show in featured section
  draft?: boolean;               // Excluded from published list
  cover_image?: string;          // Path to cover image
  reading_time?: number;         // Override auto-calculated reading time
  seo_title?: string;            // Override page title
  seo_description?: string;      // Override meta description
  faqs?: { question: string; answer: string }[];  // Article-specific FAQs
}
```

### BlogAuthor

Author profiles stored in `authors.json`.

```typescript
interface BlogAuthor {
  slug: string;                  // URL identifier
  name: string;                  // Display name
  title: string;                 // Role/title
  bio: string;                   // Author biography
  expertise?: string[];          // Topic areas
  avatar?: string;               // Path to avatar image
  twitter?: string;              // Twitter handle
  linkedin?: string;             // LinkedIn URL
  website?: string;              // Personal website
  company?: string;              // Employer name
  company_role?: string;         // Role at employer
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

**AIType** (8 values): `llm`, `predictive-ml`, `computer-vision`, `graph-analytics`, `reinforcement-learning`, `agentic`, `data-platform`, `infrastructure`

**CompanyType** (4 values): `private`, `public`, `acquired`, `token`

**FundingStage** (8 values): `pre-seed`, `seed`, `early`, `growth`, `late`, `public`, `fair-launch`, `undisclosed`

**Region** (3 values): `americas`, `emea`, `apac`

**EmployeeRange** (7 values): `1-10`, `11-50`, `51-200`, `201-500`, `501-1000`, `1001-5000`, `5000+`

**FinanceCategory** (9 values): `trading`, `risk-compliance`, `payments`, `lending`, `wealth`, `insurance`, `research`, `defi`, `general-finance`

**AgentProtocol** (5 values): `mcp`, `a2a`, `oasf`, `web`, `email`

**BlogCategory** (5 values): `analysis`, `spotlight`, `report`, `news`, `guest`

### Validation Rules

1. Every `slug` must be unique across all projects
2. Every `segment` and `layer` must reference a valid slug from their respective JSON files
3. `funding`, `valuation`, `revenue` are raw numbers (e.g. `170000000` not `"$170M"`)
4. `founded` is a 4-digit year
5. Agent `id` format: `{chainId}:{agentId}` (e.g. `11155111:462`)
6. Blog post `category` must be a valid `BlogCategory` value
7. Blog post `author_slug` must reference a valid author in `authors.json`
8. Blog post `related_companies` must reference valid project slugs
9. Blog posts with `draft: true` are excluded from the published feed

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

Submit pages use extracted client form components (`SubmitForm.tsx`, `UpdateForm.tsx`) so the page wrapper can remain a server component.

### Data loading

All data is imported from JSON at build time via `src/lib/data.ts`. No runtime fetching. No loading states needed.

---

## Styling

### Design Tokens

Use semantic token names from `tailwind.config.js`, never raw hex values. CSS custom properties are defined in `:root` in `globals.css` for use in non-Tailwind contexts (scrollbar, select glass).

| Token | CSS Variable | Value | Usage |
|-------|-------------|-------|-------|
| `background` | `--color-bg` | `#09090b` | Page background |
| `surface` | `--color-surface` | `#111113` | Card background |
| `surface-2` | `--color-surface-2` | `#18181b` | Hover/secondary surface |
| `surface-3` | `--color-surface-3` | `#1f1f23` | Elevated surface |
| `border` | `--color-border` | `#27272a` | Borders |
| `border-subtle` | `--color-border-subtle` | `#1e1e21` | Subtle dividers |
| `text-primary` | `--color-text-primary` | `#fafafa` | Main text |
| `text-secondary` | `--color-text-secondary` | `#d4d4d8` | Secondary text |
| `text-muted` | `--color-text-muted` | `#a1a1aa` | Muted text |
| `text-faint` | `--color-text-faint` | `#71717a` | Faintest text |
| `accent` | `--color-accent` | `#0d9488` | Interactive elements (teal) |
| `accent-hover` | `--color-accent-hover` | `#14b8a6` | Hover state |
| `positive` | `--color-positive` | `#22c55e` | Success/positive |
| `negative` | `--color-negative` | `#ef4444` | Error/negative |
| `warning` | `--color-warning` | `#f59e0b` | Warning |

### Rules

- Group Tailwind classes: layout > spacing > typography > colors > effects
- Desktop-first; use `md:`, `lg:` responsive prefixes as needed
- No `.module.css` files; `globals.css` is for fonts, `:root` tokens, and scrollbar only
- Prefer semantic tokens (`bg-surface`) over raw values (`bg-[#111113]`)
- Use `var(--color-*)` CSS custom properties in raw CSS contexts (scrollbar, select, keyframes)

---

## Build Pipeline

### Prebuild Scripts

The `npm run build` command runs prebuild scripts before `next build`:

1. **`generate-sitemap.js`** — Produces `public/sitemap.xml` from projects, agents, segments, layers, AI types, regions, and comparison pages. Sets per-page `lastmod` from `last_funding_date`.
2. **`generate-og-images.js`** — Produces `public/og/*.png` for every company, agent, taxonomy page, and the default OG image. Uses canvas rendering.
3. **`generate-rss.js`** — Produces `public/feed.xml` RSS 2.0 feed of recently funded companies.

All prebuild scripts read from `src/data/*.json`.

### Running the pipeline

```bash
npm run build     # Runs prebuild + next build (static export to /out)
npm run validate  # Data integrity checks only
```

---

## Blog

### How it works

Blog posts are stored in `src/data/posts.json` as JSON objects with markdown `body` fields. Authors are in `authors.json`. All blog functions (queries, formatting, FAQ generation) live in `src/lib/data.ts`.

### Routes

| Route | Purpose |
|-------|---------|
| `/blog` | Blog index with category tabs |
| `/blog/:slug` | Article detail with markdown rendering |
| `/blog/category/:category` | Category listing |
| `/blog/author/:slug` | Author profile with post list |
| `/submit/blog` | Submit article via GitHub Issue |

### Blog Categories

| Slug | Label | Color |
|------|-------|-------|
| `analysis` | Analysis | `#3b82f6` |
| `spotlight` | Company Spotlight | `#8b5cf6` |
| `report` | Market Report | `#f59e0b` |
| `news` | News | `#22c55e` |
| `guest` | Guest Post | `#ec4899` |

### Adding a Blog Post

1. Add post object to `src/data/posts.json`
2. Required fields: `slug`, `title`, `excerpt`, `body`, `category`, `author_slug`, `published_date`
3. Ensure `author_slug` references a valid author in `authors.json`
4. Set `draft: true` to exclude from published feed during development
5. Run `npm run build`

### Adding an Author

1. Add author object to `src/data/authors.json`
2. Required fields: `slug`, `name`, `title`, `bio`
3. Run `npm run build`

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
npm run build     # Prebuild scripts + production build (static export to /out)
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

## Technical Debt

### Legacy `stage` Field

The deprecated `stage` field (snake_case, e.g. `series_a`) coexists with its replacement `funding_stage` (kebab-case). ~346 projects still carry `stage`. The `funding_stage` field is preferred everywhere in the UI.

**Migration mapping** (for future data cleanup):

| Legacy `stage` | New `funding_stage` | Notes |
|----------------|---------------------|-------|
| `pre_seed` | `pre-seed` | |
| `seed` | `seed` | |
| `series_a` | `early` | |
| `series_b` | `growth` | |
| `series_c_plus` | `late` | |
| `growth` | `growth` | |
| `public` | `public` | |
| `acquired` | — | Set `company_type: 'acquired'` instead |
| `bootstrapped` | `undisclosed` | |

### Constants Duplication

`src/data/constants.json` was created as a single source of truth for shared constants (SITE_URL, label/color records) used by both CJS build scripts and the TypeScript app. Currently, the build scripts still use inline constants. A future cleanup can wire them to import from `constants.json`.

---

## Key Files

| File | Purpose |
|------|---------|
| `src/data/projects.json` | All company data (~450 entries) |
| `src/data/segments.json` | 9 market segments |
| `src/data/layers.json` | 5 tech layers |
| `src/data/agents.json` | EIP-8004 agents |
| `src/data/posts.json` | Blog posts (markdown body) |
| `src/data/authors.json` | Blog authors |
| `src/data/constants.json` | Shared constants (SITE_URL, labels, colors) |
| `src/types/index.ts` | All TypeScript interfaces and enums |
| `src/lib/data.ts` | Data loading, helpers, formatting (~1,600 lines) |
| `tailwind.config.js` | Design tokens and theme |
| `next.config.js` | Static export config (`output: 'export'`) |
| `scripts/validate-data.js` | Data integrity validator |
| `scripts/generate-sitemap.js` | Build-time sitemap generator |
| `scripts/generate-og-images.js` | Build-time OG image generator |
| `scripts/generate-rss.js` | Build-time RSS feed generator |
| `scripts/agent-pipeline/` | Agent ingestion pipeline |
