import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * `pg` pool size per Node process. On serverless, each concurrent invocation is a separate
 * process — use a small max and point `DATABASE_URL` at your host's pooler (e.g. Supabase
 * transaction mode on port 6543) so the pooler multiplexes to Postgres.
 */
function resolvePoolMax(): number {
  const raw = process.env.DATABASE_POOL_MAX;
  if (raw) {
    const n = parseInt(raw, 10);
    if (!Number.isNaN(n) && n >= 1) return Math.min(n, 50);
  }
  if (process.env.NODE_ENV !== "production") return 10;
  const serverless =
    process.env.VERCEL === "1" ||
    Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
    Boolean(process.env.AWS_EXECUTION_ENV);
  if (serverless) return 1;
  return 5;
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add it to your environment (see .env.example).",
    );
  }

  const pool = new Pool({
    connectionString,
    max: resolvePoolMax(),
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
