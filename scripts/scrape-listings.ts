/**
 * UT Austin Off-Campus Housing Scraper
 * Extracts listing data directly from the listingData JavaScript variable.
 *
 * Resilience features:
 *  - waitForFunction instead of arbitrary setTimeout
 *  - Retry with exponential backoff on page load failures
 *  - Runtime validation of every raw listing before transformation
 *  - Diff report against previous scrape output
 */

import "dotenv/config";
import puppeteer from "puppeteer";
import * as fs from "fs";
import * as path from "path";
import type { ScrapedApartment } from "../src/types/scraped";

// ---------------------------------------------------------------------------
// Raw listing shape from the page's listingData variable
// ---------------------------------------------------------------------------
interface RawListing {
  id: number;
  title?: string;
  slug?: string;
  address?: string;
  lat?: number;
  lng?: number;
  min_rent?: string;
  max_rent?: string;
  min_bed?: string;
  max_bed?: string;
  min_bath?: string;
  max_bath?: string;
  contact_number?: string;
  phone?: string;
  landlord_email?: string;
  email?: string;
  landlord_website?: string;
  website?: string;
  distance?: string;
  images?: string[];
  category_title?: string;
  description?: string;
  unitFeatures?: string[];
  listingFeatures?: string[];
  utilities?: string[];
  pets_allowed?: string;
  rent_style?: string;
  per_person_property?: boolean;
  parking_allowed?: boolean;
  laundry_allowed?: boolean;
  floorplans?: Array<{
    bed?: string;
    bath?: string;
    min_rent?: string;
    max_rent?: string;
    sq_footage?: string;
  }>;
}

// ---------------------------------------------------------------------------
// Neighborhood classification — config-driven instead of magic numbers
// ---------------------------------------------------------------------------
interface NeighborhoodRule {
  name: string;
  bounds: { latMin: number; latMax: number; lngMin: number; lngMax: number };
  keywords: string[];
}

const NEIGHBORHOOD_RULES: NeighborhoodRule[] = [
  {
    name: "West Campus",
    bounds: { latMin: 30.28, latMax: 30.295, lngMin: -97.755, lngMax: -97.735 },
    keywords: ["west", "rio grande", "nueces", "pearl", "san antonio"],
  },
  {
    name: "North Campus",
    bounds: { latMin: 30.295, latMax: 30.315, lngMin: -97.75, lngMax: -97.72 },
    keywords: ["speedway", "duval", "avenue"],
  },
  {
    name: "Hyde Park",
    bounds: { latMin: 30.3, latMax: 30.34, lngMin: -97.735, lngMax: -97.71 },
    keywords: ["hyde park"],
  },
  {
    name: "East Campus",
    bounds: { latMin: 30.25, latMax: 30.32, lngMin: -97.72, lngMax: -97.68 },
    keywords: [],
  },
  {
    name: "Riverside",
    bounds: { latMin: 30.22, latMax: 30.25, lngMin: -97.78, lngMax: -97.7 },
    keywords: ["riverside"],
  },
  {
    name: "Far Campus",
    bounds: { latMin: 30.28, latMax: 30.35, lngMin: -97.8, lngMax: -97.76 },
    keywords: ["far west"],
  },
];

