"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, Bed, DollarSign, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/apartments/favorite-button";
import { formatPriceRange } from "@/lib/utils";
import type { ApartmentCard } from "@/types";

interface ApartmentCardProps {
  apartment: ApartmentCard;
  onCompareToggle?: (id: string) => void;
  isComparing?: boolean;
  onFavoriteToggle?: (apartmentId: string, newFavorited: boolean) => void;
}

export function ApartmentCardComponent({
  apartment,
  onCompareToggle,
  isComparing = false,
  onFavoriteToggle,
}: ApartmentCardProps) {
  return (
    <Card className="group overflow-hidden hover:border-burnt-orange/50 hover:shadow-xl transition-all duration-300">
      <Link href={`/apartments/${apartment.slug}`}>
        {/* Image */}
        <div className="relative aspect-16/10 overflow-hidden bg-surface-raised">
          {apartment.imageUrl ? (
            <Image
              src={apartment.imageUrl}
              alt={apartment.name}
              fill
              sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-burnt-orange/10 to-burnt-orange/5">
              <span className="text-5xl">🏠</span>
            </div>
          )}

          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {apartment.featured && (
            <div className="absolute top-3 left-3">
              <Badge
                variant="default"
                className="bg-burnt-orange text-white shadow-lg"
              >
                <Star className="h-3 w-3 mr-1 fill-current" />
                Featured
              </Badge>
            </div>
          )}

          {/* Favorite button — top-right, always visible */}
          <div className="absolute top-3 right-3 z-10">
            <FavoriteButton
              apartmentId={apartment.id}
              size="sm"
              className="shadow-lg bg-white/90 dark:bg-surface/90 backdrop-blur-sm hover:scale-110"
              onToggle={(fav) => onFavoriteToggle?.(apartment.id, fav)}
            />
          </div>

          <div className="absolute bottom-3 left-3">
            <Badge
              variant="secondary"
              className="bg-white/95 dark:bg-surface/95 backdrop-blur-sm shadow-sm text-text-primary"
            >
              {apartment.neighborhood.name}
            </Badge>
          </div>

          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Badge className="bg-burnt-orange text-white shadow-lg">
              ${apartment.priceMin.toLocaleString()}/mo
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-semibold text-lg text-text-primary group-hover:text-burnt-orange transition-colors line-clamp-1">
            {apartment.name}
          </h3>

          <div className="flex items-center gap-1 mt-1.5 text-sm text-text-secondary">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-1">{apartment.address}</span>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4 text-sm text-text-secondary">
              <span className="flex items-center gap-1.5 bg-surface-raised px-2.5 py-1 rounded-lg">
                <Bed className="h-4 w-4 text-text-muted" />
                {apartment.bedroomRange}
              </span>
              {apartment.walkTime && (
                <span className="flex items-center gap-1.5 bg-surface-raised px-2.5 py-1 rounded-lg">
                  <Clock className="h-4 w-4 text-text-muted" />
                  {apartment.walkTime} min
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-base">
            <div className="flex items-center gap-1">
              <DollarSign className="h-5 w-5 text-burnt-orange" />
              <span className="text-xl font-bold text-burnt-orange">
                {formatPriceRange(apartment.priceMin, apartment.priceMax)}
              </span>
              <span className="text-sm text-text-muted">/mo</span>
            </div>
          </div>
        </div>
      </Link>

      {onCompareToggle && (
        <div className="px-5 pb-5">
          <button
            onClick={(e) => {
              e.preventDefault();
              onCompareToggle(apartment.id);
            }}
            className={`w-full py-2.5 text-sm font-medium rounded-xl border-2 transition-all duration-200 ${
              isComparing
                ? "bg-burnt-orange text-white border-burnt-orange shadow-lg shadow-burnt-orange-glow"
                : "bg-surface text-text-secondary border-border-base hover:border-burnt-orange hover:text-burnt-orange hover:shadow-md"
            }`}
          >
            {isComparing ? "✓ Added to Compare" : "Add to Compare"}
          </button>
        </div>
      )}
    </Card>
  );
}
