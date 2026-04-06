"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";

type FormData = {
  title: string;
  description: string;
  apartmentName: string;
  address: string;
  neighborhood: string;
  bedrooms: string;
  bathrooms: string;
  sqft: string;
  monthlyRent: string;
  deposit: string;
  leaseStart: string;
  leaseEnd: string;
  availableDate: string;
  furnished: boolean;
  utilitiesIncluded: boolean;
  parkingIncluded: boolean;
  petFriendly: boolean;
  contactEmail: string;
  contactPhone: string;
};

const INITIAL: FormData = {
  title: "",
  description: "",
  apartmentName: "",
  address: "",
  neighborhood: "",
  bedrooms: "1",
  bathrooms: "1",
  sqft: "",
  monthlyRent: "",
  deposit: "",
  leaseStart: "",
  leaseEnd: "",
  availableDate: "",
  furnished: false,
  utilitiesIncluded: false,
  parkingIncluded: false,
  petFriendly: false,
  contactEmail: "",
  contactPhone: "",
};

type Neighborhood = { id: string; name: string; slug: string };

export default function NewSubleasePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<FormData>(INITIAL);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    fetch("/api/neighborhoods")
      .then((r) => r.json())
      .then((data) => setNeighborhoods(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user?.email && !form.contactEmail) {
      setForm((prev) => ({ ...prev, contactEmail: user.email }));
    }
  }, [user, form.contactEmail]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const res = await fetch("/api/subleases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create sublease");
      }

      const data = await res.json();
      router.push(`/subleases/${data.sublease.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-burnt-orange" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-3xl">
        <div className="mb-8">
          <Link
            href="/subleases"
            className="text-sm text-text-muted hover:text-burnt-orange flex items-center gap-1 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Subleases
          </Link>
          <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
            <FileText className="h-8 w-8 text-burnt-orange" />
            Post a Sublease
          </h1>
          <p className="text-text-muted mt-2">
            List your apartment or room for sublease
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm p-4 rounded-xl border border-red-200 dark:border-red-900">
              {error}
            </div>
          )}

          {/* Listing Info */}
          <Card>
            <CardHeader>
              <CardTitle>Listing Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Title *
                </label>
                <Input
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  placeholder="e.g. Spacious 1BR in West Campus - Summer Sublease"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Description *
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Describe your space, the vibe, what's included..."
                  rows={4}
                  className="w-full rounded-xl border-2 border-border-base bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-burnt-orange/20 focus:border-burnt-orange resize-none"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Property Info */}
          <Card>
            <CardHeader>
              <CardTitle>Property Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Apartment/Building Name *
                  </label>
                  <Input
                    value={form.apartmentName}
                    onChange={(e) =>
                      setForm({ ...form, apartmentName: e.target.value })
                    }
                    placeholder="e.g. 26 West"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Address *
                  </label>
                  <Input
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                    placeholder="e.g. 2610 Rio Grande St"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Neighborhood
                  </label>
                  <Select
                    value={form.neighborhood}
                    onChange={(e) =>
                      setForm({ ...form, neighborhood: e.target.value })
                    }
                    options={[
                      { value: "", label: "Select neighborhood..." },
                      ...neighborhoods.map((n) => ({
                        value: n.slug,
                        label: n.name,
                      })),
                    ]}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Bedrooms *
                  </label>
                  <Select
                    value={form.bedrooms}
                    onChange={(e) =>
                      setForm({ ...form, bedrooms: e.target.value })
                    }
                    options={[
                      { value: "0", label: "Studio" },
                      { value: "1", label: "1" },
                      { value: "2", label: "2" },
                      { value: "3", label: "3" },
                      { value: "4", label: "4+" },
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Bathrooms *
                  </label>
                  <Select
                    value={form.bathrooms}
                    onChange={(e) =>
                      setForm({ ...form, bathrooms: e.target.value })
                    }
                    options={[
                      { value: "1", label: "1" },
                      { value: "1.5", label: "1.5" },
                      { value: "2", label: "2" },
                      { value: "2.5", label: "2.5" },
                      { value: "3", label: "3+" },
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Sq Ft
                  </label>
                  <Input
                    type="number"
                    value={form.sqft}
                    onChange={(e) =>
                      setForm({ ...form, sqft: e.target.value })
                    }
                    placeholder="e.g. 650"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Dates */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Dates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Monthly Rent ($) *
                  </label>
                  <Input
                    type="number"
                    value={form.monthlyRent}
                    onChange={(e) =>
                      setForm({ ...form, monthlyRent: e.target.value })
                    }
                    placeholder="e.g. 1200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Security Deposit ($)
                  </label>
                  <Input
                    type="number"
                    value={form.deposit}
                    onChange={(e) =>
                      setForm({ ...form, deposit: e.target.value })
                    }
                    placeholder="e.g. 500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Lease Start *
                  </label>
                  <Input
                    type="date"
                    value={form.leaseStart}
                    onChange={(e) =>
                      setForm({ ...form, leaseStart: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Lease End *
                  </label>
                  <Input
                    type="date"
                    value={form.leaseEnd}
                    onChange={(e) =>
                      setForm({ ...form, leaseEnd: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Available From *
                  </label>
                  <Input
                    type="date"
                    value={form.availableDate}
                    onChange={(e) =>
                      setForm({ ...form, availableDate: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: "furnished", label: "Furnished" },
                  { key: "utilitiesIncluded", label: "Utilities Included" },
                  { key: "parkingIncluded", label: "Parking Included" },
                  { key: "petFriendly", label: "Pet Friendly" },
                ].map((feature) => (
                  <label
                    key={feature.key}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      form[feature.key as keyof FormData]
                        ? "border-burnt-orange bg-burnt-orange/5"
                        : "border-border-base hover:border-border-strong"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={form[feature.key as keyof FormData] as boolean}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          [feature.key]: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded border-border-strong text-burnt-orange focus:ring-burnt-orange accent-burnt-orange"
                    />
                    <span className="text-sm font-medium text-text-secondary">
                      {feature.label}
                    </span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Contact Email
                  </label>
                  <Input
                    type="email"
                    value={form.contactEmail}
                    onChange={(e) =>
                      setForm({ ...form, contactEmail: e.target.value })
                    }
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Contact Phone
                  </label>
                  <Input
                    type="tel"
                    value={form.contactPhone}
                    onChange={(e) =>
                      setForm({ ...form, contactPhone: e.target.value })
                    }
                    placeholder="(512) 555-1234"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-4">
            <Button type="submit" size="lg" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post Sublease"
              )}
            </Button>
            <Link href="/subleases">
              <Button variant="outline" size="lg" type="button">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