function determineNeighborhood(
  address: string,
  lat: number,
  lng: number,
): string {
  for (const rule of NEIGHBORHOOD_RULES) {
    const { latMin, latMax, lngMin, lngMax } = rule.bounds;
    if (lat >= latMin && lat <= latMax && lng >= lngMin && lng <= lngMax) {
      return rule.name;
    }
  }

  const addr = address.toLowerCase();
  for (const rule of NEIGHBORHOOD_RULES) {
    if (rule.keywords.some((kw) => addr.includes(kw))) {
      return rule.name;
    }
  }

  return "Other";
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------
interface ValidationResult {
  valid: boolean;
  reason?: string;
}

function validateRawListing(raw: unknown): ValidationResult {
  if (typeof raw !== "object" || raw === null) {
    return { valid: false, reason: "not an object" };
  }

  const r = raw as Record<string, unknown>;

  if (typeof r.id !== "number") {
    return { valid: false, reason: "missing or non-numeric id" };
  }

  if (typeof r.lat !== "number" || typeof r.lng !== "number") {
    return { valid: false, reason: `listing ${r.id}: missing lat/lng` };
  }

  if (r.lat === 0 && r.lng === 0) {
    return { valid: false, reason: `listing ${r.id}: lat/lng are both 0` };
  }

  if (typeof r.title !== "string" || r.title.trim().length === 0) {
    return { valid: false, reason: `listing ${r.id}: missing title` };
  }

  return { valid: true };
}

// ---------------------------------------------------------------------------
// Parsing helpers
// ---------------------------------------------------------------------------
function parseAddress(fullAddress: string): {
  address: string;
  city: string;
  state: string;
  zipCode: string;
} {
  const parts = fullAddress.replace(" USA", "").trim();
  const zipMatch = parts.match(/(\d{5})(?:-\d{4})?$/);
  const zipCode = zipMatch ? zipMatch[1] : "78705";
  const stateMatch = parts.match(/,?\s*([A-Z]{2})\s+\d{5}/);
  const state = stateMatch ? stateMatch[1] : "TX";
  const cityMatch = parts.match(/([A-Za-z\s]+),?\s*[A-Z]{2}\s+\d{5}/);
  const city = cityMatch ? cityMatch[1].trim() : "Austin";
  const cityIndex = parts.indexOf(city);
  const address =
    cityIndex > 0
      ? parts.substring(0, cityIndex).trim().replace(/,\s*$/, "")
      : parts;
  return { address, city, state, zipCode };
}

function parseWalkTime(distance: string | null): number | null {
  if (!distance) return null;
  const match = distance.match(/(\d+)/);
  return match ? parseInt(match[1]) : null;
}

function decodeDescription(encoded: string | null): string | null {
  if (!encoded) return null;
  try {
    return Buffer.from(encoded, "base64").toString("utf-8");
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Transform a validated raw listing
// ---------------------------------------------------------------------------
function transformListing(raw: RawListing): ScrapedApartment {
  const { address, city, state, zipCode } = parseAddress(raw.address || "");

  let priceMin: number | null = null;
  let priceMax: number | null = null;

  if (raw.min_rent) priceMin = parseFloat(raw.min_rent);
  if (raw.max_rent) priceMax = parseFloat(raw.max_rent);

  if (!priceMin && raw.floorplans && raw.floorplans.length > 0) {
    const rents = raw.floorplans
      .map((fp) => parseFloat(fp.min_rent ?? ""))
      .filter((r) => !isNaN(r) && r > 0);
    if (rents.length > 0) {
      priceMin = Math.min(...rents);
      priceMax = Math.max(
        ...raw.floorplans
          .map((fp) => parseFloat(fp.max_rent ?? ""))
          .filter((r) => !isNaN(r)),
      );
    }
  }

  const floorplans = (raw.floorplans || []).map((fp) => ({
    bedrooms: parseInt(fp.bed ?? "0") || 0,
    bathrooms: parseInt(fp.bath ?? "0") || 1,
    rentMin: parseFloat(fp.min_rent ?? "0") || 0,
    rentMax: parseFloat(fp.max_rent ?? "0") || 0,
    sqft: fp.sq_footage ? parseInt(fp.sq_footage) : null,
  }));

  const images = (raw.images || []).map(
    (img: string) =>
      `https://rcp-prod-uploads.s3.amazonaws.com/property_images/slider_images/${img}`,
  );

  const unitFeatures = Array.isArray(raw.unitFeatures) ? raw.unitFeatures : [];
  const propertyFeatures = Array.isArray(raw.listingFeatures)
    ? raw.listingFeatures
    : [];
  const utilities = Array.isArray(raw.utilities) ? raw.utilities : [];
  const allAmenities = [...unitFeatures, ...propertyFeatures, ...utilities];

  const amenityText = allAmenities.join(" ").toLowerCase();
  const petsAllowed =
    raw.pets_allowed === "All Pets" ||
    raw.pets_allowed === "Some Pets" ||
    amenityText.includes("pet");
  const furnished = amenityText.includes("furnished");
  const hasParking =
    raw.parking_allowed ||
    amenityText.includes("parking") ||
    amenityText.includes("garage");
  const hasPool = amenityText.includes("pool") || amenityText.includes("swim");
  const hasGym = amenityText.includes("fitness") || amenityText.includes("gym");
  const hasLaundry =
    raw.laundry_allowed ||
    amenityText.includes("washer") ||
    amenityText.includes("laundry");

  return {
    id: raw.id,
    name: raw.title || "Unknown",
    slug: raw.slug || `apartment-${raw.id}`,
    address,
    city,
    state,
    zipCode,
    latitude: raw.lat || 0,
    longitude: raw.lng || 0,
    priceMin,
    priceMax,
    pricePerPerson:
      raw.rent_style === "person" || raw.per_person_property === true,
    bedroomMin: parseInt(raw.min_bed ?? "0") || 0,
    bedroomMax: parseInt(raw.max_bed ?? "0") || 0,
    bathroomMin: parseInt(raw.min_bath ?? "0") || 1,
    bathroomMax: parseInt(raw.max_bath ?? "0") || 1,
    phone: raw.contact_number || raw.phone || null,
    email: raw.landlord_email || raw.email || null,
    website: raw.landlord_website || raw.website || null,
    walkTime: parseWalkTime(raw.distance ?? null),
    imageUrl: images[0] || null,
    images,
    neighborhood: determineNeighborhood(address, raw.lat ?? 0, raw.lng ?? 0),
    category: raw.category_title || "Apartment",
    description: decodeDescription(raw.description ?? null),
    amenities: allAmenities,
    unitFeatures,
    propertyFeatures,
    utilities,
    floorplans,
    petsAllowed,
    furnished,
    hasParking,
    hasPool,
    hasGym,
    hasLaundry,
    detailUrl: `https://housing.offcampus.utexas.edu/listing/${raw.slug}`,
  };
}

// ---------------------------------------------------------------------------
// Retry helper
// ---------------------------------------------------------------------------
async function withRetry<T>(
  fn: () => Promise<T>,
  { retries = 3, baseDelay = 2000, label = "operation" } = {},
): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === retries) throw error;
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(
        `   ⚠ ${label} failed (attempt ${attempt}/${retries}), retrying in ${delay}ms...`,
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("unreachable");
}

// ---------------------------------------------------------------------------
// Diff report
// ---------------------------------------------------------------------------
function printDiffReport(
  prev: ScrapedApartment[],
  next: ScrapedApartment[],
) {
  const prevMap = new Map(prev.map((a) => [a.id, a]));
  const nextMap = new Map(next.map((a) => [a.id, a]));

  const added = next.filter((a) => !prevMap.has(a.id));
  const removed = prev.filter((a) => !nextMap.has(a.id));
  const priceChanges: {
    name: string;
    oldPrice: number | null;
    newPrice: number | null;
  }[] = [];

  for (const apt of next) {
    const old = prevMap.get(apt.id);
    if (old && old.priceMin !== apt.priceMin) {
      priceChanges.push({
        name: apt.name,
        oldPrice: old.priceMin,
        newPrice: apt.priceMin,
      });
    }
  }

  console.log("\n📋 Diff Report (vs. previous scrape):");
  console.log(`   Added:   ${added.length} listing(s)`);
  if (added.length > 0 && added.length <= 10) {
    added.forEach((a) => console.log(`     + ${a.name}`));
  }
  console.log(`   Removed: ${removed.length} listing(s)`);
  if (removed.length > 0 && removed.length <= 10) {
    removed.forEach((a) => console.log(`     - ${a.name}`));
  }
  console.log(`   Price changes: ${priceChanges.length}`);
  priceChanges.slice(0, 10).forEach((c) => {
    const old = c.oldPrice ? `$${c.oldPrice}` : "N/A";
    const nw = c.newPrice ? `$${c.newPrice}` : "N/A";
    console.log(`     ~ ${c.name}: ${old} → ${nw}`);
  });
  if (priceChanges.length > 10) {
    console.log(`     ... and ${priceChanges.length - 10} more`);
  }
}

// ---------------------------------------------------------------------------
// Main scraper
// ---------------------------------------------------------------------------
async function scrapeListings(): Promise<ScrapedApartment[]> {
  console.log("🚀 Starting UT Housing scraper...\n");

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log("📡 Loading UT Housing page...");

    await withRetry(
      () =>
        page.goto("https://housing.offcampus.utexas.edu/listing", {
          waitUntil: "networkidle2",
          timeout: 60000,
        }),
      { label: "page load" },
    );

    console.log("⏳ Waiting for listingData to appear on page...");
    await page.waitForFunction(
      () => typeof (window as unknown as Record<string, unknown>).listingData !== "undefined",
      { timeout: 30000 },
    );

    console.log("📦 Extracting listingData...");

    const listingData = await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (window as any).listingData;
    });

    if (!listingData) {
      throw new Error("listingData was undefined after waitForFunction");
    }

    const rawEntries = Object.values(listingData);
    console.log(`✅ Found ${rawEntries.length} raw entries`);

    let validationSkipped = 0;
    const validRaw: RawListing[] = [];
    for (const entry of rawEntries) {
      const result = validateRawListing(entry);
      if (result.valid) {
        validRaw.push(entry as RawListing);
      } else {
        validationSkipped++;
        if (validationSkipped <= 5) {
          console.log(`   ⚠ Skipped invalid: ${result.reason}`);
        }
      }
    }

    if (validationSkipped > 5) {
      console.log(
        `   ⚠ ... and ${validationSkipped - 5} more invalid entries`,
      );
    }
    console.log(
      `✅ ${validRaw.length} passed validation, ${validationSkipped} skipped`,
    );

    const apartments = validRaw.map(transformListing);
    const validApartments = apartments.filter(
      (apt) => apt.name && apt.latitude !== 0 && apt.longitude !== 0,
    );

    console.log(`✅ Transformed ${validApartments.length} valid listings`);

    await browser.close();
    return validApartments;
  } catch (error) {
    console.error("❌ Error during scraping:", error);
    await browser.close();
    throw error;
  }
}

