# AIFI Data Scraping System

Reference documentation for the weekly data refresh pipeline. This document provides everything needed to run scraping tasks efficiently.

---

## Quick Reference

| Pipeline | Command | Duration | Output |
|----------|---------|----------|--------|
| Agent Registry | `npm run scrape:agents` | ~2 min | `src/data/agents.json` |
| EDGAR Funding | `npm run scrape:edgar` | ~15 min | `scripts/funding-scraper/edgar-matches.json` |
| Logo Download | `npm run scrape:logos` | ~10 min | `public/logos/*.png` |
| Full Weekly | `npm run scrape:weekly` | ~30 min | All outputs |

---

## 1. Agent Pipeline

**Purpose**: Fetch EIP-8004 AI agents from The Graph, filter for finance relevance.

### Run
```bash
cd scripts/agent-pipeline
node fetch-agents.js
```

### What It Does
1. Queries The Graph subgraph for all registered agents (Sepolia testnet)
2. Filters out agents without metadata (name/description required)
3. Removes spam/test agents via pattern matching
4. Scores finance relevance (0-1) using keyword matching
5. Assigns finance category (trading, lending, defi, etc.)
6. Deduplicates by name+description (keeps newest)
7. Writes to `src/data/agents.json`

### Configuration
- **Threshold**: 0.25 (agents below excluded)
- **Rate limit**: 200ms between requests
- **Manual overrides**: `scripts/agent-pipeline/overrides.json`

### Output
```
src/data/agents.json          # Production output (committed)
scripts/agent-pipeline/results.json  # Debug info (gitignored)
```

### Troubleshooting
- **0 agents returned**: Check subgraph ID in `config.js`, verify The Graph API is up
- **Missing expected agent**: Add to `overrides.json` include list
- **Spam getting through**: Add pattern to `config.js` SPAM_NAME_PATTERNS

---

## 2. EDGAR Funding Scraper

**Purpose**: Get funding amounts and dates from SEC Form D filings (US companies only).

### Run (3 phases)
```bash
cd scripts/funding-scraper

# Phase 1: Search EDGAR for company matches
node edgar-scraper.js search

# Phase 2: Fetch Form D data for matches
node edgar-scraper.js fetch

# Phase 3: Apply dates to projects.json
node edgar-scraper.js apply-dates
```

### What It Does
1. **Search**: Queries EDGAR with company names, matches against SEC entities
2. **Fetch**: Downloads Form D XML, extracts funding amounts and dates
3. **Apply**: Updates `last_funding_date` in projects.json

### Confidence Levels
- **high**: Exact name match after normalization
- **medium**: Starts-with or contains match
- **low**: Word similarity > 0.25 (not fetched by default)

### Output Files
```
edgar-matches.json   # Entity matches with CIK, confidence, filings
results.json         # Funding amounts extracted from Form D
edgar-errors.log     # Errors for debugging
```

### After Running
```bash
# Validate matches (removes false positives)
node validate-edgar.js analyze   # See what would change
node validate-edgar.js apply     # Apply corrections

# Review changes before committing
git diff src/data/projects.json
```

### Known False Positives
The validator has 60+ manual overrides for companies that match wrong EDGAR entities:
- Alloy → matches biotech company
- Upstart → matches energy company
- Brex → matches REIT
- Plaid → matches law firm

These are auto-corrected by `validate-edgar.js`.

---

## 3. Web Enrichment (Manual)

**Purpose**: Add funding data for companies not in EDGAR (international, pre-funding, etc.)

### Workflow
```bash
cd scripts/funding-scraper

# 1. Generate gap report
node enrich-gaps.js report

# 2. Open funding-gaps.md, research companies manually
# 3. Add findings to web-enrichment.json

# 4. Apply enrichment
node apply-enrichment.js        # Dry run (see changes)
node apply-enrichment.js apply  # Apply to projects.json
```

### web-enrichment.json Format
```json
{
  "metadata": { "generated": "2026-01-28", "source": "manual-research" },
  "enrichments": [
    {
      "slug": "company-slug",
      "last_funding_date": "2025-03",
      "funding": 50000000,
      "note": "Series B $50M from TechCrunch article"
    }
  ]
}
```

### Research Sources (priority order)
1. **Tracxn**: `https://tracxn.com/d/companies/__search?q={name}`
2. **Crunchbase**: `https://www.crunchbase.com/organization/{slug}`
3. **Dealroom**: `https://app.dealroom.co/companies?q={name}`
4. **Company press releases**: Usually most accurate for dates

---

## 4. Logo Downloader

**Purpose**: Download company logos to serve locally (faster, no external dependencies).

### Run
```bash
cd scripts/logo-downloader

# With Logo.dev API key (better quality)
node download-logos.js --key pk_YOUR_KEY

# Without API key (Google Favicon fallback)
node download-logos.js
```

