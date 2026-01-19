# AIFI Taxonomy

## Market Segments

Projects are categorized by their primary business domain.

| Slug | Name | Description |
|------|------|-------------|
| `trading` | Trading & Markets | Algorithmic trading, market making, order execution, price prediction |
| `wealth` | Wealth Management | Robo-advisors, portfolio optimization, financial planning |
| `lending` | Lending & Credit | Credit scoring, underwriting automation, loan origination |
| `risk` | Risk & Compliance | Fraud detection, AML/KYC, regulatory compliance, risk modeling |
| `insurance` | Insurance | Underwriting, claims processing, actuarial modeling |
| `payments` | Payments & Banking | Payment optimization, banking operations, financial infrastructure |
| `capital` | Capital Markets | Investment banking, deal sourcing, market analysis |
| `crypto` | Crypto & DeFi | Blockchain-native finance, digital asset management |
| `research` | Research & Analytics | Market research, alternative data, financial intelligence |
| `personal` | Personal Finance | Budgeting, saving, financial wellness tools |

---

## Tech Stack Layers

Projects are also categorized by where they sit in the technology stack.

```
┌─────────────────────────────────────────┐
│           APPLICATION (9)               │  End-user products
├─────────────────────────────────────────┤
│           ORCHESTRATION (8)             │  Agent systems, workflows
├─────────────────────────────────────────┤
│           AUTOMATION (7)                │  Decision engines, RPA
├─────────────────────────────────────────┤
│           EXECUTION (6)                 │  Transactions, operations
├─────────────────────────────────────────┤
│           HARNESS (5)                   │  MLOps, model deployment
├─────────────────────────────────────────┤
│           INTELLIGENCE (4)              │  AI/ML models
├─────────────────────────────────────────┤
│           DATA (3)                      │  Pipelines, storage, feeds
├─────────────────────────────────────────┤
│           CUSTODY (2)                   │  Asset security, storage
├─────────────────────────────────────────┤
│           INFRASTRUCTURE (1)            │  Cloud, compute, networking
└─────────────────────────────────────────┘
```

| Position | Slug | Name | Description |
|----------|------|------|-------------|
| 9 | `application` | Application | End-user facing products, UIs, mobile apps |
| 8 | `orchestration` | Orchestration | Multi-agent systems, workflow coordination |
| 7 | `automation` | Automation | Business process automation, decision engines |
| 6 | `execution` | Execution | Trade execution, payment processing, settlements |
| 5 | `harness` | Harness | Model deployment, monitoring, MLOps |
| 4 | `intelligence` | Intelligence | AI/ML models, algorithms, foundation models |
| 3 | `data` | Data | Data pipelines, storage, market data, alternative data |
| 2 | `custody` | Custody | Asset custody, key management, secure storage |
| 1 | `infrastructure` | Infrastructure | Cloud services, compute, networking |

---

## Classification Guidelines

**Primary vs Secondary:**
- Every project has exactly ONE primary segment and ONE primary layer
- Projects may have multiple secondary segments/layers
- Primary = where they make money or their core focus
- Secondary = adjacent areas they also serve

**Examples:**

| Company | Primary Segment | Primary Layer | Secondary |
|---------|-----------------|---------------|-----------|
| Stripe | Payments | Execution | Infrastructure |
| Alpaca | Trading | Execution | Data, Application |
| Anthropic | Research | Intelligence | Harness |
| Betterment | Wealth | Application | Automation |
| Chainalysis | Risk | Intelligence | Crypto, Data |

**When in doubt:**
- Layer: Where does the core technology sit?
- Segment: Who pays them and for what problem?