async function main() {
  try {
    const outputPath = path.join(__dirname, "scraped-apartments.json");

    // Load previous data for diff if it exists
    let previousData: ScrapedApartment[] | null = null;
    if (fs.existsSync(outputPath)) {
      try {
        previousData = JSON.parse(fs.readFileSync(outputPath, "utf-8"));
      } catch {
        console.log("⚠ Could not parse previous scrape data, skipping diff");
      }
    }

    const apartments = await scrapeListings();

    // Save to JSON file
    fs.writeFileSync(outputPath, JSON.stringify(apartments, null, 2));
    console.log(`\n📁 Exported ${apartments.length} apartments to ${outputPath}`);

    // Diff report
    if (previousData && previousData.length > 0) {
      printDiffReport(previousData, apartments);
    } else {
      console.log("\n📋 No previous data found — skipping diff report");
    }

    // Summary
    const withPrices = apartments.filter((a) => a.priceMin !== null);
    const neighborhoods = [...new Set(apartments.map((a) => a.neighborhood))];

    console.log("\n📊 Summary:");
    console.log(`   Total apartments: ${apartments.length}`);
    console.log(`   With prices: ${withPrices.length}`);
    console.log(`   Neighborhoods: ${neighborhoods.join(", ")}`);

    const prices = withPrices.map((a) => a.priceMin!).filter((p) => p > 0);
    if (prices.length > 0) {
      console.log(
        `   Price range: $${Math.min(...prices)} - $${Math.max(...withPrices.map((a) => a.priceMax || 0))}`,
      );
    }
  } catch (error) {
    console.error("Failed to scrape:", error);
    process.exit(1);
  }
}

main();
