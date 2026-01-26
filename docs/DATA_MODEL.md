# AIFI Data Model

All data is stored as JSON files in `src/data/`. TypeScript interfaces live in `src/types/index.ts`. Data access helpers live in `src/lib/data.ts`.

---

## Data Files

| File | Type | Description |
|------|------|-------------|
| `src/data/projects.json` | `Project[]` | ~450 AI+Finance companies |
| `src/data/segments.json` | `Segment[]` | 9 market segments |
| `src/data/layers.json` | `Layer[]` | 5 tech stack layers |
| `src/data/agents.json` | `Agent[]` | EIP-8004 AI agents (from pipeline) |

---

## Project

Every company in the directory.

```typescript
interface Project {
  // ── Required ──
  slug: string;              // Unique URL identifier (lowercase-with-hyphens)
  name: string;              // Display name
  tagline: string;           // Short description (~140 chars)
  segment: string;           // Primary market segment slug
  layer: string;             // Primary tech layer slug

  // ── Classification ──
  segments?: string[];       // Additional segment slugs
  layers?: string[];         // Additional layer slugs
  ai_types?: AIType[];        // AI/ML technologies used (supports multiple)
  crypto?: boolean;          // Web3/crypto flag (for filtering)

  // ── Company Info ──
  logo?: string;             // Path relative to /public/ (e.g. "/logos/stripe.svg")
  description?: string;      // Long-form description
  summary?: string;          // Editorial summary
  website?: string;          // Company website URL
  twitter?: string;          // Twitter/X profile URL
  linkedin?: string;         // LinkedIn company URL
  founded?: number;          // Year founded (e.g. 2019)
  hq_country?: string;       // ISO 3166-1 alpha-2 country code
  hq_city?: string;          // City name
  defunct?: boolean;          // True if company is no longer operating

  // ── Financial ──
  company_type?: CompanyType;     // private | public | acquired | token
  funding_stage?: FundingStage;   // Funding maturity level
  region?: Region;                // Geographic region
  funding?: number;               // Total funding raised in USD (raw number)
  stage?: Stage;                  // Legacy field — use funding_stage instead
  valuation?: number;             // Latest known valuation in USD
  revenue?: number;               // Annual revenue/ARR in USD
  last_funding_date?: string;     // Year or "YYYY-MM"
  acquirer?: string;              // Name of acquiring company
  acquired_date?: string;         // Year or "YYYY-MM" of acquisition

  // ── People ──
  employees?: EmployeeRange;      // Employee count range
  founders?: Founder[];           // Key executives / founders
  team?: TeamMember[];            // Legacy team member list
  customers?: string[];           // Key customer names
  job_openings?: number;          // Current open positions
}
```

### Example

```json
{
  "slug": "stripe",
  "name": "Stripe",
  "logo": "/logos/stripe.svg",
  "tagline": "Financial infrastructure for the internet",
  "segment": "banking",
  "layer": "infrastructure",
  "ai_type": "predictive-ml",
  "company_type": "private",
  "funding_stage": "late",
  "region": "americas",
  "funding": 8700000000,
  "valuation": 50000000000,
  "founded": 2010,
  "hq_country": "US",
  "hq_city": "San Francisco",
  "employees": "5000+",
  "founders": [
    { "name": "Patrick Collison", "title": "CEO" },
    { "name": "John Collison", "title": "President" }
  ]
}
```

---

## Agent (EIP-8004)

AI agents from the on-chain identity registry, fetched via The Graph and classified by the agent pipeline.

```typescript
interface Agent {
  // ── Identity ──
  id: string;                    // "{chainId}:{agentId}" (e.g. "11155111:462")
  agentId: number;               // On-chain numeric ID
  chainId: number;               // EVM chain ID (11155111 = Sepolia)
  name: string;
  description: string;
  image: string | null;          // Avatar URL
  owner: string;                 // Ethereum address of the registrant
  agentWallet: string | null;    // Agent's own wallet address
  active: boolean;               // Active status flag
  x402Support: boolean;          // HTTP 402 payment protocol support

  // ── Protocols & Endpoints ──
  protocols: AgentProtocol[];    // Detected protocols (e.g. ['mcp', 'a2a'])
  mcpEndpoint: string | null;    // Model Context Protocol endpoint
  mcpTools: string[];            // MCP tool names
  mcpPrompts: string[];          // MCP prompt names
  mcpResources: string[];        // MCP resource URIs
  a2aEndpoint: string | null;    // Agent-to-Agent endpoint
  a2aSkills: string[];           // A2A skill declarations
  oasfEndpoint: string | null;   // Open Agent Service Framework endpoint
  oasfSkills: string[];          // OASF skill names
  oasfDomains: string[];         // OASF domain tags
  webEndpoint: string | null;    // Standard web endpoint

  // ── Decentralized Identity ──
  ens: string | null;            // ENS name (e.g. "myagent.eth")
  did: string | null;            // Decentralized Identifier
  supportedTrust: string[];      // Trust framework references

  // ── Reputation ──
  reputationScore: number | null; // Aggregate score (null = not yet scored)
  feedbackCount: number;
  validationCount: number;
  completedValidations: number;
  recentFeedback: FeedbackEntry[];

  // ── Classification (pipeline-assigned) ──
  financeCategory: FinanceCategory; // Best-matching finance category
  financeScore: number;             // 0–1 finance relevance score

  // ── Timestamps (Unix seconds) ──
  createdAt: number;
  updatedAt: number;
  lastActivity: number;
}
```

---

## Supporting Types

### Segment

