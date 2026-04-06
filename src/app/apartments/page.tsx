import { Suspense } from "react";
import { ApartmentsContent } from "./apartments-content";
import { ErrorBoundary } from "@/components/error-boundary";
import { Loader2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { buildWhereClause, queryApartmentCards } from "@/lib/apartments";

export const revalidate = 3600;

const PAGE_SIZE = 12;

export const metadata = {
  title: "Browse Apartments | Longhorn Housing",
  description:
    "Search and filter apartments near UT Austin by neighborhood, price, bedrooms, and amenities.",
};

async function ApartmentsDataLoader({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const neighborhood =
    typeof params.neighborhood === "string" ? params.neighborhood : undefined;

  const [initialResult, neighborhoods, amenities] = await Promise.all([
    queryApartmentCards({
      where: buildWhereClause({ neighborhood }),
      sort: "price-asc",
      page: 1,
      limit: PAGE_SIZE,
    }),
    prisma.neighborhood.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { apartments: true } } },
    }),
    prisma.amenity.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
    }),
  ]);

  return (
    <ApartmentsContent
      initialApartments={initialResult.data}
      initialTotal={initialResult.total}
      neighborhoods={neighborhoods.map((n) => ({
        id: n.id,
        name: n.name,
        slug: n.slug,
      }))}
      amenities={amenities.map((a) => ({
        id: a.id,
        name: a.name,
        category: a.category,
      }))}
      initialNeighborhood={neighborhood}
      pageSize={PAGE_SIZE}
    />
  );
}

export default function ApartmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-text-primary">
                Apartments Near UT Austin
              </h1>
              <p className="mt-2 text-text-secondary text-lg">
                Find your perfect off-campus home
              </p>
            </div>
          </div>
        </div>

        <ErrorBoundary>
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-burnt-orange mx-auto mb-4" />
                  <p className="text-text-muted">Loading apartments...</p>
                </div>
              </div>
            }
          >
            <ApartmentsDataLoader searchParams={searchParams} />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}
