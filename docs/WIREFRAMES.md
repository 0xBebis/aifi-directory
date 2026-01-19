# AIFI Wireframes

## Design Tokens

```
Colors (Dark Theme):
  Background:     #0a0a0b
  Surface:        #141416
  Surface-2:      #1c1c1f
  Border:         #2a2a2e
  Text:           #fafafa
  Text-Muted:     #a1a1aa
  Accent:         #3b82f6

Typography:
  Font:           Inter
  Mono:           JetBrains Mono

Spacing:
  Base:           4px
  SM:             8px
  MD:             16px
  LG:             24px
  XL:             32px
```

---

## 1. Homepage

```
┌────────────────────────────────────────────────────────────────┐
│  AIFI          Directory   Segments   Layers   Map    [About] │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│                     AI + FINANCE INDEX                         │
│                                                                │
│          The directory of companies building at the            │
│          intersection of AI and Finance                        │
│                                                                │
│   ┌────────────────────────────────────────────────────────┐  │
│   │  Search 200+ projects...                               │  │
│   └────────────────────────────────────────────────────────┘  │
│                                                                │
│   [Trading] [Wealth] [Lending] [Risk] [Crypto] [All →]        │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  BROWSE BY SEGMENT                                             │
│                                                                │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │
│  │ Trading      │ │ Wealth       │ │ Lending      │           │
│  │ 24 projects  │ │ 18 projects  │ │ 15 projects  │           │
│  └──────────────┘ └──────────────┘ └──────────────┘           │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │
│  │ Risk         │ │ Insurance    │ │ Payments     │           │
│  │ 12 projects  │ │ 11 projects  │ │ 14 projects  │           │
│  └──────────────┘ └──────────────┘ └──────────────┘           │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  BROWSE BY LAYER                                               │
│                                                                │
│  Application     ████████████████████████████████  48         │
│  Orchestration   ██████████                        15         │
│  Automation      ██████████████                    22         │
│  Execution       ████████████████                  26         │
│  Harness         ████████                          12         │
│  Intelligence    ██████████████████████████        42         │
│  Data            ██████████████████████            35         │
│  Custody         ██████                            9          │
│  Infrastructure  ████████████                      18         │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│  AIFI · About · Submit a Project                               │
└────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory

```
┌────────────────────────────────────────────────────────────────┐
│  AIFI          Directory   Segments   Layers   Map    [About] │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  DIRECTORY                          ┌────────────────────────┐ │
│  214 projects                       │ Search...              │ │
│                                     └────────────────────────┘ │
├───────────────────┬────────────────────────────────────────────┤
│                   │                                            │
│  SEGMENT          │  Sort: A-Z ▼                 Grid | List  │
│  ○ All            │                                            │
│  ○ Trading (24)   │  ┌─────────────┐ ┌─────────────┐ ┌───────  │
│  ○ Wealth (18)    │  │ [Logo]      │ │ [Logo]      │ │ [Logo]  │
│  ○ Lending (15)   │  │ Alpaca      │ │ Anthropic   │ │ Betterm │
│  ○ Risk (12)      │  │             │ │             │ │         │
│  ○ Insurance (11) │  │ Trading API │ │ AI safety   │ │ Robo-ad │
│  ○ Payments (14)  │  │ for devs    │ │ research    │ │ visor   │
│  ○ Capital (10)   │  │             │ │             │ │         │
│  ○ Crypto (22)    │  │ Trading     │ │ Research    │ │ Wealth  │
│  ○ Research (16)  │  │ Execution   │ │ Intel       │ │ App     │
│  ○ Personal (12)  │  │ Series C    │ │ Series E    │ │ Series F│
│                   │  └─────────────┘ └─────────────┘ └───────  │
│  LAYER            │                                            │
│  ○ All            │  ┌─────────────┐ ┌─────────────┐ ┌───────  │
│  ○ Application    │  │ [Logo]      │ │ [Logo]      │ │ [Logo]  │
│  ○ Orchestration  │  │ Stripe      │ │ Plaid       │ │ ...     │
│  ○ Automation     │  │             │ │             │ │         │
│  ○ Execution      │  │ Payment     │ │ Open bank   │ │         │
│  ○ Harness        │  │ infra       │ │ APIs        │ │         │
│  ○ Intelligence   │  │             │ │             │ │         │
│  ○ Data           │  │ Payments    │ │ Payments    │ │         │
│  ○ Custody        │  │ Execution   │ │ Data        │ │         │
│  ○ Infrastructure │  │ Growth      │ │ Series D    │ │         │
│                   │  └─────────────┘ └─────────────┘ └───────  │
│  STAGE            │                                            │
│  ○ All            │  ────────────────────────────────────────  │
│  ○ Pre-seed       │  Showing 1-12 of 214         [1] [2] [→]  │
│  ○ Seed           │                                            │
│  ○ Series A       │                                            │
│  ○ Series B       │                                            │
│  ○ Series C+      │                                            │
│  ○ Growth/Public  │                                            │
│                   │                                            │
│  [Clear filters]  │                                            │
│                   │                                            │
└───────────────────┴────────────────────────────────────────────┘
```

---

## 3. Project Profile

```
┌────────────────────────────────────────────────────────────────┐
│  AIFI          Directory   Segments   Layers   Map    [About] │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ← Back to Directory                                           │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │                                                        │   │
│  │  ┌──────┐  ALPACA MARKETS                             │   │
│  │  │ LOGO │                                              │   │
│  │  └──────┘  Commission-free stock trading API for      │   │
│  │            developers                                  │   │
│  │                                                        │   │
│  │  [Website]  [Twitter]  [LinkedIn]                     │   │
│  │                                                        │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│  │ Trading     │ │ Execution   │ │ Series C    │             │
│  │ Segment     │ │ Layer       │ │ Stage       │             │
│  └─────────────┘ └─────────────┘ └─────────────┘             │
│  ┌─────────────┐ ┌─────────────┐                              │
│  │ $170M       │ │ San Mateo   │                              │
│  │ Funding     │ │ US · 2015   │                              │
│  └─────────────┘ └─────────────┘                              │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ABOUT                                                         │
│                                                                │
│  Alpaca provides a commission-free trading API that enables   │
│  developers and businesses to build trading applications.     │
│  The platform offers real-time market data, paper trading     │
│  for testing, and fractional shares trading.                  │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  CLASSIFICATION                                                │
│                                                                │
│  Segments              Layers                                  │
│  ● Trading             ● Execution                             │
│                        ○ Data                                  │
│                        ○ Application                           │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  TEAM                                                          │
│                                                                │
│  Yoshi Yokokawa          Hitoshi Harada                       │
│  CEO & Co-founder        CTO & Co-founder                     │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  SIMILAR COMPANIES                                             │
│                                                                │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐     │
│  │ Tradier   │ │ DriveWlth │ │ IEX       │ │ Polygon   │     │
│  │ Trading   │ │ Trading   │ │ Trading   │ │ Trading   │     │
│  │ Execution │ │ Execution │ │ Execution │ │ Data      │     │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘     │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 4. Market Map

