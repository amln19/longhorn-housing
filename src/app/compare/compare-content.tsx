"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCompareList } from "@/hooks/use-compare-list";
import type { LucideIcon } from "lucide-react";

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

type CompareRow = {
  label: string;
  icon: LucideIcon | null;
  getValue: (apt: CompareApartment) => string;
  highlight?: (apt: CompareApartment) => "green" | "red" | null;
};

interface Props {
  apartments: CompareApartment[];
}

const compareRows: CompareRow[] = [
  {
    label: "Price Range",
    icon: DollarSign,
    getValue: (apt) => apt.priceRange,
  },
  {
    label: "Neighborhood",
    icon: MapPin,
    getValue: (apt) => apt.neighborhood.name,
  },
  {
    label: "Walk to Campus",
    icon: Clock,
    getValue: (apt) => (apt.walkTime ? `${apt.walkTime} min` : "N/A"),
  },
  {
    label: "Bedrooms Available",
    icon: Bed,
    getValue: (apt) => apt.bedroomRange,
  },
  {
    label: "Parking",
    icon: Car,
    getValue: (apt) => apt.parkingType || "N/A",
  },
  {
    label: "Pet Friendly",
    icon: PawPrint,
    getValue: (apt) => (apt.petFriendly ? "Yes" : "No"),
    highlight: (apt) => (apt.petFriendly ? "green" : "red"),
  },
  {
    label: "Year Built",
    icon: null,
    getValue: (apt) => apt.yearBuilt?.toString() || "N/A",
  },
];

export default function CompareContent({ apartments: initial }: Props) {
  const router = useRouter();
  const { toggle } = useCompareList();
  const [apartments, setApartments] = useState<CompareApartment[]>(initial);

  function handleRemove(id: string) {
    toggle(id); // sync localStorage + nav badge
    const next = apartments.filter((a) => a.id !== id);
    setApartments(next);
    // Keep the URL in sync so a refresh doesn't reload the removed apartment
    if (next.length > 0) {
      router.replace(`/compare?ids=${next.map((a) => a.id).join(",")}`);
    } else {
      router.replace("/compare");
    }
  }

  if (apartments.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="text-6xl mb-4">📊</div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              No Apartments to Compare
            </h1>
            <p className="text-text-secondary mb-8">
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
    ...new Set(apartments.flatMap((apt) => apt.amenities)),
  ].sort();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">
            Compare Apartments
          </h1>
          <p className="text-text-secondary mt-2">
            Comparing {apartments.length} apartment
            {apartments.length !== 1 ? "s" : ""}
          </p>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-base bg-surface-raised">
                    <th className="text-left p-4 font-medium text-text-secondary min-w-50">
                      Property
                    </th>
                    {apartments.map((apt) => (
                      <th key={apt.id} className="p-4 min-w-50 max-w-62.5">
                        <div className="text-center relative group">
                          <Link
                            href={`/apartments/${apt.slug}`}
                            className="font-semibold text-text-primary hover:text-burnt-orange"
                          >
                            {apt.name}
                          </Link>
                          <p className="text-sm text-text-muted mt-1 truncate">
                            {apt.address}
                          </p>
                          <button
                            onClick={() => handleRemove(apt.id)}
                            title="Remove from comparison"
                            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-red-500 dark:text-red-400 px-2 py-1 rounded-md bg-red-50 dark:bg-red-950/30 hover:scale-105 active:scale-95 transition-transform"
                          >
                            <X className="h-3 w-3" />
                            Remove
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {compareRows.map((row) => (
                    <tr key={row.label} className="border-b border-border-base">
                      <td className="p-4 font-medium text-text-secondary">
                        <div className="flex items-center gap-2">
                          {row.icon && (
                            <row.icon className="h-4 w-4 text-text-muted" />
                          )}
                          {row.label}
                        </div>
                      </td>
                      {apartments.map((apt) => (
                        <td
                          key={apt.id}
                          className="p-4 text-center text-text-primary"
                        >
                          <span
                            className={
                              row.highlight?.(apt) === "green"
                                ? "text-green-600 dark:text-green-400 font-medium"
                                : row.highlight?.(apt) === "red"
                                  ? "text-red-500 dark:text-red-400 font-medium"
                                  : ""
                            }
                          >
                            {row.getValue(apt)}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}

                  <tr className="bg-surface-raised">
                    <td
                      colSpan={apartments.length + 1}
                      className="p-4 font-semibold text-text-primary"
                    >
                      Amenities
                    </td>
                  </tr>
                  {allAmenities.map((amenity) => (
                    <tr key={amenity} className="border-b border-border-base">
                      <td className="p-4 text-text-secondary">{amenity}</td>
                      {apartments.map((apt) => (
                        <td key={apt.id} className="p-4 text-center">
                          {apt.amenities.includes(amenity) ? (
                            <Check className="h-5 w-5 text-green-500 dark:text-green-400 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-text-muted mx-auto" />
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
