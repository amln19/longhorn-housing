"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import {
  Users,
  Loader2,
  MapPin,
  DollarSign,
  Moon,
  Volume2,
  Sparkles,
  ArrowRight,
  UserPlus,
  GraduationCap,
  Mail,
} from "lucide-react";

type RoommateProfile = {
  id: string;
  name: string;
  age: number | null;
  gender: string | null;
  major: string | null;
  gradYear: number | null;
  bio: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  preferredNeighborhoods: string[];
  sleepSchedule: string | null;
  noiseLevel: string | null;
  cleanliness: string | null;
  guests: string | null;
  smoking: boolean;
  pets: boolean;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    avatarUrl: string | null;
  };
};

type Match = {
  profile: RoommateProfile;
  compatibility: number;
};

const NEIGHBORHOOD_LABELS: Record<string, string> = {
  "west-campus": "West Campus",
  "north-campus": "North Campus",
  riverside: "Riverside",
  "east-riverside": "East Riverside",
  "hyde-park": "Hyde Park",
  "far-west": "Far West",
  "north-loop": "North Loop",
  downtown: "Downtown",
};

function getCompatibilityColor(score: number) {
  if (score >= 80) return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800";
  if (score >= 60) return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800";
  if (score >= 40) return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
  return "bg-surface-raised text-text-secondary border-border-base";
}

function getCompatibilityLabel(score: number) {
  if (score >= 80) return "Great Match";
  if (score >= 60) return "Good Match";
  if (score >= 40) return "Fair Match";
  return "Low Match";
}

