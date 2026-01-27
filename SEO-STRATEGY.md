# AIFI SEO & AEO Strategy

A programmatic SEO and AI Engine Optimization strategy for maximizing discoverability of the AIFI directory across search engines and AI answer engines.

---

## Current State: 3/10

The site has strong content (446 companies, 2 agents, 2,500-word thesis, interactive market map) but almost zero SEO infrastructure. No sitemap, no robots.txt, no structured data, no OpenGraph images, no dynamic metadata on company pages, and no dedicated taxonomy pages. The site is invisible to search engines beyond what they can guess from raw HTML.

### What exists
- 900+ static pages (great for crawlability)
- Semantic HTML with proper heading hierarchy
- Alt text on images
- Good internal linking from company/agent detail pages
- `lang="en"` on HTML tag
- Clean URL structure (`/p/feedzai`, `/agents/11155111-462`)

### What's missing
- **Sitemap** — search engines can't efficiently discover 900+ pages
- **Robots.txt** — no crawler directives
- **Dynamic metadata** — company pages have no title/description meta tags
- **OpenGraph / Twitter Cards** — zero social sharing metadata
- **Structured data (JSON-LD)** — no rich snippets, no knowledge graph entries
- **Canonical URLs** — no explicit declarations
- **Dedicated taxonomy pages** — segments, layers, AI types have no indexable pages
- **AEO content** — no FAQ blocks, no definition-style content, no "what is" sections

---

## Part 1: Technical SEO Foundation

These are implementation tasks. Each is a code change to the Next.js app.

### 1.1 Sitemap Generation

Create `src/app/sitemap.ts` that programmatically generates a sitemap for all routes.

**Pages to include:**
- `/` (homepage)
- `/directory`
- `/agents`
- `/about` (thesis)
- `/submit`
- `/p/{slug}` for all 446 companies
- `/agents/{id}` for all agents
- Future: `/segments/{slug}`, `/layers/{slug}`, `/ai-types/{slug}`

**Priority hints:**
- Homepage, directory, agents, thesis: `priority: 1.0`
- Company detail pages: `priority: 0.8`
- Agent detail pages: `priority: 0.7`
- Submit/update pages: `priority: 0.3`

**Change frequency:**
- Directory/agents list pages: `weekly`
- Company detail pages: `monthly`
- Thesis: `monthly`
- Homepage: `weekly`

**Note:** Next.js 14 with `output: 'export'` does not run `sitemap.ts` at request time. You'll need to either: (a) generate `sitemap.xml` as a build step script that writes to `/public/sitemap.xml`, or (b) use a static sitemap file in `/public` and update it when data changes. Option (a) is better — add a `prebuild` script that generates the XML from `projects.json` and `agents.json`.

### 1.2 Robots.txt

Create `public/robots.txt`:

```
User-agent: *
Allow: /

Sitemap: https://aifi.com/sitemap.xml
```

Replace `aifi.com` with your actual domain. This tells crawlers the sitemap exists and allows full crawling.

### 1.3 Dynamic Metadata on Every Page

Currently, `/p/[slug]` company pages and several others have no metadata. Every page needs a unique `<title>` and `<meta name="description">`.

**Company detail pages** (`/p/[slug]/page.tsx`) — add `generateMetadata`:
```
Title: "{name} — {tagline} | AIFI"
Description: "{summary}" (or fallback to tagline + segment + layer context)
```

Example: `"Feedzai — AI-native fraud and financial crime prevention platform for major banks | AIFI"`

**Thesis page** (`/about/page.tsx`) — add static metadata:
```
Title: "The Future of Financial AI — Thesis | AIFI"
Description: "From statistical arbitrage to autonomous agents: a history and thesis on AI's transformation of financial services."
```

**Homepage** — already inherits from layout, but should have explicit metadata:
```
Title: "AIFI — The Financial AI Landscape"
Description: "A curated directory of {N} companies and autonomous agents building the future of finance with artificial intelligence."
```

