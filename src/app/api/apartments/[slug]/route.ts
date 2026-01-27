import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type AmenityGroup = { id: string; name: string; icon: string | null };

type ApartmentAmenityWithDetails = {
  amenity: {
    id: string;
    name: string;
    category: string;
    icon: string | null;
  };
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    const apartment = await prisma.apartment.findUnique({
      where: { slug },
      include: {
        neighborhood: true,
        floorPlans: {
          orderBy: [{ bedrooms: "asc" }, { priceMin: "asc" }],
        },
        amenities: {
          include: {
            amenity: true,
          },
        },
        images: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!apartment) {
      return NextResponse.json(
        { error: "Apartment not found" },
        { status: 404 },
      );
    }

    // Transform amenities to grouped format
    const groupedAmenities = apartment.amenities.reduce<
      Record<string, AmenityGroup[]>
    >(
      (
        acc: Record<string, AmenityGroup[]>,
        aptAmenity: ApartmentAmenityWithDetails,
      ) => {
        const category = aptAmenity.amenity.category;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push({
          id: aptAmenity.amenity.id,
          name: aptAmenity.amenity.name,
          icon: aptAmenity.amenity.icon,
        });
        return acc;
      },
      {},
    );

    return NextResponse.json({
      ...apartment,
      groupedAmenities,
    });
  } catch (error) {
    console.error("Error fetching apartment:", error);
    return NextResponse.json(
      { error: "Failed to fetch apartment" },
      { status: 500 },
    );
  }
}
