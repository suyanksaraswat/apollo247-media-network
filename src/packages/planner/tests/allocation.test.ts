import { ASSETS } from "@/packages/catalog/assets";
import type { City, ObjectiveId, SellableAsset } from "@/packages/catalog/types";
import { buildPlan, type Plan, type PlanInput } from "../index";

const twoCities: City[] = [
  { id: "hyderabad", label: "Hyderabad", storeShare: 0.5 },
  { id: "chennai", label: "Chennai", storeShare: 0.5 },
];

function fit(trial: 0 | 1 | 2 | 3): Record<ObjectiveId, 0 | 1 | 2 | 3> {
  return { awareness: 1, trial, sales: 1, loyalty: 1 };
}

function sellable(
  overrides: Partial<SellableAsset> & Pick<SellableAsset, "id" | "pricing" | "supply">,
): SellableAsset {
  return {
    name: overrides.id,
    channel: "app_shelf",
    status: "ready",
    format: "test",
    note: "test",
    buyers: ["fmcg_food"],
    objectiveFit: fit(1),
    viewsPerUnit: 1,
    ...overrides,
  };
}

const screens = sellable({
  id: "screens",
  channel: "store",
  pricing: { model: "store_week", rateINR: 1000 },
  supply: { perWeek: 10, unit: "stores", basis: "test" },
  objectiveFit: fit(1),
  viewsPerUnit: 500,
});

const banner = (perWeek: number, trial: 0 | 1 | 2 | 3) =>
  sellable({
    id: "banner",
    pricing: { model: "cpm", rateINR: 100 },
    supply: { perWeek, unit: "impressions", basis: "test" },
    objectiveFit: fit(trial),
  });

const base: PlanInput = {
  category: "fmcg_food",
  productClass: "fmcg",
  objective: "trial",
  cities: ["hyderabad"],
  budgetINR: 5000,
  weeks: 2,
};

function expectPlan(plan: Plan): Extract<Plan, { kind: "plan" }> {
  if (plan.kind !== "plan") throw new Error(`expected a plan, got ${plan.reason}`);
  return plan;
}

function line(plan: Extract<Plan, { kind: "plan" }>, id: string) {
  const found = plan.lines.find((l) => l.assetId === id);
  if (!found) throw new Error(`no line for ${id}`);
  return found;
}

describe("allocation", () => {
  it("caps an asset at the space in the chosen cities and moves the rest to the others", () => {
    const plan = expectPlan(buildPlan(base, [banner(10_000, 3), screens], twoCities));
    expect(line(plan, "banner")).toMatchObject({
      spendINR: 1000,
      units: 10_000,
      unitLabel: "impressions",
    });
    expect(line(plan, "screens")).toMatchObject({
      spendINR: 4000,
      units: 4,
      unitLabel: "store-weeks",
      summary: "2 stores × 2 weeks",
      estViews: 2000,
    });
    expect(plan.totalSpendINR).toBe(5000);
    expect(plan.unallocatedINR).toBe(0);
    expect(plan.estViews).toBe(12_000);
    expect(plan.cityShare).toBe(0.5);
    expect(plan.warnings).toEqual([]);
  });

  it("sorts lines by spend, biggest first", () => {
    const plan = expectPlan(buildPlan(base, [banner(10_000, 3), screens], twoCities));
    expect(plan.lines.map((l) => l.assetId)).toEqual(["screens", "banner"]);
  });

  it("leaves money unspent when the cities run out of space, and warns", () => {
    const plan = expectPlan(
      buildPlan({ ...base, budgetINR: 20_000 }, [banner(10_000, 3), screens], twoCities),
    );
    expect(plan.totalSpendINR).toBe(11_000);
    expect(plan.unallocatedINR).toBe(9000);
    expect(plan.warnings).toHaveLength(1);
    expect(plan.warnings[0]).toContain("₹9,000");
  });

  it("finds more space when more cities are chosen", () => {
    const plan = expectPlan(
      buildPlan(
        { ...base, budgetINR: 20_000, cities: ["hyderabad", "chennai"] },
        [banner(10_000, 3), screens],
        twoCities,
      ),
    );
    expect(line(plan, "banner").spendINR).toBe(2000);
    expect(line(plan, "screens")).toMatchObject({
      spendINR: 18_000,
      summary: "9 stores × 2 weeks",
    });
    expect(plan.unallocatedINR).toBe(0);
  });

  it("puts rounding leftovers into impression-based lines with room to spare", () => {
    const plan = expectPlan(buildPlan(base, [banner(1_000_000, 1), screens], twoCities));
    expect(line(plan, "screens").spendINR).toBe(2000);
    expect(line(plan, "banner")).toMatchObject({ spendINR: 3000, units: 30_000 });
    expect(plan.unallocatedINR).toBe(0);
  });

  it("explains an asset whose share of the budget buys less than one unit", () => {
    const takeover = sellable({
      id: "takeover",
      pricing: { model: "flat_week", rateINR: 100_000 },
      supply: { perWeek: 3, unit: "slots", basis: "test" },
    });
    const plan = expectPlan(buildPlan(base, [banner(1_000_000, 1), takeover], twoCities));
    expect(plan.lines.find((l) => l.assetId === "takeover")).toBeUndefined();
    expect(plan.exclusions.find((e) => e.assetId === "takeover")?.reason).toContain("₹2 lakh");
  });

  it("sells national slots without scaling them by city", () => {
    const takeover = sellable({
      id: "takeover",
      pricing: { model: "flat_week", rateINR: 1000 },
      supply: { perWeek: 3, unit: "slots", basis: "test" },
      viewsPerUnit: 100,
    });
    const plan = expectPlan(buildPlan({ ...base, budgetINR: 10_000 }, [takeover], twoCities));
    expect(line(plan, "takeover")).toMatchObject({
      spendINR: 6000,
      units: 6,
      summary: "3 slots × 2 weeks",
      estViews: 600,
    });
  });

  it("buys clicks on a cost-per-click asset and says so", () => {
    const sponsored = sellable({
      id: "sponsored",
      pricing: { model: "cpc", rateINR: 5, ctr: 0.02 },
      supply: { perWeek: 1_000_000, unit: "impressions", basis: "test" },
    });
    const plan = expectPlan(buildPlan(base, [sponsored], twoCities));
    expect(line(plan, "sponsored")).toMatchObject({
      spendINR: 5000,
      units: 1000,
      unitLabel: "clicks",
      estViews: 50_000,
    });
    expect(line(plan, "sponsored").summary).toContain("1,000 clicks");
  });

  it("counts per-unit buys in whole units", () => {
    const samples = sellable({
      id: "samples",
      pricing: { model: "per_unit", rateINR: 6, unit: "sample" },
      supply: { perWeek: 100_000, unit: "units", basis: "test" },
    });
    const plan = expectPlan(buildPlan({ ...base, budgetINR: 5003 }, [samples], twoCities));
    expect(line(plan, "samples")).toMatchObject({
      spendINR: 4998,
      units: 833,
      summary: "833 samples",
    });
    expect(plan.unallocatedINR).toBe(5);
  });

  it("carries the rule on careful lines", () => {
    const careful = sellable({
      id: "careful",
      status: "careful",
      rule: "Opt-in only.",
      pricing: { model: "cpm", rateINR: 100 },
      supply: { perWeek: 1_000_000, unit: "impressions", basis: "test" },
    });
    const plan = expectPlan(buildPlan(base, [careful], twoCities));
    expect(line(plan, "careful").rule).toBe("Opt-in only.");
  });
});

