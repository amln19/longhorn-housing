import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Define FloorPlan type for type safety
type FloorPlan = {
  id: string;
  priceMin: number;
  priceMax: number | null;
  bedrooms: number;
  bathrooms: number;
  sqft: number | null;
  availableNow: boolean;
};

type ApartmentWithRelations = {
  id: string;
  name: string;
  slug: string;
  address: string;
  latitude: number;
  longitude: number;
  walkTime: number | null;
  petFriendly: boolean;
  featured: boolean;
  available: boolean;
  imageUrl: string | null;
  neighborhood: { id: string; name: string; slug: string };
  floorPlans: FloorPlan[];
  amenities: { amenity: { id: string; name: string; category: string } }[];
  images: { url: string; isPrimary: boolean }[];
};

type ApartmentCard = {
  id: string;
  name: string;
  slug: string;
  address: string;
  latitude: number;
  longitude: number;
  neighborhood: { name: string; slug: string };
  imageUrl: string | null;
  walkTime: number | null;
  priceMin: number;
  priceMax: number | null;
  bedroomRange: string;
  featured: boolean;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search");
    const neighborhood = searchParams.get("neighborhood");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const bedrooms = searchParams.get("bedrooms");
    const petFriendly = searchParams.get("petFriendly");
    const availableNow = searchParams.get("availableNow");
    const sort = searchParams.get("sort") || "price-asc";

    // Build where clause
    const where: {
      available?: boolean;
      petFriendly?: boolean;
      neighborhood?: { slug: string };
      OR?: Array<{
        name?: { contains: string; mode: "insensitive" };
        address?: { contains: string; mode: "insensitive" };
      }>;
    } = {
      available: true,
    };

    if (neighborhood) {
      where.neighborhood = {
        slug: neighborhood,
      };
    }

    if (petFriendly === "true") {
      where.petFriendly = true;
    }

    // Add search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get apartments with relations
    let apartments: ApartmentWithRelations[] = await prisma.apartment.findMany({
      where,
      include: {
        neighborhood: true,
        floorPlans: true,
        amenities: {
          include: {
            amenity: true,
          },
        },
        images: {
          where: { isPrimary: true },
          take: 1,
        },
      },
    });

    // Filter by price (using floor plans)
    if (minPrice || maxPrice) {
      apartments = apartments.filter((apt: ApartmentWithRelations) => {
        const prices = apt.floorPlans.map((fp: FloorPlan) => fp.priceMin);
        if (prices.length === 0) return true;

        const lowestPrice = Math.min(...prices);

        if (minPrice && lowestPrice < parseInt(minPrice)) return false;
        if (maxPrice && lowestPrice > parseInt(maxPrice)) return false;

        return true;
      });
    }

    // Filter by bedrooms
    if (bedrooms) {
      const bedroomList = bedrooms.split(",").map(Number);
      apartments = apartments.filter((apt: ApartmentWithRelations) => {
        const aptBedrooms = apt.floorPlans.map((fp: FloorPlan) => fp.bedrooms);
        return bedroomList.some((b) => aptBedrooms.includes(b));
      });
    }

    // Filter by availability
    if (availableNow === "true") {
      apartments = apartments.filter((apt: ApartmentWithRelations) =>
        apt.floorPlans.some((fp: FloorPlan) => fp.availableNow),
      );
    }

    // Transform to card format
    const cards: ApartmentCard[] = apartments.map(
      (apt: ApartmentWithRelations) => {
        const prices = apt.floorPlans.map((fp: FloorPlan) => fp.priceMin);
        const maxPrices = apt.floorPlans.map(
          (fp: FloorPlan) => fp.priceMax || fp.priceMin,
        );
        const bedroomNums = [
          ...new Set(apt.floorPlans.map((fp: FloorPlan) => fp.bedrooms)),
        ].sort((a: number, b: number) => a - b);

        const bedroomRange =
          bedroomNums.length === 0
            ? "N/A"
            : bedroomNums.length === 1
              ? bedroomNums[0] === 0
                ? "Studio"
                : `${bedroomNums[0]} Bed`
              : `${bedroomNums[0] === 0 ? "Studio" : bedroomNums[0]} - ${bedroomNums[bedroomNums.length - 1]} Bed`;

        return {
          id: apt.id,
          name: apt.name,
          slug: apt.slug,
          address: apt.address,
          latitude: apt.latitude,
          longitude: apt.longitude,
          neighborhood: {
            name: apt.neighborhood.name,
            slug: apt.neighborhood.slug,
          },
          imageUrl: apt.images[0]?.url || apt.imageUrl,
          walkTime: apt.walkTime,
          priceMin: prices.length > 0 ? Math.min(...prices) : 0,
          priceMax: maxPrices.length > 0 ? Math.max(...maxPrices) : null,
          bedroomRange,
          featured: apt.featured,
        };
      },
    );

    // Sort
    switch (sort) {
      case "price-asc":
        cards.sort(
          (a: ApartmentCard, b: ApartmentCard) => a.priceMin - b.priceMin,
        );
        break;
      case "price-desc":
        cards.sort(
          (a: ApartmentCard, b: ApartmentCard) => b.priceMin - a.priceMin,
        );
        break;
      case "distance":
        cards.sort(
          (a: ApartmentCard, b: ApartmentCard) =>
            (a.walkTime || 999) - (b.walkTime || 999),
        );
        break;
    }

    return NextResponse.json(cards);
  } catch (error) {
    console.error("Error fetching apartments:", error);
    return NextResponse.json(
      { error: "Failed to fetch apartments" },
      { status: 500 },
    );
  }
}
