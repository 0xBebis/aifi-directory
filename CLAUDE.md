# AIFI Development Guide

This document defines the architectural constraints, conventions, and guidelines for maintaining and extending the AIFI codebase. Follow these rules to ensure consistency and quality across iterations.

---

## Project Identity

**AIFI** is a curated directory of AI + Finance companies. It is:
- A **static site** with no backend
- **Data-driven** from JSON files
- **Simple to maintain** by non-technical users
- **Fast and reliable** with minimal dependencies

### Core Principles

1. **Simplicity over features** - Resist adding complexity. Every feature must justify its existence.
2. **Data as the source of truth** - All content comes from `/src/data/*.json`. No hardcoded content in components.
3. **Static first** - The site must build to static HTML. No runtime server required.
4. **Zero external services** - No databases, no APIs, no auth providers. Everything runs client-side.

---

## Architecture Constraints

### What We Use
| Layer | Technology | Reason |
|-------|------------|--------|
| Framework | Next.js 14 (App Router) | Static export, file-based routing |
| Styling | Tailwind CSS | Utility-first, no CSS files to manage |
| Search | Fuse.js | Client-side fuzzy search, no backend |
| Icons | Lucide React | Lightweight, tree-shakeable |
| Types | TypeScript | Type safety, better DX |

### What We DON'T Use
- **No database** - Data lives in JSON files
- **No CMS** - Edit JSON directly
- **No authentication** - Public read-only site
- **No analytics services** - Add only if explicitly requested
- **No state management libraries** - React useState is sufficient
- **No CSS-in-JS** - Tailwind only
- **No API routes** - Static export doesn't support them

### Forbidden Patterns
- Server components that fetch external data
- Environment variables for runtime config
- Dynamic imports for data files
- localStorage for persistent state
- External image hosts (use local `/public`)

---

## File Organization

```
src/
├── app/                    # Pages only - minimal logic
│   ├── page.tsx           # Homepage
│   ├── layout.tsx         # Root layout (nav, footer)
│   ├── globals.css        # Tailwind imports + minimal global styles
│   ├── not-found.tsx      # 404 page
│   ├── [feature]/         # Feature routes
│   │   ├── page.tsx       # List/index page
│   │   └── [slug]/        # Detail pages
│   │       └── page.tsx
├── components/            # Reusable UI components
│   ├── Nav.tsx           # Navigation (single file)
│   ├── ProjectCard.tsx   # Project card component
│   └── [Component].tsx   # One component per file
├── data/                  # JSON data files (source of truth)
│   ├── projects.json     # All projects
│   ├── segments.json     # Market segments
│   └── layers.json       # Tech stack layers
├── lib/                   # Utilities and helpers
│   └── data.ts           # Data loading and transformation
└── types/                 # TypeScript definitions
    └── index.ts          # All types in one file
```

### Naming Conventions
- **Files**: kebab-case for routes, PascalCase for components
- **Components**: PascalCase (`ProjectCard.tsx`)
- **Utilities**: camelCase (`formatFunding`)
- **Types**: PascalCase (`Project`, `Segment`)
- **Slugs**: lowercase-with-hyphens (`two-sigma`)

---

## Data Model

### Projects (`/src/data/projects.json`)
```typescript
interface Project {
  // Required
  slug: string;        // URL identifier, unique
  name: string;        // Display name
  tagline: string;     // Max 140 chars
  segment: string;     // Primary segment slug
  layer: string;       // Primary layer slug

  // Optional
  description?: string;
  website?: string;
  twitter?: string;
  linkedin?: string;
  segments?: string[]; // Additional segments
  layers?: string[];   // Additional layers
  stage?: Stage;
  funding?: number;    // USD, no formatting
  founded?: number;    // Year only
  hq_country?: string; // ISO 3166-1 alpha-2
  hq_city?: string;
  team?: TeamMember[];
}
```

