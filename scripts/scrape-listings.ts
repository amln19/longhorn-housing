/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * UT Austin Off-Campus Housing Scraper
 * Extracts listing data directly from the listingData JavaScript variable
 */

import "dotenv/config";
import puppeteer from "puppeteer";
import * as fs from "fs";
import * as path from "path";

// Types for our transformed data
interface ScrapedApartment {
  id: number;
  name: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  priceMin: number | null;
  priceMax: number | null;
  pricePerPerson: boolean;
  bedroomMin: number;
  bedroomMax: number;
  bathroomMin: number;
  bathroomMax: number;
  phone: string | null;
  email: string | null;
  website: string | null;
  walkTime: number | null;
  imageUrl: string | null;
  images: string[];
  neighborhood: string;
  category: string;
  description: string | null;
  amenities: string[];
  unitFeatures: string[];
  propertyFeatures: string[];
  utilities: string[];
  floorplans: Array<{
    bedrooms: number;
    bathrooms: number;
    rentMin: number;
    rentMax: number;
    sqft: number | null;
  }>;
  petsAllowed: boolean;
  furnished: boolean;
  hasParking: boolean;
  hasPool: boolean;
  hasGym: boolean;
  hasLaundry: boolean;
  detailUrl: string;
}

// Parse address components from full address string
function parseAddress(fullAddress: string): {
  address: string;
  city: string;
  state: string;
  zipCode: string;
} {
  // Format: "701 West 28th Street Austin, TX 78705 USA"
  const parts = fullAddress.replace(" USA", "").trim();

  // Try to extract zip code
  const zipMatch = parts.match(/(\d{5})(?:-\d{4})?$/);
  const zipCode = zipMatch ? zipMatch[1] : "78705";

  // Try to extract state
  const stateMatch = parts.match(/,?\s*([A-Z]{2})\s+\d{5}/);
  const state = stateMatch ? stateMatch[1] : "TX";

  // Try to extract city
  const cityMatch = parts.match(/([A-Za-z\s]+),?\s*[A-Z]{2}\s+\d{5}/);
  const city = cityMatch ? cityMatch[1].trim() : "Austin";

  // Street address is everything before the city
  const cityIndex = parts.indexOf(city);
  const address =
    cityIndex > 0
      ? parts.substring(0, cityIndex).trim().replace(/,\s*$/, "")
      : parts;

  return { address, city, state, zipCode };
}

// Parse walk time from distance string like "9 mins"
function parseWalkTime(distance: string | null): number | null {
  if (!distance) return null;
  const match = distance.match(/(\d+)/);
  return match ? parseInt(match[1]) : null;
}

// Determine neighborhood based on address and coordinates
function determineNeighborhood(
  address: string,
  lat: number,
  lng: number,
): string {
  const addr = address.toLowerCase();

  // West Campus: Generally west of Guadalupe, north of MLK
  if (lat > 30.28 && lat < 30.295 && lng > -97.755 && lng < -97.735) {
    return "West Campus";
  }

  // North Campus: North of 30th St
  if (lat > 30.295 && lat < 30.315 && lng > -97.75 && lng < -97.72) {
    return "North Campus";
  }

  // Hyde Park: Further north
  if (lat > 30.3 && lng > -97.735 && lng < -97.71) {
    return "Hyde Park";
  }

  // East Campus: East of I-35
  if (lng > -97.72) {
    return "East Campus";
  }

  // Riverside: South of the river
  if (lat < 30.25) {
    return "Riverside";
  }

  // Far West / Far Campus
  if (lng < -97.76) {
    return "Far Campus";
  }

  // Default based on address keywords
  if (
    addr.includes("west") ||
    addr.includes("rio grande") ||
    addr.includes("nueces") ||
    addr.includes("pearl") ||
    addr.includes("san antonio")
  ) {
    return "West Campus";
  }
  if (
    addr.includes("speedway") ||
    addr.includes("duval") ||
    addr.includes("avenue")
  ) {
    return "North Campus";
  }

  return "Other";
}

// Decode base64 description
function decodeDescription(encoded: string | null): string | null {
  if (!encoded) return null;
  try {
    return Buffer.from(encoded, "base64").toString("utf-8");
  } catch {
    return null;
  }
}