### Options
```bash
--resume           # Resume from last failed company
--only slug1,slug2 # Download specific companies only
```

### Manual Overrides
Place PNG files in `scripts/logo-downloader/overrides/{slug}.png` before running.

### After Running
```bash
# Update projects.json with logo paths
node update-projects.js

# Verify
ls -la public/logos/ | wc -l
```

---

## 5. AI Type Classification

**Purpose**: Classify companies by AI technology (llm, predictive-ml, agentic, etc.)

### Run
```bash
cd scripts/funding-scraper
node classify-ai-type.js
```

### What It Does
1. Applies manual overrides (200+ hand-curated mappings)
2. Falls back to keyword matching on name/tagline/description
3. Updates `ai_types` array in projects.json

### AI Types
| Type | Description | Examples |
|------|-------------|----------|
| `llm` | Large language models | Harvey, Hebbia, Cleo |
| `predictive-ml` | Fraud/credit/risk scoring | Feedzai, Upstart |
| `computer-vision` | Document processing, KYC | Ocrolus, Au10tix |
| `graph-analytics` | Blockchain analysis | Chainalysis, Elliptic |
| `reinforcement-learning` | Trading optimization | QuantConnect |
| `agentic` | Autonomous agents | ai16z, Virtuals |
| `data-platform` | Data aggregation | Plaid, Yipitdata |
| `infrastructure` | Compute networks | Together AI, Bittensor |

---

## Weekly Scrape Workflow

### Automated (30 min)
```bash
npm run scrape:weekly
```

This runs:
1. Agent pipeline (fetch + filter + classify)
2. EDGAR search + fetch + validate
3. Apply validated EDGAR dates
4. AI type classification
5. Data validation

### Manual Follow-up (as needed)
```bash
# Review any EDGAR changes
git diff src/data/projects.json

# Check gap report for manual research opportunities
cat scripts/funding-scraper/funding-gaps.md | head -100

# If doing manual enrichment
node scripts/funding-scraper/apply-enrichment.js apply
```

---

## Data Validation

Always run before committing:
```bash
npm run validate
npm run build
```

### Validation Checks
- All slugs unique
- All segment/layer references valid
- Required fields present (slug, name, tagline, segment, layer)
- Funding amounts are numbers (not strings)
- Dates in YYYY or YYYY-MM format

---

## Troubleshooting

### EDGAR Rate Limiting
SEC allows 10 req/sec. Scripts use 5 req/sec (200ms delay). If blocked:
- Wait 10 minutes
- Check User-Agent is set: `AIFI Directory admin@aifimap.com`

### The Graph Errors
- Check subgraph health: https://thegraph.com/explorer
- Verify API key in `config.js`

### Missing Company Data
1. Check if company is in EDGAR (US-only): `node edgar-scraper.js search --only company-slug`
2. If not US or not in EDGAR: Add to `web-enrichment.json` manually
3. For logo: Check website has valid favicon, or add manual override

### Build Fails After Scraping
```bash
# Check for TypeScript errors
npm run build 2>&1 | grep -i error

# Common issues:
# - Invalid date format (should be YYYY or YYYY-MM)
# - Funding as string instead of number
# - Invalid segment/layer slug reference
```

---

## File Locations

### Source Data (committed)
```
src/data/projects.json    # Company directory (~450 entries)
src/data/agents.json      # Agent registry
src/data/segments.json    # Market segments
src/data/layers.json      # Tech layers
```

### Scraper Outputs (gitignored)
```
scripts/funding-scraper/
  ├── results.json          # Funding search results
  ├── review.json           # Manual review queue
  ├── edgar-matches.json    # EDGAR entity matches
  ├── funding-gaps.md       # Gap analysis report
  └── funding-gaps.csv      # Gap spreadsheet

scripts/agent-pipeline/
  └── results.json          # Pipeline debug info

scripts/logo-downloader/
  └── results.json          # Download results
```

### Logos (committed)
```
public/logos/{slug}.png    # Company logos
```

---

## API Keys & Credentials

| Service | Required | Location |
|---------|----------|----------|
| SEC EDGAR | No (public API) | User-Agent in script |
| The Graph | Optional | `scripts/agent-pipeline/config.js` |
| Logo.dev | Optional | CLI arg `--key pk_XXX` |

---

## Adding New Companies

After adding to `projects.json`:
```bash
# Download logo
node scripts/logo-downloader/download-logos.js --only new-company-slug

# Classify AI type
node scripts/funding-scraper/classify-ai-type.js

# Search EDGAR (if US company)
node scripts/funding-scraper/edgar-scraper.js search --only new-company-slug

# Validate and build
npm run validate && npm run build
```