### Validation Rules
1. Every `slug` must be unique across all projects
2. Every `segment` must reference a valid segment slug
3. Every `layer` must reference a valid layer slug
4. `funding` is stored as raw number (e.g., `170000000` not `"$170M"`)
5. `founded` is a 4-digit year (e.g., `2015` not `"2015"`)

### Adding New Data Fields
1. Add to TypeScript interface in `/src/types/index.ts`
2. Add to data utility functions in `/src/lib/data.ts`
3. Update relevant components to display the field
4. Document the field in this file

---

## Component Patterns

### Page Components (`/src/app/**/page.tsx`)
- Fetch data at the top of the component
- Pass data down to child components
- Keep pages thin - delegate to components
- Use `generateStaticParams` for dynamic routes

```typescript
// Good: Page fetches data and delegates
export default function SegmentPage({ params }: { params: { slug: string } }) {
  const segment = getSegment(params.slug);
  if (!segment) notFound();

  const projects = getProjectsBySegment(segment.slug);
  return <SegmentView segment={segment} projects={projects} />;
}

// Bad: Business logic in page
export default function SegmentPage({ params }) {
  // Don't do complex filtering/sorting here
}
```

### UI Components (`/src/components/*.tsx`)
- Single responsibility - one component, one job
- Props-driven - no internal data fetching
- Stateless when possible
- Co-locate styles with Tailwind classes

```typescript
// Good: Props in, JSX out
interface ProjectCardProps {
  project: Project;
  segment: Segment | undefined;
  layer: Layer | undefined;
}

export default function ProjectCard({ project, segment, layer }: ProjectCardProps) {
  return <div>...</div>;
}

// Bad: Component fetches its own data
export default function ProjectCard({ slug }: { slug: string }) {
  const project = getProject(slug); // Don't do this
}
```

### Client Components
- Only use `'use client'` when necessary:
  - `useState`, `useEffect`, `useRef`
  - Event handlers (onClick, onChange)
  - Browser APIs
- Keep client components small and leaf-level
- Never make a page component a client component if avoidable

---

## Styling Rules

### Tailwind Classes
- Use design tokens from `tailwind.config.js`:
  - `bg-background`, `bg-surface`, `bg-surface-2`
  - `text-text-primary`, `text-text-muted`
  - `border-border`
  - `text-accent`
- Prefer semantic color names over raw values
- Group classes logically: layout → spacing → typography → colors → effects

```typescript
// Good: Semantic, organized
<div className="flex items-center gap-4 p-4 bg-surface border border-border rounded-lg hover:bg-surface-2 transition-colors">

// Bad: Raw values, disorganized
<div className="hover:bg-[#1c1c1f] border p-4 flex gap-4 border-[#2a2a2e] rounded-lg items-center bg-[#141416]">
```

### Responsive Design
- Mobile-first is NOT required (desktop-first is fine for this project)
- Use responsive prefixes when needed: `md:`, `lg:`
- Test at 3 breakpoints: mobile (375px), tablet (768px), desktop (1280px)

### No Custom CSS
- Everything in Tailwind classes
- Exception: `globals.css` for fonts and scrollbar only
- Never create `.module.css` files

---

## State Management

### Local State Only
- Use `useState` for component-level state
- Use URL params for shareable state (filters, search)
- No global state libraries

### URL as State
The directory page uses URL search params for filters:
```
/directory?segment=trading&layer=intelligence&stage=seed
```

This makes filtered views shareable and bookmarkable.

---

## Performance Guidelines

### Data Loading
- All data loaded at build time via JSON imports
- No runtime fetching
- No loading states needed (data is always available)

### Bundle Size
- Import only what you need from lucide-react
- No barrel exports in components
- Avoid large dependencies

### Images
- Store logos in `/public/logos/`
- Use descriptive filenames (`stripe.svg`, not `logo-001.svg`)
- Prefer SVG for logos, PNG/WebP for photos
- No external image URLs

---

## Adding Features

