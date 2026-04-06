import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { parseRequestJson } from "@/lib/parse-request-json";
import { updateSubleaseSchema, isValidStatusTransition } from "@/lib/validations";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const limited = await checkRateLimit(request);
  if (limited) return limited;

  const { id } = await context.params;

  const sublease = await prisma.sublease.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true } },
      neighborhood: { select: { name: true, slug: true } },
    },
  });

  if (!sublease) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ sublease });
}

export async function PATCH(request: Request, context: RouteContext) {
  const limited = await checkRateLimit(request);
  if (limited) return limited;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const sublease = await prisma.sublease.findUnique({ where: { id } });
  if (!sublease) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (sublease.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const raw = await parseRequestJson(request);
  if (!raw.ok) return raw.response;

  const parsed = updateSubleaseSchema.safeParse(raw.data);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  if (
    parsed.data.status !== undefined &&
    parsed.data.status !== sublease.status &&
    !isValidStatusTransition(sublease.status, parsed.data.status)
  ) {
    return NextResponse.json(
      { error: `Cannot transition from "${sublease.status}" to "${parsed.data.status}"` },
      { status: 400 },
    );
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
  if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
  if (parsed.data.monthlyRent !== undefined) updateData.monthlyRent = parsed.data.monthlyRent;
  if (
    parsed.data.status !== undefined &&
    parsed.data.status !== sublease.status
  ) {
    updateData.status = parsed.data.status;
  }
  if (parsed.data.availableDate !== undefined) updateData.availableDate = parsed.data.availableDate;

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ sublease });
  }

  const updated = await prisma.sublease.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({ sublease: updated });
}

export async function DELETE(request: Request, context: RouteContext) {
  const limited = await checkRateLimit(request);
  if (limited) return limited;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const sublease = await prisma.sublease.findUnique({ where: { id } });
  if (!sublease) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (sublease.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.sublease.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
