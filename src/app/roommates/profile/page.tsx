"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, Users, UserX, UserCheck } from "lucide-react";

const NEIGHBORHOODS = [
  { value: "west-campus", label: "West Campus" },
  { value: "north-campus", label: "North Campus" },
  { value: "riverside", label: "Riverside" },
  { value: "east-riverside", label: "East Riverside" },
  { value: "hyde-park", label: "Hyde Park" },
  { value: "far-west", label: "Far West" },
  { value: "north-loop", label: "North Loop" },
  { value: "downtown", label: "Downtown" },
];

type FormData = {
  name: string;
  age: string;
  gender: string;
  major: string;
  gradYear: string;
  bio: string;
  budgetMin: string;
  budgetMax: string;
  moveInDate: string;
  preferredNeighborhoods: string[];
  sleepSchedule: string;
  noiseLevel: string;
  cleanliness: string;
  guests: string;
  smoking: boolean;
  pets: boolean;
};

const INITIAL: FormData = {
  name: "",
  age: "",
  gender: "",
  major: "",
  gradYear: "",
  bio: "",
  budgetMin: "",
  budgetMax: "",
  moveInDate: "",
  preferredNeighborhoods: [],
  sleepSchedule: "",
  noiseLevel: "",
  cleanliness: "",
  guests: "",
  smoking: false,
  pets: false,
};

