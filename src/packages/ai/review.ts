import { SAMPLE_BRIEFS } from "@/packages/catalog/briefs";
import { CATEGORIES, PRODUCT_CLASSES } from "@/packages/catalog/taxonomy";
import type { CategoryId, CreativeReview, ProductClassId } from "@/packages/catalog/types";
import { AiUnavailableError, generateJson } from "./lib/gemini";
import { REVIEW_SYSTEM, reviewPrompt } from "./lib/prompts";
import { REVIEW_SCHEMA } from "./lib/schemas";
import { toCreativeReview } from "./lib/validate";
import type { AiOutcome } from "./outcome";

export interface ReviewInput {
  lines: readonly string[];
  category: CategoryId;
  productClass: ProductClassId;
}

export const MAX_REVIEW_LINES = 5;
export const MAX_REVIEW_LINE_CHARS = 300;

function sameLines(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((line, index) => line === b[index]);
}

export function sampleReviewFor(lines: readonly string[]): CreativeReview | undefined {
  return (
    SAMPLE_BRIEFS.find((brief) => brief.review && sameLines(brief.fields.creativeLines, lines))
      ?.review ?? undefined
  );
}

export async function reviewCreative(input: ReviewInput): Promise<AiOutcome<CreativeReview>> {
  const lines = input.lines.map((line) => line.trim()).filter((line) => line.length > 0);
  const productClass = PRODUCT_CLASSES.find((item) => item.id === input.productClass);
  if (productClass && !productClass.consumerAds) {
    return {
      kind: "ok",
      source: "rules",
      value: {
        verdict: "refuse",
        issues: [
          {
            quote: lines[0] ?? "",
            rule: "rx_promotion",
            problem: productClass.reason ?? "This product cannot be advertised to the public.",
            rewrite: "No consumer ad is possible for this product.",
          },
        ],
      },
    };
  }
  if (lines.length === 0)
    return { kind: "ok", source: "rules", value: { verdict: "ok", issues: [] } };

  const sample = sampleReviewFor(lines);
  if (sample) return { kind: "ok", value: sample, source: "sample" };

  try {
    const raw = await generateJson({
      system: REVIEW_SYSTEM,
      prompt: reviewPrompt({
        lines,
        categoryLabel:
          CATEGORIES.find((item) => item.id === input.category)?.label ?? input.category,
        productClassLabel: productClass?.label ?? input.productClass,
      }),
      schema: REVIEW_SCHEMA,
    });
    return { kind: "ok", value: toCreativeReview(raw, lines), source: "gemini" };
  } catch (error) {
    if (error instanceof AiUnavailableError) {
      return { kind: "unavailable", reason: error.reason, message: error.message };
    }
    throw error;
  }
}
