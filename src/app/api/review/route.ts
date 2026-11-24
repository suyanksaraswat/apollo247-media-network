import { UNAVAILABLE_MESSAGES } from "@/packages/ai/outcome";
import {
  MAX_REVIEW_LINE_CHARS,
  MAX_REVIEW_LINES,
  reviewCreative,
  sampleReviewFor,
} from "@/packages/ai/review";
import { CATEGORIES, PRODUCT_CLASSES } from "@/packages/catalog/taxonomy";
import { clientKey, createLimiter } from "@/packages/ratelimit";

export const maxDuration = 60;

const limiter = createLimiter({ limit: 8, windowMs: 10 * 60_000 });

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const record = isRecord(body) ? body : {};
  const category = CATEGORIES.find((item) => item.id === record.category)?.id;
  const productClass = PRODUCT_CLASSES.find((item) => item.id === record.productClass)?.id;
  const raw = Array.isArray(record.lines) ? record.lines : [];
  const lines = raw
    .filter((line): line is string => typeof line === "string")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (
    !category ||
    !productClass ||
    lines.length > MAX_REVIEW_LINES ||
    lines.some((line) => line.length > MAX_REVIEW_LINE_CHARS)
  ) {
    return Response.json(
      {
        kind: "invalid",
        message: `Send up to ${MAX_REVIEW_LINES} lines of copy, each under ${MAX_REVIEW_LINE_CHARS} characters, with a category and product type.`,
      },
      { status: 400 },
    );
  }

  const needsModel =
    lines.length > 0 &&
    !sampleReviewFor(lines) &&
    PRODUCT_CLASSES.some((item) => item.id === productClass && item.consumerAds);
  if (needsModel) {
    const taken = limiter.take(clientKey(request));
    if (!taken.ok) {
      return Response.json(
        { kind: "unavailable", reason: "rate_limited", message: UNAVAILABLE_MESSAGES.rate_limited },
        { status: 429, headers: { "Retry-After": String(taken.retryAfterSec) } },
      );
    }
  }

  const outcome = await reviewCreative({ lines, category, productClass });
  return Response.json(outcome, { status: outcome.kind === "ok" ? 200 : 503 });
}
