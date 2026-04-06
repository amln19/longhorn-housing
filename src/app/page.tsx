import Link from "next/link";
import {
  ArrowRight,
  MapPin,
  Search,
  GitCompare,
  Star,
  TrendingUp,
  Users,
  FileText,
  Heart,
  Navigation,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Search,
    title: "Smart Search",
    description:
      "Filter by price, bedrooms, amenities, and distance to campus",
  },
  {
    icon: GitCompare,
    title: "Side-by-Side Compare",
    description:
      "Compare up to 4 apartments at once to find your perfect match",
  },
  {
    icon: TrendingUp,
    title: "Price Trends",
    description:
      "Track weekly price changes and see historical pricing data for every apartment",
  },
  {
    icon: Navigation,
    title: "Route Planner",
    description:
      "Search UT buildings and see walking routes from any apartment on the interactive map",
  },
  {
    icon: Users,
    title: "Roommate Matching",
    description:
      "Find compatible roommates based on budget, lifestyle, and neighborhood preferences",
  },
  {
    icon: FileText,
    title: "Sublease Marketplace",
    description:
      "Post or find subleases and lease transfers near campus",
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-linear-to-br from-[#bf5700] to-[#ffa060] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Off-Campus Housing
              <br />
              <span className="text-white">Made Simple</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-white/90 max-w-2xl">
              Browse verified listings, compare amenities and prices, track
              price trends, find roommates, and discover subleases near The
              University of Texas at Austin.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link href="/apartments">
                <Button
                  size="lg"
                  className="bg-white text-burnt-orange hover:bg-white hover:[box-shadow:0_0_20px_rgba(255,255,255,0.6)] hover:scale-105 w-full sm:w-auto transition-all duration-200"
                >
                  Browse Apartments
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/map">
                <Button
                  size="lg"
                  className="bg-transparent text-white border border-white/60 hover:bg-white/15 w-full sm:w-auto transition-all duration-200"
                >
                  <MapPin className="mr-2 h-5 w-5" />
                  View Map
                </Button>
              </Link>
              <Link href="/subleases">
                <Button
                  size="lg"
                  className="bg-transparent text-white border border-white/60 hover:bg-white/15 w-full sm:w-auto transition-all duration-200"
                >
                  <FileText className="mr-2 h-5 w-5" />
                  Subleases
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="border-t border-white/20 bg-black/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">
                  100+
                </div>
                <div className="text-white/90 text-sm">Verified Listings</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">
                  $800+
                </div>
                <div className="text-white/90 text-sm">Starting Price</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">
                  Weekly
                </div>
                <div className="text-white/90 text-sm">Price Updates</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">
                  Free
                </div>
                <div className="text-white/90 text-sm">No Hidden Fees</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-surface-raised">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary">
              Everything You Need to Find Housing
            </h2>
            <p className="mt-4 text-text-secondary max-w-2xl mx-auto">
              We&apos;ve built the tools to make your apartment search as easy
              as possible
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-xl bg-burnt-orange/10 flex items-center justify-center mb-6">
                    <feature.icon className="h-6 w-6 text-burnt-orange" />
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-surface">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-text-primary">How It Works</h2>
            <p className="mt-4 text-text-secondary max-w-2xl mx-auto">
              Find your next home in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-burnt-orange flex items-center justify-center mb-6 shadow-lg shadow-burnt-orange/30">
                  <Search className="h-8 w-8 text-white" />
                </div>
                <div
                  className="absolute top-8 left-1/2 w-full h-0.5 bg-linear-to-r from-transparent via-burnt-orange/30 to-burnt-orange/30 hidden md:block"
                  style={{ transform: "translateX(25%)" }}
                />
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-burnt-orange/10 text-burnt-orange font-bold text-sm mb-4">
                  1
                </span>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  Search & Filter
                </h3>
                <p className="text-text-secondary">
                  Use our powerful filters to narrow down apartments by price,
                  bedrooms, amenities, and distance to campus.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-burnt-orange flex items-center justify-center mb-6 shadow-lg shadow-burnt-orange/30">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <div
                  className="absolute top-8 left-1/2 w-full h-0.5 bg-linear-to-r from-burnt-orange/30 via-burnt-orange/30 to-transparent hidden md:block"
                  style={{ transform: "translateX(25%)" }}
                />
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-burnt-orange/10 text-burnt-orange font-bold text-sm mb-4">
                  2
                </span>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  Save & Compare
                </h3>
                <p className="text-text-secondary">
                  Save your favorites, compare side-by-side, and track price
                  trends to make informed decisions.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-burnt-orange flex items-center justify-center mb-6 shadow-lg shadow-burnt-orange/30">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-burnt-orange/10 text-burnt-orange font-bold text-sm mb-4">
                  3
                </span>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  Find Your Home
                </h3>
                <p className="text-text-secondary">
                  Contact properties directly, find roommates, or discover
                  subleases — all in one place.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link href="/apartments">
              <Button size="lg" className="shadow-lg shadow-burnt-orange/20">
                Start Your Search
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-surface-raised">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-text-primary mb-6">
                Why Students Choose Us
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary mb-1">
                      Price Tracking
                    </h3>
                    <p className="text-text-secondary text-sm">
                      Weekly price snapshots let you see exactly how prices
                      change over time for every apartment.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary mb-1">
                      Roommate Matching
                    </h3>
                    <p className="text-text-secondary text-sm">
                      Our compatibility algorithm matches you with roommates
                      based on lifestyle, budget, and neighborhood preferences.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Navigation className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary mb-1">
                      Route Planning
                    </h3>
                    <p className="text-text-secondary text-sm">
                      Search any UT building and instantly see walking routes
                      and times from apartments on the map.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-linear-to-br from-[#bf5700] to-[#ffa060] rounded-3xl p-8 text-white">
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-2xl font-bold mb-2">Ready to explore?</h3>
                <p className="text-white/80 mb-6">
                  Browse all available apartments near UT Austin and find your
                  next home.
                </p>
                <Link href="/apartments">
                  <Button className="bg-white text-burnt-orange hover:bg-white hover:[box-shadow:0_0_20px_rgba(255,255,255,0.6)] transition-all duration-200">
                    View All Apartments
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-linear-to-br from-gray-900 via-gray-900 to-gray-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Find Your New Home?
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-10 text-lg">
            Start exploring apartments near UT Austin today. Filter by your
            preferences, compare your top choices, and find the perfect roommate.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/apartments">
              <Button
                size="lg"
                className="bg-white text-burnt-orange hover:bg-white hover:[box-shadow:0_0_20px_rgba(255,255,255,0.6)] hover:scale-105 px-8 transition-all duration-200"
              >
                Start Searching
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/roommates">
              <Button
                size="lg"
                className="bg-transparent text-white border border-white/40 hover:bg-white/15 hover:border-white/60 transition-all duration-200"
              >
                <Users className="mr-2 h-5 w-5" />
                Find Roommates
              </Button>
            </Link>
            <Link href="/map">
              <Button
                size="lg"
                className="bg-transparent text-white border border-white/40 hover:bg-white/15 hover:border-white/60 transition-all duration-200"
              >
                <MapPin className="mr-2 h-5 w-5" />
                Explore Map
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
