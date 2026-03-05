# Longhorn Housing 🤘

A modern apartment search platform built for University of Texas at Austin students looking for off-campus housing. Browse 150+ verified listings, filter by neighborhood, price, and amenities, compare apartments side-by-side, and explore an interactive Mapbox-powered map — all in a fast, responsive Next.js app themed in burnt orange.

## Features

- 🔍 **Smart Search & Filters** — filter by price range, bedroom count, neighborhood, pet-friendliness, amenities, and availability
- 🗺️ **Interactive Map** — Mapbox GL map centered on UT Austin with clickable apartment markers and configurable label modes (name, price, or both)
- ⚖️ **Side-by-Side Compare** — select up to 4 apartments and compare pricing, walk time, amenities, and more in a single table
- 🏠 **Detailed Listings** — each apartment page shows floor plans, grouped amenities, image galleries, contact info, and commute times
- 🤖 **Automated Data Pipeline** — Puppeteer-based scraper pulls live data from the UT off-campus housing portal, then seeds a PostgreSQL database via Prisma
- 📱 **Fully Responsive** — mobile-first design with a collapsible nav, touch-friendly filters, and adaptive grid layouts
- ⚡ **App Router + React 19** — leverages Next.js 16 App Router with server components, streaming Suspense boundaries, and dynamic metadata

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **UI:** React 19, Tailwind CSS 4, Lucide React icons
- **Styling utilities:** clsx, tailwind-merge, class-variance-authority
- **Database:** PostgreSQL via Prisma ORM (with `@prisma/adapter-pg` driver adapter)
- **Maps:** Mapbox GL JS
- **Scraping:** Puppeteer (headless Chrome)
- **Runtime scripts:** tsx
- **Linting:** ESLint with eslint-config-next
- **Fonts:** Geist Sans & Geist Mono (via `next/font`)

## Getting Started

### Prerequisites

- **Node.js** 20+
- **npm** (or another package manager)
- **PostgreSQL** database (local or hosted — e.g. Neon, Supabase, Railway)
- **Mapbox** account for an access token (free tier works)

### Installation

```bash
# Clone the repo
git clone https://github.com/amln19/longhorn-housing.git
cd longhorn-housing

# Install dependencies
npm install
```

### Environment Setup

Create a `.env` file in the project root:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/longhorn_housing"
NEXT_PUBLIC_MAPBOX_TOKEN="pk.your_mapbox_token_here"
```

### Database Setup

```bash
# Generate the Prisma client
npm run db:generate

# Push the schema to your database
npm run db:push

# Seed the database with scraped apartment data
npm run db:seed
```

### Run the App

```bash
# Development server (http://localhost:3000)
npm run dev

# Production build
npm run build && npm start
```

## Environment Variables

| Variable                   | Description                                              | Required |
| -------------------------- | -------------------------------------------------------- | -------- |
| `DATABASE_URL`             | PostgreSQL connection string used by Prisma              | Yes      |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox GL JS public access token for the interactive map | Yes      |

## Scraping Workflow

The project includes a Puppeteer scraper that pulls apartment data directly from the [UT Off-Campus Housing portal](https://housing.offcampus.utexas.edu/listing).

```bash
# Run the scraper (outputs scripts/scraped-apartments.json)
npm run scrape

# Seed the database from the scraped JSON
npm run db:seed
```

**How it works:**

1. `scrape-listings.ts` launches headless Chrome, navigates to the UT housing page, and extracts the `window.listingData` JavaScript variable containing all listings.
2. Each raw listing is transformed — addresses are parsed, neighborhoods are inferred from coordinates, amenities are mapped, and floor plans are normalized.
3. The result is written to `scripts/scraped-apartments.json`.
4. `seed-from-scrape.ts` reads that JSON, clears the database, and inserts neighborhoods, amenities, apartments, floor plans, and images via Prisma.

> **Note:** A pre-scraped `scraped-apartments.json` is included in the repo so you can seed the database without running the scraper.

## Project Structure

```
├── prisma/
│   ├── schema.prisma          # Database schema (Apartment, FloorPlan, Amenity, etc.)
│   └── seed-from-scrape.ts    # Seed script that reads scraped JSON → DB
├── scripts/
│   ├── scrape-listings.ts     # Puppeteer scraper for UT housing portal
│   └── scraped-apartments.json
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing page with hero, features, and neighborhoods
│   │   ├── apartments/        # Browse & detail pages
│   │   ├── compare/           # Side-by-side comparison page
│   │   ├── map/               # Full-screen Mapbox map page
│   │   └── api/               # REST API routes (apartments, neighborhoods, amenities)
│   ├── components/
│   │   ├── apartments/        # ApartmentCard, SearchFilters
│   │   ├── layout/            # Header, Footer
│   │   ├── map/               # MapView (Mapbox GL wrapper)
│   │   └── ui/                # Reusable primitives (Button, Card, Badge, etc.)
│   ├── lib/
│   │   ├── db.ts              # Prisma client singleton
│   │   └── utils.ts           # cn(), formatPrice(), slugify()
│   └── types/
│       └── index.ts           # Shared TypeScript types
```

## Available Scripts

| Script          | Command               | Description                         |
| --------------- | --------------------- | ----------------------------------- |
| Dev server      | `npm run dev`         | Start Next.js in development mode   |
| Build           | `npm run build`       | Create a production build           |
| Start           | `npm start`           | Serve the production build          |
| Lint            | `npm run lint`        | Run ESLint                          |
| Generate Prisma | `npm run db:generate` | Regenerate the Prisma client        |
| Push schema     | `npm run db:push`     | Push schema changes to the database |
| Seed database   | `npm run db:seed`     | Seed the database from scraped data |
| Prisma Studio   | `npm run db:studio`   | Open the Prisma Studio GUI          |
| Scrape listings | `npm run scrape`      | Run the Puppeteer scraper           |

## License

MIT