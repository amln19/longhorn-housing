import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ profile: null });
  }

  const profile = await prisma.roommateProfile.findUnique({
    where: { userId: user.id },
  });

  return NextResponse.json({ profile });
}
