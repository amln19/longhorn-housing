# LonghornHousing 🤘

A modern apartment finder app for UT Austin students. Search, compare, and find off-campus housing near The University of Texas at Austin.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748)

## Features

- 🔍 **Smart Search** - Filter by neighborhood, price, bedrooms, amenities
- 📊 **Side-by-Side Compare** - Compare up to 4 apartments at once
- 🗺️ **Interactive Map** - See all apartments with walk times to campus
- 📱 **Mobile Responsive** - Works great on all devices
- ⚡ **Fast** - Built with Next.js 16 App Router
- 🏠 **Real Data** - 153 apartments scraped from UT Housing website

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Maps**: Mapbox GL
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or Supabase)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/amln19/longhorn-housing.git
   cd longhorn-housing
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your database URL:

   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/longhorn_housing"  # Local PostgreSQL database URL
   # OR
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"  # Supabase

   NEXT_PUBLIC_MAPBOX_TOKEN="your-mapbox-token"  # Optional, for maps functionality
   ```

4. **Set up the database**

   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push schema to database
   npm run db:push

   # Seed with sample data
   npm run db:seed
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

### Using Supabase (Recommended for deployment)

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Get your connection string from Settings > Database
4. Update your `.env` file with the Supabase URL

## Project Structure

```
src/
├── app/                     # Next.js App Router pages
│   ├── api/                 # API routes
│   ├── apartments/          # Apartment listing & detail pages
│   ├── compare/             # Comparison page
│   └── map/                 # Map view page
├── components/              # React components
│   ├── apartments/          # Apartment-specific components
│   ├── layout/              # Header, Footer
│   ├── map/                 # Map components
│   └── ui/                  # Reusable UI components
├── lib/                     # Utilities
│   ├── db.ts                # Prisma client
│   └── utils.ts             # Helper functions
└── types/                   # TypeScript types

prisma/
├── schema.prisma            # Database schema
└── seed-from-scrape.ts      # Seed data from scraper

scripts/
├── scrape-listings.ts       # UT Housing website scraper
└── scraped-apartments.json  # Scraped data (153 apartments)
```

## Available Scripts

| Command               | Description                        |
| --------------------- | ---------------------------------- |
| `npm run dev`         | Start development server           |
| `npm run build`       | Build for production               |
| `npm run start`       | Start production server            |
| `npm run db:generate` | Generate Prisma client             |
| `npm run db:push`     | Push schema to database            |
| `npm run db:seed`     | Seed database with scraped data    |
| `npm run db:studio`   | Open Prisma Studio (database GUI)  |
| `npm run scrape`      | Scrape UT Housing website for data |

## Environment Variables

| Variable                   | Description                  | Required |
| -------------------------- | ---------------------------- | -------- |
| `DATABASE_URL`             | PostgreSQL connection string | Yes      |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox API token for maps    | No       |

## Scraping Fresh Data

The project includes a scraper to fetch the latest apartment listings from the UT Housing website.

```bash
# Run the scraper (uses Puppeteer)
npm run scrape

# This outputs to scripts/scraped-apartments.json
# Then seed the database with the new data
npm run db:seed
```

The scraper extracts:

- Apartment names, addresses, and coordinates
- Pricing and floor plan details
- Amenities and features
- Contact information and websites
- Walk times to campus

> **Note**: The scraped data file (`scripts/scraped-apartments.json`) is gitignored. Run the scraper to generate fresh data.

## Roadmap

- [ ] User authentication
- [ ] Save favorite apartments
- [ ] User reviews and ratings
- [ ] Price history charts
- [ ] Email notifications for new listings
- [ ] Roommate finder
- [ ] Virtual tours integration

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your own purposes.

---

Made with 🧡 for UT Austin students
