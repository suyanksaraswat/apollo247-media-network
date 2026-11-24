import { clientKey, createLimiter } from "../index";

describe("createLimiter", () => {
  it("allows up to the limit inside the window, then refuses with a wait time", () => {
    const limiter = createLimiter({ limit: 2, windowMs: 60_000 });
    expect(limiter.take("a", 0)).toEqual({ ok: true });
    expect(limiter.take("a", 1_000)).toEqual({ ok: true });
    expect(limiter.take("a", 2_000)).toEqual({ ok: false, retryAfterSec: 58 });
  });

  it("frees a slot once the oldest request leaves the window", () => {
    const limiter = createLimiter({ limit: 1, windowMs: 10_000 });
    expect(limiter.take("a", 0).ok).toBe(true);
    expect(limiter.take("a", 9_999).ok).toBe(false);
    expect(limiter.take("a", 10_001).ok).toBe(true);
  });

  it("counts each key separately", () => {
    const limiter = createLimiter({ limit: 1, windowMs: 10_000 });
    expect(limiter.take("a", 0).ok).toBe(true);
    expect(limiter.take("b", 0).ok).toBe(true);
  });
});

describe("clientKey", () => {
  it("uses the first forwarded address", () => {
    const request = new Request("http://x", {
      headers: { "x-forwarded-for": "1.2.3.4, 10.0.0.1" },
    });
    expect(clientKey(request)).toBe("1.2.3.4");
  });

  it("falls back when no address is given", () => {
    expect(clientKey(new Request("http://x"))).toBe("local");
  });
});
