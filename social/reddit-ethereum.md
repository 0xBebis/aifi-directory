# Reddit — r/ethereum

**Title:** Built a registry of 144 AI agents operating on-chain via ERC-8004 — here's the breakdown by finance category

**Body:**

Hey r/ethereum,

Sharing something that might be useful for people interested in where AI and crypto are actually intersecting.

I built aifimap.com which tracks, among other things, a registry of 144 AI agents registered on the ERC-8004 protocol across Ethereum Mainnet and Polygon.

**Agent breakdown by finance category:**
- DeFi: 60 agents (largest category by far)
- Trading: 28
- Risk & Compliance: 22
- Research: 16
- Payments: 15
- Wealth: 3

**By protocol support:**
- MCP (Model Context Protocol): 72 agents
- OASF: 68
- Web: 66
- A2A: 47
- Email: 14

The data is fetched from The Graph subgraph and each agent is scored for finance relevance using a keyword-weighted classifier. The pipeline filters out spam/test agents (there are a LOT of those in the raw registry) and deduplicates wallet-specific instances.

The DeFi category being the largest tracks with what you'd expect — yield optimization, rebalancing, and liquidity management are natural fits for autonomous agents. The risk/compliance category being third is more surprising and suggests there's real demand for on-chain compliance tooling.

Each agent profile shows endpoints, tools, skills, reputation score, and validation count. The full pipeline code is open source.

aifimap.com/agents — free, no login.

Curious what people think about the ERC-8004 standard and where on-chain agents are heading.