export default function RoommatesPage() {
  const { user, loading: authLoading } = useAuth();
  const [view, setView] = useState<"matches" | "browse">("browse");
  const [profiles, setProfiles] = useState<RoommateProfile[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [browseFetchError, setBrowseFetchError] = useState<
    "unauthorized" | "failed" | null
  >(null);
  const [filterNoise, setFilterNoise] = useState("");

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    void (async () => {
      if (user && view === "matches") {
        setBrowseFetchError(null);
        setLoading(true);
        try {
          const r = await fetch("/api/roommates/matches");
          const data = await r.json();
          if (cancelled) return;
          if (!r.ok) {
            setMatches([]);
            if (data.error) setView("browse");
            return;
          }
          if (data.matches) setMatches(data.matches);
        } catch {
          if (!cancelled) setMatches([]);
        } finally {
          if (!cancelled) setLoading(false);
        }
        return;
      }

      if (view !== "browse") return;

      if (!user) {
        setProfiles([]);
        setBrowseFetchError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setBrowseFetchError(null);
      const params = new URLSearchParams();
      if (filterNoise) params.set("noiseLevel", filterNoise);
      try {
        const r = await fetch(`/api/roommates?${params}`);
        const data = await r.json();
        if (cancelled) return;
        if (!r.ok) {
          setProfiles([]);
          setBrowseFetchError(r.status === 401 ? "unauthorized" : "failed");
          return;
        }
        setBrowseFetchError(null);
        setProfiles(Array.isArray(data.profiles) ? data.profiles : []);
      } catch {
        if (!cancelled) {
          setProfiles([]);
          setBrowseFetchError("failed");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, view, filterNoise]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
              <Users className="h-8 w-8 text-burnt-orange" />
              Find Roommates
            </h1>
            <p className="text-text-muted mt-1">
              Connect with compatible roommates near UT Austin
            </p>
          </div>
          <div className="flex gap-3">
            {user && (
              <Link href="/roommates/profile">
                <Button variant="outline">
                  <UserPlus className="h-4 w-4 mr-2" />
                  My Profile
                </Button>
              </Link>
            )}
            {!user && (
              <Link href="/auth/login">
                <Button>
                  Sign in to match
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* View Toggle & Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          {user && (
            <div className="flex bg-surface-raised rounded-xl p-1">
              <button
                onClick={() => setView("browse")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  view === "browse"
                    ? "bg-surface text-text-primary shadow-sm"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                Browse All
              </button>
              <button
                onClick={() => setView("matches")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
                  view === "matches"
                    ? "bg-surface text-text-primary shadow-sm"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                <Sparkles className="h-4 w-4" />
                My Matches
              </button>
            </div>
          )}
          {view === "browse" && user && (
            <Select
              value={filterNoise}
              onChange={(e) => setFilterNoise(e.target.value)}
              options={[
                { value: "", label: "All Noise Levels" },
                { value: "quiet", label: "Quiet" },
                { value: "moderate", label: "Moderate" },
                { value: "social", label: "Social" },
              ]}
            />
          )}
        </div>

        {/* Content */}
        {authLoading || loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-burnt-orange" />
          </div>
        ) : view === "matches" ? (
          matches.length === 0 ? (
            <EmptyState
              message="No matches found yet"
              sub="Make sure your profile is complete for better matches"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map((m) => (
                <RoommateCard
                  key={m.profile.id}
                  profile={m.profile}
                  compatibility={m.compatibility}
                />
              ))}
            </div>
          )
        ) : !user ? (
          <EmptyState
            message="Sign in to browse roommates"
            sub="Profiles and contact info are only shown to signed-in users."
            action={{ href: "/auth/login?next=/roommates", label: "Sign in" }}
          />
        ) : browseFetchError === "unauthorized" ? (
          <EmptyState
            message="Couldn&apos;t load profiles"
            sub="Your session may have expired. Sign in again to continue."
            action={{ href: "/auth/login?next=/roommates", label: "Sign in" }}
          />
        ) : browseFetchError === "failed" ? (
          <EmptyState
            message="Something went wrong"
            sub="We couldn&apos;t load roommate profiles. Try again in a moment."
            action={{ label: "Try again", onClick: () => window.location.reload() }}
          />
        ) : profiles.length === 0 ? (
          <EmptyState
            message="No roommate profiles yet"
            sub="Be the first to create a profile!"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles
              .filter((p) => p.user.id !== user?.id)
              .map((p) => (
                <RoommateCard key={p.id} profile={p} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RoommateCard({
  profile,
  compatibility,
}: {
  profile: RoommateProfile;
  compatibility?: number;
}) {
  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-burnt-orange/10 text-burnt-orange flex items-center justify-center font-bold text-lg">
              {initials}
            </div>
            <div>
              <CardTitle className="text-lg">{profile.name}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-text-muted">
                {profile.age && <span>{profile.age} years old</span>}
                {profile.gender && profile.age && <span>·</span>}
                {profile.gender && (
                  <span className="capitalize">{profile.gender}</span>
                )}
              </div>
            </div>
          </div>
          {compatibility !== undefined && (
            <div
              className={`px-3 py-1 rounded-full text-sm font-semibold border ${getCompatibilityColor(compatibility)}`}
            >
              {compatibility}%
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {compatibility !== undefined && (
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 h-2 bg-surface-raised rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  compatibility >= 80
                    ? "bg-green-500"
                    : compatibility >= 60
                      ? "bg-blue-500"
                      : compatibility >= 40
                        ? "bg-yellow-500"
                        : "bg-gray-400"
                }`}
                style={{ width: `${compatibility}%` }}
              />
            </div>
            <span className="text-xs text-text-muted font-medium">
              {getCompatibilityLabel(compatibility)}
            </span>
          </div>
        )}

        {profile.bio && (
          <p className="text-sm text-text-secondary line-clamp-2">{profile.bio}</p>
        )}

        <div className="flex flex-wrap gap-2">
          {profile.major && (
            <Badge variant="secondary" className="gap-1">
              <GraduationCap className="h-3 w-3" />
              {profile.major}
              {profile.gradYear && ` '${profile.gradYear.toString().slice(2)}`}
            </Badge>
          )}
          {profile.budgetMin != null && profile.budgetMax != null && (
            <Badge variant="secondary" className="gap-1">
              <DollarSign className="h-3 w-3" />
              ${profile.budgetMin} - ${profile.budgetMax}
            </Badge>
          )}
          {profile.sleepSchedule && (
            <Badge variant="secondary" className="gap-1">
              <Moon className="h-3 w-3" />
              {profile.sleepSchedule === "early-bird"
                ? "Early Bird"
                : profile.sleepSchedule === "night-owl"
                  ? "Night Owl"
                  : "Flexible"}
            </Badge>
          )}
          {profile.noiseLevel && (
            <Badge variant="secondary" className="gap-1">
              <Volume2 className="h-3 w-3" />
              {profile.noiseLevel.charAt(0).toUpperCase() +
                profile.noiseLevel.slice(1)}
            </Badge>
          )}
        </div>

        {profile.preferredNeighborhoods.length > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-text-muted">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {profile.preferredNeighborhoods
                .map((n) => NEIGHBORHOOD_LABELS[n] || n)
                .join(", ")}
            </span>
          </div>
        )}

        <div className="pt-2 border-t border-border-base">
          {profile.user.email ? (
            <a
              href={`mailto:${profile.user.email}`}
              className="flex items-center gap-2 text-sm text-burnt-orange font-medium hover:underline"
            >
              <Mail className="h-4 w-4" />
              Contact
            </a>
          ) : (
            <span className="flex items-center gap-2 text-sm text-text-muted">
              <Mail className="h-4 w-4" />
              Contact unavailable
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({
  message,
  sub,
  action = { href: "/roommates/profile", label: "Create Your Profile" },
}: {
  message: string;
  sub: string;
  action?:
    | { href: string; label: string }
    | { label: string; onClick: () => void };
}) {
  return (
    <div className="text-center py-20">
      <Users className="h-16 w-16 mx-auto text-text-muted mb-4" />
      <p className="text-lg font-medium text-text-secondary">{message}</p>
      <p className="text-sm text-text-muted mt-1">{sub}</p>
      {"href" in action ? (
        <Link href={action.href}>
          <Button className="mt-6">
            {action.label}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      ) : (
        <Button type="button" className="mt-6" onClick={action.onClick}>
          {action.label}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      )}
    </div>
  );
}
