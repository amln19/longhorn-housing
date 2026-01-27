import Link from "next/link";
import {
  ArrowRight,
  MapPin,
  Search,
  GitCompare,
  Star,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Search,
    title: "Smart Search",
    description: "Filter by price, bedrooms, amenities, and distance to campus",
  },
  {
    icon: GitCompare,
    title: "Side-by-Side Compare",
    description:
      "Compare up to 4 apartments at once to find your perfect match",
  },
  {
    icon: MapPin,
    title: "Interactive Map",
    description: "See all apartments on a map with walk times to campus",
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
              Browse verified listings, compare amenities and prices, and find
              your ideal apartment near The University of Texas at Austin.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-6">
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
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="border-t border-white/20 bg-black/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-3 gap-8">
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
                  Free
                </div>
                <div className="text-white/90 text-sm">No Hidden Fees</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Everything You Need to Find Housing
            </h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              We{"'"}ve built the tools to make your apartment search as easy as
              possible
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-xl bg-burnt-orange/10 flex items-center justify-center mb-6">
                    <feature.icon className="h-6 w-6 text-burnt-orange" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
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
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Search & Filter
                </h3>
                <p className="text-gray-600">
                  Use our powerful filters to narrow down apartments by price,
                  bedrooms, amenities, and distance to campus.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-burnt-orange flex items-center justify-center mb-6 shadow-lg shadow-burnt-orange/30">
                  <GitCompare className="h-8 w-8 text-white" />
                </div>
                <div
                  className="absolute top-8 left-1/2 w-full h-0.5 bg-linear-to-r from-burnt-orange/30 via-burnt-orange/30 to-transparent hidden md:block"
                  style={{ transform: "translateX(25%)" }}
                />
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-burnt-orange/10 text-burnt-orange font-bold text-sm mb-4">
                  2
                </span>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Compare Options
                </h3>
                <p className="text-gray-600">
                  Add your favorites to compare and see them side-by-side. Make
                  informed decisions with all the details.
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
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Find Your Home
                </h3>
                <p className="text-gray-600">
                  Contact properties directly through their website. We provide
                  all the info you need to get started.
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
      <section className="py-20 bg-linear-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Students Choose Us
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Up-to-Date Listings
                    </h3>
                    <p className="text-gray-600 text-sm">
                      We regularly update our database to ensure accurate
                      pricing and availability information.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Walk Time to Campus
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Every listing includes estimated walk, bike, and bus times
                      to UT Austin.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <GitCompare className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Easy Comparison
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Compare up to 4 apartments side-by-side to find your
                      perfect match.
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
            preferences and compare your top choices.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/apartments">
              <Button
                size="lg"
                className="bg-white text-burnt-orange hover:bg-white hover:[box-shadow:0_0_20px_rgba(255,255,255,0.6)] hover:scale-105 px-8 transition-all duration-200"
              >
                Start Searching
                <ArrowRight className="ml-2 h-5 w-5" />
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
