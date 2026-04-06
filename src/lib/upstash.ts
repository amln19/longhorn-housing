import { Redis } from "@upstash/redis";

let cached: Redis | null | undefined;

/**
 * Upstash REST Redis. Returns null when `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`
 * are unset — use in-memory fallbacks for local dev only.
 */
export function getUpstashRedis(): Redis | null {
  if (cached !== undefined) return cached;
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    cached = null;
    return null;
  }
  try {
    cached = Redis.fromEnv();
  } catch {
    cached = null;
  }
  return cached;
}