### Before Adding Anything
Ask these questions:
1. Does this align with the core purpose (directory/discovery)?
2. Can this be done without adding dependencies?
3. Does this require a backend? (If yes, reconsider)
4. Will this complicate maintenance?

### Feature Checklist
- [ ] Types defined in `/src/types/index.ts`
- [ ] Data utilities in `/src/lib/data.ts`
- [ ] Components in `/src/components/`
- [ ] Pages in `/src/app/`
- [ ] No new dependencies unless absolutely necessary
- [ ] Works with static export (`npm run build`)
- [ ] Responsive at all breakpoints

### Extending the Data Model
1. Add field to TypeScript interface
2. Add to JSON files (can be optional)
3. Add helper functions if needed
4. Update components to display
5. Update CLAUDE.md to document

---

## Quality Checklist

Before considering any change complete:

### Code Quality
- [ ] No TypeScript errors (`npm run build` passes)
- [ ] No console errors or warnings
- [ ] No hardcoded data in components
- [ ] Consistent naming conventions
- [ ] No dead code or unused imports

### Data Integrity
- [ ] All slugs are unique
- [ ] All references (segment, layer) are valid
- [ ] Numbers stored as numbers, not strings
- [ ] No HTML in JSON data

### UX Quality
- [ ] All links work
- [ ] All pages have proper titles
- [ ] Filters clear properly
- [ ] Back navigation works
- [ ] 404 page shows for invalid routes

### Build Verification
```bash
npm run build  # Must complete without errors
npm run start  # Verify static export works
```

---

## Common Tasks

### Add a New Project
1. Edit `/src/data/projects.json`
2. Add project object with required fields
3. Verify segment/layer slugs exist
4. Run `npm run build` to verify

### Add a New Segment or Layer
1. Edit `/src/data/segments.json` or `/src/data/layers.json`
2. Use unique slug
3. Pick a distinct color (hex format)
4. For layers, set correct `position` (1-9)

### Fix a Bug
1. Identify the affected component
2. Make minimal change to fix
3. Verify no regressions
4. Run full build

### Refactor
1. Only refactor when explicitly requested
2. Maintain all existing functionality
3. Don't change data structures without discussion
4. Keep changes atomic and reviewable

---

## What NOT to Do

### Never
- Add a database or external API
- Add authentication
- Add server-side rendering for data
- Use `getServerSideProps` (doesn't work with static export)
- Store secrets or API keys
- Add tracking/analytics without explicit request
- Create unnecessary abstractions
- Add features "for the future"

### Avoid
- Large dependencies for small tasks
- Premature optimization
- Over-engineering simple features
- Breaking changes to data structure
- Removing existing functionality

---

## Versioning & Changes

### Data Changes
- Projects can be added/updated without version bump
- Schema changes require discussion

### Code Changes
- Bug fixes: patch version
- New features: minor version
- Breaking changes: major version

### Changelog
Document significant changes in commit messages:
- `feat:` - New feature
- `fix:` - Bug fix
- `data:` - Data updates
- `refactor:` - Code restructure
- `docs:` - Documentation

---

## Quick Reference

### Build Commands
```bash
npm run dev      # Development server
npm run build    # Production build (static)
npm run start    # Serve production build
npm run lint     # Run linter
```

### Key Files to Know
| File | Purpose |
|------|---------|
| `src/data/projects.json` | All project data |
| `src/lib/data.ts` | Data utilities |
| `src/types/index.ts` | TypeScript types |
| `tailwind.config.js` | Design tokens |
| `next.config.js` | Build config |

### Design Tokens
| Token | Value | Usage |
|-------|-------|-------|
| `background` | `#0a0a0b` | Page background |
| `surface` | `#141416` | Card background |
| `surface-2` | `#1c1c1f` | Hover states |
| `border` | `#2a2a2e` | Borders |
| `text-primary` | `#fafafa` | Main text |
| `text-muted` | `#a1a1aa` | Secondary text |
| `accent` | `#3b82f6` | Interactive elements |
