"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  Globe,
  Bed,
  Bath,
  Square,
  Car,
  PawPrint,
  Calendar,
  ChevronLeft,
  ExternalLink,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  formatPriceRange,
  getBedroomLabel,
  getBathroomLabel,
} from "@/lib/utils";

type FloorPlan = {
  id: string;
  name: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number | null;
  priceMin: number;
  priceMax: number | null;
  pricePerPerson: boolean;
  availableNow: boolean;
};

type Amenity = {
  id: string;
  name: string;
  icon: string | null;
};

type ApartmentDetail = {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  neighborhood: { id: string; name: string; slug: string };
  phone: string | null;
  email: string | null;
  website: string | null;
  walkTime: number | null;
  bikeTime: number | null;
  busTime: number | null;
  yearBuilt: number | null;
  totalUnits: number | null;
  petFriendly: boolean;
  parkingType: string | null;
  description: string | null;
  imageUrl: string | null;
  featured: boolean;
  floorPlans: FloorPlan[];
  groupedAmenities: Record<string, Amenity[]>;
  images: { url: string; caption: string | null }[];
};

export default function ApartmentDetailClient({ slug }: { slug: string }) {
  const [apartment, setApartment] = useState<ApartmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchApartment() {
      try {
        const res = await fetch(`/api/apartments/${slug}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError("Apartment not found");
          } else {
            setError("Failed to load apartment");
          }
          return;
        }
        const data = await res.json();
        setApartment(data);
      } catch {
        setError("Failed to load apartment");
      } finally {
        setLoading(false);
      }
    }

    fetchApartment();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-burnt-orange mx-auto mb-4" />
          <p className="text-gray-500">Loading apartment details...</p>
        </div>
      </div>
    );
  }

  if (error || !apartment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || "Apartment Not Found"}
          </h1>
          <p className="text-gray-500 mb-6">
            The apartment you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Link href="/apartments">
            <Button>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Apartments
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gray-100 py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back button */}
          <Link href="/apartments">
            <Button variant="secondary" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Search
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title & Address */}
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <Link
                  href={`/apartments?neighborhood=${apartment.neighborhood.slug}`}
                  className="hover:text-burnt-orange"
                >
                  {apartment.neighborhood.name}
                </Link>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                {apartment.name}
              </h1>
              <div className="flex items-center gap-1 mt-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>
                  {apartment.address}, {apartment.city}, {apartment.state}{" "}
                  {apartment.zipCode}
                </span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {apartment.walkTime && (
                <Card>
                  <CardContent className="p-4 text-center">
                    <Clock className="h-5 w-5 mx-auto text-burnt-orange mb-2" />
                    <div className="font-semibold">
                      {apartment.walkTime} min
                    </div>
                    <div className="text-xs text-gray-500">Walk to UT</div>
                  </CardContent>
                </Card>
              )}
              {apartment.yearBuilt && (
                <Card>
                  <CardContent className="p-4 text-center">
                    <Calendar className="h-5 w-5 mx-auto text-burnt-orange mb-2" />
                    <div className="font-semibold">{apartment.yearBuilt}</div>
                    <div className="text-xs text-gray-500">Year Built</div>
                  </CardContent>
                </Card>
              )}
              <Card>
                <CardContent className="p-4 text-center">
                  <PawPrint className="h-5 w-5 mx-auto text-burnt-orange mb-2" />
                  <div className="font-semibold">
                    {apartment.petFriendly ? "Yes" : "No"}
                  </div>
                  <div className="text-xs text-gray-500">Pet Friendly</div>
                </CardContent>
              </Card>
              {apartment.parkingType && (
                <Card>
                  <CardContent className="p-4 text-center">
                    <Car className="h-5 w-5 mx-auto text-burnt-orange mb-2" />
                    <div className="font-semibold">{apartment.parkingType}</div>
                    <div className="text-xs text-gray-500">Parking</div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Description */}
            {apartment.description && (
              <Card>
                <CardHeader>
                  <CardTitle>About This Property</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {apartment.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Floor Plans */}
            <Card>
              <CardHeader>
                <CardTitle>Floor Plans & Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 font-medium text-gray-600">
                          Unit Type
                        </th>
                        <th className="text-left py-3 px-2 font-medium text-gray-600">
                          Bed/Bath
                        </th>
                        <th className="text-left py-3 px-2 font-medium text-gray-600">
                          Sq Ft
                        </th>
                        <th className="text-left py-3 px-2 font-medium text-gray-600">
                          Price
                        </th>
                        <th className="text-left py-3 px-2 font-medium text-gray-600">
                          Availability
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {apartment.floorPlans.map((plan) => (
                        <tr key={plan.id} className="border-b last:border-0">
                          <td className="py-4 px-2 font-medium">{plan.name}</td>
                          <td className="py-4 px-2">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Bed className="h-4 w-4 text-gray-400" />
                                {getBedroomLabel(plan.bedrooms)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Bath className="h-4 w-4 text-gray-400" />
                                {getBathroomLabel(plan.bathrooms)}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-2">
                            {plan.sqft ? (
                              <span className="flex items-center gap-1">
                                <Square className="h-4 w-4 text-gray-400" />
                                {plan.sqft}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="py-4 px-2">
                            <span className="font-semibold text-burnt-orange">
                              {formatPriceRange(plan.priceMin, plan.priceMax)}
                            </span>
                            {plan.pricePerPerson && (
                              <span className="text-xs text-gray-500 block">
                                per person
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-2">
                            {plan.availableNow ? (
                              <Badge variant="success">Available Now</Badge>
                            ) : (
                              <Badge variant="outline">Coming Soon</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Amenities */}
            {Object.keys(apartment.groupedAmenities).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {Object.entries(apartment.groupedAmenities).map(
                      ([category, amenities]) => (
                        <div key={category}>
                          <h4 className="font-medium text-gray-900 mb-3">
                            {category}
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {amenities.map((amenity) => (
                              <div
                                key={amenity.id}
                                className="flex items-center gap-2 text-sm text-gray-600"
                              >
                                <Check className="h-4 w-4 text-green-500" />
                                {amenity.name}
                              </div>
                            ))}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Property</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {apartment.phone && (
                  <a
                    href={`tel:${apartment.phone}`}
                    className="flex items-center gap-3 text-gray-700 hover:text-burnt-orange transition-colors"
                  >
                    <Phone className="h-5 w-5 shrink-0" />
                    <span>{apartment.phone}</span>
                  </a>
                )}
                {apartment.email && (
                  <a
                    href={`mailto:${apartment.email}`}
                    className="flex items-start gap-3 text-gray-700 hover:text-burnt-orange transition-colors"
                  >
                    <Mail className="h-5 w-5 shrink-0 mt-0.5" />
                    <span className="break-all text-sm">{apartment.email}</span>
                  </a>
                )}
                {apartment.website && (
                  <a
                    href={apartment.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-700 hover:text-burnt-orange transition-colors"
                  >
                    <Globe className="h-5 w-5 shrink-0" />
                    <span>Visit Website</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                {apartment.website && (
                  <a
                    href={apartment.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button className="w-full mt-4">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View on Property Website
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>

            {/* Location Card */}
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-lg overflow-hidden mb-4 border border-gray-200">
                  {process.env.NEXT_PUBLIC_MAPBOX_TOKEN ? (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(apartment.address + ", " + apartment.city + ", " + apartment.state)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full h-full"
                    >
                      <img
                        src={`https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-l+bf5700(${apartment.longitude},${apartment.latitude})/${apartment.longitude},${apartment.latitude},15,0/400x300@2x?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`}
                        alt={`Map showing location of ${apartment.name}`}
                        className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                      />
                    </a>
                  ) : (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(apartment.address + ", " + apartment.city + ", " + apartment.state)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center h-full bg-linear-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 transition-colors"
                    >
                      <MapPin className="h-8 w-8 text-burnt-orange mb-2" />
                      <span className="text-sm font-medium text-gray-700">
                        View on Google Maps
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        Click to open
                      </span>
                    </a>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  {apartment.walkTime && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Walk to UT:</span>
                      <span className="font-medium">
                        {apartment.walkTime} min
                      </span>
                    </div>
                  )}
                  {apartment.bikeTime && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Bike to UT:</span>
                      <span className="font-medium">
                        {apartment.bikeTime} min
                      </span>
                    </div>
                  )}
                  {apartment.busTime && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Bus to UT:</span>
                      <span className="font-medium">
                        {apartment.busTime} min
                      </span>
                    </div>
                  )}
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(apartment.address + ", " + apartment.city + ", " + apartment.state)}&origin=The+University+of+Texas+at+Austin`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-4"
                >
                  <Button variant="outline" className="w-full">
                    <MapPin className="h-4 w-4 mr-2" />
                    Get Directions
                  </Button>
                </a>
              </CardContent>
            </Card>

            {/* Property Image Card */}
            <Card>
              <CardHeader>
                <CardTitle>Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative w-full bg-linear-to-br from-gray-200 to-gray-300 rounded-lg overflow-hidden">
                  {apartment.imageUrl ? (
                    <img
                      src={apartment.imageUrl}
                      alt={apartment.name}
                      className="w-full h-auto"
                    />
                  ) : (
                    <div className="flex items-center justify-center py-12">
                      <span className="text-6xl">🏢</span>
                    </div>
                  )}
                  {apartment.featured && (
                    <div className="absolute top-2 right-2">
                      <Badge>Featured</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
