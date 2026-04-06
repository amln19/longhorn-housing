import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { parseRequestJson } from "@/lib/parse-request-json";
import { createSubleaseSchema } from "@/lib/validations";

export async function GET(request: Request) {
  const limited = await checkRateLimit(request);
  if (limited) return limited;

  try {
    const { searchParams } = new URL(request.url);
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const bedrooms = searchParams.get("bedrooms");
    const neighborhood = searchParams.get("neighborhood");
    const furnished = searchParams.get("furnished");
    const search = searchParams.get("search");
    const userId = searchParams.get("userId");

    const where: Record<string, unknown> = { status: "active" };

    if (userId) {
      const currentUser = await getCurrentUser();
      if (currentUser?.id === userId) {
        delete where.status;
      }
      where.userId = userId;
    }

    if (minPrice) {
      const parsed = parseInt(minPrice);
      if (!isNaN(parsed)) where.monthlyRent = { ...((where.monthlyRent as object) || {}), gte: parsed };
    }
    if (maxPrice) {
      const parsed = parseInt(maxPrice);
      if (!isNaN(parsed)) where.monthlyRent = { ...((where.monthlyRent as object) || {}), lte: parsed };
    }
    if (bedrooms) {
      const parsed = parseInt(bedrooms);
      if (!isNaN(parsed)) where.bedrooms = parsed;
    }
    if (neighborhood) {
      const nb = await prisma.neighborhood.findFirst({
        where: { OR: [{ slug: neighborhood }, { id: neighborhood }] },
      });
      if (!nb) {
        return NextResponse.json(
          { subleases: [] },
          {
            headers: {
              "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
            },
          },
        );
      }
      where.neighborhoodId = nb.id;
    }
    if (furnished === "true") where.furnished = true;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { apartmentName: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
      ];
    }

    const limitParam = searchParams.get("limit");
    const safeLimit = limitParam ? Math.min(100, Math.max(1, parseInt(limitParam) || 50)) : 50;

    const subleases = await prisma.sublease.findMany({
      where,
      take: safeLimit,
      include: {
        user: { select: { id: true, name: true } },
        neighborhood: { select: { name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      { subleases },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      },
    );
  } catch (error) {
    console.error("Error fetching subleases:", error);
    return NextResponse.json(
      { error: "Failed to fetch subleases" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const limited = await checkRateLimit(request);
  if (limited) return limited;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = await parseRequestJson(request);
  if (!raw.ok) return raw.response;

  const parsed = createSubleaseSchema.safeParse(raw.data);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const data = parsed.data;

  let neighborhoodId: string | null = null;
  if (data.neighborhood) {
    const nb = await prisma.neighborhood.findUnique({
      where: { slug: data.neighborhood },
    });
    if (nb) neighborhoodId = nb.id;
  }

  const sublease = await prisma.sublease.create({
    data: {
      userId: user.id,
      title: data.title,
      description: data.description,
      apartmentName: data.apartmentName,
      address: data.address,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      neighborhoodId,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      sqft: data.sqft ?? null,
      monthlyRent: data.monthlyRent,
      deposit: data.deposit ?? null,
      leaseStart: data.leaseStart,
      leaseEnd: data.leaseEnd,
      availableDate: data.availableDate,
      furnished: data.furnished,
      utilitiesIncluded: data.utilitiesIncluded,
      parkingIncluded: data.parkingIncluded,
      petFriendly: data.petFriendly,
      imageUrls: data.imageUrls,
      contactEmail: data.contactEmail || user.email,
      contactPhone: data.contactPhone ?? null,
    },
  });

  return NextResponse.json({ sublease }, { status: 201 });
}