**Submit pages** — add metadata:
```
Title: "Submit a Company | AIFI"
Description: "Submit a company to the AIFI directory of AI + Finance companies."
```

### 1.4 OpenGraph and Twitter Card Metadata

Add to every page's metadata export:

```typescript
openGraph: {
  title: '...',
  description: '...',
  url: 'https://aifi.com/p/feedzai',
  siteName: 'AIFI',
  type: 'website', // or 'article' for thesis
  locale: 'en_US',
},
twitter: {
  card: 'summary_large_image',
  title: '...',
  description: '...',
}
```

**Dynamic OG images** (high impact for social sharing):
- Create `src/app/opengraph-image.tsx` for the default OG image (AIFI brand)
- Create `src/app/p/[slug]/opengraph-image.tsx` that renders company name, logo, segment, funding, and tagline as an image
- Create `src/app/agents/[id]/opengraph-image.tsx` for agent OG images

Next.js supports these as special route files that generate images at build time. Since you're using static export, you may need to pre-generate these as PNG files in a build script instead.

**Alternative for static export:** Use a build script to generate OG images as static PNGs in `/public/og/` and reference them in metadata. Libraries like `@vercel/og` or `satori` can render JSX to images.

### 1.5 Canonical URLs

Add to root layout metadata:

```typescript
metadataBase: new URL('https://aifi.com'),
alternates: {
  canonical: './',
},
```

This ensures every page declares its canonical URL, preventing duplicate content issues.

### 1.6 JSON-LD Structured Data

Add structured data scripts to pages. These appear as `<script type="application/ld+json">` in the HTML and tell search engines exactly what your content represents.

**Root layout — Organization schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "AIFI",
  "url": "https://aifi.com",
  "description": "The directory of companies building at the intersection of AI and Finance",
  "sameAs": ["https://github.com/your-repo"]
}
```

**Company detail pages — Organization schema per company:**
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Feedzai",
  "description": "AI-native fraud and financial crime prevention platform for major banks",
  "url": "https://feedzai.com",
  "foundingDate": "2011",
  "address": { "@type": "PostalAddress", "addressLocality": "Coimbra", "addressCountry": "PT" },
  "numberOfEmployees": { "@type": "QuantitativeValue", "minValue": 501, "maxValue": 1000 },
  "founder": [
    { "@type": "Person", "name": "Nuno Sebastião", "jobTitle": "Co-founder & CEO" }
  ],
  "sameAs": ["https://twitter.com/feedzai", "https://linkedin.com/company/feedzai"]
}
```

**Directory page — ItemList schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "AI Finance Companies Directory",
  "numberOfItems": 446,
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "url": "https://aifi.com/p/feedzai", "name": "Feedzai" },
    ...
  ]
}
```

**Thesis page — Article schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "The Future of Financial AI",
  "description": "...",
  "author": { "@type": "Organization", "name": "AIFI" },
  "datePublished": "2025-01-01",
  "articleSection": "Thesis"
}
```

**Breadcrumb schema** on detail pages:
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "AIFI", "item": "https://aifi.com" },
    { "@type": "ListItem", "position": 2, "name": "Directory", "item": "https://aifi.com/directory" },
    { "@type": "ListItem", "position": 3, "name": "Feedzai" }
  ]
}
```

### 1.7 Security and Performance Headers

Update `next.config.js` to add headers. Note: with `output: 'export'` you can't use Next.js `headers()` config. Instead, configure these on your hosting platform (Vercel, Netlify, Cloudflare Pages):

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Cache-Control: public, max-age=3600, stale-while-revalidate=86400
```

For Vercel, add a `vercel.json`. For Netlify, add a `_headers` file. For Cloudflare Pages, use `_headers`.

---

## Part 2: Programmatic Page Generation

