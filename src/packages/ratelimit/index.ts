export type TakeResult = { ok: true } | { ok: false; retryAfterSec: number };

export interface Limiter {
  take(key: string, now?: number): TakeResult;
}

const MAX_KEYS = 10_000;

export function createLimiter(options: { limit: number; windowMs: number }): Limiter {
  const hits = new Map<string, number[]>();
  return {
    take(key, now = Date.now()) {
      const since = now - options.windowMs;
      const recent = (hits.get(key) ?? []).filter((time) => time > since);
      if (recent.length >= options.limit) {
        const oldest = recent[0] ?? now;
        hits.set(key, recent);
        return {
          ok: false,
          retryAfterSec: Math.max(1, Math.ceil((oldest + options.windowMs - now) / 1000)),
        };
      }
      recent.push(now);
      hits.delete(key);
      hits.set(key, recent);
      if (hits.size > MAX_KEYS) {
        const first = hits.keys().next();
        if (!first.done) hits.delete(first.value);
      }
      return { ok: true };
    },
  };
}

export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "local";
}
