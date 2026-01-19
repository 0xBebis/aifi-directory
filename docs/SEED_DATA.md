# AIFI Seed Data

Initial project list for MVP launch. This data should be converted to `data/projects.json`.

---

## Trading & Markets

| Name | Tagline | Layer | Stage | HQ |
|------|---------|-------|-------|-----|
| Alpaca | Commission-free stock trading API for developers | execution | series_c | US |
| Two Sigma | Technology-driven investment firm using AI/ML | intelligence | growth | US |
| Kensho | AI solutions for financial analytics (S&P Global) | intelligence | acquired | US |
| Numerai | AI hedge fund built by crowdsourced data scientists | automation | series_a | US |
| Kavout | AI-powered equity analysis and stock ranking | intelligence | series_a | US |
| Accern | NLP platform for financial market intelligence | intelligence | series_b | US |
| Sentient Technologies | Evolutionary AI for trading strategies | intelligence | series_c | US |
| QuantConnect | Open-source algorithmic trading platform | application | series_a | US |

## Wealth Management

| Name | Tagline | Layer | Stage | HQ |
|------|---------|-------|-------|-----|
| Betterment | Automated investing and financial planning | application | growth | US |
| Wealthfront | Automated investment management platform | application | series_e | US |
| Addepar | Wealth management platform for advisors | application | series_f | US |
| Personal Capital | Digital wealth management and planning | application | acquired | US |
| Vise | AI-powered portfolio management for advisors | automation | series_c | US |
| Titan | Active investment management app | application | series_b | US |

## Lending & Credit

| Name | Tagline | Layer | Stage | HQ |
|------|---------|-------|-------|-----|
| Upstart | AI lending platform beyond FICO scores | intelligence | public | US |
| Zest AI | AI-powered credit underwriting for lenders | intelligence | series_d | US |
| Figure | Blockchain-powered home equity lending | execution | series_d | US |
| Ocrolus | Document automation for lending decisions | automation | series_c | US |
| Blend | Digital lending platform for mortgages | application | series_g | US |
| LendingClub | AI-powered personal loans marketplace | application | public | US |

## Risk & Compliance

| Name | Tagline | Layer | Stage | HQ |
|------|---------|-------|-------|-----|
| Chainalysis | Blockchain analytics for compliance | intelligence | series_f | US |
| Featurespace | Adaptive behavioral analytics for fraud | intelligence | series_d | GB |
| Alloy | Identity decisioning platform for fintech | automation | series_c | US |
| Sardine | Fraud prevention and compliance platform | intelligence | series_b | US |
| Unit21 | No-code fraud and AML detection platform | automation | series_c | US |
| ComplyAdvantage | AI-driven financial crime detection | intelligence | series_c | GB |

## Insurance

| Name | Tagline | Layer | Stage | HQ |
|------|---------|-------|-------|-----|
| Lemonade | AI-powered insurance for home, auto, pet | application | public | US |
| Tractable | AI for accident and disaster recovery | intelligence | series_e | GB |
| Shift Technology | AI fraud detection for insurers | intelligence | series_d | FR |
| Hippo | Smart home insurance with IoT integration | application | public | US |
| Cape Analytics | Property intelligence from aerial imagery | intelligence | series_b | US |

## Payments & Banking

| Name | Tagline | Layer | Stage | HQ |
|------|---------|-------|-------|-----|
| Stripe | Payment infrastructure for the internet | execution | growth | US |
| Plaid | Open banking APIs connecting apps to banks | data | series_d | US |
| Marqeta | Modern card issuing platform | execution | public | US |
| Ramp | Corporate card with spend management | application | series_d | US |
| Mercury | Banking for startups | application | series_b | US |
| Column | Bank-as-a-service infrastructure | infrastructure | series_b | US |

## Capital Markets

| Name | Tagline | Layer | Stage | HQ |
|------|---------|-------|-------|-----|
| Bloomberg | Financial data and AI-powered analytics | data | growth | US |
| Orbital Insight | Geospatial analytics from satellite imagery | intelligence | series_d | US |
| AlphaSense | AI-powered market intelligence platform | intelligence | series_e | US |
| Tegus | Expert network and primary research platform | data | series_d | US |
| Visible Alpha | Consensus and estimates data platform | data | series_b | US |

