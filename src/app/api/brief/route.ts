import { MAX_BRIEF_CHARS, parseBrief, sampleBriefFor } from "@/packages/ai/brief";
import { UNAVAILABLE_MESSAGES } from "@/packages/ai/outcome";
import { clientKey, createLimiter } from "@/packages/ratelimit";

export const maxDuration = 60;

const limiter = createLimiter({ limit: 8, windowMs: 10 * 60_000 });

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const text =
    typeof body === "object" && body !== null && "text" in body && typeof body.text === "string"
      ? body.text.trim()
      : "";
  if (!text || text.length > MAX_BRIEF_CHARS) {
    return Response.json(
      {
        kind: "invalid",
        message: `Write a brief of up to ${MAX_BRIEF_CHARS.toLocaleString("en-IN")} characters.`,
      },
      { status: 400 },
    );
  }
  if (!sampleBriefFor(text)) {
    const taken = limiter.take(clientKey(request));
    if (!taken.ok) {
      return Response.json(
        { kind: "unavailable", reason: "rate_limited", message: UNAVAILABLE_MESSAGES.rate_limited },
        { status: 429, headers: { "Retry-After": String(taken.retryAfterSec) } },
      );
    }
  }
  const outcome = await parseBrief(text);
  return Response.json(outcome, { status: outcome.kind === "ok" ? 200 : 503 });
}
