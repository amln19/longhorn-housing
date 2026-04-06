import { NextResponse } from "next/server";
import {
  APARTMENT_LIST_MAX_LIMIT,
  APARTMENT_LIST_MAX_PAGE,
  buildWhereClause,
  queryApartmentCards,
} from "@/lib/apartments";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const rateLimited = await checkRateLimit(request);
  if (rateLimited) return rateLimited;

  try {
    const { searchParams } = new URL(request.url);

    const where = buildWhereClause({
      search: searchParams.get("search"),
      neighborhood: searchParams.get("neighborhood"),
      minPrice: searchParams.get("minPrice"),
      maxPrice: searchParams.get("maxPrice"),
      bedrooms: searchParams.get("bedrooms"),
      petFriendly: searchParams.get("petFriendly"),
      availableNow: searchParams.get("availableNow"),
      amenityIds: searchParams.get("amenities"),
    });

    const sort = searchParams.get("sort") || "price-asc";
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");

    const page = pageParam
      ? Math.min(
          APARTMENT_LIST_MAX_PAGE,
          Math.max(1, parseInt(pageParam, 10) || 1),
        )
      : undefined;
    const limit = limitParam
      ? Math.min(
          APARTMENT_LIST_MAX_LIMIT,
          Math.max(1, parseInt(limitParam, 10) || 1),
        )
      : undefined;

    const result = await queryApartmentCards({ where, sort, page, limit });

    const headers = {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    };

    if (page !== undefined && limit !== undefined) {
      return NextResponse.json(
        {
          data: result.data,
          pagination: {
            page,
            limit,
            total: result.total,
            totalPages: Math.ceil(result.total / limit),
          },
        },
        { headers },
      );
    }

    return NextResponse.json(result.data, { headers });
  } catch (error) {
    console.error("Error fetching apartments:", error);
    return NextResponse.json(
      { error: "Failed to fetch apartments" },
      { status: 500 },
    );
  }
}
