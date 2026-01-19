# AIFI - AI Finance Index

A curated directory of companies building at the intersection of AI and Finance.

> **For Developers**: See [CLAUDE.md](./CLAUDE.md) for architectural guidelines and conventions.

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Validate data integrity
npm run validate
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Features

- **Interactive Market Map**: Grid visualization of companies across segments and tech layers
- **Searchable Directory**: Filter by segment, layer, and funding stage with fuzzy search
- **Project Profiles**: Detailed pages for each company

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── directory/          # Main directory page (unified interface)
│   ├── p/[slug]/           # Individual project profiles
│   ├── about/              # About page
│   └── submit/             # Submission form
├── components/             # React components
│   ├── MarketMap.tsx       # Interactive segment × layer grid
│   ├── ProjectTable.tsx    # Searchable, filterable table
│   └── Nav.tsx             # Navigation
├── data/                   # JSON data files
│   ├── projects.json       # All projects
│   ├── segments.json       # Market segments
│   └── layers.json         # Tech stack layers
├── lib/                    # Utilities and data helpers
└── types/                  # TypeScript types
```

## Adding Projects

1. Edit `src/data/projects.json`
2. Add a new project object with required fields:
   - `slug` - URL-safe identifier
   - `name` - Company name
   - `tagline` - One-line description
   - `segment` - Primary segment slug
   - `layer` - Primary layer slug
3. Optional fields: `description`, `website`, `twitter`, `linkedin`, `stage`, `funding`, `founded`, `hq_country`, `hq_city`, `team`
4. Run `npm run validate` to check data integrity

## Deployment

The site is configured for static export. Deploy to any static hosting:

```bash
npm run build
# Output in 'out' directory
```

Or deploy directly to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## Tech Stack

- [Next.js 14](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Fuse.js](https://fusejs.io/) - Client-side search
- [Lucide](https://lucide.dev/) - Icons

## License

MIT
