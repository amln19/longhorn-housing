import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { computeFloorPlanSummary } from "@/lib/apartments";
import { formatPriceRange } from "@/lib/utils";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const rateLimited = await checkRateLimit(request);
  if (rateLimited) return rateLimited;

  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get("ids")?.split(",").filter(Boolean) || [];

    if (ids.length === 0) {
      return NextResponse.json([]);
    }

    if (ids.length > 4) {
      return NextResponse.json(
        { error: "Maximum 4 apartments can be compared" },
        { status: 400 },
      );
    }

    const apartments = await prisma.apartment.findMany({
      where: { id: { in: ids } },
      include: {
        neighborhood: true,
        floorPlans: {
          orderBy: [{ bedrooms: "asc" }, { priceMin: "asc" }],
        },
        amenities: {
          include: { amenity: true },
        },
      },
    });

    const byId = new Map(apartments.map((apt) => [apt.id, apt]));
    const ordered = ids
      .map((id) => byId.get(id))
      .filter((apt): apt is (typeof apartments)[number] => apt != null);

    const result = ordered.map((apt) => {
      const { priceMin, priceMax, bedroomRange } = computeFloorPlanSummary(
        apt.floorPlans,
      );

      return {
        id: apt.id,
        name: apt.name,
        slug: apt.slug,
        address: apt.address,
        neighborhood: {
          name: apt.neighborhood.name,
          slug: apt.neighborhood.slug,
        },
        walkTime: apt.walkTime,
        petFriendly: apt.petFriendly,
        parkingType: apt.parkingType,
        yearBuilt: apt.yearBuilt,
        priceMin,
        priceMax,
        priceRange: formatPriceRange(priceMin, priceMax) + "/mo",
        bedroomRange,
        amenities: apt.amenities.map((a) => a.amenity.name),
      };
    });

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Error fetching compare apartments:", error);
    return NextResponse.json(
      { error: "Failed to fetch apartments for comparison" },
      { status: 500 },
    );
  }
}
