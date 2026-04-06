"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ApartmentCardComponent } from "@/components/apartments/apartment-card";
import { SearchFiltersComponent } from "@/components/apartments/search-filters";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import { useCompareList } from "@/hooks/use-compare-list";
import { Loader2 } from "lucide-react";
import type { ApartmentCard, SearchFilters } from "@/types";

type Neighborhood = { id: string; name: string; slug: string };
type Amenity = { id: string; name: string; category: string };

interface ApartmentsContentProps {
  initialApartments: ApartmentCard[];
  initialTotal: number;
  neighborhoods: Neighborhood[];
  amenities: Amenity[];
  initialNeighborhood?: string;
  pageSize: number;
}

type PaginatedResponse = {
  data: ApartmentCard[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export function ApartmentsContent({
  initialApartments,
  initialTotal,
  neighborhoods,
  amenities,
  initialNeighborhood,
  pageSize,
}: ApartmentsContentProps) {
  const [apartments, setApartments] = useState<ApartmentCard[]>(
    initialApartments ?? [],
  );
  const [total, setTotal] = useState(initialTotal ?? 0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<SearchFilters>({
    neighborhood: initialNeighborhood,
  });
  const [sortBy, setSortBy] = useState<string>("price-asc");
  const { compareList, toggle: handleCompareToggle } = useCompareList();
  const [loadingMore, setLoadingMore] = useState(false);
  const isFirstRender = useRef(true);

  const debouncedFilters = useDebounce(filters, 300);

  const buildParams = useCallback(
    (pageNum: number) => {
      const params = new URLSearchParams();
      if (debouncedFilters.search)
        params.set("search", debouncedFilters.search);
      if (debouncedFilters.neighborhood)
        params.set("neighborhood", debouncedFilters.neighborhood);
      if (debouncedFilters.minPrice)
        params.set("minPrice", debouncedFilters.minPrice.toString());
      if (debouncedFilters.maxPrice)
        params.set("maxPrice", debouncedFilters.maxPrice.toString());
      if (debouncedFilters.bedrooms?.length)
        params.set("bedrooms", debouncedFilters.bedrooms.join(","));
      if (debouncedFilters.amenities?.length)
        params.set("amenities", debouncedFilters.amenities.join(","));
      if (debouncedFilters.petFriendly) params.set("petFriendly", "true");
      if (debouncedFilters.availableNow) params.set("availableNow", "true");
      params.set("sort", sortBy);
      params.set("page", pageNum.toString());
      params.set("limit", pageSize.toString());
      return params;
    },
    [debouncedFilters, sortBy, pageSize],
  );

  const fetchPage = useCallback(
    async (pageNum: number, replace: boolean) => {
      try {
        setLoadingMore(true);
        const params = buildParams(pageNum);
        const res = await fetch(`/api/apartments?${params.toString()}`);
        const result: PaginatedResponse = await res.json();

        if (!result?.pagination || !Array.isArray(result.data)) {
          console.error("Unexpected API response shape:", result);
          return;
        }

        setApartments((prev) =>
          replace ? result.data : [...prev, ...result.data],
        );
        setTotal(result.pagination.total);
        setPage(pageNum);
      } catch (error) {
        console.error("Error fetching apartments:", error);
      } finally {
        setLoadingMore(false);
      }
    },
    [buildParams],
  );

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fetchPage(1, true);
  }, [debouncedFilters, sortBy, fetchPage]);

  const hasMore = apartments.length < total;

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
        <p className="text-sm text-text-secondary">
          Showing <span className="font-medium">{apartments.length}</span> of{" "}
          <span className="font-medium">{total}</span> apartments
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
          <p className="text-text-muted">
            No apartments found matching your criteria.
          </p>
        </div>
      ) : (
        <>
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

          {/* Load more */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => fetchPage(page + 1, false)}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  `Show More (${total - apartments.length} remaining)`
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
