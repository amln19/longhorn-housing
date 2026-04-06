# Longhorn Housing 🤘

A modern apartment search platform built for UT Austin students looking for off-campus housing. Browse 150+ verified listings; filter by neighborhood, price, and amenities; compare apartments side-by-side; save favorites; track rent trends; find roommates; post subleases; and explore an interactive map — all in a fast, responsive Next.js app themed in burnt orange.

## Features

- 🔍 **Smart Search & Filters** — filter by price range, bedroom count, neighborhood, pet-friendliness, amenities, and availability
- 🗺️ **Interactive Map** — MapLibre GL map (Carto Positron style) centered on UT Austin with clickable markers, configurable label modes (name, price, or both), and optional walking routes via public OSRM
- ⚖️ **Side-by-Side Compare** — select up to 4 apartments and compare pricing, walk time, amenities, and more in a single table (with a dedicated compare API for client use)
- 🏠 **Detailed Listings** — each apartment page shows floor plans, grouped amenities, image galleries, contact info, commute times, and **price history charts** when snapshot data exists
- ❤️ **Favorites** — sign in with Supabase Auth and save apartments; manage them from the dashboard
- 👥 **Roommates** — create a roommate profile and browse suggested matches (API rate limiting uses Upstash Redis in production when configured)
- 📋 **Subleases** — list and browse user-submitted sublets with neighborhood and map-friendly fields
- 🔐 **Authentication** — email/password sign-up and login via Supabase; auth callback and `/api/auth/me` for session-aware UI
- 🌓 **Theme** — light/dark/system appearance via `next-themes`
- 🤖 **Automated Data Pipeline** — Puppeteer-based scraper pulls live data from the UT off-campus housing portal, then seeds a PostgreSQL database via Prisma
- 📈 **Price snapshots** — optional `snapshot:prices` script records weekly floor-plan prices for historical charts (run cron in production)
- 📱 **Fully Responsive** — mobile-first design with a collapsible nav, touch-friendly filters, and adaptive grid layouts
- ⚡ **App Router + React 19** — leverages Next.js 16 App Router with server components, streaming Suspense boundaries, dynamic metadata, and route-level error UI where relevant

## Tech Stack

- **Framework:** Next.js
- **Language:** TypeScript
- **UI:** React 19, Tailwind CSS 4, Lucide React icons
- **Styling utilities:** clsx, tailwind-merge, class-variance-authority
- **Database:** PostgreSQL via Prisma ORM (with `@prisma/adapter-pg` driver adapter)
- **Auth:** Supabase Auth (`@supabase/ssr`, `@supabase/supabase-js`)
- **Maps:** MapLibre GL JS (vector basemap; walking directions from OSRM)
- **Charts:** Recharts
- **Validation:** Zod
- **Rate limiting / cache (optional prod):** Upstash Redis
- **Scraping:** Puppeteer (headless Chrome)
- **Runtime scripts:** tsx
- **Testing:** Vitest
- **Linting:** ESLint with eslint-config-next
- **Fonts:** Geist Sans & Geist Mono (via `next/font`)

## Getting Started

### Prerequisites

