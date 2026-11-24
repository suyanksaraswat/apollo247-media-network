import {
  CATEGORIES,
  CITIES,
  CLAIM_RULES,
  OBJECTIVES,
  PRODUCT_CLASSES,
} from "@/packages/catalog/taxonomy";
import type { BriefFields, CityId, CreativeIssue, CreativeReview } from "@/packages/catalog/types";
import { AiUnavailableError } from "./gemini";

const MAX_LINES = 5;
const MAX_LINE = 300;
const MAX_NOTE = 400;
const MAX_WEEKS = 26;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pick<T extends string>(value: unknown, allowed: readonly { id: T }[]): T | undefined {
  return allowed.find((item) => item.id === value)?.id;
}

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function toBriefFields(raw: unknown): BriefFields {
  if (!isRecord(raw)) throw new AiUnavailableError("bad_output");
  const category = pick(raw.category, CATEGORIES);
  const productClass = pick(raw.productClass, PRODUCT_CLASSES);
  const objective = pick(raw.objective, OBJECTIVES);
  if (!category || !productClass || !objective) throw new AiUnavailableError("bad_output");

  const cities: CityId[] = [];
  for (const value of Array.isArray(raw.cities) ? raw.cities : []) {
    const id = pick(value, CITIES);
    if (id && !cities.includes(id)) cities.push(id);
  }

  const budget = raw.budgetINR;
  const weeks = raw.weeks;
  const condition = isRecord(raw.conditionTargeting) ? raw.conditionTargeting : {};
  const asked = condition.asked === true;
  const note = text(condition.note, MAX_NOTE);

  return {
    category,
    productClass,
    objective,
    cities,
    budgetINR:
      typeof budget === "number" && Number.isFinite(budget) && budget > 0
        ? Math.round(budget)
        : null,
    weeks:
      typeof weeks === "number" && Number.isInteger(weeks) && weeks >= 1 && weeks <= MAX_WEEKS
        ? weeks
        : null,
    creativeLines: (Array.isArray(raw.creativeLines) ? raw.creativeLines : [])
      .map((line) => text(line, MAX_LINE))
      .filter((line) => line.length > 0)
      .slice(0, MAX_LINES),
    conditionTargeting: { asked, note: asked && note ? note : null },
    summary: text(raw.summary, MAX_LINE),
  };
}

export function toCreativeReview(raw: unknown, lines: readonly string[]): CreativeReview {
  if (!isRecord(raw)) throw new AiUnavailableError("bad_output");
  const copy = lines.join("\n").toLowerCase();
  const issues: CreativeIssue[] = [];
  for (const item of Array.isArray(raw.issues) ? raw.issues : []) {
    if (!isRecord(item)) continue;
    const rule = pick(item.rule, CLAIM_RULES);
    const quote = text(item.quote, MAX_LINE);
    const problem = text(item.problem, MAX_NOTE);
    const rewrite = text(item.rewrite, MAX_LINE);
    if (!rule || !quote || !problem || !copy.includes(quote.toLowerCase())) continue;
    issues.push({ quote, rule, problem, rewrite });
  }
  const verdict = raw.verdict === "refuse" ? "refuse" : issues.length > 0 ? "revise" : "ok";
  return { verdict, issues };
}
