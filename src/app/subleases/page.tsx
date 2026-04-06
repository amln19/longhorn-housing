"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Search,
  Plus,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Calendar,
  Loader2,
  Sofa,
  Zap,
  Car,
  PawPrint,
  ArrowRight,
  Mail,
} from "lucide-react";
import { format } from "date-fns";

type Sublease = {
  id: string;
  title: string;
  description: string;
  apartmentName: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number | null;
  monthlyRent: number;
  deposit: number | null;
  leaseStart: string;
  leaseEnd: string;
  availableDate: string;
  furnished: boolean;
  utilitiesIncluded: boolean;
  parkingIncluded: boolean;
  petFriendly: boolean;
  imageUrls: string[];
  contactEmail: string | null;
  status: string;
  createdAt: string;
  user: { id: string; name: string | null };
  neighborhood: { name: string; slug: string } | null;
};

export default function SubleasesPage() {
  const { user } = useAuth();
  const [subleases, setSubleases] = useState<Sublease[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [bedroomFilter, setBedroomFilter] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (bedroomFilter) params.set("bedrooms", bedroomFilter);
    if (maxPrice) params.set("maxPrice", maxPrice);

    let cancelled = false;

    void (async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/subleases?${params}`);
        const data = await r.json();
        if (!cancelled) {
          setSubleases(data.subleases || []);
        }
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [search, bedroomFilter, maxPrice]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
              <FileText className="h-8 w-8 text-burnt-orange" />
              Sublease Marketplace
            </h1>
            <p className="text-text-muted mt-1">
              Find subleases or post your own near UT Austin
            </p>
          </div>
          {user ? (
            <Link href="/subleases/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Post Sublease
              </Button>
            </Link>
          ) : (
            <Link href="/auth/login">
              <Button variant="outline">
                Sign in to post
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="bg-surface rounded-xl border border-border-base p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search subleases..."
                className="pl-10"
              />
            </div>
            <Select
              value={bedroomFilter}
              onChange={(e) => setBedroomFilter(e.target.value)}
              options={[
                { value: "", label: "All Bedrooms" },
                { value: "0", label: "Studio" },
                { value: "1", label: "1 Bedroom" },
                { value: "2", label: "2 Bedrooms" },
                { value: "3", label: "3 Bedrooms" },
                { value: "4", label: "4+ Bedrooms" },
              ]}
            />
            <Select
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              options={[
                { value: "", label: "Any Price" },
                { value: "800", label: "Under $800" },
                { value: "1000", label: "Under $1,000" },
                { value: "1200", label: "Under $1,200" },
                { value: "1500", label: "Under $1,500" },
                { value: "2000", label: "Under $2,000" },
              ]}
            />
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-burnt-orange" />
          </div>
        ) : subleases.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="h-16 w-16 mx-auto text-text-muted mb-4" />
            <p className="text-lg font-medium text-text-secondary">
              No subleases found
            </p>
            <p className="text-sm text-text-muted mt-1">
              {search || bedroomFilter || maxPrice
                ? "Try adjusting your filters"
                : "Be the first to post a sublease!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subleases.map((sub) => (
              <SubleaseCard key={sub.id} sublease={sub} currentUserId={user?.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SubleaseCard({
  sublease,
  currentUserId,
}: {
  sublease: Sublease;
  currentUserId?: string;
}) {
  const isOwner = currentUserId === sublease.user.id;
  const availDate = new Date(sublease.availableDate);
  const leaseEnd = new Date(sublease.leaseEnd);

  return (
    <Link href={`/subleases/${sublease.id}`}>
      <Card className="hover:shadow-lg hover:border-burnt-orange/30 transition-all duration-300 h-full">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg text-text-primary line-clamp-1">
              {sublease.title}
            </h3>
            {isOwner && (
              <Badge variant="outline" className="shrink-0 text-xs">
                Your listing
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-sm text-text-muted">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-1">{sublease.address}</span>
          </div>

          <div className="flex items-center gap-1">
            <DollarSign className="h-5 w-5 text-burnt-orange" />
            <span className="text-xl font-bold text-burnt-orange">
              ${sublease.monthlyRent.toLocaleString()}
            </span>
            <span className="text-sm text-text-muted">/mo</span>
          </div>

          <div className="flex items-center gap-4 text-sm text-text-secondary">
            <span className="flex items-center gap-1">
              <Bed className="h-4 w-4 text-text-muted" />
              {sublease.bedrooms === 0
                ? "Studio"
                : `${sublease.bedrooms} Bed`}
            </span>
            <span className="flex items-center gap-1">
              <Bath className="h-4 w-4 text-text-muted" />
              {sublease.bathrooms} Bath
            </span>
            {sublease.sqft && (
              <span className="text-text-muted">{sublease.sqft} sqft</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-sm text-text-muted">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {format(availDate, "MMM d")} — {format(leaseEnd, "MMM d, yyyy")}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {sublease.furnished && (
              <Badge variant="secondary" className="text-xs gap-1">
                <Sofa className="h-3 w-3" /> Furnished
              </Badge>
            )}
            {sublease.utilitiesIncluded && (
              <Badge variant="secondary" className="text-xs gap-1">
                <Zap className="h-3 w-3" /> Utils Incl
              </Badge>
            )}
            {sublease.parkingIncluded && (
              <Badge variant="secondary" className="text-xs gap-1">
                <Car className="h-3 w-3" /> Parking
              </Badge>
            )}
            {sublease.petFriendly && (
              <Badge variant="secondary" className="text-xs gap-1">
                <PawPrint className="h-3 w-3" /> Pets OK
              </Badge>
            )}
          </div>

          {sublease.neighborhood && (
            <div className="pt-2 border-t border-border-base flex items-center justify-between">
              <Badge variant="outline">{sublease.neighborhood.name}</Badge>
              {sublease.contactEmail && (
                <span className="flex items-center gap-1 text-xs text-text-muted">
                  <Mail className="h-3 w-3" />
                  Contact available
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