- **Node.js** 20+
- **npm** (or another package manager)
- **PostgreSQL** database (local or hosted — e.g. Neon, Supabase, Railway)
- **Supabase** project for authentication (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- _(Optional, recommended for production)_ **Upstash Redis** for distributed rate limits and roommate match caching

### Installation

```bash
# Clone the repo
git clone https://github.com/amln19/longhorn-housing.git
cd longhorn-housing

# Install dependencies
npm install
```

### Environment Setup

Create a `.env` file in the project root. See `.env.example` for annotated templates (including Supabase pooler connection notes).

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/longhorn_housing"
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
# Optional (production): rate limits + roommate cache
# UPSTASH_REDIS_REST_URL="https://xxxx.upstash.io"
# UPSTASH_REDIS_REST_TOKEN="..."
# Optional: tune the app's pg pool (see .env.example)
# DATABASE_POOL_MAX=10
```

### Database Setup

```bash
# Generate the Prisma client
npm run db:generate

# Apply schema — migrations are checked into prisma/migrations/
npx prisma migrate deploy

# For local experimentation without migration history, you can instead use:
# npm run db:push

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

| Variable                     | Description                                                                 | Required |
| ---------------------------- | ---------------------------------------------------------------------------- | -------- |
| `DATABASE_URL`               | PostgreSQL connection string used by Prisma and the `pg` pool                | Yes      |
| `NEXT_PUBLIC_SUPABASE_URL`   | Supabase project URL                                                         | Yes      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous (public) key                                         | Yes      |
| `UPSTASH_REDIS_REST_URL`     | Upstash Redis REST URL for production rate limiting / caching                | No       |
| `UPSTASH_REDIS_REST_TOKEN`   | Upstash Redis REST token                                                     | No       |
| `DATABASE_POOL_MAX`        | Max connections for the app `pg` pool (defaults vary by environment)         | No       |

> The interactive map does **not** require a Mapbox token; it uses MapLibre with a public Carto style and OSRM for optional walking routes.

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

### Price history snapshots

To populate **price history** charts over time, run the snapshot job on a schedule (for example weekly):

```bash
npm run snapshot:prices
```

This writes `PriceSnapshot` rows for every floor plan’s current min/max rent.

## Project Structure

```
longhorn-housing/
├── prisma/
│   ├── migrations/            # Versioned SQL migrations
│   ├── schema.prisma          # Database schema (Apartment, User, Sublease, etc.)
│   └── seed-from-scrape.ts    # Seed script that reads scraped JSON → DB
├── scripts/
│   ├── scrape-listings.ts     # Puppeteer scraper for UT housing portal
│   ├── snapshot-prices.ts    # Weekly price snapshots for charts
│   └── scraped-apartments.json
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing page with hero, features, and neighborhoods
│   │   ├── apartments/        # Browse & detail pages
│   │   ├── auth/              # Login & signup (Supabase)
│   │   ├── dashboard/         # Signed-in hub (e.g. favorites)
│   │   ├── compare/           # Side-by-side comparison page
│   │   ├── roommates/        # Roommate profile & matches
│   │   ├── subleases/        # Sublease browse / create / detail
│   │   ├── map/               # Full-screen map page
│   │   └── api/               # REST routes (apartments, favorites, auth, roommates, subleases, geocode, …)
│   ├── components/
│   │   ├── apartments/        # ApartmentCard, SearchFilters, FavoriteButton, PriceChart, …
│   │   ├── auth/             # Auth UI
│   │   ├── layout/            # Header, Footer
│   │   ├── map/               # MapView (MapLibre wrapper)
│   │   └── ui/                # Reusable primitives (Button, Card, Badge, ThemeToggle, etc.)
│   ├── lib/
│   │   ├── db.ts              # Prisma client + pool
│   │   ├── supabase/         # Supabase browser/server clients
│   │   ├── auth.ts            # Session / user helpers
│   │   ├── validations.ts     # Zod schemas for APIs
│   │   └── utils.ts           # cn(), formatPrice(), slugify(), …
│   └── types/
│       └── index.ts           # Shared TypeScript types
```

## Available Scripts

| Script              | Command                    | Description                                      |
| ------------------- | -------------------------- | ------------------------------------------------ |
| Dev server          | `npm run dev`              | Start Next.js in development mode                |
| Build               | `npm run build`            | Create a production build                        |
| Start               | `npm start`                | Serve the production build                       |
| Lint                | `npm run lint`             | Run ESLint                                       |
| Tests               | `npm test`                 | Run Vitest once                                  |
| Tests (watch)       | `npm run test:watch`       | Run Vitest in watch mode                         |
| Generate Prisma     | `npm run db:generate`      | Regenerate the Prisma client                     |
| Push schema         | `npm run db:push`          | Push schema changes (no migration files)         |
| Seed database       | `npm run db:seed`          | Seed the database from scraped data              |
| Prisma Studio       | `npm run db:studio`        | Open the Prisma Studio GUI                       |
| Scrape listings     | `npm run scrape`           | Run the Puppeteer scraper                        |
| Price snapshots     | `npm run snapshot:prices`   | Record current rents into `PriceSnapshot`        |

## License

MIT