```typescript
interface Segment {
  slug: string;          // Unique identifier
  name: string;          // Display name
  description: string;   // Brief description
  icon?: string;         // Icon identifier (unused in current UI)
  color: string;         // Hex color for visualizations
}
```

### Layer

```typescript
interface Layer {
  slug: string;
  name: string;
  description: string;
  position: number;      // Stack position (1 = bottom, 5 = top)
  icon?: string;
  color: string;
}
```

### TeamMember (legacy)

```typescript
interface TeamMember {
  name: string;
  role: string;
  linkedin?: string;
}
```

### Founder

```typescript
interface Founder {
  name: string;
  title?: string;        // CEO, CTO, Co-founder, etc.
  linkedin?: string;
}
```

### FeedbackEntry

```typescript
interface FeedbackEntry {
  score: number;
  tag1: string | null;
  tag2: string | null;
  reviewer: string;      // Ethereum address
  text: string | null;
  createdAt: number;     // Unix seconds
}
```

---

## Enum Types

### Stage (legacy — use FundingStage)

```typescript
type Stage =
  | 'pre_seed' | 'seed' | 'series_a' | 'series_b'
  | 'series_c_plus' | 'growth' | 'public' | 'acquired' | 'bootstrapped';
```

### CompanyType

| Value | Label |
|-------|-------|
| `private` | Private |
| `public` | Public |
| `acquired` | Acquired |
| `token` | Token |

### FundingStage

| Value | Label | Typical Range |
|-------|-------|---------------|
| `pre-seed` | Pre-Seed | <$2M |
| `seed` | Seed | $2M–$15M |
| `early` | Early Stage | $15M–$50M (Series A) |
| `growth` | Growth | $50M–$200M (Series B–C) |
| `late` | Late Stage | $200M+ (Series D+) |
| `public` | Public | Public company |
| `fair-launch` | Fair Launch | Token without VC funding |
| `undisclosed` | Undisclosed | Unknown |

### Region

| Value | Label |
|-------|-------|
| `americas` | Americas |
| `emea` | EMEA |
| `apac` | APAC |

### EmployeeRange

Values: `1-10`, `11-50`, `51-200`, `201-500`, `501-1000`, `1001-5000`, `5000+`

### AIType

| Value | Label |
|-------|-------|
| `llm` | LLM / NLP |
| `predictive-ml` | Predictive ML |
| `computer-vision` | Computer Vision |
| `graph-analytics` | Graph Analytics |
| `reinforcement-learning` | Reinforcement Learning |
| `agentic` | Agentic AI |
| `data-platform` | Data Platform |
| `infrastructure` | Infrastructure |

### FinanceCategory

| Value | Label |
|-------|-------|
| `trading` | Trading & Markets |
| `risk-compliance` | Risk & Compliance |
| `payments` | Payments & Banking |
| `lending` | Lending & Credit |
| `wealth` | Wealth Management |
| `insurance` | Insurance |
| `research` | Research & Data |
| `defi` | DeFi & Crypto |
| `general-finance` | General Finance |

### AgentProtocol

| Value | Label |
|-------|-------|
| `mcp` | MCP |
| `a2a` | A2A |
| `oasf` | OASF |
| `web` | Web |
| `email` | Email |

---

## Validation Rules

Run `npm run validate` to check all of these.

1. **Unique slugs** — No duplicate `slug` values within projects
2. **Valid segment references** — Every `segment` and entry in `segments[]` must match a slug in `segments.json`
3. **Valid layer references** — Every `layer` and entry in `layers[]` must match a slug in `layers.json`
4. **Numbers as numbers** — `funding`, `valuation`, `revenue`, `founded` are stored as raw numbers, not formatted strings
5. **Year format** — `founded` is a 4-digit year (e.g. `2019`)
6. **Agent ID format** — `{chainId}:{agentId}` (e.g. `11155111:462`)
7. **URL format** — `website`, `twitter`, `linkedin` should be valid URLs when present
8. **Country codes** — `hq_country` should be a valid ISO 3166-1 alpha-2 code

---

## Data Access

All data loading happens through `src/lib/data.ts`. Key exports:

```typescript
// Core collections
export const projects: Project[];
export const segments: Segment[];
export const layers: Layer[];       // sorted by position descending
export const agents: Agent[];

// Project lookups
getProject(slug: string): Project | undefined
getSegment(slug: string): Segment | undefined
getLayer(slug: string): Layer | undefined
getProjectsBySegment(segmentSlug: string): Project[]
getProjectsByLayer(layerSlug: string): Project[]
getSimilarProjects(project: Project, limit?: number): Project[]

// Agent lookups
getAgent(id: string): Agent | undefined
getAgentsByCategory(category: FinanceCategory): Agent[]
getAgentsByProtocol(protocol: AgentProtocol): Agent[]
getActiveAgents(): Agent[]
getSimilarAgents(agent: Agent, limit?: number): Agent[]

// Formatting
formatFunding(amount: number): string      // 170000000 → "$170M"
formatStage(stage: Stage): string
formatReputationScore(score: number | null): string
formatTimestamp(unix: number): string
formatRelativeTime(unix: number): string
truncateAddress(address: string): string   // "0x1234...abcd"

// Market map
getMarketMapData(aiTypeFilter?: AIType | null): MarketMapData
getProjectsAtIntersection(segmentSlug: string, layerSlug: string, aiTypeFilter?: AIType | null): Project[]

// Agent slug conversion (for URL routing)
agentSlug(id: string): string              // "11155111:462" → "11155111-462"
agentIdFromSlug(slug: string): string      // "11155111-462" → "11155111:462"
```
