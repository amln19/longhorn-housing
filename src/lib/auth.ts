import { Prisma } from "@prisma/client";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();

  if (!supabaseUser) return null;

  const email =
    supabaseUser.email?.trim() ||
    `user-${supabaseUser.id}@placeholder.local`;

  let user = await prisma.user.findFirst({
    where: {
      OR: [
        { supabaseId: supabaseUser.id },
        { email: email }
      ]
    },
  });

  if (user && user.supabaseId !== supabaseUser.id) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { supabaseId: supabaseUser.id },
    });
  }

  if (!user) {
    try {
      user = await prisma.user.create({
        data: {
          supabaseId: supabaseUser.id,
          email,
          name:
            supabaseUser.user_metadata?.full_name ||
            supabaseUser.email?.split("@")[0] ||
            null,
          avatarUrl: supabaseUser.user_metadata?.avatar_url || null,
        },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        user = await prisma.user.findFirst({
          where: {
            OR: [{ supabaseId: supabaseUser.id }, { email }],
          },
        });
      } else {
        throw e;
      }
    }
  }

  return user;
}
