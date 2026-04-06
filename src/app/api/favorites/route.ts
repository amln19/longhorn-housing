import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { parseRequestJson } from "@/lib/parse-request-json";
import { favoriteSchema } from "@/lib/validations";

export async function GET(request: Request) {
  const limited = await checkRateLimit(request);
  if (limited) return limited;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const favorites = await prisma.favoriteApartment.findMany({
      where: { userId: user.id },
      include: {
        apartment: {
          include: {
            neighborhood: true,
            floorPlans: true,
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ favorites });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorites" },
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

  const parsed = favoriteSchema.safeParse(raw.data);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { apartmentId } = parsed.data;

  const existing = await prisma.favoriteApartment.findUnique({
    where: { userId_apartmentId: { userId: user.id, apartmentId } },
  });

  if (existing) {
    await prisma.favoriteApartment.deleteMany({
      where: { userId: user.id, apartmentId },
    });
    return NextResponse.json({ favorited: false });
  }

  const apartment = await prisma.apartment.findUnique({
    where: { id: apartmentId },
    select: { id: true },
  });
  if (!apartment) {
    return NextResponse.json({ error: "Apartment not found" }, { status: 404 });
  }

  try {
    await prisma.favoriteApartment.create({
      data: { userId: user.id, apartmentId },
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return NextResponse.json({ favorited: true });
    }
    throw e;
  }

  return NextResponse.json({ favorited: true });
}
