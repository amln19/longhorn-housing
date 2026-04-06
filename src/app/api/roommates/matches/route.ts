import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { getUpstashRedis } from "@/lib/upstash";

type Profile = {
  id: string;
  userId: string;
  name: string;
  age: number | null;
  gender: string | null;
  major: string | null;
  gradYear: number | null;
  bio: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  moveInDate: Date | null;
  preferredNeighborhoods: string[];
  sleepSchedule: string | null;
  noiseLevel: string | null;
  cleanliness: string | null;
  guests: string | null;
  smoking: boolean;
  pets: boolean;
  user: { id: string; name: string | null; avatarUrl: string | null };
};

function computeCompatibility(me: Profile, other: Profile): number {
  let score = 0;
  let factors = 0;

  if (me.budgetMin != null && me.budgetMax != null && other.budgetMin != null && other.budgetMax != null) {
    factors += 3;
    const overlapStart = Math.max(me.budgetMin, other.budgetMin);
    const overlapEnd = Math.min(me.budgetMax, other.budgetMax);
    if (overlapStart <= overlapEnd) {
      const overlapRange = overlapEnd - overlapStart;
      const myRange = me.budgetMax - me.budgetMin || 1;
      score += Math.min(1, overlapRange / myRange) * 3;
    }
  }

  if (me.sleepSchedule && other.sleepSchedule) {
    factors += 2;
    if (me.sleepSchedule === other.sleepSchedule) score += 2;
    else if (me.sleepSchedule === "flexible" || other.sleepSchedule === "flexible") score += 1;
  }

  if (me.noiseLevel && other.noiseLevel) {
    factors += 2;
    if (me.noiseLevel === other.noiseLevel) score += 2;
    else {
      const levels = ["quiet", "moderate", "social"];
      const diff = Math.abs(levels.indexOf(me.noiseLevel) - levels.indexOf(other.noiseLevel));
      if (diff === 1) score += 1;
    }
  }

  if (me.cleanliness && other.cleanliness) {
    factors += 2;
    if (me.cleanliness === other.cleanliness) score += 2;
    else {
      const levels = ["very-clean", "clean", "relaxed"];
      const diff = Math.abs(levels.indexOf(me.cleanliness) - levels.indexOf(other.cleanliness));
      if (diff === 1) score += 1;
    }
  }

  if (me.guests && other.guests) {
    factors += 1;
    if (me.guests === other.guests) score += 1;
    else if (
      (me.guests === "sometimes" && other.guests !== "often") ||
      (other.guests === "sometimes" && me.guests !== "often")
    ) {
      score += 0.5;
    }
  }

  factors += 2;
  if (me.smoking === other.smoking) score += 2;
  else score -= 1;

  factors += 1;
  if (me.pets === other.pets) score += 1;

  if (me.preferredNeighborhoods.length > 0 && other.preferredNeighborhoods.length > 0) {
    factors += 2;
    const overlap = me.preferredNeighborhoods.filter((n) =>
      other.preferredNeighborhoods.includes(n),
    );
    if (overlap.length > 0) {
      score += (overlap.length / me.preferredNeighborhoods.length) * 2;
    }
  }

  if (me.gradYear && other.gradYear) {
    factors += 1;
    const diff = Math.abs(me.gradYear - other.gradYear);
    if (diff === 0) score += 1;
    else if (diff === 1) score += 0.5;
  }

  if (factors === 0) return 50;
  return Math.round(Math.max(0, Math.min(100, (score / factors) * 100)));
}

/** Cap candidates scored per request (tune if the roommate pool grows large). */
const MATCH_CANDIDATE_LIMIT = 200;

const CACHE_TTL_MS = 5 * 60_000;
const CACHE_TTL_SEC = Math.floor(CACHE_TTL_MS / 1000);
const MATCH_CACHE_KEY_PREFIX = "longhorn-housing:roommate-matches:v2:";

/** Used only when Upstash is not configured (local dev). */
const memoryMatchCache = new Map<string, { matches: unknown[]; expiresAt: number }>();

export async function GET(request: Request) {
  const limited = await checkRateLimit(request);
  if (limited) return limited;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const redis = getUpstashRedis();
  if (redis) {
    const raw = await redis.get(MATCH_CACHE_KEY_PREFIX + user.id);
    if (raw != null) {
      try {
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        return NextResponse.json({ matches: parsed });
      } catch {
        /* cache miss */
      }
    }
  } else {
    if (Math.random() < 0.05) {
      const now = Date.now();
      for (const [k, v] of memoryMatchCache) {
        if (now > v.expiresAt) memoryMatchCache.delete(k);
      }
    }
    const cached = memoryMatchCache.get(user.id);
    if (cached && Date.now() < cached.expiresAt) {
      return NextResponse.json({ matches: cached.matches });
    }
  }

  const myProfile = await prisma.roommateProfile.findUnique({
    where: { userId: user.id },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
  });

  if (!myProfile) {
    return NextResponse.json(
      { error: "Create a roommate profile first" },
      { status: 400 },
    );
  }

  const others = await prisma.roommateProfile.findMany({
    where: {
      active: true,
      userId: { not: user.id },
    },
    take: MATCH_CANDIDATE_LIMIT,
    orderBy: { updatedAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
  });

  const matches = others
    .map((other) => ({
      profile: other,
      compatibility: computeCompatibility(myProfile as Profile, other as Profile),
    }))
    .sort((a, b) => b.compatibility - a.compatibility);

  if (redis) {
    await redis.set(MATCH_CACHE_KEY_PREFIX + user.id, JSON.stringify(matches), {
      ex: CACHE_TTL_SEC,
    });
  } else {
    memoryMatchCache.set(user.id, { matches, expiresAt: Date.now() + CACHE_TTL_MS });
  }

  return NextResponse.json({ matches });
}
