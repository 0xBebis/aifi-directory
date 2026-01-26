# Agent Directory Specification

## AIFI Live Agent Registry — EIP-8004 Financial AI Agents

**Status:** Specification
**Author:** AIFI Team
**Last Updated:** 2026-01-26

---

## 1. Overview

Add a new top-level section to AIFI: a **live directory of financial AI agents** registered on Ethereum's [EIP-8004](https://eips.ethereum.org/EIPS/eip-8004) Trustless Agent Registry. The directory filters the global EIP-8004 registry down to agents relevant to finance and presents them in the same design language as the existing company directory.

### Goals

1. Let users discover AI agents that perform financial tasks (trading, risk, DeFi, lending, etc.)
2. Show each agent's capabilities, trust signals, and connection endpoints
3. Filter out non-finance agents from the global registry
4. Provide enough context for a user to evaluate whether to interact with an agent
5. Match the existing AIFI design system and static-site architecture

### Non-Goals

- Real-time WebSocket feeds or streaming data
- In-browser agent interaction/execution
- Agent registration (handled by the EIP-8004 tooling itself)
- Wallet connection or on-chain transactions

---

## 2. Data Source: EIP-8004

### 2.1 Protocol Summary

EIP-8004 defines three on-chain registries:

| Registry | Purpose | Key Data |
|----------|---------|----------|
| **Identity** | ERC-721 NFT per agent | name, description, image, endpoints, capabilities |
| **Reputation** | Signed feedback signals | score (fixed-point), tags, reviewer address |
| **Validation** | Third-party attestations | validator address, status, response |

Each agent has an on-chain ID and a `tokenURI` pointing to an off-chain JSON registration file (typically IPFS). The registration file contains the agent's full profile: name, description, service endpoints, supported protocols, and capabilities.

### 2.2 Deployed Infrastructure

**Contracts (Ethereum Sepolia):**
- Identity Registry: `0x8004A818BFB912233c491871b3d84c89A494BD9e`
- Reputation Registry: `0x8004B663056A597Dffe9eCcC1965A193B7388713`

**Subgraph Endpoint:**
```
https://gateway.thegraph.com/api/subgraphs/id/6wQRC7geo9XYAhckfmfo8kbMRLeWU8KQd3XsJqFKmZLT
```

