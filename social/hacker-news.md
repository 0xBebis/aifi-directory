# Hacker News — Show HN

**Title:** Show HN: Aifimap.com – open-source directory of 433 AI x finance companies with interactive market map

**Body:**

I built aifimap.com as a structured market map of AI in financial services. It's a static Next.js site built on plain JSON data files — no backend, no auth, no database. Open source.

The directory covers 433 companies classified across 9 market segments and 5 technology layers, with an 8-type AI taxonomy (LLM, predictive ML, agentic, computer vision, reinforcement learning, graph analytics, data platform, infrastructure). You can filter by any combination of segment, layer, AI type, funding stage, region, and company type.

A few technical choices worth mentioning:

- All data lives in /src/data/*.json. The site is a static export. No runtime fetching.
- Search is Fuse.js client-side fuzzy search. No search backend.
- OG images and the sitemap are generated at build time from the JSON data via Node scripts.
- The market matrix (segment x layer heatmap) is computed from the same JSON, client-side.

The site also has an agent registry pulled from the ERC-8004 on-chain protocol via The Graph subgraph — 144 agents across Ethereum and Polygon, scored for finance relevance using a keyword-weighted classifier.

The classifier code, the data pipeline, and the full JSON dataset are in the repo. PRs welcome for data corrections and additions.

The interesting data finding from building this: predictive ML still accounts for 46% of companies (200 of 433) — fraud detection, credit scoring, AML. LLMs are 13% (56 companies). Agentic AI is 8% (35 companies). The deployment gap between current LLM hype and actual fintech production usage is wider than most coverage of the space suggests.

aifimap.com