```
┌────────────────────────────────────────────────────────────────┐
│  AIFI          Directory   Segments   Layers   Map    [About] │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  MARKET MAP                                    [Download PNG]  │
│  All 214 projects by segment and layer                        │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│         Trading  Wealth  Lending  Risk  Insur  Pay  Cap  Cry  │
│       ┌────────────────────────────────────────────────────┐  │
│  App  │  ○ ○ ○   ○ ○     ○        ○     ○ ○    ○ ○  ○    ○ ○│  │
│       ├────────────────────────────────────────────────────┤  │
│  Orch │  ○ ○     ○                             ○         ○  │  │
│       ├────────────────────────────────────────────────────┤  │
│  Auto │  ○ ○ ○   ○ ○     ○ ○ ○    ○ ○   ○ ○    ○    ○    ○  │  │
│       ├────────────────────────────────────────────────────┤  │
│  Exec │  ○ ○ ○          ○ ○              ○     ○ ○ ○ ○   ○ ○│  │
│       ├────────────────────────────────────────────────────┤  │
│  Harn │  ○       ○       ○        ○ ○                   ○  │  │
│       ├────────────────────────────────────────────────────┤  │
│  Intl │  ○ ○ ○ ○ ○ ○     ○ ○ ○    ○ ○ ○ ○ ○ ○  ○    ○ ○  ○ ○│  │
│       ├────────────────────────────────────────────────────┤  │
│  Data │  ○ ○ ○ ○ ○       ○ ○      ○ ○   ○      ○    ○ ○  ○ ○│  │
│       ├────────────────────────────────────────────────────┤  │
│  Cust │  ○                                          ○   ○ ○│  │
│       ├────────────────────────────────────────────────────┤  │
│  Infr │  ○ ○     ○              ○        ○     ○ ○       ○  │  │
│       └────────────────────────────────────────────────────┘  │
│                                                                │
│  ○ = Company logo (clickable)                                 │
│                                                                │
│  Hover: Show company name                                     │
│  Click: Go to project profile                                 │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 5. Segment Page

```
┌────────────────────────────────────────────────────────────────┐
│  AIFI          Directory   Segments   Layers   Map    [About] │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ← All Segments                                                │
│                                                                │
│  TRADING & MARKETS                                             │
│  Algorithmic trading, market making, order execution,         │
│  price prediction                                              │
│                                                                │
│  24 projects                         [View in Directory →]    │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  SEGMENT MAP                                                   │
│                                                                │
│  Application     ○ ○ ○ ○ ○                                    │
│  Orchestration   ○ ○                                          │
│  Automation      ○ ○ ○                                        │
│  Execution       ○ ○ ○ ○ ○ ○                                  │
│  Harness         ○                                            │
│  Intelligence    ○ ○ ○ ○                                      │
│  Data            ○ ○ ○ ○ ○                                    │
│  Custody         ○                                            │
│  Infrastructure  ○ ○                                          │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ALL TRADING PROJECTS                                         │
│                                                                │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│  │ Alpaca      │ │ Two Sigma   │ │ Numerai     │ ...         │
│  └─────────────┘ └─────────────┘ └─────────────┘             │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Component: Project Card

```
┌────────────────────────────────────┐
│  ┌──────┐                          │
│  │ LOGO │  Company Name            │
│  └──────┘                          │
│                                    │
│  Short tagline describing what     │
│  the company does...               │
│                                    │
│  ┌─────────┐  ┌─────────┐         │
│  │ Segment │  │ Layer   │         │
│  └─────────┘  └─────────┘         │
│                                    │
│  Series B · San Francisco          │
└────────────────────────────────────┘

Size: 280px wide (desktop)
States:
  - Default: Surface background
  - Hover: Surface-2 + slight lift
```

---

## Responsive Notes

**Desktop (>1024px)**: Full layout as shown
**Tablet (768-1024px)**: Filters collapse to top bar dropdowns
**Mobile (<768px)**: Single column, hamburger nav, stacked filters
