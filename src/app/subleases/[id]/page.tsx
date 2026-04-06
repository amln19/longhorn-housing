"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  MapPin,
  DollarSign,
  Bed,
  Calendar,
  Loader2,
  Sofa,
  Zap,
  Car,
  PawPrint,
  Mail,
  Phone,
  Trash2,
  Square,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";

type SubleaseDetail = {
  id: string;
  title: string;
  description: string;
  apartmentName: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
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
  contactPhone: string | null;
  status: string;
  createdAt: string;
  user: { id: string; name: string | null };
  neighborhood: { name: string; slug: string } | null;
};

export default function SubleaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const [sublease, setSublease] = useState<SubleaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/subleases/${id}`)
      .then((r) => r.json())
      .then((data) => setSublease(data.sublease || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    setDeleting(true);
    try {
      await fetch(`/api/subleases/${id}`, { method: "DELETE" });
      router.push("/subleases");
    } catch {
      setDeleting(false);
    }
  }

  async function handleMarkClosed() {
    try {
      const res = await fetch(`/api/subleases/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "closed" }),
      });
      const data = await res.json();
      setSublease((prev) =>
        prev ? { ...prev, status: data.sublease.status } : prev,
      );
    } catch {
      // ignore
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-burnt-orange" />
      </div>
    );
  }

  if (!sublease) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <p className="text-text-muted text-lg">Sublease not found</p>
        <Link href="/subleases">
          <Button variant="outline" className="mt-4">
            Back to Subleases
          </Button>
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === sublease.user.id;
  const availDate = new Date(sublease.availableDate);
  const leaseStart = new Date(sublease.leaseStart);
  const leaseEnd = new Date(sublease.leaseEnd);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-surface-raised py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/subleases">
            <Button variant="secondary" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Subleases
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-text-primary">
                    {sublease.title}
                  </h1>
                  <p className="text-lg text-text-secondary mt-1">
                    {sublease.apartmentName}
                  </p>
                </div>
                {sublease.status === "closed" && (
                  <Badge variant="outline" className="text-red-600 border-red-200">
                    Closed
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-text-muted">
                <MapPin className="h-4 w-4" />
                <span>{sublease.address}</span>
              </div>
            </div>

            {/* Key Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <DollarSign className="h-5 w-5 mx-auto text-burnt-orange mb-2" />
                  <div className="font-semibold text-lg">
                    ${sublease.monthlyRent.toLocaleString()}
                  </div>
                  <div className="text-xs text-text-muted">per month</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Bed className="h-5 w-5 mx-auto text-burnt-orange mb-2" />
                  <div className="font-semibold">
                    {sublease.bedrooms === 0
                      ? "Studio"
                      : `${sublease.bedrooms} Bed`}
                  </div>
                  <div className="text-xs text-text-muted">
                    {sublease.bathrooms} Bath
                  </div>
                </CardContent>
              </Card>
              {sublease.sqft && (
                <Card>
                  <CardContent className="p-4 text-center">
                    <Square className="h-5 w-5 mx-auto text-burnt-orange mb-2" />
                    <div className="font-semibold">{sublease.sqft}</div>
                    <div className="text-xs text-text-muted">sq ft</div>
                  </CardContent>
                </Card>
              )}
              <Card>
                <CardContent className="p-4 text-center">
                  <Calendar className="h-5 w-5 mx-auto text-burnt-orange mb-2" />
                  <div className="font-semibold text-sm">
                    {format(availDate, "MMM d")}
                  </div>
                  <div className="text-xs text-text-muted">Available</div>
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Sublease</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-text-secondary leading-relaxed whitespace-pre-line">
                  {sublease.description}
                </p>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <FeatureItem
                    icon={Sofa}
                    label="Furnished"
                    active={sublease.furnished}
                  />
                  <FeatureItem
                    icon={Zap}
                    label="Utilities Included"
                    active={sublease.utilitiesIncluded}
                  />
                  <FeatureItem
                    icon={Car}
                    label="Parking Included"
                    active={sublease.parkingIncluded}
                  />
                  <FeatureItem
                    icon={PawPrint}
                    label="Pet Friendly"
                    active={sublease.petFriendly}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Lease Details */}
            <Card>
              <CardHeader>
                <CardTitle>Lease Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <DetailRow
                  label="Lease Start"
                  value={format(leaseStart, "MMMM d, yyyy")}
                />
                <DetailRow
                  label="Lease End"
                  value={format(leaseEnd, "MMMM d, yyyy")}
                />
                <DetailRow
                  label="Available From"
                  value={format(availDate, "MMMM d, yyyy")}
                />
                {sublease.deposit && (
                  <DetailRow
                    label="Security Deposit"
                    value={`$${sublease.deposit.toLocaleString()}`}
                  />
                )}
                {sublease.neighborhood && (
                  <DetailRow
                    label="Neighborhood"
                    value={sublease.neighborhood.name}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle>Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-text-secondary">
                  Posted by{" "}
                  <span className="font-medium text-text-primary">
                    {sublease.user.name || "User"}
                  </span>
                </div>
                {sublease.contactEmail && (
                  <a
                    href={`mailto:${sublease.contactEmail}?subject=Sublease: ${sublease.title}`}
                    className="flex items-center gap-3 text-text-secondary hover:text-burnt-orange transition-colors"
                  >
                    <Mail className="h-5 w-5 shrink-0" />
                    <span className="text-sm break-all">
                      {sublease.contactEmail}
                    </span>
                  </a>
                )}
                {sublease.contactPhone && (
                  <a
                    href={`tel:${sublease.contactPhone}`}
                    className="flex items-center gap-3 text-text-secondary hover:text-burnt-orange transition-colors"
                  >
                    <Phone className="h-5 w-5 shrink-0" />
                    <span className="text-sm">{sublease.contactPhone}</span>
                  </a>
                )}
                {sublease.contactEmail && (
                  <a
                    href={`mailto:${sublease.contactEmail}?subject=Sublease: ${sublease.title}`}
                  >
                    <Button className="w-full mt-2">
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>

            {/* Map Link */}
            {sublease.address && (
              <Card>
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sublease.address + ", Austin, TX")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="w-full">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View on Google Maps
                    </Button>
                  </a>
                </CardContent>
              </Card>
            )}

            {/* Owner Actions */}
            {isOwner && (
              <Card>
                <CardHeader>
                  <CardTitle>Manage Listing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sublease.status === "active" && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleMarkClosed}
                    >
                      Mark as Closed
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Delete Listing
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({
  icon: Icon,
  label,
  active,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 p-3 rounded-xl border ${
        active
          ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
          : "bg-surface-raised border-border-base text-text-muted"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-text-muted">{label}</span>
      <span className="font-medium text-text-primary">{value}</span>
    </div>
  );
}
