import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { parseRequestJson } from "@/lib/parse-request-json";
import { roommateProfileSchema } from "@/lib/validations";

export async function GET(request: Request) {
  const limited = await checkRateLimit(request);
  if (limited) return limited;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const budget = searchParams.get("budget");
    const neighborhood = searchParams.get("neighborhood");
    const noiseLevel = searchParams.get("noiseLevel");
    const cleanliness = searchParams.get("cleanliness");

    const where: Record<string, unknown> = { active: true };

    if (budget) {
      const parsed = parseInt(budget);
      if (!isNaN(parsed)) where.budgetMax = { gte: parsed };
    }
    if (neighborhood) {
      where.preferredNeighborhoods = { has: neighborhood };
    }
    if (noiseLevel) {
      where.noiseLevel = noiseLevel;
    }
    if (cleanliness) {
      where.cleanliness = cleanliness;
    }

    const limitParam = searchParams.get("limit");
    const safeLimit = limitParam ? Math.min(100, Math.max(1, parseInt(limitParam) || 50)) : 50;

    const profiles = await prisma.roommateProfile.findMany({
      where,
      take: safeLimit,
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ profiles });
  } catch (error) {
    console.error("Error fetching roommate profiles:", error);
    return NextResponse.json(
      { error: "Failed to fetch roommate profiles" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const limited = await checkRateLimit(request);
  if (limited) return limited;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.roommateProfile.updateMany({
    where: { userId: user.id },
    data: { active: false },
  });

  return NextResponse.json({ success: true });
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

  const parsed = roommateProfileSchema.safeParse(raw.data);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const data = {
    name: parsed.data.name,
    age: parsed.data.age ?? null,
    gender: parsed.data.gender ?? null,
    major: parsed.data.major ?? null,
    gradYear: parsed.data.gradYear ?? null,
    bio: parsed.data.bio ?? null,
    budgetMin: parsed.data.budgetMin ?? null,
    budgetMax: parsed.data.budgetMax ?? null,
    moveInDate: parsed.data.moveInDate ?? null,
    preferredNeighborhoods: parsed.data.preferredNeighborhoods,
    sleepSchedule: parsed.data.sleepSchedule ?? null,
    noiseLevel: parsed.data.noiseLevel ?? null,
    cleanliness: parsed.data.cleanliness ?? null,
    guests: parsed.data.guests ?? null,
    smoking: parsed.data.smoking,
    pets: parsed.data.pets,
    active: true,
  };

  const profile = await prisma.roommateProfile.upsert({
    where: { userId: user.id },
    update: data,
    create: { userId: user.id, ...data },
  });

  return NextResponse.json({ profile });
}