This is the highest-leverage SEO strategy. You already have rich data for 446 companies across 9 segments, 5 layers, and 8 AI types. Generate dedicated pages for every taxonomy dimension to capture long-tail search queries.

### 2.1 Segment Pages — `/segments/{slug}`

Create 9 pages, one per market segment. Each page targets searches like:
- "AI trading companies"
- "AI lending platforms"
- "best AI insurance companies"
- "AI risk management software"

**Content per page:**
- H1: "{Segment Name}: AI Companies & Platforms"
- Description paragraph (from `segments.json` + editorial expansion)
- Stats: company count, total funding, average founding year
- Company list: all companies in this segment, sorted by funding
- Related segments
- Link to filtered directory view

**Data already available:** `getProjectsBySegment()`, segment descriptions, company data.

### 2.2 Layer Pages — `/layers/{slug}`

Create 5 pages, one per tech layer. Target searches like:
- "AI infrastructure companies finance"
- "AI data platforms financial services"
- "AI automation tools banking"

**Content per page:**
- H1: "{Layer Name} Layer: Financial AI Companies"
- Description paragraph explaining what this layer means
- Stats: company count, top funded
- Company list sorted by funding
- Stack context: where this layer fits (above/below other layers)

### 2.3 AI Type Pages — `/ai-types/{slug}`

Create 8 pages, one per AI technology type. Target searches like:
- "LLM finance companies"
- "computer vision fintech"
- "reinforcement learning trading"
- "agentic AI financial services"

**Content per page:**
- H1: "{AI Type Label} in Finance"
- Description from `AI_TYPE_DESCRIPTIONS` + editorial expansion
- Stats: company count, total funding
- Company list
- How this technology is applied in finance (2-3 paragraphs)
- Related AI types

**Data already available:** `getAITypeStats()`, `AI_TYPE_DESCRIPTIONS`, company data.

### 2.4 Region Pages — `/regions/{slug}`

Create 3 pages (Americas, EMEA, APAC). Target searches like:
- "AI fintech companies Europe"
- "Asian AI finance startups"
- "US AI banking companies"

**Content per page:**
- H1: "Financial AI Companies in {Region}"
- Top countries represented
- Company list by country grouping
- Regional trends and stats

### 2.5 Funding Stage Pages — `/funding/{slug}`

Create pages for each funding stage. Target searches like:
- "seed stage AI fintech"
- "late stage AI finance companies"
- "public AI financial companies"

### 2.6 Cross-Dimensional Pages (High Value)

These combine two dimensions and target very specific queries:
- `/segments/trading/ai-types/reinforcement-learning` — "reinforcement learning trading companies"
- `/segments/lending/ai-types/llm` — "LLM lending platforms"
- `/segments/risk/layers/models` — "AI risk models"

Only generate these where there are 3+ companies at the intersection. Use `getProjectsAtIntersection()` which already exists.

**Estimated page count from cross-dimensional generation:**
- 9 segments x 8 AI types = 72 potential pages (generate where count >= 3)
- 9 segments x 5 layers = 45 potential pages (generate where count >= 3)
- Realistic after filtering: ~40-60 additional pages

### 2.7 "Companies Like X" Pages

For the top 50 most-searched companies, generate pages like:
- `/alternatives/stripe` — "Companies like Stripe in AI Finance"
- `/alternatives/plaid` — "Plaid competitors and alternatives"

These capture commercial-intent search queries.

---

## Part 3: AEO (AI Engine Optimization)

AEO ensures your content is surfaced by AI answer engines (ChatGPT, Perplexity, Claude, Gemini, Copilot). AI engines favor content that is:
1. **Factual and well-sourced** (citations, data points)
2. **Structured with clear answers** (definition → context → examples)
3. **Authoritative** (comprehensive coverage, unique data)
4. **Frequently cited** (backlinks from other authoritative sources)

### 3.1 Entity-First Content Architecture

AI engines extract entities and relationships. Structure content so every entity is clearly defined.