export default function RoommateProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<FormData>(INITIAL);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [success, setSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }

    fetch("/api/roommates/me")
      .then((r) => r.json())
      .then((data) => {
        const existing = data.profile;
        if (existing) {
          setHasProfile(true);
          setIsActive(existing.active ?? true);
          setForm({
            name: existing.name || "",
            age: existing.age?.toString() || "",
            gender: existing.gender || "",
            major: existing.major || "",
            gradYear: existing.gradYear?.toString() || "",
            bio: existing.bio || "",
            budgetMin: existing.budgetMin?.toString() || "",
            budgetMax: existing.budgetMax?.toString() || "",
            moveInDate: existing.moveInDate
              ? new Date(existing.moveInDate).toISOString().split("T")[0]
              : "",
            preferredNeighborhoods: existing.preferredNeighborhoods || [],
            sleepSchedule: existing.sleepSchedule || "",
            noiseLevel: existing.noiseLevel || "",
            cleanliness: existing.cleanliness || "",
            guests: existing.guests || "",
            smoking: existing.smoking || false,
            pets: existing.pets || false,
          });
        } else {
          setForm((prev) => ({ ...prev, name: user.name || "" }));
        }
      })
      .catch(() => {})
      .finally(() => setLoadingProfile(false));
  }, [user, authLoading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setSaveError(null);

    try {
      const res = await fetch("/api/roommates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          typeof data.error === "string"
            ? data.error
            : "Could not save profile. Check the form and try again.";
        setSaveError(msg);
        return;
      }
      setHasProfile(true);
      setIsActive(true);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setSaveError("Network error. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    setRemoving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/roommates", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSaveError(
          typeof data.error === "string"
            ? data.error
            : "Could not update visibility. Try again.",
        );
        return;
      }
      setIsActive(false);
    } catch {
      setSaveError("Network error. Try again.");
    } finally {
      setRemoving(false);
    }
  }

  function toggleNeighborhood(slug: string) {
    setForm((prev) => ({
      ...prev,
      preferredNeighborhoods: prev.preferredNeighborhoods.includes(slug)
        ? prev.preferredNeighborhoods.filter((n) => n !== slug)
        : [...prev.preferredNeighborhoods, slug],
    }));
  }

  if (authLoading || loadingProfile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-burnt-orange" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
            <Users className="h-8 w-8 text-burnt-orange" />
            Roommate Profile
          </h1>
          <p className="text-text-muted mt-2">
            Fill out your profile to get matched with compatible roommates
          </p>
        </div>

        {/* Active / inactive status banner */}
        {hasProfile && (
          <div
            className={`flex items-center justify-between gap-4 rounded-xl border-2 px-5 py-4 mb-6 ${
              isActive
                ? "border-green-500/30 bg-green-50 dark:bg-green-950/20"
                : "border-border-base bg-surface-raised"
            }`}
          >
            <div className="flex items-center gap-3">
              {isActive ? (
                <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
              ) : (
                <UserX className="h-5 w-5 text-text-muted shrink-0" />
              )}
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  {isActive
                    ? "Your profile is visible in roommate search"
                    : "Your profile is hidden from roommate search"}
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  {isActive
                    ? "Other students can find and contact you. Remove yourself once you've found a roommate."
                    : "Save your profile below to make it visible again."}
                </p>
              </div>
            </div>
            {isActive && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemove}
                disabled={removing}
                className="shrink-0 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                {removing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <UserX className="h-4 w-4 mr-1.5" />
                    Remove from Search
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {saveError && (
            <div className="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm p-4 rounded-xl border border-red-200 dark:border-red-900">
              {saveError}
            </div>
          )}
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>About You</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Name *
                  </label>
                  <Input
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Age
                  </label>
                  <Input
                    type="number"
                    value={form.age}
                    onChange={(e) =>
                      setForm({ ...form, age: e.target.value })
                    }
                    placeholder="e.g. 20"
                    min={17}
                    max={40}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Gender
                  </label>
                  <Select
                    value={form.gender}
                    onChange={(e) =>
                      setForm({ ...form, gender: e.target.value })
                    }
                    options={[
                      { value: "", label: "Prefer not to say" },
                      { value: "male", label: "Male" },
                      { value: "female", label: "Female" },
                      { value: "non-binary", label: "Non-binary" },
                      { value: "other", label: "Other" },
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Major
                  </label>
                  <Input
                    value={form.major}
                    onChange={(e) =>
                      setForm({ ...form, major: e.target.value })
                    }
                    placeholder="e.g. Computer Science"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Graduation Year
                  </label>
                  <Input
                    type="number"
                    value={form.gradYear}
                    onChange={(e) =>
                      setForm({ ...form, gradYear: e.target.value })
                    }
                    placeholder="e.g. 2027"
                    min={2025}
                    max={2035}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Bio
                </label>
                <textarea
                  value={form.bio}
                  onChange={(e) =>
                    setForm({ ...form, bio: e.target.value })
                  }
                  placeholder="Tell potential roommates about yourself..."
                  rows={3}
                  className="w-full rounded-xl border-2 border-border-base bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-burnt-orange/20 focus:border-burnt-orange resize-none"
                  maxLength={500}
                />
              </div>
            </CardContent>
          </Card>

          {/* Budget & Move-in */}
          <Card>
            <CardHeader>
              <CardTitle>Budget & Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Min Budget ($/mo)
                  </label>
                  <Input
                    type="number"
                    value={form.budgetMin}
                    onChange={(e) =>
                      setForm({ ...form, budgetMin: e.target.value })
                    }
                    placeholder="e.g. 800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Max Budget ($/mo)
                  </label>
                  <Input
                    type="number"
                    value={form.budgetMax}
                    onChange={(e) =>
                      setForm({ ...form, budgetMax: e.target.value })
                    }
                    placeholder="e.g. 1500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Preferred Move-in Date
                </label>
                <Input
                  type="date"
                  value={form.moveInDate}
                  onChange={(e) =>
                    setForm({ ...form, moveInDate: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Neighborhoods */}
          <Card>
            <CardHeader>
              <CardTitle>Preferred Neighborhoods</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {NEIGHBORHOODS.map((n) => (
                  <button
                    key={n.value}
                    type="button"
                    onClick={() => toggleNeighborhood(n.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                      form.preferredNeighborhoods.includes(n.value)
                        ? "bg-burnt-orange text-white border-burnt-orange"
                        : "bg-surface text-text-secondary border-border-base hover:border-burnt-orange/50"
                    }`}
                  >
                    {n.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Lifestyle */}
          <Card>
            <CardHeader>
              <CardTitle>Lifestyle Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Sleep Schedule
                  </label>
                  <Select
                    value={form.sleepSchedule}
                    onChange={(e) =>
                      setForm({ ...form, sleepSchedule: e.target.value })
                    }
                    options={[
                      { value: "", label: "Select..." },
                      { value: "early-bird", label: "Early Bird (before 10pm)" },
                      { value: "night-owl", label: "Night Owl (after midnight)" },
                      { value: "flexible", label: "Flexible" },
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Noise Level
                  </label>
                  <Select
                    value={form.noiseLevel}
                    onChange={(e) =>
                      setForm({ ...form, noiseLevel: e.target.value })
                    }
                    options={[
                      { value: "", label: "Select..." },
                      { value: "quiet", label: "Quiet" },
                      { value: "moderate", label: "Moderate" },
                      { value: "social", label: "Social / Lively" },
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Cleanliness
                  </label>
                  <Select
                    value={form.cleanliness}
                    onChange={(e) =>
                      setForm({ ...form, cleanliness: e.target.value })
                    }
                    options={[
                      { value: "", label: "Select..." },
                      { value: "very-clean", label: "Very Clean" },
                      { value: "clean", label: "Clean" },
                      { value: "relaxed", label: "Relaxed" },
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Guests
                  </label>
                  <Select
                    value={form.guests}
                    onChange={(e) =>
                      setForm({ ...form, guests: e.target.value })
                    }
                    options={[
                      { value: "", label: "Select..." },
                      { value: "rarely", label: "Rarely" },
                      { value: "sometimes", label: "Sometimes" },
                      { value: "often", label: "Often" },
                    ]}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.smoking}
                    onChange={(e) =>
                      setForm({ ...form, smoking: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-border-strong text-burnt-orange focus:ring-burnt-orange accent-burnt-orange"
                  />
                  <span className="text-sm text-text-secondary">Smoker</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.pets}
                    onChange={(e) =>
                      setForm({ ...form, pets: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-border-strong text-burnt-orange focus:ring-burnt-orange accent-burnt-orange"
                  />
                  <span className="text-sm text-text-secondary">Has Pets</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex items-center gap-4">
            <Button type="submit" size="lg" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : !isActive && hasProfile ? (
                <>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Save & Re-activate Profile
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
            {success && (
              <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                {isActive ? "Profile saved & visible in search!" : "Profile saved successfully!"}
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
