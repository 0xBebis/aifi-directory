# AIFI Taxonomy

Classification system for the AIFI directory. Every company is placed on two axes (segment + layer) and optionally tagged with an AI type. Agents are classified by finance category and protocol.

---

## Market Segments (9)

Where in finance a company operates. Every project has exactly one primary segment and optionally additional secondary segments.

| Slug | Name | Description | Color |
|------|------|-------------|-------|
| `trading` | Trading & Markets | Algorithmic trading, market making, order execution, quantitative strategies | `#3b82f6` |
| `banking` | Banking & Payments | Neobanks, payment processing, banking operations, financial infrastructure | `#ec4899` |
| `lending` | Lending & Credit | Credit scoring, underwriting, loan origination, collections | `#06b6d4` |
| `wealth` | Wealth Management | Robo-advisors, portfolio optimization, financial planning, asset management | `#8b5cf6` |
| `insurance` | Insurance | Underwriting, claims processing, actuarial modeling, risk assessment | `#10b981` |
| `risk` | Risk & Compliance | Fraud detection, AML/KYC, identity verification, regulatory compliance | `#f59e0b` |
| `enterprise` | Enterprise Finance | Treasury management, accounting automation, FP&A, corporate finance | `#84cc16` |
| `crypto` | Crypto & Web3 | DeFi protocols, blockchain infrastructure, crypto trading, web3 AI agents | `#f97316` |
| `research` | Research & Data | Market research, alternative data, financial intelligence, capital markets analytics | `#14b8a6` |

---

## Tech Layers (5)

What kind of technology a company builds. Ordered bottom-up from infrastructure to applications. Every project has one primary layer and optionally additional layers.

```
┌─────────────────────────────────────────┐
│           APPLICATIONS (5)              │  End-user products, platforms, dashboards
├─────────────────────────────────────────┤
│           AUTOMATION (4)                │  Process automation, AI agents, execution
├─────────────────────────────────────────┤
│           MODELS (3)                    │  AI/ML models, algorithms, prediction engines
├─────────────────────────────────────────┤
│           DATA (2)                      │  Data pipelines, market data, alt data
├─────────────────────────────────────────┤
│           INFRASTRUCTURE (1)            │  Cloud compute, blockchain, core infra
└─────────────────────────────────────────┘
```

| Position | Slug | Name | Description | Color |
|----------|------|------|-------------|-------|
| 5 | `applications` | Applications | End-user products, platforms, dashboards, developer tools | `#3b82f6` |
| 4 | `automation` | Automation | Process automation, AI agents, execution systems, workflow orchestration | `#22c55e` |
| 3 | `models` | Models | AI/ML models, algorithms, prediction engines, foundation models | `#a855f7` |
| 2 | `data` | Data | Data pipelines, market data feeds, alternative data providers | `#0ea5e9` |
| 1 | `infrastructure` | Infrastructure | Cloud compute, blockchain networks, core financial infrastructure | `#64748b` |

---

## AI Types (8)

Classification of AI/ML technologies a company uses. Array field (`ai_types`) on each project — companies may have multiple types.

| Slug | Label | Description | Color |
|------|-------|-------------|-------|
| `llm` | LLM / NLP | Large language models for NLP, chat, document understanding, text generation | `#8b5cf6` |
| `predictive-ml` | Predictive ML | Traditional ML for classification, regression, scoring models | `#3b82f6` |
| `computer-vision` | Computer Vision | Image/video processing, OCR, document extraction | `#06b6d4` |
| `graph-analytics` | Graph Analytics | Graph neural networks for network analysis, relationship detection | `#f97316` |
| `reinforcement-learning` | Reinforcement Learning | RL for trading, portfolio optimization | `#ec4899` |
| `agentic` | Agentic AI | Autonomous AI agents that execute actions independently | `#22c55e` |
| `data-platform` | Data Platform | Data aggregation/enrichment with minimal ML | `#64748b` |
| `infrastructure` | Infrastructure | AI/ML infrastructure, compute networks, tooling | `#71717a` |

---

## Finance Categories (9) — Agents

Classification for EIP-8004 agents. Assigned by the agent pipeline's keyword-cluster matching (`scripts/agent-pipeline/finance-classifier.js`).

| Slug | Label | Color |
|------|-------|-------|
| `trading` | Trading & Markets | `#3b82f6` |
| `risk-compliance` | Risk & Compliance | `#f59e0b` |
| `payments` | Payments & Banking | `#ec4899` |
| `lending` | Lending & Credit | `#06b6d4` |
| `wealth` | Wealth Management | `#8b5cf6` |
| `insurance` | Insurance | `#10b981` |
| `research` | Research & Data | `#14b8a6` |
| `defi` | DeFi & Crypto | `#f97316` |
| `general-finance` | General Finance | `#64748b` |

---

## Agent Protocols (5)

Communication protocols supported by EIP-8004 agents.

| Slug | Label | Description | Color |
|------|-------|-------------|-------|
| `mcp` | MCP | Model Context Protocol — structured tool/prompt/resource interface | `#8b5cf6` |
| `a2a` | A2A | Agent-to-Agent — peer communication with skill declarations | `#3b82f6` |
| `oasf` | OASF | Open Agent Service Framework — domain/skill taxonomy | `#14b8a6` |
| `web` | Web | Standard HTTP/HTTPS web endpoint | `#64748b` |
| `email` | Email | Email-based communication | `#71717a` |

---

## Classification Guidelines

### Primary vs Secondary

- Every project has exactly **one** primary segment and **one** primary layer
- Projects may have additional segments (`segments[]`) and layers (`layers[]`)
- **Primary** = where they make money / core focus
- **Secondary** = adjacent areas they also serve

### Choosing a Segment

Ask: **Who pays them and for what financial problem?**

| If they... | Segment |
|------------|---------|
| Execute trades or build quant strategies | `trading` |
| Process payments or operate as a bank | `banking` |
| Provide loans or assess credit | `lending` |
| Manage portfolios or advise investors | `wealth` |
| Underwrite policies or process claims | `insurance` |
| Detect fraud, ensure compliance | `risk` |
| Serve corporate finance / back-office | `enterprise` |
| Build on blockchain or serve crypto markets | `crypto` |
| Provide data, research, or analytics | `research` |

### Choosing a Layer

Ask: **Where does the core technology sit in the stack?**

| If they build... | Layer |
|-----------------|-------|
| Cloud, compute, blockchain networks | `infrastructure` |
| Data pipelines, feeds, alt data | `data` |
| ML models, algorithms, prediction engines | `models` |
| Process automation, agents, execution systems | `automation` |
| End-user products, dashboards, platforms | `applications` |

### Choosing an AI Type

Ask: **What AI/ML technologies power the product?** Assign all that apply.

- Most NLP/chatbot/document companies → `llm`
- Credit scoring, risk models → `predictive-ml`
- Document OCR, image processing → `computer-vision`
- Fraud graphs, network analysis → `graph-analytics`
- Trading optimization via RL → `reinforcement-learning`
- Autonomous agent systems → `agentic`
- Data aggregators with minimal ML → `data-platform`
- AI tooling/compute providers → `infrastructure`
- Companies using multiple AI types → assign all applicable (e.g. `["llm", "computer-vision"]`)
