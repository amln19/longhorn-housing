import type {
  Apartment,
  FloorPlan,
  Neighborhood,
  Amenity,
  ApartmentImage,
} from "@prisma/client";

export type ApartmentWithRelations = Apartment & {
  neighborhood: Neighborhood;
  floorPlans: FloorPlan[];
  amenities: ApartmentAmenityWithAmenity[];
  images: ApartmentImage[];
};

export type ApartmentAmenityWithAmenity = {
  id: string;
  apartmentId: string;
  amenityId: string;
  amenity: Amenity;
};

export type ApartmentCard = {
  id: string;
  name: string;
  slug: string;
  address: string;
  neighborhood: { name: string; slug: string };
  imageUrl: string | null;
  walkTime: number | null;
  priceMin: number;
  priceMax: number | null;
  bedroomRange: string;
  featured: boolean;
};

export type SearchFilters = {
  search?: string;
  neighborhood?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number[];
  amenities?: string[];
  petFriendly?: boolean;
  availableNow?: boolean;
};

export type SortOption = "price-asc" | "price-desc" | "distance" | "newest";