// Transform raw listing to our format
function transformListing(raw: any): ScrapedApartment {
  const { address, city, state, zipCode } = parseAddress(raw.address || "");

  // Get price from floorplans or direct fields
  let priceMin: number | null = null;
  let priceMax: number | null = null;

  if (raw.min_rent) {
    priceMin = parseFloat(raw.min_rent);
  }
  if (raw.max_rent) {
    priceMax = parseFloat(raw.max_rent);
  }

  // If no direct prices, calculate from floorplans
  if (!priceMin && raw.floorplans?.length > 0) {
    const rents = raw.floorplans
      .map((fp: any) => parseFloat(fp.min_rent))
      .filter((r: number) => !isNaN(r) && r > 0);
    if (rents.length > 0) {
      priceMin = Math.min(...rents);
      priceMax = Math.max(
        ...raw.floorplans
          .map((fp: any) => parseFloat(fp.max_rent))
          .filter((r: number) => !isNaN(r)),
      );
    }
  }

  // Transform floorplans
  const floorplans = (raw.floorplans || []).map((fp: any) => ({
    bedrooms: parseInt(fp.bed) || 0,
    bathrooms: parseInt(fp.bath) || 1,
    rentMin: parseFloat(fp.min_rent) || 0,
    rentMax: parseFloat(fp.max_rent) || 0,
    sqft: fp.sq_footage ? parseInt(fp.sq_footage) : null,
  }));

  // Get image URLs
  const images = (raw.images || []).map(
    (img: string) =>
      `https://rcp-prod-uploads.s3.amazonaws.com/property_images/slider_images/${img}`,
  );

  // Get all amenity strings
  const unitFeatures = Array.isArray(raw.unitFeatures) ? raw.unitFeatures : [];
  const propertyFeatures = Array.isArray(raw.listingFeatures)
    ? raw.listingFeatures
    : [];
  const utilities = Array.isArray(raw.utilities) ? raw.utilities : [];
  const allAmenities = [...unitFeatures, ...propertyFeatures, ...utilities];

  // Detect features
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
    bedroomMin: parseInt(raw.min_bed) || 0,
    bedroomMax: parseInt(raw.max_bed) || 0,
    bathroomMin: parseInt(raw.min_bath) || 1,
    bathroomMax: parseInt(raw.max_bath) || 1,
    phone: raw.contact_number || raw.phone || null,
    email: raw.landlord_email || raw.email || null,
    website: raw.landlord_website || raw.website || null,
    walkTime: parseWalkTime(raw.distance),
    imageUrl: images[0] || null,
    images,
    neighborhood: determineNeighborhood(address, raw.lat, raw.lng),
    category: raw.category_title || "Apartment",
    description: decodeDescription(raw.description),
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

async function scrapeListings(): Promise<ScrapedApartment[]> {
  console.log("🚀 Starting UT Housing scraper...\n");

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log("📡 Loading UT Housing page...");
    await page.goto("https://housing.offcampus.utexas.edu/listing", {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    // Wait for the data to load
    await new Promise((r) => setTimeout(r, 3000));

    console.log("📦 Extracting listingData from page...");

    // Extract the listingData global variable
    const listingData = await page.evaluate(() => {
      return (window as any).listingData;
    });

    if (!listingData) {
      throw new Error("listingData not found on page");
    }

    // Convert to array and transform
    const rawListings = Object.values(listingData) as any[];
    console.log(`✅ Found ${rawListings.length} raw listings`);

    // Transform all listings
    const apartments = rawListings.map(transformListing);

    // Filter out any with missing critical data
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
    const apartments = await scrapeListings();

    // Save to JSON file
    const outputPath = path.join(__dirname, "scraped-apartments.json");
    fs.writeFileSync(outputPath, JSON.stringify(apartments, null, 2));
    console.log(`\n📁 Exported data to ${outputPath}`);

    // Print summary
    const withPrices = apartments.filter((a) => a.priceMin !== null);
    const neighborhoods = [...new Set(apartments.map((a) => a.neighborhood))];
    const categories = [...new Set(apartments.map((a) => a.category))];

    console.log("\n📊 Summary:");
    console.log(`   Total apartments: ${apartments.length}`);
    console.log(`   With prices: ${withPrices.length}`);
    console.log(`   Neighborhoods: ${neighborhoods.join(", ")}`);
    console.log(`   Categories: ${categories.join(", ")}`);

    // Print price range
    const prices = withPrices.map((a) => a.priceMin!).filter((p) => p > 0);
    if (prices.length > 0) {
      console.log(
        `   Price range: $${Math.min(...prices)} - $${Math.max(...withPrices.map((a) => a.priceMax || 0))}`,
      );
    }

    // Print first 10 apartments
    console.log("\n🏠 Sample apartments:");
    apartments.slice(0, 10).forEach((apt, i) => {
      const price = apt.priceMin
        ? `$${apt.priceMin}${apt.priceMax && apt.priceMax !== apt.priceMin ? `-$${apt.priceMax}` : ""}`
        : "Call for price";
      console.log(`   ${i + 1}. ${apt.name} (${apt.neighborhood}) - ${price}`);
    });
  } catch (error) {
    console.error("Failed to scrape:", error);
    process.exit(1);
  }
}

main();