describe("allocation on the real catalog", () => {
  const inputs: PlanInput[] = [
    {
      category: "fmcg_food",
      productClass: "fmcg",
      objective: "trial",
      cities: ["hyderabad"],
      budgetINR: 2_500_000,
      weeks: 6,
    },
    {
      category: "devices",
      productClass: "device",
      objective: "sales",
      cities: ["mumbai", "pune"],
      budgetINR: 40_000_000,
      weeks: 8,
    },
    {
      category: "insurance",
      productClass: "service",
      objective: "awareness",
      cities: ["kolkata"],
      budgetINR: 150_000,
      weeks: 1,
    },
    {
      category: "otc",
      productClass: "otc",
      objective: "loyalty",
      cities: ["chennai", "ahmedabad"],
      budgetINR: 900_000_000,
      weeks: 26,
    },
  ];

  it.each(inputs)(
    "never spends more than the budget and accounts for every rupee (%#)",
    (input) => {
      const plan = expectPlan(buildPlan(input));
      const lineTotal = plan.lines.reduce((sum, l) => sum + l.spendINR, 0);
      expect(plan.totalSpendINR).toBe(lineTotal);
      expect(plan.totalSpendINR).toBeLessThanOrEqual(input.budgetINR);
      expect(
        Math.abs(plan.totalSpendINR + plan.unallocatedINR - input.budgetINR),
      ).toBeLessThanOrEqual(1);
      for (const l of plan.lines) {
        expect(l.units).toBeGreaterThan(0);
        expect(Number.isInteger(l.spendINR)).toBe(true);
      }
    },
  );

  it("never buys more stores than have the space in the chosen cities", () => {
    const plan = expectPlan(buildPlan(inputs[3]!));
    const storeScreens = ASSETS.find((a) => a.id === "store_screens");
    if (!storeScreens || storeScreens.status === "never") throw new Error("store screens missing");
    const storeCap = Math.floor(storeScreens.supply.perWeek * (0.2 + 0.07));
    const screenLine = plan.lines.find((l) => l.assetId === "store_screens");
    expect(screenLine).toBeDefined();
    expect(screenLine!.units).toBeLessThanOrEqual(storeCap * 26);
  });

  it("gives the same plan for the same input", () => {
    expect(buildPlan(inputs[0]!)).toEqual(buildPlan(inputs[0]!));
  });
});
