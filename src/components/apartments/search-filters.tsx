"use client";

import { useState, useCallback } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { SearchFilters } from "@/types";

interface SearchFiltersProps {
  neighborhoods: { id: string; name: string; slug: string }[];
  amenities: { id: string; name: string; category: string }[];
  onFiltersChange: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
}

export function SearchFiltersComponent({
  neighborhoods,
  amenities,
  onFiltersChange,
  initialFilters = {},
}: SearchFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [searchQuery, setSearchQuery] = useState("");

  const updateFilters = useCallback(
    (newFilters: Partial<SearchFilters>) => {
      const updated = { ...filters, ...newFilters };
      setFilters(updated);
      onFiltersChange(updated);
    },
    [filters, onFiltersChange],
  );

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      updateFilters({ search: query || undefined });
    },
    [updateFilters],
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchQuery || undefined });
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery("");
    onFiltersChange({});
  };

  const bedroomOptions = [
    { value: "0", label: "Studio" },
    { value: "1", label: "1 Bed" },
    { value: "2", label: "2 Beds" },
    { value: "3", label: "3 Beds" },
    { value: "4", label: "4+ Beds" },
  ];

  const priceOptions = [
    { value: "", label: "Any Price" },
    { value: "500", label: "$500" },
    { value: "750", label: "$750" },
    { value: "1000", label: "$1,000" },
    { value: "1250", label: "$1,250" },
    { value: "1500", label: "$1,500" },
    { value: "2000", label: "$2,000" },
    { value: "2500", label: "$2,500" },
  ];

  const groupedAmenities = amenities.reduce(
    (acc, amenity) => {
      if (!acc[amenity.category]) {
        acc[amenity.category] = [];
      }
      acc[amenity.category].push(amenity);
      return acc;
    },
    {} as Record<string, typeof amenities>,
  );

  const hasActiveFilters =
    Object.values(filters).some(
      (v) =>
        v !== undefined && v !== "" && (Array.isArray(v) ? v.length > 0 : true),
    ) || searchQuery.length > 0;

  return (
    <div className="space-y-4">
      {/* Main search bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by apartment name or address..."
            className="pl-10 pr-10"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => handleSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(showFilters && "border-burnt-orange text-burnt-orange")}
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 h-5 w-5 rounded-full bg-burnt-orange text-white text-xs flex items-center justify-center">
              !
            </span>
          )}
        </Button>
      </form>

      {/* Expanded filters */}
      {showFilters && (
        <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 space-y-6 shadow-lg">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <h3 className="font-bold text-lg text-gray-900">Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm font-medium text-burnt-orange hover:underline flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                Clear all
              </button>
            )}
          </div>

          {/* Neighborhood */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Neighborhood
            </label>
            <Select
              options={[
                { value: "", label: "All Neighborhoods" },
                ...neighborhoods.map((n) => ({ value: n.slug, label: n.name })),
              ]}
              value={filters.neighborhood || ""}
              onChange={(e) =>
                updateFilters({ neighborhood: e.target.value || undefined })
              }
            />
          </div>

          {/* Price Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Min Price
              </label>
              <Select
                options={priceOptions}
                value={filters.minPrice?.toString() || ""}
                onChange={(e) =>
                  updateFilters({
                    minPrice: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Price
              </label>
              <Select
                options={priceOptions}
                value={filters.maxPrice?.toString() || ""}
                onChange={(e) =>
                  updateFilters({
                    maxPrice: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
              />
            </div>
          </div>

          {/* Bedrooms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Bedrooms
            </label>
            <div className="flex flex-wrap gap-2">
              {bedroomOptions.map((option) => {
                const isSelected = filters.bedrooms?.includes(
                  Number(option.value),
                );
                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      const current = filters.bedrooms || [];
                      const value = Number(option.value);
                      const newBedrooms = isSelected
                        ? current.filter((b) => b !== value)
                        : [...current, value];
                      updateFilters({
                        bedrooms:
                          newBedrooms.length > 0 ? newBedrooms : undefined,
                      });
                    }}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium border transition-colors",
                      isSelected
                        ? "bg-burnt-orange text-white border-burnt-orange"
                        : "bg-white text-gray-600 border-gray-300 hover:border-burnt-orange",
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick filters */}
          <div className="flex flex-wrap gap-4">
            <Checkbox
              label="Pet Friendly"
              checked={filters.petFriendly || false}
              onChange={(e) =>
                updateFilters({ petFriendly: e.target.checked || undefined })
              }
            />
            <Checkbox
              label="Available Now"
              checked={filters.availableNow || false}
              onChange={(e) =>
                updateFilters({ availableNow: e.target.checked || undefined })
              }
            />
          </div>

          {/* Amenities */}
          {Object.keys(groupedAmenities).length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Amenities
              </label>
              <div className="space-y-4">
                {Object.entries(groupedAmenities).map(
                  ([category, categoryAmenities]) => (
                    <div key={category}>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                        {category}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {categoryAmenities.map((amenity) => {
                          const isSelected = filters.amenities?.includes(
                            amenity.id,
                          );
                          return (
                            <button
                              key={amenity.id}
                              onClick={() => {
                                const current = filters.amenities || [];
                                const newAmenities = isSelected
                                  ? current.filter((a) => a !== amenity.id)
                                  : [...current, amenity.id];
                                updateFilters({
                                  amenities:
                                    newAmenities.length > 0
                                      ? newAmenities
                                      : undefined,
                                });
                              }}
                              className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                                isSelected
                                  ? "bg-burnt-orange text-white border-burnt-orange"
                                  : "bg-white text-gray-600 border-gray-300 hover:border-burnt-orange",
                              )}
                            >
                              {amenity.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
