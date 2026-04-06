/**
 * Weekly Price Snapshot Script
 *
 * Run via: npx tsx scripts/snapshot-prices.ts
 * Schedule with cron: 0 0 * * 0 (every Sunday midnight)
 *
 * Captures current prices for all floor plans and stores them
 * as PriceSnapshot records for historical trend analysis.
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function snapshotPrices() {
  console.log("Starting weekly price snapshot...");

  const floorPlans = await prisma.floorPlan.findMany({
    select: {
      id: true,
      apartmentId: true,
      priceMin: true,
      priceMax: true,
    },
  });

  console.log(`Found ${floorPlans.length} floor plans to snapshot.`);

  const now = new Date();
  const snapshots = floorPlans.map((fp) => ({
    apartmentId: fp.apartmentId,
    floorPlanId: fp.id,
    priceMin: fp.priceMin,
    priceMax: fp.priceMax,
    recordedAt: now,
  }));

  const result = await prisma.priceSnapshot.createMany({
    data: snapshots,
  });

  console.log(`Created ${result.count} price snapshots at ${now.toISOString()}`);

  const uniqueApartments = new Set(floorPlans.map((fp) => fp.apartmentId)).size;
  console.log(`Covered ${uniqueApartments} apartments.`);

  // Clean up snapshots older than 1 year
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const deleted = await prisma.priceSnapshot.deleteMany({
    where: { recordedAt: { lt: oneYearAgo } },
  });

  if (deleted.count > 0) {
    console.log(`Cleaned up ${deleted.count} snapshots older than 1 year.`);
  }
}

snapshotPrices()
  .catch((err) => {
    console.error("Price snapshot failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
