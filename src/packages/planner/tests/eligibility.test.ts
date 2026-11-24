import { ASSETS, assetById } from "@/packages/catalog/assets";
import type { MediaAsset } from "@/packages/catalog/types";
import { buildPlan, checkEligibility, type PlanInput } from "../index";

const input: PlanInput = {
  category: "fmcg_food",
  productClass: "fmcg",
  objective: "trial",
  cities: ["hyderabad", "chennai"],
  budgetINR: 2_500_000,
  weeks: 6,
};

function asset(id: string): MediaAsset {
  const found = assetById(id);
  if (!found) throw new Error(`missing asset ${id}`);
  return found;
}

describe("buildPlan input checks", () => {
  it.each([
    ["a zero budget", { budgetINR: 0 }],
    ["a negative budget", { budgetINR: -5 }],
    ["zero weeks", { weeks: 0 }],
    ["a fraction of a week", { weeks: 2.5 }],
    ["more than 26 weeks", { weeks: 27 }],
    ["no cities", { cities: [] }],
  ])("refuses %s", (_label, change) => {
    expect(() => buildPlan({ ...input, ...change })).toThrow(RangeError);
  });
});

describe("prescription medicines", () => {
  it("blocks the whole plan with the reason from the product class", () => {
    expect(buildPlan({ ...input, productClass: "rx" })).toEqual({
      kind: "blocked",
      reason: expect.stringMatching(/not advertised to the public/),
    });
  });
});

describe("checkEligibility", () => {
  it("refuses a never asset with its own rule", () => {
    expect(checkEligibility(asset("lab_reports"), "fmcg_food", "fmcg", "trial")).toEqual({
      eligible: false,
      reason: "No ads beside a patient's test results.",
    });
  });

  it("refuses a category the asset is not sold to", () => {
    expect(checkEligibility(asset("cart_slots"), "insurance", "service", "trial")).toEqual({
      eligible: false,
      reason: "Not sold to Insurance and finance brands.",
    });
  });

  it("refuses a product class the asset excludes, with the asset's rule", () => {
    expect(checkEligibility(asset("teleconsult_wait"), "nutrition", "otc", "awareness")).toEqual({
      eligible: false,
      reason: "No medicines next to a doctor's consultation.",
    });
  });

  it("refuses an objective the asset doesn't serve", () => {
    expect(checkEligibility(asset("teleconsult_wait"), "devices", "device", "sales")).toEqual({
      eligible: false,
      reason: "Doesn't serve sales.",
    });
  });

  it("accepts a fitting asset", () => {
    expect(checkEligibility(asset("store_screens"), "fmcg_food", "fmcg", "trial")).toEqual({
      eligible: true,
    });
  });

  it("refuses everything for a prescription medicine", () => {
    const result = checkEligibility(asset("store_screens"), "otc", "rx", "sales");
    expect(result.eligible).toBe(false);
  });
});

describe("exclusions in a plan", () => {
  it("lists every never asset with its rule", () => {
    const plan = buildPlan(input);
    if (plan.kind !== "plan") throw new Error("expected a plan");
    const never = ASSETS.filter((a) => a.status === "never");
    for (const a of never) {
      expect(plan.exclusions).toContainEqual({ assetId: a.id, assetName: a.name, reason: a.rule });
    }
    expect(plan.lines.map((l) => l.assetId)).not.toEqual(
      expect.arrayContaining(never.map((a) => a.id)),
    );
  });

  it("keeps the teleconsult screen out of an OTC plan", () => {
    const plan = buildPlan({
      ...input,
      category: "nutrition",
      productClass: "otc",
      objective: "awareness",
    });
    if (plan.kind !== "plan") throw new Error("expected a plan");
    expect(plan.lines.find((l) => l.assetId === "teleconsult_wait")).toBeUndefined();
    expect(plan.exclusions.find((e) => e.assetId === "teleconsult_wait")?.reason).toBe(
      "No medicines next to a doctor's consultation.",
    );
  });
});
