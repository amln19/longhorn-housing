import { Ratelimit } from "@upstash/ratelimit";
import { getUpstashRedis } from "@/lib/upstash";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 300;

type ClientRecord = { count: number; resetAt: number };

class SimpleLRU<K, V> {
  private max: number;
  private cache: Map<K, V>;
  constructor(max: number = 1000) {
    this.max = max;
    this.cache = new Map();
  }
  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;
    const val = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }
  set(key: K, value: V) {
    if (this.cache.has(key)) this.cache.delete(key);
    this.cache.set(key, value);
    if (this.cache.size > this.max) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) this.cache.delete(firstKey);
    }
  }
}

const memoryStore = new SimpleLRU<string, ClientRecord>(5000); // Enforce rigid ceiling

let ratelimit: Ratelimit | null | undefined;

function getDistributedRatelimit(): Ratelimit | null {
  if (ratelimit !== undefined) return ratelimit;
  const redis = getUpstashRedis();
  if (!redis) {
    ratelimit = null;
    return null;
  }
  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(MAX_REQUESTS, `${WINDOW_MS / 1000} s`),
    prefix: "longhorn-housing:ratelimit",
  });
  return ratelimit;
}

function getClientKey(request: Request): string {
  const platformIp =
    request.headers.get("x-vercel-forwarded-for") ||
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("fly-client-ip");

  if (platformIp) return platformIp.split(",")[0].trim();

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  const ua = request.headers.get("user-agent") || "";
  return `anon-${simpleHash(ua)}`;
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(36);
}

function checkRateLimitMemory(request: Request): Response | null {
  const key = getClientKey(request);
  const now = Date.now();

  const record = memoryStore.get(key);

  if (!record || now > record.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return null;
  }

  record.count++;

  if (record.count > MAX_REQUESTS) {
    return Response.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  return null;
}

export async function checkRateLimit(request: Request): Promise<Response | null> {
  const distributed = getDistributedRatelimit();
  if (!distributed) {
    return checkRateLimitMemory(request);
  }

  const key = getClientKey(request);
  const { success, reset } = await distributed.limit(key);

  if (!success) {
    const retryAfterSec = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
    return Response.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(retryAfterSec) } },
    );
  }

  return null;
}