**SDK:** `npm install agent0-sdk` ([agent0lab/agent0-ts](https://github.com/agent0lab/agent0-ts))

> **Note:** As of January 2026, the registry is live on Sepolia testnet. The spec should be chain-agnostic — when mainnet or L2 deployments arrive, only the subgraph URL and chainId change. The pipeline config stores these values.

### 2.3 Subgraph Data Model

The subgraph indexes both on-chain events and off-chain IPFS registration files. Key entities:

**Agent** (mutable, on-chain):
```
id, chainId, agentId, agentURI, owner, agentWallet, operators,
createdAt, updatedAt, totalFeedback, lastActivity,
registrationFile → AgentRegistrationFile
feedback → [Feedback]
validations → [Validation]
metadata → [AgentMetadata]
```

**AgentRegistrationFile** (immutable, from IPFS):
```
name, description, image, active, x402Support, supportedTrusts,
mcpEndpoint, mcpVersion, mcpTools[], mcpPrompts[], mcpResources[],
a2aEndpoint, a2aVersion, a2aSkills[],
oasfEndpoint, oasfVersion, oasfSkills[], oasfDomains[],
webEndpoint, emailEndpoint, ens, did
```

**AgentStats** (aggregation):
```
totalFeedback, averageFeedbackValue, totalValidations,
completedValidations, averageValidationScore, lastActivity
```

**Feedback** (mutable):
```
value (BigDecimal), tag1, tag2, endpoint, clientAddress,
isRevoked, createdAt, feedbackFile → FeedbackFile
```

**FeedbackFile** (immutable, from IPFS):
```
text, mcpTool, a2aSkills[], oasfSkills[], oasfDomains[],
proofOfPaymentTxHash, tag1, tag2
```

---

## 3. Data Pipeline

### 3.1 Architecture

Following the existing pattern (`scripts/funding-scraper/`, `scripts/logo-downloader/`), create a build-time pipeline that:

1. Queries the EIP-8004 subgraph for all agents with registration files
2. Scores each agent for finance relevance
3. Classifies matching agents into finance categories
4. Fetches reputation/validation stats
5. Writes filtered results to `src/data/agents.json`

```
scripts/agent-pipeline/
  fetch-agents.js        # Main pipeline script
  finance-classifier.js  # Finance relevance scoring + categorization
  config.js              # Subgraph URLs, thresholds, keyword lists
  results.json           # Raw pipeline output (gitignored)
```

The page then renders from `agents.json` exactly like projects render from `projects.json`.

### 3.2 Subgraph Query

The pipeline queries agents in batches of 100 (subgraph pagination limit):

```graphql
query FetchAgents($skip: Int!, $first: Int!) {
  agents(
    first: $first
    skip: $skip
    orderBy: createdAt
    orderDirection: desc
  ) {
    id
    chainId
    agentId
    agentURI
    owner
    agentWallet
    createdAt
    updatedAt
    totalFeedback
    lastActivity
    registrationFile {
      name
      description
      image
      active
      x402Support
      supportedTrusts
      mcpEndpoint
      mcpVersion
      mcpTools
      mcpPrompts
      mcpResources
      a2aEndpoint
      a2aVersion
      a2aSkills
      oasfEndpoint
      oasfVersion
      oasfSkills
      oasfDomains
      webEndpoint
      emailEndpoint
      ens
      did
    }
  }
}
```

For agents that pass the finance filter, fetch reputation stats:

```graphql
query AgentReputation($agentId: ID!) {
  agentStats(id: $agentId) {
    totalFeedback
    averageFeedbackValue
    totalValidations
    completedValidations
    averageValidationScore
  }
  feedbacks(
    where: { agent: $agentId, isRevoked: false }
    orderBy: createdAt
    orderDirection: desc
    first: 20
  ) {
    value
    tag1
    tag2
    clientAddress
    createdAt
    feedbackFile {
      text
    }
  }
}
```

### 3.3 Finance Filtering Strategy

The global EIP-8004 registry contains agents for all domains. We need a multi-signal scoring system to identify finance-relevant agents.

**Signal Sources (weighted):**

| Signal | Weight | Method |
|--------|--------|--------|
| Name keywords | 0.20 | Substring match against finance vocabulary |
| Description keywords | 0.30 | Substring match + density scoring |
| OASF domains | 0.25 | Exact match against finance domain list |
| A2A / MCP skills/tools | 0.15 | Exact or fuzzy match against finance tool list |
| Manual override | 1.00 | Force include/exclude by agent ID |

**Finance Keyword Vocabulary:**
```javascript
const FINANCE_KEYWORDS = [
  // Core finance
  'finance', 'financial', 'fintech', 'banking', 'bank',
  'trading', 'trade', 'trader', 'market making', 'order execution',
  'payment', 'payments', 'transaction', 'transfer',
  'lending', 'loan', 'credit', 'underwriting', 'mortgage',
  'insurance', 'insure', 'actuarial', 'claims',
  'investment', 'invest', 'portfolio', 'asset management', 'wealth',
  'risk', 'compliance', 'aml', 'kyc', 'fraud', 'sanctions',
  'accounting', 'audit', 'treasury', 'revenue', 'invoice',

  // Crypto/DeFi
  'defi', 'decentralized finance', 'yield', 'liquidity',
  'swap', 'dex', 'amm', 'vault', 'staking', 'restaking',
  'bridge', 'cross-chain', 'token', 'nft marketplace',

  // Quantitative
  'quant', 'quantitative', 'alpha', 'signal', 'backtest',
  'hedge fund', 'prop trading', 'arbitrage', 'derivatives',
  'options', 'futures', 'forex', 'equities', 'fixed income',

  // Data
  'market data', 'price feed', 'oracle', 'bloomberg',
  'financial data', 'economic data', 'earnings', 'sec filing',
];
```

**Finance OASF Domains** (subset — to be refined once OASF taxonomy is published):
```javascript
const FINANCE_OASF_DOMAINS = [
  'finance', 'banking', 'trading', 'insurance', 'payments',
  'lending', 'risk-management', 'compliance', 'accounting',
  'cryptocurrency', 'defi', 'wealth-management',
  'investment', 'portfolio-management', 'market-analysis',
];
```

**Scoring Algorithm:**
```
score = (nameScore * 0.20) + (descScore * 0.30) + (domainScore * 0.25) + (toolScore * 0.15)
```

- `nameScore`: 1.0 if any finance keyword appears in name, 0.0 otherwise
- `descScore`: min(1.0, matchCount / 3) — density of keyword matches in description
- `domainScore`: 1.0 if any OASF domain matches, 0.5 if any A2A skill matches, 0.0 otherwise
- `toolScore`: 1.0 if any MCP tool or A2A skill name matches a finance keyword, 0.0 otherwise

**Threshold:** Include agent if `score >= 0.25` OR if agent ID is in the manual include list.

**Manual Overrides** (`scripts/agent-pipeline/overrides.json`):
```json
{
  "include": ["11155111:42", "11155111:99"],
  "exclude": ["11155111:7"]
}
```

### 3.4 Finance Category Assignment

Each included agent is assigned a primary `financeCategory` based on the strongest keyword cluster match:

```typescript
type FinanceCategory =
  | 'trading'           // trading, market making, execution, quant, alpha
  | 'risk-compliance'   // risk, compliance, fraud, aml, kyc, sanctions
  | 'payments'          // payments, transfers, banking, neobank
  | 'lending'           // lending, credit, underwriting, loans
  | 'wealth'            // wealth, portfolio, investment, asset management
  | 'insurance'         // insurance, claims, actuarial
  | 'research'          // market data, analytics, signals, research
  | 'defi'              // defi, yield, liquidity, swap, vault, staking
  | 'general-finance';  // finance-related but no strong category signal
```

The category assignment uses the same keyword matching against category-specific word lists. The category with the highest match count wins. Ties go to `'general-finance'`.

### 3.5 Output Format: `src/data/agents.json`

```typescript
interface AgentEntry {
  // Identity
  id: string;                      // "{chainId}:{agentId}" — used as slug
  agentId: number;
  chainId: number;
  name: string;
  description: string;
  image: string | null;
  owner: string;                   // Ethereum address (checksummed)
  agentWallet: string | null;      // Ethereum address

  // Status
  active: boolean;
  x402Support: boolean;

  // Protocols & Endpoints
  protocols: string[];             // e.g. ['mcp', 'a2a', 'web']
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
  ens: string | null;
  did: string | null;

  // Trust & Reputation
  supportedTrust: string[];        // e.g. ['reputation', 'crypto-economic']
  reputationScore: number | null;  // 0-100 normalized average feedback
  feedbackCount: number;
  validationCount: number;
  completedValidations: number;
  recentFeedback: FeedbackEntry[]; // Last 5 non-revoked feedback items

  // Classification (computed by pipeline)
  financeCategory: FinanceCategory;
  financeScore: number;            // 0-1 relevance confidence

  // Timestamps (Unix seconds)
  createdAt: number;
  updatedAt: number;
  lastActivity: number;
}

interface FeedbackEntry {
  score: number;                   // Normalized 0-100
  tag1: string | null;
  tag2: string | null;
  reviewer: string;                // Address (truncated for display)
  text: string | null;             // From IPFS feedback file
  createdAt: number;
}
```

---

## 4. TypeScript Types

Add to `src/types/index.ts`:

```typescript
// ── Agent Registry Types ──

export type FinanceCategory =
  | 'trading'
  | 'risk-compliance'
  | 'payments'
  | 'lending'
  | 'wealth'
  | 'insurance'
  | 'research'
  | 'defi'
  | 'general-finance';

export const FINANCE_CATEGORY_LABELS: Record<FinanceCategory, string> = {
  'trading': 'Trading & Markets',
  'risk-compliance': 'Risk & Compliance',
  'payments': 'Payments & Banking',
  'lending': 'Lending & Credit',
  'wealth': 'Wealth Management',
  'insurance': 'Insurance',
  'research': 'Research & Data',
  'defi': 'DeFi & Crypto',
  'general-finance': 'General Finance',
};

export const FINANCE_CATEGORY_COLORS: Record<FinanceCategory, string> = {
  'trading': '#3b82f6',
  'risk-compliance': '#f59e0b',
  'payments': '#ec4899',
  'lending': '#06b6d4',
  'wealth': '#8b5cf6',
  'insurance': '#10b981',
  'research': '#14b8a6',
  'defi': '#f97316',
  'general-finance': '#64748b',
};

export type AgentProtocol = 'mcp' | 'a2a' | 'oasf' | 'web' | 'email';

export const PROTOCOL_LABELS: Record<AgentProtocol, string> = {
  mcp: 'MCP',
  a2a: 'A2A',
  oasf: 'OASF',
  web: 'Web',
  email: 'Email',
};

export const PROTOCOL_COLORS: Record<AgentProtocol, string> = {
  mcp: '#8b5cf6',
  a2a: '#3b82f6',
  oasf: '#14b8a6',
  web: '#64748b',
  email: '#71717a',
};

export interface FeedbackEntry {
  score: number;
  tag1: string | null;
  tag2: string | null;
  reviewer: string;
  text: string | null;
  createdAt: number;
}

export interface Agent {
  id: string;
  agentId: number;
  chainId: number;
  name: string;
  description: string;
  image: string | null;
  owner: string;
  agentWallet: string | null;
  active: boolean;
  x402Support: boolean;
  protocols: AgentProtocol[];
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
  ens: string | null;
  did: string | null;
  supportedTrust: string[];
  reputationScore: number | null;
  feedbackCount: number;
  validationCount: number;
  completedValidations: number;
  recentFeedback: FeedbackEntry[];
  financeCategory: FinanceCategory;
  financeScore: number;
  createdAt: number;
  updatedAt: number;
  lastActivity: number;
}
```

---

## 5. Data Utilities

Add to `src/lib/data.ts`:

```typescript
import agentsData from '@/data/agents.json';

export const agents: Agent[] = agentsData as Agent[];

export function getAgent(id: string): Agent | undefined {
  return agents.find(a => a.id === id);
}

export function getAgentsByCategory(category: FinanceCategory): Agent[] {
  return agents.filter(a => a.financeCategory === category);
}

export function getAgentsByProtocol(protocol: AgentProtocol): Agent[] {
  return agents.filter(a => a.protocols.includes(protocol));
}

export function getActiveAgents(): Agent[] {
  return agents.filter(a => a.active);
}

export function formatReputationScore(score: number | null): string {
  if (score === null) return 'N/A';
  return score.toFixed(1);
}

export function formatTimestamp(unix: number): string {
  return new Date(unix * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getAgentCategoryStats(): Array<{
  category: FinanceCategory;
  label: string;
  color: string;
  count: number;
}> {
  const categories = Object.keys(FINANCE_CATEGORY_LABELS) as FinanceCategory[];
  return categories
    .map(cat => ({
      category: cat,
      label: FINANCE_CATEGORY_LABELS[cat],
      color: FINANCE_CATEGORY_COLORS[cat],
      count: agents.filter(a => a.financeCategory === cat).length,
    }))
    .filter(c => c.count > 0)
    .sort((a, b) => b.count - a.count);
}
```

---

## 6. Page Design

### 6.1 Navigation

Update `src/components/Nav.tsx` to add an "Agents" tab:

```
[ AIFI Logo ]    [ Directory ] [ Agents ] [ Thesis ]    [ Submit ]
```

The "Agents" tab highlights on `/agents` and `/agents/*` paths. Use the same styling pattern as "Directory".

### 6.2 Agents Index Page (`/agents`)

**Route:** `src/app/agents/page.tsx`

**Layout:**

```
┌─────────────────────────────────────────────────────────┐
│  The Registry                                           │
│  LIVE AGENTS                                            │
│  Browse {N} financial AI agents registered on EIP-8004  │
│                                                         │
│  ┌────────┐ ┌────────┐ ┌──────────┐ ┌────────────┐     │
│  │ {N}    │ │ {N}    │ │ {avg}    │ │ {N}        │     │
│  │ agents │ │ active │ │ rep score│ │ protocols  │     │
│  └────────┘ └────────┘ └──────────┘ └────────────┘     │
│                                                         │
│  ┌─ Filters ──────────────────────────────────────────┐ │
│  │ [Search...] [Category ▼] [Protocol ▼] [Active ▼]  │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                │
│  │ Agent    │ │ Agent    │ │ Agent    │                │
│  │ Card 1   │ │ Card 2   │ │ Card 3   │                │
│  │          │ │          │ │          │                │
│  └──────────┘ └──────────┘ └──────────┘                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                │
│  │ Card 4   │ │ Card 5   │ │ Card 6   │                │
│  └──────────┘ └──────────┘ └──────────┘                │
│  ...                                                    │
└─────────────────────────────────────────────────────────┘
```

**Stats Bar** (same `gap-px bg-border rounded-xl overflow-hidden` pattern as the project detail page):

| Stat | Source |
|------|--------|
| Total Agents | `agents.length` |
| Active | `agents.filter(a => a.active).length` |
| Avg Reputation | Mean of non-null `reputationScore` values |
| Protocols | Count of unique protocols across all agents |

**Filter Bar** (`'use client'` component):

| Filter | Type | Options |
|--------|------|---------|
| Search | Text input | Fuse.js over `name`, `description`, `mcpTools`, `a2aSkills` |
| Category | Multi-select pills | Finance categories (only those with agents) |
| Protocol | Multi-select pills | MCP, A2A, OASF, Web |
| Status | Toggle | All / Active Only |

**Sort Options:** Name (A-Z), Reputation (High-Low), Recently Active, Newest

### 6.3 Agent Card Component

**File:** `src/components/AgentCard.tsx`

```
┌────────────────────────────────────────┐
│  ┌─────┐  Agent Name            [MCP] │
│  │ img │  Short description...  [A2A] │
│  └─────┘                               │
│                                         │
│  ┌─────────────┐ ┌──────────────────┐  │
│  │ Trading &   │ │ ★ 87.3 (12)     │  │
│  │ Markets     │ │ reputation      │  │
│  └─────────────┘ └──────────────────┘  │
│                                         │
│  MCP: code_gen, market_data, +2        │
│                                         │
│  Active · Last seen 2h ago      →      │
└────────────────────────────────────────┘
```

**Elements:**

1. **Agent Image** — 48px rounded square. Fallback: gradient initial (same pattern as `CompanyLogo`, but with a bot/agent icon instead of a letter if no image)
2. **Name** — Bold, links to detail page
3. **Protocol Badges** — Small colored pills (MCP = purple, A2A = blue, etc.)
4. **Description** — 2-line clamp
5. **Category Badge** — Colored pill matching `FINANCE_CATEGORY_COLORS`
6. **Reputation** — Star + score + feedback count. Color: green (80+), yellow (50-79), gray (< 50 or N/A)
7. **Capabilities Preview** — First 2-3 MCP tools or A2A skills, "+N more"
8. **Footer** — Active dot (green/gray) + relative time since last activity + arrow icon

### 6.4 Agent Detail Page (`/agents/[id]`)

**Route:** `src/app/agents/[id]/page.tsx`

**Layout** (mirrors the project detail page structure):

```
┌───────────────────────────────────────────────────────────┐
│  ← Back to Agents                                         │
│                                                           │
│  ┌── Hero ─────────────────────────────────────────────┐  │
│  │  [gradient bar — category color]                    │  │
│  │                                                     │  │
│  │  ┌─────┐  Agent Name                               │  │
│  │  │ img │  Description tagline                       │  │
│  │  └─────┘                                            │  │
│  │  [Active] [Trading] [MCP] [A2A] [x402]             │  │
│  │                                    [Web] [Registry] │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  ┌── Metrics Strip ────────────────────────────────────┐  │
│  │ Reputation │ Feedback │ Validations │ Created │ Last │  │
│  │   87.3     │   12     │    3        │ Dec '25 │ 2h   │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  ┌── Main Content (2/3) ──────┐ ┌── Sidebar (1/3) ────┐  │
│  │                            │ │                      │  │
│  │  About                     │ │  Endpoints           │  │
│  │  Full description text     │ │  MCP: url            │  │
│  │                            │ │  A2A: url            │  │
│  │  Capabilities              │ │  Web: url            │  │
│  │  ┌──────┐ ┌──────┐        │ │  ENS: name.eth       │  │
│  │  │ Tool │ │ Tool │ ...    │ │                      │  │
│  │  └──────┘ └──────┘        │ │  Trust Model         │  │
│  │                            │ │  [reputation]        │  │
│  │  MCP Tools (if any)        │ │  [x402 enabled]      │  │
│  │  • tool_name - desc        │ │                      │  │
│  │  • tool_name - desc        │ │  On-Chain Identity   │  │
│  │                            │ │  Chain: Sepolia      │  │
│  │  A2A Skills (if any)       │ │  Agent ID: #42       │  │
│  │  • skill_name              │ │  Owner: 0x1a2b...    │  │
│  │                            │ │  Wallet: 0x3c4d...   │  │
│  │  Feedback History          │ │  Registry: 0x800...  │  │
│  │  ┌───────────────────────┐ │ │                      │  │
│  │  │ ★ 92 "Great..." 0x.. │ │ │  Category            │  │
│  │  │ ★ 85 "Reliable" 0x.. │ │ │  [Trading & Markets] │  │
│  │  └───────────────────────┘ │ │                      │  │
│  └────────────────────────────┘ └──────────────────────┘  │
│                                                           │
│  ┌── Related Agents ───────────────────────────────────┐  │
│  │  [Card] [Card] [Card]                               │  │
│  └─────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────┘
```

**Hero Section:**
- Category-colored gradient bar at top (same pattern as project page)
- Agent image (lg size) or fallback
- Name + description
- Status pills: active/inactive, finance category, protocol badges, x402 badge
- Action buttons: "Open Web" (if webEndpoint), "View on Registry" (link to etherscan/blockscout for the agent's NFT)

**Metrics Strip** (same `grid gap-px bg-border` pattern):

| Metric | Value | Icon |
|--------|-------|------|
| Reputation | Score out of 100 or "N/A" | Star |
| Feedback | Count | MessageSquare |
| Validations | "X of Y" (completed/total) | ShieldCheck |
| Created | Formatted date | Calendar |
| Last Active | Relative time ("2h ago", "3d ago") | Clock |

**Main Content:**

1. **About** — Full description text
2. **Capabilities** — Visual grid of MCP tools, A2A skills, OASF skills as badges/cards
3. **MCP Tools** (if any) — List with tool names (description if available from future metadata)
4. **A2A Skills** (if any) — List with skill names
5. **Feedback History** — Reverse-chronological list of recent non-revoked feedback. Each item shows: score (color-coded), text snippet (if available from IPFS), reviewer address (truncated), relative timestamp

**Sidebar:**

1. **Endpoints** — List of available service endpoints with copy-to-clipboard and external link icons. Show protocol version where available.
2. **Trust Model** — Supported trust types as pills. x402 support indicator.
3. **On-Chain Identity** — Chain name, Agent ID, Owner address, Agent Wallet address, Registry contract address. Each address is a link to block explorer.
4. **Category** — Finance category badge linking back to `/agents?category=trading`

**Related Agents** — Up to 3 agents in the same `financeCategory`, sorted by reputation. Uses `AgentCard` component.

---

## 7. Component Structure

### New Components

| Component | File | Type | Purpose |
|-----------|------|------|---------|
| `AgentCard` | `src/components/AgentCard.tsx` | Server | Card for agent grid |
| `AgentFilters` | `src/components/AgentFilters.tsx` | Client | Search + filter bar |
| `AgentImage` | `src/components/AgentImage.tsx` | Server | Image with bot-icon fallback |
| `ReputationBadge` | `src/components/ReputationBadge.tsx` | Server | Color-coded score display |
| `ProtocolBadge` | `src/components/ProtocolBadge.tsx` | Server | Protocol pill (MCP/A2A/etc.) |
| `EndpointList` | `src/components/EndpointList.tsx` | Client | Endpoint URLs with copy button |

### Modified Components

| Component | Change |
|-----------|--------|
| `Nav.tsx` | Add "Agents" link between "Directory" and "Thesis" |

### Reused Components

| Component | Where Used |
|-----------|-----------|
| `CompanyLogo.tsx` pattern | Inspiration for `AgentImage` (same size system) |
| `CategoryBadge` from `ui/index.tsx` | Finance category badges |
| `Tooltip` from `ui/index.tsx` | Truncated skill/tool lists |

---

## 8. Routing

```
src/app/
  agents/
    page.tsx              # Agent directory index
    [id]/
      page.tsx            # Agent detail page
```

Both pages use `generateStaticParams` for static generation:

```typescript
// agents/page.tsx — no params needed, single static page

// agents/[id]/page.tsx
export function generateStaticParams() {
  return agents.map((agent) => ({
    id: agent.id,
  }));
}
```

**Note:** Agent IDs use the format `{chainId}:{agentId}` (e.g., `11155111:42`). Since colons are valid in URL paths but unusual, the `[id]` segment will receive the full ID as-is. The colon does not need encoding for Next.js file-based routing.

---

## 9. File Structure Summary

```
NEW   scripts/agent-pipeline/
        fetch-agents.js           # Pipeline: query subgraph → filter → classify → write JSON
        finance-classifier.js     # Finance relevance scoring & categorization
        config.js                 # Subgraph URLs, chain config, thresholds
        overrides.json            # Manual include/exclude lists
        results.json              # Raw pipeline output (gitignored)

NEW   src/data/agents.json        # Pipeline output: finance-filtered agent data

NEW   src/app/agents/
        page.tsx                  # Agent directory index
        [id]/
          page.tsx                # Agent detail page

NEW   src/components/
        AgentCard.tsx             # Agent grid card
        AgentFilters.tsx          # Client: search + filter bar
        AgentImage.tsx            # Agent image with fallback
        ReputationBadge.tsx       # Color-coded reputation display
        ProtocolBadge.tsx         # Protocol type pill
        EndpointList.tsx          # Client: endpoint URLs with copy

MOD   src/types/index.ts          # Add Agent, FinanceCategory, etc.
MOD   src/lib/data.ts             # Add agent data utilities
MOD   src/components/Nav.tsx      # Add "Agents" tab
```

---

## 10. Implementation Order

### Phase 1: Data Pipeline
1. Create `scripts/agent-pipeline/config.js` with subgraph URLs, keyword lists, thresholds
2. Create `scripts/agent-pipeline/finance-classifier.js` with scoring + categorization logic
3. Create `scripts/agent-pipeline/fetch-agents.js` — main pipeline script
4. Run pipeline to generate `src/data/agents.json`
5. Verify: check agent count, category distribution, confirm no non-finance agents leaked through

### Phase 2: Types & Data Layer
6. Add `Agent`, `FinanceCategory`, `AgentProtocol`, `FeedbackEntry` types to `src/types/index.ts`
7. Add label/color constants for categories and protocols
8. Add agent data utilities to `src/lib/data.ts`
9. Verify: `npm run build` passes with new types

### Phase 3: Navigation
10. Update `Nav.tsx` to add "Agents" tab with proper active state detection

### Phase 4: Agent Directory Page
11. Create `AgentImage.tsx` (image + bot-icon fallback)
12. Create `ProtocolBadge.tsx`
13. Create `ReputationBadge.tsx`
14. Create `AgentCard.tsx`
15. Create `AgentFilters.tsx` (client component with Fuse.js search)
16. Create `src/app/agents/page.tsx` — main directory page
17. Verify: page renders, filters work, cards display correctly

### Phase 5: Agent Detail Page
18. Create `EndpointList.tsx` (client component with copy-to-clipboard)
19. Create `src/app/agents/[id]/page.tsx` — detail page
20. Verify: all detail sections render, links work, related agents display

### Phase 6: Build & Polish
21. Run full `npm run build` — must pass with 0 errors
22. Spot-check agents: verify finance filtering accuracy, check for missed agents
23. Review visual consistency with existing directory pages

---

## 11. Design Tokens & Visual Reference

The agent directory uses the existing AIFI design system:

| Element | Token / Pattern |
|---------|----------------|
| Page background | `bg-background` (#09090b) |
| Card background | `bg-surface` (#111113) |
| Card border | `border-border` (#27272a) |
| Card hover | `hover:border-accent/30 hover:shadow-soft` |
| Active indicator | Green dot `bg-positive` (#22c55e) / Gray `bg-text-faint` |
| Reputation color | `text-positive` (80+), `text-warning` (50-79), `text-text-muted` (<50) |
| Section headers | `label-refined` class (uppercase, tracking-wider, text-text-faint) |
| Metrics strip | `grid gap-px bg-border rounded-xl overflow-hidden` |
| Hero gradient | `linear-gradient(90deg, {categoryColor}, transparent)` |
| Protocol badges | Small pills with `PROTOCOL_COLORS` background at 10% opacity |
| Category badges | `CategoryBadge` component with `FINANCE_CATEGORY_COLORS` |
| Stats text | `text-2xl font-extrabold tracking-tight` (same as market matrix) |
| Body text | `text-text-secondary leading-relaxed text-[0.9375rem]` |
| Timestamp | `text-text-muted text-xs tabular-nums` |

---

## 12. Edge Cases

| Case | Handling |
|------|----------|
| Agent has no registration file (IPFS unavailable) | Exclude from directory — require name+description |
| Agent has no image | Show fallback: gradient background + bot icon (Cpu from lucide) |
| Agent has 0 feedback | Show "No ratings yet" in reputation badge |
| Agent marked inactive | Show but with reduced opacity + "Inactive" badge |
| Agent description is very long | Clamp to 3 lines on card, full text on detail page |
| Reputation score is negative | Possible (feedback value is signed). Show as red, format as negative |
| Agent has no endpoints | Show "No public endpoints" message on detail page |
| Colon in URL (`/agents/11155111:42`) | Valid in URL paths, Next.js handles correctly |
| Pipeline finds 0 finance agents | Write empty array. Page shows "No agents found" state |
| Subgraph is down during pipeline | Script exits with error, preserves previous `agents.json` |

---

## 13. Future Considerations

These are explicitly OUT OF SCOPE for v1 but noted for future reference:

1. **Client-side refresh** — Add optional `useEffect` fetch to update agent data without a full rebuild
2. **Mainnet support** — When EIP-8004 deploys to mainnet or L2s, update pipeline config to query multiple chains
3. **Agent interaction** — "Try this agent" button that opens the agent's web endpoint or connects via MCP
4. **Wallet integration** — Connect wallet to leave feedback directly from AIFI
5. **Real-time reputation** — WebSocket/polling for live reputation score updates
6. **Cross-reference with companies** — Link agents to AIFI company entries when agent owner matches a known company
7. **Search service integration** — Use agent0lab/search-service for semantic search instead of local Fuse.js

---

## 14. References

- [EIP-8004 Specification](https://eips.ethereum.org/EIPS/eip-8004)
- [ERC-8004 Smart Contracts](https://github.com/erc-8004/erc-8004-contracts)
- [Agent0 Subgraph](https://github.com/agent0lab/subgraph)
- [Agent0 TypeScript SDK](https://github.com/agent0lab/agent0-ts) (`npm install agent0-sdk`)
- [Agent0 Search Service](https://github.com/agent0lab/search-service)
- Subgraph endpoint: `https://gateway.thegraph.com/api/subgraphs/id/6wQRC7geo9XYAhckfmfo8kbMRLeWU8KQd3XsJqFKmZLT`
- Identity Registry (Sepolia): `0x8004A818BFB912233c491871b3d84c89A494BD9e`
- Reputation Registry (Sepolia): `0x8004B663056A597Dffe9eCcC1965A193B7388713`
