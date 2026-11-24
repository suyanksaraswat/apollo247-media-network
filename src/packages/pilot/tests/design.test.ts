import { designPilot, generateStores, minimumDetectableLift, type PilotInput } from "../index";

const stores = generateStores();

const input: PilotInput = {
  cities: ["hyderabad", "chennai"],
  testStores: 50,
  weeks: 6,
  pricePerStoreWeekINR: 1150,
  weeklyNoiseCV: 0.25,
  screenOnly: true,
};

describe("designPilot", () => {
  const design = designPilot(input, stores);

  it("matches every requested test store with a control", () => {
    expect(design.pairs).toHaveLength(50);
    expect(design.requestedTestStores).toBe(50);
    expect(design.warnings).toEqual([]);
  });

  it("only tests stores with a screen in the chosen cities", () => {
    for (const { test } of design.pairs) {
      expect(test.hasScreen).toBe(true);
      expect(["hyderabad", "chennai"]).toContain(test.city);
    }
    expect(design.eligibleStores).toBe(
      stores.filter((s) => s.hasScreen && (s.city === "hyderabad" || s.city === "chennai")).length,
    );
  });

  it("splits test stores across cities in proportion to the eligible stores", () => {
    const hyd = design.pairs.filter((p) => p.test.city === "hyderabad").length;
    const eligibleHyd = stores.filter((s) => s.hasScreen && s.city === "hyderabad").length;
    expect(
      Math.abs(hyd - Math.round((50 * eligibleHyd) / design.eligibleStores)),
    ).toBeLessThanOrEqual(1);
  });

  it("pairs each test store with a store of the same city and format that isn't in the test", () => {
    const testIds = new Set(design.pairs.map((p) => p.test.id));
    for (const { test, control } of design.pairs) {
      expect(control.city).toBe(test.city);
      expect(control.format).toBe(test.format);
      expect(testIds.has(control.id)).toBe(false);
    }
  });

  it("never uses a control store twice", () => {
    const controls = design.pairs.map((p) => p.control.id);
    expect(new Set(controls).size).toBe(controls.length);
  });

  it("finds close matches on baseline sales", () => {
    expect(design.avgBaselineGap).toBeLessThan(0.05);
    for (const pair of design.pairs) {
      expect(pair.baselineGap).toBeCloseTo(
        Math.abs(pair.control.baselineWeeklySalesINR / pair.test.baselineWeeklySalesINR - 1),
        10,
      );
    }
  });

  it("charges for every test store and week, and reports the pilot's power", () => {
    expect(design.mediaRevenueINR).toBe(50 * 6 * 1150);
    expect(design.mde).toBeCloseTo(minimumDetectableLift(50, 6, 0.25), 10);
  });

  it("is the same every time", () => {
    expect(designPilot(input, stores)).toEqual(design);
  });

  it("warns when the cities can't supply the stores asked for", () => {
    const tiny = designPilot({ ...input, cities: ["ahmedabad"], testStores: 5000 }, stores);
    expect(tiny.pairs.length).toBeLessThan(5000);
    expect(tiny.warnings.join(" ")).toMatch(/5,000/);
  });

  it("warns when the pilot is too small to detect a realistic lift", () => {
    const small = designPilot({ ...input, testStores: 5, weeks: 2 }, stores);
    expect(small.mde).toBeGreaterThan(0.15);
    expect(small.warnings.join(" ")).toMatch(/too small to detect a lift under/);
  });

  it("can test stores without screens when asked", () => {
    const any = designPilot({ ...input, screenOnly: false }, stores);
    expect(any.eligibleStores).toBe(
      stores.filter((s) => s.city === "hyderabad" || s.city === "chennai").length,
    );
  });

  it.each([
    ["no cities", { cities: [] }],
    ["no test stores", { testStores: 0 }],
    ["a fraction of a store", { testStores: 2.5 }],
    ["zero weeks", { weeks: 0 }],
    ["a negative price", { pricePerStoreWeekINR: -1 }],
    ["no sales noise", { weeklyNoiseCV: 0 }],
  ])("refuses %s", (_label, change) => {
    expect(() => designPilot({ ...input, ...change }, stores)).toThrow(RangeError);
  });
});
