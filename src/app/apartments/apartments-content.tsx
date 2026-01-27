"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ApartmentCardComponent } from "@/components/apartments/apartment-card";
import { SearchFiltersComponent } from "@/components/apartments/search-filters";
import { Select } from "@/components/ui/select";
import type { ApartmentCard, SearchFilters } from "@/types";

type Neighborhood = { id: string; name: string; slug: string };
type Amenity = { id: string; name: string; category: string };

export function ApartmentsContent() {
  const searchParams = useSearchParams();
  const initialNeighborhood = searchParams.get("neighborhood") || undefined;

  const [apartments, setApartments] = useState<ApartmentCard[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>({
    neighborhood: initialNeighborhood,
  });
  const [sortBy, setSortBy] = useState<string>("price-asc");
  const [compareList, setCompareList] = useState<string[]>([]);

  // Fetch data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [apartmentsRes, neighborhoodsRes, amenitiesRes] =
          await Promise.all([
            fetch("/api/apartments"),
            fetch("/api/neighborhoods"),
            fetch("/api/amenities"),
          ]);

        const apartmentsData = await apartmentsRes.json();
        const neighborhoodsData = await neighborhoodsRes.json();
        const amenitiesData = await amenitiesRes.json();

        setApartments(apartmentsData);
        setNeighborhoods(neighborhoodsData);
        setAmenities(amenitiesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Re-fetch when filters change
  useEffect(() => {
    async function fetchFiltered() {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.neighborhood)
        params.set("neighborhood", filters.neighborhood);
      if (filters.minPrice) params.set("minPrice", filters.minPrice.toString());
      if (filters.maxPrice) params.set("maxPrice", filters.maxPrice.toString());
      if (filters.bedrooms?.length)
        params.set("bedrooms", filters.bedrooms.join(","));
      if (filters.petFriendly) params.set("petFriendly", "true");
      if (filters.availableNow) params.set("availableNow", "true");
      params.set("sort", sortBy);

      try {
        const res = await fetch(`/api/apartments?${params.toString()}`);
        const data = await res.json();
        setApartments(data);
      } catch (error) {
        console.error("Error fetching filtered apartments:", error);
      }
    }

    if (!loading) {
      fetchFiltered();
    }
  }, [filters, sortBy, loading]);

  const handleCompareToggle = (id: string) => {
    setCompareList((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      if (prev.length >= 4) {
        return prev;
      }
      return [...prev, id];
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 min-h-[60vh]">
        <div className="relative">
          {/* Spinning ring */}
          <div className="w-16 h-16 border-4 border-gray-200 border-t-burnt-orange rounded-full animate-spin" />
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">🏠</span>
          </div>
        </div>
        <h3 className="mt-6 text-lg font-semibold text-gray-900">
          Finding Your Perfect Home
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Searching through apartments near UT...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <SearchFiltersComponent
        neighborhoods={neighborhoods}
        amenities={amenities}
        onFiltersChange={setFilters}
        initialFilters={filters}
      />

      {/* Results header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          <span className="font-medium">{apartments.length}</span> apartments
          found
        </p>
        <div className="flex items-center gap-4">
          {compareList.length > 0 && (
            <a
              href={`/compare?ids=${compareList.join(",")}`}
              className="text-sm font-medium text-burnt-orange hover:underline"
            >
              Compare ({compareList.length})
            </a>
          )}
          <Select
            options={[
              { value: "price-asc", label: "Price: Low to High" },
              { value: "price-desc", label: "Price: High to Low" },
              { value: "distance", label: "Distance to Campus" },
            ]}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          />
        </div>
      </div>

      {/* Apartment grid */}
      {apartments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No apartments found matching your criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apartments.map((apartment) => (
            <ApartmentCardComponent
              key={apartment.id}
              apartment={apartment}
              isComparing={compareList.includes(apartment.id)}
              onCompareToggle={() => handleCompareToggle(apartment.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