## Crypto & DeFi

| Name | Tagline | Layer | Stage | HQ |
|------|---------|-------|-------|-----|
| Fireblocks | Digital asset custody and transfer | custody | series_e | US |
| Gauntlet | DeFi risk management and simulation | intelligence | series_b | US |
| Nansen | Blockchain analytics for crypto investors | data | series_b | SG |
| Alchemy | Web3 developer platform | infrastructure | series_c | US |
| Anchorage | Institutional crypto custody and trading | custody | series_d | US |
| Circle | Stablecoin and payments infrastructure | infrastructure | series_f | US |
| Coinbase | Crypto exchange and custody platform | application | public | US |
| Uniswap | Decentralized exchange protocol | execution | series_b | US |

## Research & Analytics

| Name | Tagline | Layer | Stage | HQ |
|------|---------|-------|-------|-----|
| Anthropic | AI safety company building reliable AI | intelligence | series_e | US |
| OpenAI | AI research and deployment company | intelligence | growth | US |
| Cohere | Enterprise NLP and LLM platform | intelligence | series_c | CA |
| Weights & Biases | MLOps platform for AI development | harness | series_c | US |
| Scale AI | Data labeling and AI infrastructure | data | series_e | US |
| Hugging Face | Open-source ML platform and model hub | harness | series_d | US |

## Personal Finance

| Name | Tagline | Layer | Stage | HQ |
|------|---------|-------|-------|-----|
| Cleo | AI assistant for financial wellness | application | series_c | GB |
| Copilot | Smart money tracker and planner | application | series_a | US |
| Rocket Money | Bill negotiation and subscription tracking | application | acquired | US |
| Mint (Intuit) | Personal budgeting and finance tracker | application | acquired | US |
| YNAB | Zero-based budgeting software | application | bootstrapped | US |

---

## JSON Format Example

```json
[
  {
    "slug": "alpaca",
    "name": "Alpaca",
    "tagline": "Commission-free stock trading API for developers",
    "description": "Alpaca provides commission-free trading APIs enabling developers to build trading apps. Features real-time market data, paper trading, and fractional shares.",
    "website": "https://alpaca.markets",
    "twitter": "https://twitter.com/AlpacaHQ",
    "linkedin": "https://linkedin.com/company/alpacamarkets",
    "segment": "trading",
    "layer": "execution",
    "layers": ["execution", "data", "application"],
    "stage": "series_c",
    "funding": 170000000,
    "founded": 2015,
    "hq_country": "US",
    "hq_city": "San Mateo",
    "team": [
      { "name": "Yoshi Yokokawa", "role": "CEO & Co-founder" },
      { "name": "Hitoshi Harada", "role": "CTO & Co-founder" }
    ]
  },
  {
    "slug": "anthropic",
    "name": "Anthropic",
    "tagline": "AI safety company building reliable AI systems",
    "description": "Anthropic develops large-scale AI systems focused on safety, interpretability, and reliability. Their Claude AI assistant serves enterprise and consumer applications.",
    "website": "https://anthropic.com",
    "twitter": "https://twitter.com/AnthropicAI",
    "linkedin": "https://linkedin.com/company/anthropic",
    "segment": "research",
    "layer": "intelligence",
    "layers": ["intelligence", "harness"],
    "stage": "series_e",
    "funding": 7600000000,
    "founded": 2021,
    "hq_country": "US",
    "hq_city": "San Francisco",
    "team": [
      { "name": "Dario Amodei", "role": "CEO & Co-founder" },
      { "name": "Daniela Amodei", "role": "President & Co-founder" }
    ]
  }
]
```

---

## Counts by Segment

| Segment | Count |
|---------|-------|
| Trading | 8 |
| Wealth | 6 |
| Lending | 6 |
| Risk | 6 |
| Insurance | 5 |
| Payments | 6 |
| Capital | 5 |
| Crypto | 8 |
| Research | 6 |
| Personal | 5 |
| **Total** | **61** |

---

## Next Steps

1. Convert tables above to `data/projects.json`
2. Add company logos to `public/logos/`
3. Verify all URLs are correct
4. Add more projects to reach 100-200 for launch
