"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapView, MapLabelMode } from "@/components/map/map-view";
import { DollarSign, Tag, Building } from "lucide-react";

type ApartmentForMap = {
  id: string;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  priceMin: number;
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
  { value: "name", label: "Name Only", icon: <Building className="h-4 w-4" /> },
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
  const [labelMode, setLabelMode] = useState<MapLabelMode>("name-price");

  useEffect(() => {
    async function fetchApartments() {
      try {
        const response = await fetch("/api/apartments");
        const data = await response.json();

        // API returns array directly, not wrapped in object
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

  const handleMarkerClick = (slug: string) => {
    router.push(`/apartments/${slug}`);
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] relative">
      {/* Label Mode Toggle */}
      <div className="absolute top-4 left-4 z-10 bg-white rounded-xl shadow-lg border border-gray-200 p-1">
        <div className="flex gap-1">
          {labelModeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setLabelMode(option.value)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                ${
                  labelMode === option.value
                    ? "bg-burnt-orange text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }
              `}
            >
              {option.icon}
              <span className="hidden sm:inline">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Apartment count badge */}
      <div className="absolute top-4 right-16 z-10 bg-white rounded-lg shadow-md border border-gray-200 px-3 py-2">
        <span className="text-sm font-medium text-gray-700">
          {apartments.length} apartments
        </span>
      </div>

      <MapView
        apartments={apartments}
        onMarkerClick={handleMarkerClick}
        labelMode={labelMode}
      />
    </div>
  );
}
