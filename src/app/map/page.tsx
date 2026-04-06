"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MapView, MapLabelMode } from "@/components/map/map-view";
import { ErrorBoundary } from "@/components/error-boundary";
import { useDebounce } from "@/hooks/use-debounce";
import {
  DollarSign,
  Tag,
  Building,
  Search,
  Navigation,
  X,
  MapPin,
  Loader2,
} from "lucide-react";

type ApartmentForMap = {
  id: string;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  priceMin: number;
};

type GeocodeResult = {
  name: string;
  subtitle: string;
  lat: number;
  lng: number;
};

const labelModeOptions: {
  value: MapLabelMode;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "name-price",
    label: "Name + Price",
    icon: <Tag className="h-4 w-4" />,
  },
  {
    value: "name",
    label: "Name Only",
    icon: <Building className="h-4 w-4" />,
  },
  {
    value: "price",
    label: "Price Only",
    icon: <DollarSign className="h-4 w-4" />,
  },
];

export default function MapPage() {
  const router = useRouter();
  const [apartments, setApartments] = useState<ApartmentForMap[]>([]);
  const [loading, setLoading] = useState(true);
  const [labelMode, setLabelMode] = useState<MapLabelMode>("price");

  // Building search & route planning
  const [buildingQuery, setBuildingQuery] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState<GeocodeResult | null>(null);
  const [selectedApartment, setSelectedApartment] = useState<string | null>(null);
  const [showBuildingResults, setShowBuildingResults] = useState(false);
  const [geocodeResults, setGeocodeResults] = useState<GeocodeResult[]>([]);
  const [geocodeLoading, setGeocodeLoading] = useState(false);

  const debouncedQuery = useDebounce(buildingQuery, 350);

  useEffect(() => {
    async function fetchApartments() {
      try {
        const response = await fetch("/api/apartments");
        const data = await response.json();
        const mapData = data.map((apt: ApartmentForMap) => ({
          id: apt.id,
          name: apt.name,
          slug: apt.slug,
          latitude: apt.latitude,
          longitude: apt.longitude,
          priceMin: apt.priceMin,
        }));
        setApartments(mapData);
      } catch (error) {
        console.error("Failed to fetch apartments:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchApartments();
  }, []);

  // Live geocode search — fires when debounced query changes
  useEffect(() => {
    // Don't search if a building is already selected and the query matches it
    if (selectedBuilding && debouncedQuery === selectedBuilding.name) return;

    if (debouncedQuery.trim().length < 2) {
      setGeocodeResults([]);
      return;
    }

    let cancelled = false;
    setGeocodeLoading(true);

    fetch(`/api/geocode?q=${encodeURIComponent(debouncedQuery)}`)
      .then((r) => r.json())
      .then((data: GeocodeResult[]) => {
        if (!cancelled) setGeocodeResults(data);
      })
      .catch(() => {
        if (!cancelled) setGeocodeResults([]);
      })
      .finally(() => {
        if (!cancelled) setGeocodeLoading(false);
      });

    return () => { cancelled = true; };
  }, [debouncedQuery, selectedBuilding]);

  const handleSelectBuilding = useCallback((result: GeocodeResult) => {
    setSelectedBuilding(result);
    setBuildingQuery(result.name);
    setGeocodeResults([]);
    setShowBuildingResults(false);
  }, []);

  const handleMarkerClick = useCallback(
    (slug: string) => {
      if (selectedBuilding) {
        setSelectedApartment(slug);
      } else {
        router.push(`/apartments/${slug}`);
      }
    },
    [selectedBuilding, router],
  );

  const clearRoute = useCallback(() => {
    setSelectedBuilding(null);
    setSelectedApartment(null);
    setBuildingQuery("");
    setGeocodeResults([]);
  }, []);

  const routeTo = useMemo(() => {
    if (!selectedBuilding) return null;
    return {
      lat: selectedBuilding.lat,
      lng: selectedBuilding.lng,
      name: selectedBuilding.name,
    };
  }, [selectedBuilding]);

  const selectedAptName = useMemo(() => {
    if (!selectedApartment) return null;
    return apartments.find((a) => a.slug === selectedApartment)?.name;
  }, [selectedApartment, apartments]);

  if (loading) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-burnt-orange" />
      </div>
    );
  }

  const showDropdown =
    showBuildingResults &&
    buildingQuery.trim().length >= 2 &&
    !selectedBuilding;

  return (
    <div className="h-[calc(100vh-64px)] relative">
      {/* Top Control Bar */}
      <div className="absolute top-4 left-4 right-16 z-10 flex flex-col sm:flex-row gap-3">
        {/* Label Mode Toggle */}
        <div className="bg-surface rounded-xl shadow-lg border border-border-base p-1 flex gap-1 shrink-0">
          {labelModeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setLabelMode(option.value)}
              className={`
                flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all
                ${
                  labelMode === option.value
                    ? "bg-burnt-orange text-white shadow-sm"
                    : "text-text-secondary hover:bg-surface-raised"
                }
              `}
            >
              {option.icon}
              <span className="hidden sm:inline">{option.label}</span>
            </button>
          ))}
        </div>

        {/* Building Search */}
        <div className="relative flex-1 max-w-md">
          <div className="bg-surface rounded-xl shadow-lg border border-border-base flex items-center">
            {geocodeLoading ? (
              <Loader2 className="h-4 w-4 text-text-muted ml-3 shrink-0 animate-spin" />
            ) : (
              <Search className="h-4 w-4 text-text-muted ml-3 shrink-0" />
            )}
            <input
              type="text"
              value={buildingQuery}
              onChange={(e) => {
                setBuildingQuery(e.target.value);
                setShowBuildingResults(true);
                if (!e.target.value) {
                  setSelectedBuilding(null);
                  setSelectedApartment(null);
                  setGeocodeResults([]);
                }
              }}
              onFocus={() => setShowBuildingResults(true)}
              onBlur={() => setTimeout(() => setShowBuildingResults(false), 150)}
              placeholder="Search buildings, libraries, landmarks..."
              className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none text-text-primary placeholder:text-text-muted"
            />
            {buildingQuery && (
              <button
                onClick={clearRoute}
                className="p-2 hover:bg-surface-raised rounded-lg mr-1"
              >
                <X className="h-4 w-4 text-text-muted" />
              </button>
            )}
          </div>

          {/* Search results dropdown */}
          {showDropdown && (
            <div className="absolute top-full mt-2 w-full bg-surface rounded-xl shadow-xl border border-border-base py-2 max-h-64 overflow-y-auto">
              {geocodeLoading && geocodeResults.length === 0 ? (
                <div className="flex items-center gap-2 px-4 py-3 text-sm text-text-muted">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching...
                </div>
              ) : geocodeResults.length === 0 ? (
                <div className="px-4 py-3 text-sm text-text-muted">
                  No results found. Try a building name or address.
                </div>
              ) : (
                geocodeResults.map((result, i) => (
                  <button
                    key={i}
                    onMouseDown={() => handleSelectBuilding(result)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-raised transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-burnt-orange/10 flex items-center justify-center shrink-0">
                      <MapPin className="h-4 w-4 text-burnt-orange" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-text-primary truncate">
                        {result.name}
                      </div>
                      {result.subtitle && (
                        <div className="text-xs text-text-muted truncate">
                          {result.subtitle}
                        </div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Route Instructions Panel */}
      {selectedBuilding && (
        <div className="absolute top-20 sm:top-4 right-4 z-10 bg-surface rounded-xl shadow-lg border border-border-base p-4 w-72">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Navigation className="h-4 w-4 text-burnt-orange" />
              <h3 className="font-semibold text-sm text-text-primary">
                Route Planner
              </h3>
            </div>
            <button
              onClick={clearRoute}
              className="text-text-muted hover:text-text-primary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-burnt-orange/10 flex items-center justify-center mt-0.5 shrink-0">
                <div className="w-2 h-2 rounded-full bg-burnt-orange" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-text-muted">To</div>
                <div className="font-medium text-text-primary truncate">
                  {selectedBuilding.name}
                </div>
                {selectedBuilding.subtitle && (
                  <div className="text-xs text-text-muted truncate">
                    {selectedBuilding.subtitle}
                  </div>
                )}
              </div>
            </div>

            {selectedApartment ? (
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mt-0.5 shrink-0">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                </div>
                <div>
                  <div className="text-xs text-text-muted">From</div>
                  <div className="font-medium text-text-primary">
                    {selectedAptName}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-text-muted pl-7 pt-1">
                Click an apartment on the map to see the walking route
              </p>
            )}
          </div>
        </div>
      )}

      {/* Apartment count */}
      <div className="absolute bottom-4 right-4 z-10 bg-surface/90 backdrop-blur-sm rounded-lg shadow-md border border-border-base px-3 py-2">
        <span className="text-sm font-medium text-text-secondary">
          {apartments.length} apartments
        </span>
      </div>

      <ErrorBoundary
        fallback={
          <div className="flex items-center justify-center h-full">
            <p className="text-text-muted">Failed to load map</p>
          </div>
        }
      >
        <MapView
          apartments={apartments}
          onMarkerClick={handleMarkerClick}
          labelMode={labelMode}
          routeTo={routeTo}
          selectedApartment={selectedApartment}
        />
      </ErrorBoundary>
    </div>
  );
}
