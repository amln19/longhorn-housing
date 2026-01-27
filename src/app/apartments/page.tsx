import { Suspense } from "react";
import { ApartmentsContent } from "./apartments-content";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Browse Apartments | Longhorn Housing",
  description:
    "Search and filter apartments near UT Austin by neighborhood, price, bedrooms, and amenities.",
};

export default function ApartmentsPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Apartments Near UT Austin
              </h1>
              <p className="mt-2 text-gray-600 text-lg">
                Find your perfect off-campus home
              </p>
            </div>
          </div>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-burnt-orange mx-auto mb-4" />
                <p className="text-gray-500">Loading apartments...</p>
              </div>
            </div>
          }
        >
          <ApartmentsContent />
        </Suspense>
      </div>
    </div>
  );
}
