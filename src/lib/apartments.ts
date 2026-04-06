import { prisma } from "./db";
import type { Prisma } from "@prisma/client";
import type { ApartmentCard } from "@/types";

/** Shared caps for listing queries (API + server components). */
export const APARTMENT_LIST_MAX_PAGE = 500;
export const APARTMENT_LIST_MAX_LIMIT = 100;

export const cardInclude = {
  neighborhood: true,
  floorPlans: true,
  images: {
    where: { isPrimary: true },
    take: 1,
  },
} satisfies Prisma.ApartmentInclude;

type ApartmentForCard = Prisma.ApartmentGetPayload<{
  include: typeof cardInclude;
}>;

export function computeFloorPlanSummary(floorPlans: { priceMin: number; priceMax: number | null; bedrooms: number }[]) {
  const prices = floorPlans.map((fp) => fp.priceMin);
  const maxPrices = floorPlans.map((fp) => fp.priceMax || fp.priceMin);
  const bedroomNums = [
    ...new Set(floorPlans.map((fp) => fp.bedrooms)),
  ].sort((a, b) => a - b);

  const bedroomRange =
    bedroomNums.length === 0
      ? "N/A"
      : bedroomNums.length === 1
        ? bedroomNums[0] === 0
          ? "Studio"
          : `${bedroomNums[0]} Bed`
        : `${bedroomNums[0] === 0 ? "Studio" : bedroomNums[0]} - ${bedroomNums[bedroomNums.length - 1]} Bed`;

  return {
    priceMin: prices.length > 0 ? Math.min(...prices) : 0,
    priceMax: maxPrices.length > 0 ? Math.max(...maxPrices) : null,
    bedroomRange,
  };
}

export function toApartmentCard(apt: ApartmentForCard): ApartmentCard {
  const { priceMin, priceMax, bedroomRange } = computeFloorPlanSummary(apt.floorPlans);

  return {
    id: apt.id,
    name: apt.name,
    slug: apt.slug,
    address: apt.address,
    latitude: apt.latitude,
    longitude: apt.longitude,
    neighborhood: { name: apt.neighborhood.name, slug: apt.neighborhood.slug },
    imageUrl: apt.images[0]?.url || apt.imageUrl,
    walkTime: apt.walkTime,
    priceMin: apt.minPrice ?? priceMin,
    priceMax: apt.maxPrice ?? priceMax,
    bedroomRange,
    featured: apt.featured,
  };
}

export function buildWhereClause(params: {
  search?: string | null;
  neighborhood?: string | null;
  minPrice?: string | null;
  maxPrice?: string | null;
  bedrooms?: string | null;
  petFriendly?: string | null;
  availableNow?: string | null;
  amenityIds?: string | null;
}): Prisma.ApartmentWhereInput {
  const conditions: Prisma.ApartmentWhereInput[] = [{ available: true }];

  if (params.neighborhood) {
    conditions.push({ neighborhood: { slug: params.neighborhood } });
  }

  if (params.petFriendly === "true") {
    conditions.push({ petFriendly: true });
  }

  if (params.search) {
    conditions.push({
      OR: [
        { name: { contains: params.search, mode: "insensitive" } },
        { address: { contains: params.search, mode: "insensitive" } },
      ],
    });
  }

  const fpConditions: Prisma.FloorPlanWhereInput = {};

  if (params.minPrice || params.maxPrice) {
    const min = params.minPrice ? parseInt(params.minPrice) : NaN;
    const max = params.maxPrice ? parseInt(params.maxPrice) : NaN;
    const priceFilter: Record<string, number> = {};
    if (!isNaN(min)) priceFilter.gte = min;
    if (!isNaN(max)) priceFilter.lte = max;
    if (Object.keys(priceFilter).length > 0) {
      fpConditions.priceMin = priceFilter;
    }
  }

  if (params.bedrooms) {
    const parsed = params.bedrooms.split(",").map(Number).filter((n) => !isNaN(n));
    if (parsed.length > 0) fpConditions.bedrooms = { in: parsed };
  }

  if (params.availableNow === "true") {
    fpConditions.availableNow = true;
  }

  if (Object.keys(fpConditions).length > 0) {
    conditions.push({ floorPlans: { some: fpConditions } });
  }

  if (params.amenityIds) {
    for (const id of params.amenityIds.split(",")) {
      conditions.push({
        amenities: { some: { amenityId: id } },
      });
    }
  }

  return conditions.length === 1 ? conditions[0] : { AND: conditions };
}

function buildOrderBy(sort: string): Prisma.ApartmentOrderByWithRelationInput[] {
  switch (sort) {
    case "price-asc":
      return [{ minPrice: { sort: "asc", nulls: "last" } }];
    case "price-desc":
      return [{ minPrice: { sort: "desc", nulls: "last" } }];
    case "distance":
      return [{ walkTime: { sort: "asc", nulls: "last" } }];
    case "newest":
      return [{ createdAt: "desc" }];
    default:
      return [{ minPrice: { sort: "asc", nulls: "last" } }];
  }
}

export async function queryApartmentCards(options: {
  where?: Prisma.ApartmentWhereInput;
  sort?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: ApartmentCard[]; total: number }> {
  const {
    where = { available: true },
    sort = "price-asc",
    page,
    limit,
  } = options;

  const orderBy = buildOrderBy(sort);
  const safePage =
    page !== undefined && Number.isFinite(page)
      ? Math.min(APARTMENT_LIST_MAX_PAGE, Math.max(1, Math.floor(page)))
      : undefined;
  const safeLimit =
    limit !== undefined && Number.isFinite(limit)
      ? Math.min(APARTMENT_LIST_MAX_LIMIT, Math.max(1, Math.floor(limit)))
      : Math.min(APARTMENT_LIST_MAX_LIMIT, 50);
  const skip =
    safePage !== undefined && safeLimit !== undefined
      ? (safePage - 1) * safeLimit
      : undefined;
  const take = safeLimit;

  const [apartments, total] = await Promise.all([
    prisma.apartment.findMany({
      where,
      include: cardInclude,
      orderBy,
      skip,
      take,
    }),
    prisma.apartment.count({ where }),
  ]);

  return {
    data: apartments.map(toApartmentCard),
    total,
  };
}
