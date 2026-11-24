import { designPilot, generateStores, simulatePilot, type PilotInput } from "../index";

const stores = generateStores();

const pilot: PilotInput = {
  cities: ["hyderabad", "chennai"],
  testStores: 50,
  weeks: 6,
  pricePerStoreWeekINR: 1150,
  weeklyNoiseCV: 0.25,
  screenOnly: true,
};

const design = designPilot(pilot, stores);

function run(seed: number, trueLift = 0.1, marketTrend = 0.08) {
  return simulatePilot({ design, weeks: 6, trueLift, marketTrend, weeklyNoiseCV: 0.25, seed });
}

describe("simulatePilot", () => {
  it("reports six weeks before and six weeks after the campaign starts", () => {
    expect(run(1).series.map((p) => p.week)).toEqual([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
  });

  it("gives the same readout for the same seed", () => {
    expect(run(7)).toEqual(run(7));
    expect(run(7)).not.toEqual(run(8));
  });

  it("separates the brand's lift from the market trend on a large pilot", () => {
    const big = designPilot(
      {
        ...pilot,
        cities: ["hyderabad", "chennai", "bengaluru", "kolkata", "mumbai"],
        testStores: 400,
        weeks: 8,
        screenOnly: false,
      },
      stores,
    );
    const readout = simulatePilot({
      design: big,
      weeks: 8,
      trueLift: 0.1,
      marketTrend: 0.08,
      weeklyNoiseCV: 0.25,
      seed: 3,
    });
    expect(readout.measuredLift).toBeGreaterThan(0.07);
    expect(readout.measuredLift).toBeLessThan(0.13);
    expect(readout.naiveLift).toBeGreaterThan(0.15);
    expect(readout.naiveLift).toBeLessThan(0.23);
    expect(readout.significant).toBe(true);
  });

  it("brackets zero in its 95% interval most of the time when the campaign does nothing", () => {
    let covered = 0;
    for (let seed = 1; seed <= 40; seed++) {
      const r = run(seed, 0, 0.08);
      if (r.ciLow <= 0 && r.ciHigh >= 0) covered += 1;
    }
    expect(covered).toBeGreaterThanOrEqual(34);
  });

  it("prices the return on the pilot's media cost", () => {
    const r = run(5);
    expect(r.mediaCostINR).toBe(design.mediaRevenueINR);
    expect(r.iroas).toBeCloseTo(r.incrementalSalesINR / r.mediaCostINR, 10);
    expect(r.incrementalSalesINR).toBeGreaterThan(0);
  });

  it("calls a result significant only when the whole interval is above zero", () => {
    for (let seed = 1; seed <= 10; seed++) {
      const r = run(seed);
      expect(r.significant).toBe(r.ciLow > 0);
      expect(r.ciLow).toBeLessThanOrEqual(r.measuredLift);
      expect(r.ciHigh).toBeGreaterThanOrEqual(r.measuredLift);
    }
  });

  it("shows test stores pulling ahead of their controls after launch", () => {
    const r = simulatePilot({
      design,
      weeks: 6,
      trueLift: 0.3,
      marketTrend: 0,
      weeklyNoiseCV: 0.1,
      seed: 2,
    });
    const post = r.series.filter((p) => p.week > 0);
    const pre = r.series.filter((p) => p.week < 0);
    const ratio = (pts: typeof post) =>
      pts.reduce((s, p) => s + p.test, 0) / pts.reduce((s, p) => s + p.control, 0);
    expect(ratio(post) / ratio(pre)).toBeGreaterThan(1.2);
  });

  it("returns an empty, insignificant readout when there are no pairs", () => {
    const empty = { ...design, pairs: [], mediaRevenueINR: 0 };
    const r = simulatePilot({
      design: empty,
      weeks: 6,
      trueLift: 0.1,
      marketTrend: 0,
      weeklyNoiseCV: 0.25,
      seed: 1,
    });
    expect(r.series).toEqual([]);
    expect(r.significant).toBe(false);
    expect(r.iroas).toBe(0);
  });
});
