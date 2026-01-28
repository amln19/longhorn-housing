"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  X,
  Check,
  MapPin,
  Clock,
  Bed,
  Car,
  PawPrint,
  DollarSign,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatPriceRange } from "@/lib/utils";

type CompareApartment = {
  id: string;
  name: string;
  slug: string;
  address: string;
  neighborhood: { name: string; slug: string };
  walkTime: number | null;
  petFriendly: boolean;
  parkingType: string | null;
  yearBuilt?: number | null;
  priceMin: number;
  priceMax: number | null;
  bedroomRange: string;
  amenities?: string[];
};

export default function CompareContent() {
  const searchParams = useSearchParams();
  const ids = searchParams.get("ids")?.split(",") || [];

  const [apartments, setApartments] = useState<CompareApartment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchApartments() {
      if (ids.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/apartments");
        const allApartments = await res.json();

        const filtered = allApartments.filter((apt: CompareApartment) =>
          ids.includes(apt.id),
        );

        const detailed = await Promise.all(
          filtered.map(async (apt: CompareApartment) => {
            try {
              const detailRes = await fetch(`/api/apartments/${apt.slug}`);
              const detail = await detailRes.json();
              const amenityNames = Object.values(
                detail.groupedAmenities || {},
              ).flat() as { name: string }[];
              return {
                ...apt,
                yearBuilt: detail.yearBuilt,
                petFriendly: detail.petFriendly,
                parkingType: detail.parkingType,
                amenities: amenityNames.map((a) => a.name),
              };
            } catch {
              return apt;
            }
          }),
        );

        setApartments(detailed);
      } catch (error) {
        console.error("Error fetching apartments:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchApartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-burnt-orange mx-auto mb-4" />
          <p className="text-gray-500">Loading comparison...</p>
        </div>
      </div>
    );
  }

  if (apartments.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="text-6xl mb-4">📊</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              No Apartments to Compare
            </h1>
            <p className="text-gray-600 mb-8">
              Add apartments to your compare list from the browse page
            </p>
            <Link href="/apartments">
              <Button>Browse Apartments</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const allAmenities = [
    ...new Set(apartments.flatMap((apt) => apt.amenities || [])),
  ].sort();

  const compareRows = [
    {
      label: "Price Range",
      icon: DollarSign,
      getValue: (apt: CompareApartment) =>
        formatPriceRange(apt.priceMin, apt.priceMax) + "/mo",
    },
    {
      label: "Neighborhood",
      icon: MapPin,
      getValue: (apt: CompareApartment) => apt.neighborhood.name,
    },
    {
      label: "Walk to Campus",
      icon: Clock,
      getValue: (apt: CompareApartment) =>
        apt.walkTime ? `${apt.walkTime} min` : "N/A",
    },
    {
      label: "Bedrooms Available",
      icon: Bed,
      getValue: (apt: CompareApartment) => apt.bedroomRange,
    },
    {
      label: "Parking",
      icon: Car,
      getValue: (apt: CompareApartment) => apt.parkingType || "N/A",
    },
    {
      label: "Pet Friendly",
      icon: PawPrint,
      getValue: (apt: CompareApartment) => (apt.petFriendly ? "Yes" : "No"),
      highlight: (apt: CompareApartment) => (apt.petFriendly ? "green" : "red"),
    },
    {
      label: "Year Built",
      icon: null,
      getValue: (apt: CompareApartment) => apt.yearBuilt?.toString() || "N/A",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Compare Apartments
          </h1>
          <p className="text-gray-600 mt-2">
            Comparing {apartments.length} apartment
            {apartments.length !== 1 ? "s" : ""}
          </p>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-4 font-medium text-gray-600 min-w-50">
                      Property
                    </th>
                    {apartments.map((apt) => (
                      <th key={apt.id} className="p-4 min-w-50 max-w-62.5">
                        <div className="text-center">
                          <Link
                            href={`/apartments/${apt.slug}`}
                            className="font-semibold text-gray-900 hover:text-burnt-orange"
                          >
                            {apt.name}
                          </Link>
                          <p className="text-sm text-gray-500 mt-1 truncate">
                            {apt.address}
                          </p>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {compareRows.map((row) => (
                    <tr key={row.label} className="border-b">
                      <td className="p-4 font-medium text-gray-700">
                        <div className="flex items-center gap-2">
                          {row.icon && (
                            <row.icon className="h-4 w-4 text-gray-400" />
                          )}
                          {row.label}
                        </div>
                      </td>
                      {apartments.map((apt) => (
                        <td key={apt.id} className="p-4 text-center">
                          <span
                            className={
                              row.highlight?.(apt) === "green"
                                ? "text-green-600 font-medium"
                                : row.highlight?.(apt) === "red"
                                  ? "text-red-500 font-medium"
                                  : ""
                            }
                          >
                            {row.getValue(apt)}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}

                  <tr className="bg-gray-50">
                    <td
                      colSpan={apartments.length + 1}
                      className="p-4 font-semibold text-gray-900"
                    >
                      Amenities
                    </td>
                  </tr>
                  {allAmenities.map((amenity) => (
                    <tr key={amenity} className="border-b">
                      <td className="p-4 text-gray-700">{amenity}</td>
                      {apartments.map((apt) => (
                        <td key={apt.id} className="p-4 text-center">
                          {apt.amenities?.includes(amenity) ? (
                            <Check className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-gray-300 mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 flex justify-center gap-4">
          <Link href="/apartments">
            <Button variant="outline">Add More Apartments</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
