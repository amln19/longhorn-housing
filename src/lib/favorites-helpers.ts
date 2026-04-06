import type { ApartmentCard } from "@/types";

/** Shape of each row returned by `GET /api/favorites` (nested `apartment` for cards). */
export type FavoriteWithApartment = {
  apartmentId: string;
  apartment: {
    id: string;
    name: string;
    slug: string;
    address: string;
    latitude: number;
    longitude: number;
    imageUrl: string | null;
    walkTime: number | null;
    featured: boolean;
    neighborhood: { name: string; slug: string };
    floorPlans: { priceMin: number; priceMax: number | null; bedrooms: number }[];
    images: { url: string }[];
  };
};

export function computeCardFromFavorite(fav: FavoriteWithApartment): ApartmentCard {
  const apt = fav.apartment;
  const fps = apt.floorPlans;

  const prices = fps.map((fp) => fp.priceMin);
  const maxPrices = fps.map((fp) => fp.priceMax || fp.priceMin);
  const bedroomNums = [...new Set(fps.map((fp) => fp.bedrooms))].sort((a, b) => a - b);

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
    neighborhood: { name: apt.neighborhood.name, slug: apt.neighborhood.slug },
    imageUrl: apt.images[0]?.url || apt.imageUrl,
    walkTime: apt.walkTime,
    priceMin: prices.length > 0 ? Math.min(...prices) : 0,
    priceMax: maxPrices.length > 0 ? Math.max(...maxPrices) : null,
    bedroomRange,
    featured: apt.featured,
  };
}
