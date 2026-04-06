import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { ErrorBoundary } from "@/components/error-boundary";
import { prisma } from "@/lib/db";
import CompareContent from "./compare-content";
import { formatPriceRange } from "@/lib/utils";

export const revalidate = 3600;

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-burnt-orange mx-auto mb-4" />
        <p className="text-text-muted">Loading comparison...</p>
      </div>
    </div>
  );
}

type CompareApartment = {
  id: string;
  name: string;
  slug: string;
  address: string;
  neighborhood: { name: string; slug: string };
  walkTime: number | null;
  petFriendly: boolean;
  parkingType: string | null;
  yearBuilt: number | null;
  priceMin: number;
  priceMax: number | null;
  priceRange: string;
  bedroomRange: string;
  amenities: string[];
};

async function CompareDataLoader({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const idStr = typeof params.ids === "string" ? params.ids : "";
  const ids = idStr.split(",").filter(Boolean).slice(0, 4);

  if (ids.length === 0) {
    return <CompareContent apartments={[]} />;
  }

  const raw = await prisma.apartment.findMany({
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

  const byId = new Map(raw.map((apt) => [apt.id, apt]));
  const ordered = ids
    .map((id) => byId.get(id))
    .filter((apt): apt is (typeof raw)[number] => apt != null);

  const apartments: CompareApartment[] = ordered.map((apt) => {
    const prices = apt.floorPlans.map((fp) => fp.priceMin);
    const maxPrices = apt.floorPlans.map((fp) => fp.priceMax || fp.priceMin);
    const bedroomNums = [
      ...new Set(apt.floorPlans.map((fp) => fp.bedrooms)),
    ].sort((a, b) => a - b);

    const bedroomRange =
      bedroomNums.length === 0
        ? "N/A"
        : bedroomNums.length === 1
          ? bedroomNums[0] === 0
            ? "Studio"
            : `${bedroomNums[0]} Bed`
          : `${bedroomNums[0] === 0 ? "Studio" : bedroomNums[0]} - ${bedroomNums[bedroomNums.length - 1]} Bed`;

    const priceMin = prices.length > 0 ? Math.min(...prices) : 0;
    const priceMax = maxPrices.length > 0 ? Math.max(...maxPrices) : null;

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

  return <CompareContent apartments={apartments} />;
}

export default function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <CompareDataLoader searchParams={searchParams} />
      </Suspense>
    </ErrorBoundary>
  );
}
