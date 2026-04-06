import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(request: Request, context: RouteContext) {
  const limited = await checkRateLimit(request);
  if (limited) return limited;

  try {
    const { slug } = await context.params;

    const apartment = await prisma.apartment.findUnique({
      where: { slug },
      select: {
        id: true,
        floorPlans: {
          select: {
            id: true,
            name: true,
            bedrooms: true,
            priceMin: true,
            priceMax: true,
          },
          orderBy: { bedrooms: "asc" },
        },
      },
    });

    if (!apartment) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const snapshots = await prisma.priceSnapshot.findMany({
      where: { apartmentId: apartment.id },
      orderBy: { recordedAt: "asc" },
      select: {
        floorPlanId: true,
        priceMin: true,
        priceMax: true,
        recordedAt: true,
      },
    });

    // Group snapshots by date, averaging across floor plans per date
    const dateMap = new Map<
      string,
      { date: string; prices: Map<string, { min: number; max: number | null }> }
    >();

    for (const snap of snapshots) {
      const dateKey = snap.recordedAt.toISOString().split("T")[0];
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, { date: dateKey, prices: new Map() });
      }
      dateMap.get(dateKey)!.prices.set(snap.floorPlanId, {
        min: snap.priceMin,
        max: snap.priceMax,
      });
    }

    // Build per-floor-plan time series
    const floorPlanSeries = apartment.floorPlans.map((fp) => {
      const dataPoints: {
        date: string;
        priceMin: number;
        priceMax: number | null;
      }[] = [];

      for (const [, entry] of dateMap) {
        const price = entry.prices.get(fp.id);
        if (price) {
          dataPoints.push({
            date: entry.date,
            priceMin: price.min,
            priceMax: price.max,
          });
        }
      }

      return {
        floorPlanId: fp.id,
        name: fp.name,
        bedrooms: fp.bedrooms,
        currentPrice: fp.priceMin,
        currentPriceMax: fp.priceMax,
        dataPoints,
      };
    });

    // Build aggregate time series (overall min across all floor plans per date)
    const aggregateSeries: { date: string; priceMin: number; priceMax: number }[] =
      [];
    for (const [, entry] of dateMap) {
      const mins: number[] = [];
      const maxes: number[] = [];
      for (const [, price] of entry.prices) {
        mins.push(price.min);
        maxes.push(price.max ?? price.min);
      }
      if (mins.length > 0) {
        aggregateSeries.push({
          date: entry.date,
          priceMin: Math.min(...mins),
          priceMax: Math.max(...maxes),
        });
      }
    }

    return NextResponse.json(
      {
        floorPlans: floorPlanSeries,
        aggregate: aggregateSeries,
        hasHistory: snapshots.length > 0,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (error) {
    console.error("Error fetching price history:", error);
    return NextResponse.json(
      { error: "Failed to fetch price history" },
      { status: 500 },
    );
  }
}
