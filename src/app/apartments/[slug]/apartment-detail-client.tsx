"use client";

import Link from "next/link";
import Image from "next/image";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/apartments/favorite-button";
import { PriceChart } from "@/components/apartments/price-chart";
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

type ApartmentDetailData = {
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
  yearBuilt: number | null;
  totalUnits: number | null;
  petFriendly: boolean;
  parkingType: string | null;
  description: string | null;
  imageUrl: string | null;
  featured: boolean;
  floorPlans: FloorPlan[];
  images: { url: string; caption: string | null }[];
};

interface Props {
  apartment: ApartmentDetailData;
  groupedAmenities: Record<string, Amenity[]>;
}

export default function ApartmentDetail({
  apartment,
  groupedAmenities,
}: Props) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="bg-surface-raised py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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
              <div className="flex items-center gap-2 text-sm text-text-secondary mb-2">
                <Link
                  href={`/apartments?neighborhood=${apartment.neighborhood.slug}`}
                  className="hover:text-burnt-orange"
                >
                  {apartment.neighborhood.name}
                </Link>
              </div>
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-3xl md:text-4xl font-bold text-text-primary">
                  {apartment.name}
                </h1>
                <FavoriteButton apartmentId={apartment.id} size="lg" />
              </div>
              <div className="flex items-center gap-1 mt-2 text-text-secondary">
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
                    <div className="text-xs text-text-muted">Walk to UT</div>
                  </CardContent>
                </Card>
              )}
              {apartment.yearBuilt && (
                <Card>
                  <CardContent className="p-4 text-center">
                    <Calendar className="h-5 w-5 mx-auto text-burnt-orange mb-2" />
                    <div className="font-semibold">{apartment.yearBuilt}</div>
                    <div className="text-xs text-text-muted">Year Built</div>
                  </CardContent>
                </Card>
              )}
              <Card>
                <CardContent className="p-4 text-center">
                  <PawPrint className="h-5 w-5 mx-auto text-burnt-orange mb-2" />
                  <div className="font-semibold">
                    {apartment.petFriendly ? "Yes" : "No"}
                  </div>
                    <div className="text-xs text-text-muted">Pet Friendly</div>
                </CardContent>
              </Card>
              {apartment.parkingType && (
                <Card>
                  <CardContent className="p-4 text-center">
                    <Car className="h-5 w-5 mx-auto text-burnt-orange mb-2" />
                    <div className="font-semibold">{apartment.parkingType}</div>
                    <div className="text-xs text-text-muted">Parking</div>
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
                  <p className="text-text-secondary leading-relaxed">
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
                        <th className="text-left py-3 px-2 font-medium text-text-secondary">
                          Unit Type
                        </th>
                        <th className="text-left py-3 px-2 font-medium text-text-secondary">
                          Bed/Bath
                        </th>
                        <th className="text-left py-3 px-2 font-medium text-text-secondary">
                          Sq Ft
                        </th>
                        <th className="text-left py-3 px-2 font-medium text-text-secondary">
                          Price
                        </th>
                        <th className="text-left py-3 px-2 font-medium text-text-secondary">
                          Availability
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {apartment.floorPlans.map((plan) => (
                        <tr key={plan.id} className="border-b border-border-base last:border-0">
                          <td className="py-4 px-2 font-medium text-text-primary">{plan.name}</td>
                          <td className="py-4 px-2">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Bed className="h-4 w-4 text-text-muted" />
                                {getBedroomLabel(plan.bedrooms)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Bath className="h-4 w-4 text-text-muted" />
                                {getBathroomLabel(plan.bathrooms)}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-2">
                            {plan.sqft ? (
                              <span className="flex items-center gap-1">
                                <Square className="h-4 w-4 text-text-muted" />
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
                              <span className="text-xs text-text-muted block">
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
            {Object.keys(groupedAmenities).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {Object.entries(groupedAmenities).map(
                      ([category, amenities]) => (
                        <div key={category}>
                          <h4 className="font-medium text-text-primary mb-3">
                            {category}
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {amenities.map((amenity) => (
                              <div
                                key={amenity.id}
                                className="flex items-center gap-2 text-sm text-text-secondary"
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
            {/* Price Trends */}
            <PriceChart slug={apartment.slug} />
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
                    className="flex items-center gap-3 text-text-secondary hover:text-burnt-orange transition-colors"
                  >
                    <Phone className="h-5 w-5 shrink-0" />
                    <span>{apartment.phone}</span>
                  </a>
                )}
                {apartment.email && (
                  <a
                    href={`mailto:${apartment.email}`}
                    className="flex items-start gap-3 text-text-secondary hover:text-burnt-orange transition-colors"
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
                    className="flex items-center gap-3 text-text-secondary hover:text-burnt-orange transition-colors"
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
                <div className="aspect-video rounded-lg overflow-hidden mb-4 border border-border-base">
                  <iframe
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${apartment.longitude - 0.005},${apartment.latitude - 0.005},${apartment.longitude + 0.005},${apartment.latitude + 0.005}&layer=mapnik&marker=${apartment.latitude},${apartment.longitude}`}
                    className="w-full h-full"
                    style={{ border: 0 }}
                    loading="lazy"
                    title={`Map showing location of ${apartment.name}`}
                  />
                </div>
                <div className="space-y-2 text-sm">
                  {apartment.walkTime && (
                    <div className="flex justify-between">
                      <span className="text-text-muted">Walk to UT:</span>
                      <span className="font-medium">
                        {apartment.walkTime} min
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
                <div className="relative w-full bg-surface-raised rounded-lg overflow-hidden">
                  {apartment.imageUrl ? (
                    <Image
                      src={apartment.imageUrl}
                      alt={apartment.name}
                      width={800}
                      height={600}
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
