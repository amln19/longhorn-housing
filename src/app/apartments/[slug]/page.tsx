import { cache } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import ApartmentDetail from "./apartment-detail-client";

export const revalidate = 3600;

type Props = {
  params: Promise<{ slug: string }>;
};

const getApartment = cache(async (slug: string) => {
  return prisma.apartment.findUnique({
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
});

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const apartment = await getApartment(slug);

  if (!apartment) {
    return { title: "Not Found | Longhorn Housing" };
  }

  return {
    title: `${apartment.name} | Longhorn Housing`,
    description:
      apartment.description?.slice(0, 160) ||
      `View details, floor plans, and amenities for ${apartment.name} near UT Austin.`,
  };
}

export default async function ApartmentDetailPage({ params }: Props) {
  const { slug } = await params;
  const apartment = await getApartment(slug);

  if (!apartment) notFound();

  const groupedAmenities = apartment.amenities.reduce<
    Record<string, { id: string; name: string; icon: string | null }[]>
  >((acc, aptAmenity) => {
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
  }, {});

  return (
    <ApartmentDetail
      apartment={{
        id: apartment.id,
        name: apartment.name,
        slug: apartment.slug,
        address: apartment.address,
        city: apartment.city,
        state: apartment.state,
        zipCode: apartment.zipCode,
        latitude: apartment.latitude,
        longitude: apartment.longitude,
        neighborhood: {
          id: apartment.neighborhood.id,
          name: apartment.neighborhood.name,
          slug: apartment.neighborhood.slug,
        },
        phone: apartment.phone,
        email: apartment.email,
        website: apartment.website,
        walkTime: apartment.walkTime,
        yearBuilt: apartment.yearBuilt,
        totalUnits: apartment.totalUnits,
        petFriendly: apartment.petFriendly,
        parkingType: apartment.parkingType,
        description: apartment.description,
        imageUrl: apartment.imageUrl,
        featured: apartment.featured,
        floorPlans: apartment.floorPlans.map((fp) => ({
          id: fp.id,
          name: fp.name,
          bedrooms: fp.bedrooms,
          bathrooms: fp.bathrooms,
          sqft: fp.sqft,
          priceMin: fp.priceMin,
          priceMax: fp.priceMax,
          pricePerPerson: fp.pricePerPerson,
          availableNow: fp.availableNow,
        })),
        images: apartment.images.map((img) => ({
          url: img.url,
          caption: img.caption,
        })),
      }}
      groupedAmenities={groupedAmenities}
    />
  );
}
