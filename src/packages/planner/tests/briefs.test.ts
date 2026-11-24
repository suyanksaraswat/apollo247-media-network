import { SAMPLE_BRIEFS } from "@/packages/catalog/briefs";
import type { SampleBrief } from "@/packages/catalog/types";
import { buildPlan, type Plan } from "../index";

function brief(id: string): SampleBrief {
  const found = SAMPLE_BRIEFS.find((b) => b.id === id);
  if (!found) throw new Error(`missing brief ${id}`);
  return found;
}

function planFor(id: string): Plan {
  const { fields } = brief(id);
  return buildPlan({
    category: fields.category,
    productClass: fields.productClass,
    objective: fields.objective,
    cities: fields.cities,
    budgetINR: fields.budgetINR ?? 0,
    weeks: fields.weeks ?? 0,
  });
}

function expectPlan(plan: Plan): Extract<Plan, { kind: "plan" }> {
  if (plan.kind !== "plan") throw new Error(`blocked: ${plan.reason}`);
  return plan;
}

function lineIds(plan: Plan): string[] {
  return expectPlan(plan).lines.map((l) => l.assetId);
}

describe("sample briefs", () => {
  it("blocks the prescription antibiotic", () => {
    expect(planFor("antibiotic").kind).toBe("blocked");
  });

  it("gives the insurer no shelf space, since insurance isn't sold on the shelf", () => {
    const plan = expectPlan(planFor("insurer"));
    expect(plan.lines.length).toBeGreaterThan(0);
    expect(plan.lines.filter((l) => l.channel === "app_shelf")).toEqual([]);
  });

  it("puts the summer drink in store screens and delivery bags", () => {
    expect(lineIds(planFor("hydration"))).toEqual(
      expect.arrayContaining(["store_screens", "delivery_sampling"]),
    );
  });

  it("spends most of the summer drink budget", () => {
    const plan = expectPlan(planFor("hydration"));
    expect(plan.unallocatedINR).toBeLessThan(2_500_000 * 0.1);
    expect(plan.warnings).toEqual([]);
  });

  it("never sells condition audiences to the glucometer brand", () => {
    const plan = expectPlan(planFor("glucometer"));
    expect(plan.lines.map((l) => l.assetId)).not.toContain("condition_audiences");
    expect(plan.exclusions.map((e) => e.assetId)).toContain("condition_audiences");
  });

  it("keeps the rule on every careful line of every sample plan", () => {
    const carefulLines = SAMPLE_BRIEFS.map((b) => planFor(b.id))
      .flatMap((plan) => (plan.kind === "plan" ? plan.lines : []))
      .filter((l) => l.status === "careful");
    expect(carefulLines.length).toBeGreaterThan(0);
    expect(carefulLines.filter((l) => !l.rule)).toEqual([]);
  });
});
