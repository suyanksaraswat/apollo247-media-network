import {
  CATEGORIES,
  CITIES,
  CLAIM_RULES,
  OBJECTIVES,
  PRODUCT_CLASSES,
} from "@/packages/catalog/taxonomy";

const ids = (list: readonly { id: string }[]) => list.map((item) => item.id);
const nullable = (schema: object) => ({ anyOf: [schema, { type: "null" }] });

export const BRIEF_SCHEMA = {
  type: "object",
  properties: {
    category: { type: "string", enum: ids(CATEGORIES) },
    productClass: { type: "string", enum: ids(PRODUCT_CLASSES) },
    objective: { type: "string", enum: ids(OBJECTIVES) },
    cities: { type: "array", items: { type: "string", enum: ids(CITIES) } },
    budgetINR: nullable({ type: "number" }),
    weeks: nullable({ type: "integer" }),
    creativeLines: { type: "array", items: { type: "string" } },
    conditionTargeting: {
      type: "object",
      properties: { asked: { type: "boolean" }, note: nullable({ type: "string" }) },
      required: ["asked", "note"],
    },
    summary: { type: "string" },
  },
  required: [
    "category",
    "productClass",
    "objective",
    "cities",
    "budgetINR",
    "weeks",
    "creativeLines",
    "conditionTargeting",
    "summary",
  ],
} as const;

export const REVIEW_SCHEMA = {
  type: "object",
  properties: {
    verdict: { type: "string", enum: ["ok", "revise", "refuse"] },
    issues: {
      type: "array",
      items: {
        type: "object",
        properties: {
          quote: { type: "string" },
          rule: { type: "string", enum: ids(CLAIM_RULES) },
          problem: { type: "string" },
          rewrite: { type: "string" },
        },
        required: ["quote", "rule", "problem", "rewrite"],
      },
    },
  },
  required: ["verdict", "issues"],
} as const;
