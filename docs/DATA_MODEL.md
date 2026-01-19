# AIFI Data Model

All data is stored as JSON files in the `/data` directory.

## File Structure

```
data/
├── projects.json       # All projects
├── segments.json       # Market segment definitions
└── layers.json         # Tech stack layer definitions
```

---

## Projects Schema

`data/projects.json` - Array of project objects.

```json
{
  "slug": "alpaca",
  "name": "Alpaca Markets",
  "logo": "/logos/alpaca.svg",
  "tagline": "Commission-free stock trading API for developers",
  "description": "Alpaca provides a commission-free trading API...",
  "website": "https://alpaca.markets",
  "twitter": "https://twitter.com/alpaborhq",
  "linkedin": "https://linkedin.com/company/alpaca",
  "segment": "trading",
  "segments": ["trading"],
  "layer": "execution",
  "layers": ["execution", "data"],
  "stage": "series_c",
  "funding": 170000000,
  "founded": 2015,
  "hq_country": "US",
  "hq_city": "San Mateo",
  "team": [
    {
      "name": "Yoshi Yokokawa",
      "role": "CEO & Co-founder",
      "linkedin": "https://linkedin.com/in/yoshi"
    }
  ]
}
```

### Field Reference

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `slug` | string | yes | URL-safe identifier (lowercase, hyphens) |
| `name` | string | yes | Company display name |
| `logo` | string | no | Path to logo file in `/public/logos/` |
| `tagline` | string | yes | One-line description (max 140 chars) |
| `description` | string | no | Full description (markdown supported) |
| `website` | string | no | Company website URL |
| `twitter` | string | no | Twitter profile URL |
| `linkedin` | string | no | LinkedIn company URL |
| `segment` | string | yes | Primary segment slug |
| `segments` | string[] | no | All segment slugs (includes primary) |
| `layer` | string | yes | Primary layer slug |
| `layers` | string[] | no | All layer slugs (includes primary) |
| `stage` | string | no | Funding stage (see values below) |
| `funding` | number | no | Total funding in USD (omit if unknown) |
| `founded` | number | no | Year founded |
| `hq_country` | string | no | ISO 3166-1 alpha-2 country code |
| `hq_city` | string | no | City name |
| `team` | object[] | no | Key team members |

### Stage Values

```
pre_seed
seed
series_a
series_b
series_c_plus
growth
public
acquired
bootstrapped
```

---

## Segments Schema

`data/segments.json` - Array of segment definitions.

```json
{
  "slug": "trading",
  "name": "Trading & Markets",
  "description": "Algorithmic trading, market making, order execution, price prediction",
  "icon": "chart-line",
  "color": "#3B82F6"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `slug` | string | yes | URL-safe identifier |
| `name` | string | yes | Display name |
| `description` | string | yes | Brief description |
| `icon` | string | no | Icon identifier (for UI) |
| `color` | string | no | Hex color for visualizations |

---

## Layers Schema

`data/layers.json` - Array of layer definitions.

```json
{
  "slug": "execution",
  "name": "Execution",
  "description": "Trade execution, payment processing, settlements",
  "position": 6,
  "icon": "bolt",
  "color": "#10B981"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `slug` | string | yes | URL-safe identifier |
| `name` | string | yes | Display name |
| `description` | string | yes | Brief description |
| `position` | number | yes | Stack position (1=bottom, 9=top) |
| `icon` | string | no | Icon identifier (for UI) |
| `color` | string | no | Hex color for visualizations |

---

## TypeScript Types

For type safety in the codebase:

```typescript
interface Project {
  slug: string;
  name: string;
  logo?: string;
  tagline: string;
  description?: string;
  website?: string;
  twitter?: string;
  linkedin?: string;
  segment: string;
  segments?: string[];
  layer: string;
  layers?: string[];
  stage?: Stage;
  funding?: number;
  founded?: number;
  hq_country?: string;
  hq_city?: string;
  team?: TeamMember[];
}

interface TeamMember {
  name: string;
  role: string;
  linkedin?: string;
}

interface Segment {
  slug: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
}

interface Layer {
  slug: string;
  name: string;
  description: string;
  position: number;
  icon?: string;
  color?: string;
}

type Stage =
  | 'pre_seed'
  | 'seed'
  | 'series_a'
  | 'series_b'
  | 'series_c_plus'
  | 'growth'
  | 'public'
  | 'acquired'
  | 'bootstrapped';
```

---

## Validation Rules

1. **Unique slugs**: No duplicate slugs within projects, segments, or layers
2. **Valid references**: `segment` must match a slug in `segments.json`
3. **Valid references**: `layer` must match a slug in `layers.json`
4. **Primary in array**: `segment` should appear in `segments[]` if provided
5. **Primary in array**: `layer` should appear in `layers[]` if provided
6. **URL format**: `website`, `twitter`, `linkedin` should be valid URLs
7. **Country codes**: `hq_country` should be valid ISO 3166-1 alpha-2