**For each company page, ensure:**
- First sentence defines the company: "{Name} is a {funding_stage} {company_type} company that {tagline}."
- Second sentence adds context: "Founded in {year} in {city}, {country}, the company has raised {funding} and employs {employees} people."
- Third sentence states what they do: "{summary}"
- This makes it trivially easy for AI engines to extract a factual answer about any company.

**For each segment page, ensure:**
- First paragraph defines the segment: "{Segment} companies use AI to {description}."
- Follow with market size, company count, notable players.
- End with a list of companies.

### 3.2 FAQ Blocks on Taxonomy Pages

Add FAQ sections to segment, layer, and AI type pages. These directly target AI engine queries and can win featured snippets.

**Example FAQs for the Trading segment page:**
- "What is AI trading?" → Definition paragraph
- "How many AI trading companies are there?" → "{N} companies in the AIFI directory focus on AI-powered trading..."
- "What AI technologies are used in trading?" → List of AI types with counts
- "What is the most funded AI trading company?" → Name, funding, description

**Example FAQs for the LLM AI type page:**
- "How are LLMs used in finance?" → Application paragraph
- "Which financial companies use LLMs?" → Company list with descriptions
- "What is the difference between LLMs and traditional ML in finance?" → Comparison paragraph

Add FAQ structured data (JSON-LD) for these:
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is AI trading?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "AI trading uses machine learning algorithms..."
      }
    }
  ]
}
```

### 3.3 Definition and Glossary Content

Create a glossary page (`/glossary`) or inline definitions that AI engines can extract:
- "EIP-8004" — what it is, why it matters
- "Model Context Protocol (MCP)" — definition and use
- "Agent-to-Agent (A2A)" — protocol definition
- "Agentic AI in Finance" — definition and examples
- Each market segment term defined
- Each AI type term defined

These target "what is X" queries that AI engines answer directly.

### 3.4 Thesis as a Citable Source

The thesis page is your strongest AEO asset. It has original analysis, 17 footnoted sources, and a clear narrative. To maximize AI engine citation:

- **Add a meta description that summarizes the thesis** in one sentence
- **Add explicit claims with data**: "446 companies are building AI-powered financial services as of January 2026" — AI engines love citable statistics
- **Add a `dateModified` meta tag** so AI engines know the content is current
- **Structured data** as an `Article` with `author`, `datePublished`, `dateModified`

### 3.5 Data Freshness Signals

AI engines heavily weight recency. Signal freshness:
- Add "Last updated: {date}" to the directory and agents pages
- Add `dateModified` to Article structured data
- Keep the thesis page updated with current-year data points
- Add a "Recently Added" or "Recently Funded" section visible on the directory

### 3.6 Statistics Page

Create `/stats` or embed stats prominently. AI engines love answering "how many" questions:
- "How many AI finance companies are there?" → "{N} companies tracked in the AIFI directory"
- "How much funding has AI fintech raised?" → "{$X} total funding tracked"
- "What percentage of AI finance companies use LLMs?" → Computed stat
- "Which country has the most AI finance companies?" → Regional breakdown

These become direct answers in AI engine responses.

---

## Part 4: Content Strategy

### 4.1 Company Page Content Enrichment

Current company pages show raw data. Enrich them with narrative content.

**Add to `projects.json` schema:**
- `seo_description`: A 150-160 character SEO-optimized description for meta tags (different from `tagline`)
- `long_description`: 2-3 paragraph editorial description for the company page body
- `use_cases`: Array of specific use cases (e.g., "fraud detection for banks", "automated credit scoring")
- `key_differentiator`: One sentence on what makes this company unique

**For companies where you don't have editorial content yet**, auto-generate the meta description from existing fields:
```
"{name} is a {funding_stage} {company_type} company building {tagline}. Founded {founded} in {hq_city}, {hq_country}. {funding ? `Raised ${formatFunding(funding)}.` : ''}"
```

### 4.2 Segment Editorial Content

Each segment page should have 300-500 words of editorial content explaining:
1. What this segment is and why AI matters here
2. Key trends (2-3 bullet points)
3. Notable companies and what they do
4. The investment landscape (total funding, recent raises)

This can be added as a `long_description` field in `segments.json`.

### 4.3 Blog / Insights Section (Future)

A `/blog` or `/insights` section would capture informational search queries:
- "State of AI in Trading 2026"
- "AI Lending Market Map"
- "How AI is Changing Insurance Underwriting"
- "AI Finance Companies to Watch"

Each post links heavily to company pages and taxonomy pages, building internal link equity.

This is not needed immediately but becomes valuable as the site establishes authority.

### 4.4 "Recently Funded" Feed

Add a `/recent` page showing companies sorted by `last_funding_date`. This captures:
- "latest AI fintech funding"
- "AI finance funding rounds 2026"
- News-type queries that AI engines surface for current events

### 4.5 Comparison Pages

Generate pages like:
- "Feedzai vs Sardine" — comparison of two companies in the same segment
- "Top 10 AI Fraud Detection Companies"
- "AI Lending: Upstart vs Zest AI vs ..."

These target high-commercial-intent searches.

---

## Part 5: Off-Site and Distribution

### 5.1 Google Search Console

- Submit the sitemap to Google Search Console immediately after deploying
- Monitor index coverage reports
- Check for crawl errors on company pages
- Track which queries bring traffic and optimize those pages

### 5.2 Bing Webmaster Tools

- Submit to Bing as well — Bing powers Copilot's search results
- Same sitemap submission process
- Bing's index feeds into Microsoft Copilot AI answers

### 5.3 Schema.org Validation

- Test structured data with Google's Rich Results Test
- Test with Schema.org validator
- Ensure every company page validates as Organization schema
- Ensure the thesis validates as Article schema

### 5.4 Social Distribution

- Share the thesis on Twitter/X, LinkedIn, Hacker News
- Each share builds backlinks and social signals
- OpenGraph images ensure shares look professional
- The thesis is the most shareable content asset — lead with it

### 5.5 Backlink Strategy

The directory itself is a backlink magnet. Company founders and employees will link to their company's page if it looks professional and accurate.

- **Notify companies**: When you add or update a company's page, email or tweet at them. Many will link back.
- **Get listed in AI/fintech directories**: Submit AIFI to curated lists of AI resources, fintech databases, startup tools.
- **Contribute to Wikipedia**: If any article references a company in your directory, add AIFI as a reference (where appropriate and genuinely useful).
- **Academic citations**: The thesis page with footnotes positions as an academic-style resource. Share with researchers covering AI in finance.

### 5.6 Perplexity and AI Engine Submission

- Perplexity Pro users can submit sources. Share the directory and thesis links with Perplexity.
- ChatGPT's browsing mode will discover the site via Bing indexing.
- Ensure the site loads fast and renders clean HTML (it does — static export is ideal).

---

## Part 6: Implementation Priority

### Phase 1 — Technical Foundation (Immediate)

These are table-stakes changes that unblock everything else.

| Task | Impact | Effort |
|------|--------|--------|
| Generate `sitemap.xml` at build time | Critical | Low |
| Add `robots.txt` | Critical | Trivial |
| Add `generateMetadata` to `/p/[slug]` | Critical | Low |
| Add metadata to `/about`, `/submit`, `/` | High | Low |
| Add `metadataBase` + canonical to root layout | High | Trivial |

### Phase 2 — Structured Data and Social (Week After)

| Task | Impact | Effort |
|------|--------|--------|
| Add Organization JSON-LD to company pages | High | Medium |
| Add Article JSON-LD to thesis page | High | Low |
| Add BreadcrumbList JSON-LD to detail pages | Medium | Low |
| Add OpenGraph metadata to all pages | High | Low |
| Add Twitter Card metadata to all pages | Medium | Low |
| Generate OG images (build script) | High | Medium |

### Phase 3 — Programmatic Pages (Next Sprint)

| Task | Impact | Effort |
|------|--------|--------|
| Create `/segments/[slug]` pages | Very High | Medium |
| Create `/ai-types/[slug]` pages | Very High | Medium |
| Create `/layers/[slug]` pages | High | Medium |
| Add FAQ sections + FAQ schema to taxonomy pages | High | Medium |
| Create `/regions/[slug]` pages | Medium | Low |
| Create `/stats` page | Medium | Low |

### Phase 4 — Content Enrichment (Ongoing)

| Task | Impact | Effort |
|------|--------|--------|
| Write `seo_description` for top 50 companies | High | Medium |
| Write segment editorial content (300-500 words each) | High | Medium |
| Add glossary definitions for key terms | Medium | Low |
| Add "Recently Funded" page | Medium | Low |
| Cross-dimensional pages (segment x AI type) | High | High |
| Comparison pages for top companies | Medium | High |

### Phase 5 — Distribution (Ongoing)

| Task | Impact | Effort |
|------|--------|--------|
| Submit sitemap to Google Search Console | Critical | Trivial |
| Submit sitemap to Bing Webmaster Tools | High | Trivial |
| Validate structured data with Google Rich Results | High | Low |
| Share thesis on social channels | High | Low |
| Notify listed companies | High | Medium |

---

## Expected Outcomes

### Search Queries Captured

**Brand queries** (immediate):
- "AIFI directory", "AI finance index"

**Company queries** (Phase 1):
- "{company name}" → company detail page
- "{company name} funding", "{company name} valuation"
- "{company name} alternatives"

**Category queries** (Phase 3):
- "AI trading companies", "AI lending platforms"
- "LLM finance companies", "agentic AI fintech"
- "AI fraud detection companies", "AI insurance underwriting"

**Informational queries** (Phase 3-4):
- "what is AI trading", "how is AI used in banking"
- "AI finance companies 2026", "top AI fintech startups"
- "EIP-8004 agent registry"

**AI engine queries** (Phase 2-4):
- "how many AI finance companies are there" → stats page
- "what companies use LLMs in finance" → AI type page
- "who are the biggest AI trading companies" → segment page with funding data
- "what is the future of AI in finance" → thesis page

### Page Inventory Growth

| Phase | New Pages | Total |
|-------|-----------|-------|
| Current | 0 | ~900 |
| Phase 3 (taxonomy pages) | 25+ | ~925 |
| Phase 3 (cross-dimensional) | 40-60 | ~975 |
| Phase 4 (comparison, stats, recent) | 10-20 | ~995 |
| Future (blog/insights) | Ongoing | 1000+ |

### Traffic Projection

With zero SEO currently, the site likely receives near-zero organic traffic. After implementing this strategy:

- **Phase 1-2** (technical foundation): Indexed correctly, start appearing for brand and company-name queries. Low hundreds of monthly visits.
- **Phase 3** (taxonomy pages): Capture long-tail category queries. Hundreds to low thousands monthly.
- **Phase 4-5** (content + distribution): Authority builds, AI engines start citing. Thousands monthly.
- **Mature state** (6+ months): The definitive directory for "AI finance companies" queries across search engines and AI answer engines.

---

## Key Principles

1. **Every page earns its existence** — each page targets a specific search query or set of queries.
2. **Data is content** — your 446 companies with structured data ARE the SEO strategy. Generate pages from it.
3. **Answer engines want answers** — structure content as entity definitions, not marketing copy. Lead with facts.
4. **Freshness wins** — update timestamps, add recently funded companies, keep the thesis current.
5. **Internal links are free authority** — every taxonomy page should link to relevant company pages and vice versa.
6. **Static export is a superpower** — 900+ static HTML pages load instantly, crawl perfectly, and don't break. This is ideal for SEO.
