"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useFavorites } from "@/hooks/use-favorites";
import { ApartmentCardComponent } from "@/components/apartments/apartment-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Users,
  FileText,
  Loader2,
  ArrowRight,
  User,
} from "lucide-react";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { favorites, loading: loadingFavs } = useFavorites();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-burnt-orange" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-surface rounded-2xl border border-border-base p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-burnt-orange text-white flex items-center justify-center text-2xl font-bold">
              {user.name
                ? user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)
                : user.email[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">
                {user.name || "Welcome!"}
              </h1>
              <p className="text-text-muted">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Link href="/roommates/profile">
            <Card className="hover:border-burnt-orange/50 hover:shadow-lg transition-all cursor-pointer h-full">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">
                    Roommate Profile
                  </h3>
                  <p className="text-sm text-text-muted">
                    Set up your profile to find matches
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-text-muted ml-auto" />
              </CardContent>
            </Card>
          </Link>
          <Link href="/subleases/new">
            <Card className="hover:border-burnt-orange/50 hover:shadow-lg transition-all cursor-pointer h-full">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                  <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">
                    Post Sublease
                  </h3>
                  <p className="text-sm text-text-muted">
                    List your place on the marketplace
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-text-muted ml-auto" />
              </CardContent>
            </Card>
          </Link>
          <Link href="/roommates">
            <Card className="hover:border-burnt-orange/50 hover:shadow-lg transition-all cursor-pointer h-full">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                  <User className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">
                    Browse Roommates
                  </h3>
                  <p className="text-sm text-text-muted">
                    Find compatible roommates near UT
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-text-muted ml-auto" />
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Favorites Section */}
        <div id="favorites">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Saved Apartments
                {favorites.length > 0 && (
                  <span className="text-sm font-normal text-text-muted">
                    ({favorites.length})
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingFavs ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-text-muted" />
                </div>
              ) : favorites.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="h-12 w-12 mx-auto text-text-muted mb-3" />
                  <p className="text-text-secondary font-medium">
                    No saved apartments yet
                  </p>
                  <p className="text-sm text-text-muted mt-1">
                    Click the heart icon on any apartment to save it here
                  </p>
                  <Link href="/apartments">
                    <Button variant="outline" className="mt-4">
                      Browse Apartments
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favorites.map((apt) => (
                    <ApartmentCardComponent key={apt.id} apartment={apt} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
