# Longhorn Housing 🤘

A modern apartment search platform built for UT Austin students looking for off-campus housing. The problem: existing portals are clunky, lack specific UT details, and make comparing options difficult. Longhorn Housing fixes that with an intuitive UI, side-by-side comparisons, and interactive maps.

## Features

- **Smart filters** — sort by price range, bedroom count, neighborhood, pets, amenities, and availability
- **Interactive map** — MapLibre GL integration centered on UT Austin with configureable markers and walking routes
- **Side-by-side compare** — select up to 4 apartments and contrast pricing, commute times, and details in a single view
- **Price history charts** — historical rent trend visualization for granular floor plans
- **Favorites & Dashboard** — save properties and manage shortlists via fully integrated Supabase authentication
- **Sublets & Roommates** — browse user-submitted subleases and find student roommate matches
- **Automated pipeline** — Puppeteer-based scraper regularly pulls live data from the UT housing portal

## Tech Stack

- **TypeScript** — strict mode, full type coverage
- **Next.js** — App Router, Server Components, and API routes
- **Tailwind CSS** — styling, responsive UI, and custom theme layouts
- **PostgreSQL & Prisma** — relational database and type-safe ORM
- **Supabase** — native authentication and user sessions
- **MapLibre GL JS** — high-performance vector maps
- **Puppeteer** — headless browser scraping for automated seeding

## Getting Started

### Prerequisites

- **Node.js** (v20+) and **npm**
- **PostgreSQL** database (local or hosted)
- **Supabase** project for authentication

### Installation

1. **Clone the repo and install dependencies:**

   ```bash
   git clone https://github.com/amln19/longhorn-housing.git
   cd longhorn-housing
   npm install
   ```

2. **Environment Setup:**

   Create a `.env` file in the project root:

   ```bash
   DATABASE_URL="postgresql://user:password@localhost:5432/longhorn_housing"
   NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   ```

3. **Database Setup:**

   ```bash
   # Generate Prisma client and apply migrations
   npm run db:generate
   npx prisma migrate deploy

   # Seed the database with provided scraped data
   npm run db:seed
   ```

4. **Run the App:**

   ```bash
   npm run dev
   ```

## Architecture

```
src/
├── app/               # Next.js App Router (pages, layouts, APIs)
├── components/        # Reusable UI elements, composite views, and map widgets
├── lib/               # Prisma client, Supabase config, and utils
└── types/             # Shared TypeScript types
prisma/
└── schema.prisma      # PostgreSQL schema
scripts/
└── scrape-listings.ts # Puppeteer logic for UT housing portal
```

### Data Pipeline Utilities

| Command             | Description                                                  |
| ------------------- | ------------------------------------------------------------ |
| `npm run scrape`    | Pulls live apartment data directly from the UT housing portal |
| `npm run db:seed`   | Seeds the scraped housing data into the database              |
| `npm run snapshot:prices` | Records current minimum/maximum rents into a snapshot table |

## License

MIT
