interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: Date;
  key: string;
}

interface MemoryBucket {
  count: number;
  resetAt: number;
}

interface UpstashPipelineResponse {
  result?: unknown;
  error?: string;
}

const memoryBuckets = new Map<string, MemoryBucket>();

function normalizeWindowSeconds(windowSeconds: number) {
  return Math.max(1, Math.floor(windowSeconds));
}

function buildKey(scope: 'ip' | 'user', identifier: string, limit: number, windowSeconds: number) {
  return `rate-limit:${scope}:${identifier}:${limit}:${windowSeconds}`;
}

function limitWithMemory(key: string, limit: number, windowSeconds: number): RateLimitResult {
  const now = Date.now();
  const windowMs = normalizeWindowSeconds(windowSeconds) * 1000;
  const existing = memoryBuckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    memoryBuckets.set(key, { count: 1, resetAt });

    return {
      success: true,
      remaining: Math.max(0, limit - 1),
      resetAt: new Date(resetAt),
      key,
    };
  }

  existing.count += 1;
  const remaining = Math.max(0, limit - existing.count);

  return {
    success: existing.count <= limit,
    remaining,
    resetAt: new Date(existing.resetAt),
    key,
  };
}

async function limitWithUpstash(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  try {
    const response = await fetch(`${url.replace(/\/$/, '')}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        ['INCR', key],
        ['EXPIRE', key, normalizeWindowSeconds(windowSeconds)],
      ]),
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const result = (await response.json()) as UpstashPipelineResponse[];
    const countResult = result[0]?.result;
    const count = typeof countResult === 'number' ? countResult : Number(countResult);

    if (!Number.isFinite(count)) {
      return null;
    }

    const resetAt = new Date(Date.now() + normalizeWindowSeconds(windowSeconds) * 1000);

    return {
      success: count <= limit,
      remaining: Math.max(0, limit - count),
      resetAt,
      key,
    };
  } catch (error: unknown) {
    console.warn('Upstash rate limit unavailable, falling back to memory:', error);
    return null;
  }
}

async function rateLimit(
  scope: 'ip' | 'user',
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const safeIdentifier = identifier.trim() || 'anonymous';
  const safeWindow = normalizeWindowSeconds(windowSeconds);
  const key = buildKey(scope, safeIdentifier, limit, safeWindow);
  const upstashResult = await limitWithUpstash(key, limit, safeWindow);

  return upstashResult ?? limitWithMemory(key, limit, safeWindow);
}

export function getClientIp(headers: Headers) {
  const forwardedFor = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const realIp = headers.get('x-real-ip')?.trim();
  const cfConnectingIp = headers.get('cf-connecting-ip')?.trim();

  return forwardedFor || realIp || cfConnectingIp || 'unknown';
}

export async function rateLimitByIP(ip: string, limit: number, windowSeconds: number) {
  return rateLimit('ip', ip, limit, windowSeconds);
}

export async function rateLimitByUser(userId: string, limit: number, windowSeconds: number) {
  return rateLimit('user', userId, limit, windowSeconds);
}
