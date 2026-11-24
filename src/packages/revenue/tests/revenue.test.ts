import { projectRevenue, SCENARIOS, type RevenueInputs } from "../index";

const fixture: RevenueInputs = {
  onlineGmvCr: 100,
  gmvGrowth: 0.1,
  takeRate: [0.01, 0.02, 0.03],
  storesLive: [10, 20, 30],
  screenRateMonthly: 5000,
  otherInStoreMonthly: 3000,
  fillRate: [0.5, 0.5, 1],
  dailyDeliveries: 1000,
  samplingShare: [0.1, 0.1, 0.1],
  feePerSample: 5,
  insightBrands: [1, 2, 3],
  insightFeeAnnual: 100_000,
  screenCapexPerStore: 20_000,
};

describe("projectRevenue", () => {
  it("earns app revenue as a share of grown online GMV", () => {
    const result = projectRevenue(fixture);
    expect(result.years[0].app).toBeCloseTo(11_000_000);
    expect(result.years[2].app).toBeCloseTo(39_930_000);
  });

  it("earns store revenue from live stores at the filled monthly rate", () => {
    const result = projectRevenue(fixture);
    expect(result.storeRevenuePerStoreMonth).toEqual([4000, 4000, 8000]);
    expect(result.years[0].stores).toBeCloseTo(480_000);
    expect(result.years[2].stores).toBeCloseTo(2_880_000);
  });

  it("earns doorstep revenue from sampled deliveries and insights from subscribing brands", () => {
    const year1 = projectRevenue(fixture).years[0];
    expect(year1.doorstep).toBeCloseTo(182_500);
    expect(year1.insights).toBe(100_000);
    expect(year1.total).toBeCloseTo(11_762_500);
  });

  it("numbers the years 1 to 3", () => {
    expect(projectRevenue(fixture).years.map((y) => y.year)).toEqual([1, 2, 3]);
  });

  it("costs screens for the most stores ever live and pays a screen back from its filled screen rate", () => {
    const result = projectRevenue(fixture);
    expect(result.capexINR).toBe(600_000);
    expect(result.screenPaybackMonths).toBeCloseTo(8);
  });

  it("has no payback when the first year sells no screen time", () => {
    const result = projectRevenue({ ...fixture, fillRate: [0, 0.5, 1] });
    expect(result.screenPaybackMonths).toBeNull();
  });
});

describe("SCENARIOS", () => {
  it("ranks conservative below base below ambitious in every year", () => {
    const totals = (["conservative", "base", "ambitious"] as const).map((id) =>
      projectRevenue(SCENARIOS[id].inputs).years.map((y) => y.total),
    );
    for (let year = 0; year < 3; year++) {
      expect(totals[0]![year]!).toBeLessThan(totals[1]![year]!);
      expect(totals[1]![year]!).toBeLessThan(totals[2]![year]!);
    }
  });

  it("anchors the base case to Apollo's reported FY26 GMV", () => {
    expect(SCENARIOS.base.inputs.onlineGmvCr).toBe(2037);
  });

  it("puts the base case's first year in the tens of crores", () => {
    const year1 = projectRevenue(SCENARIOS.base.inputs).years[0].total;
    expect(year1).toBeGreaterThan(10e7);
    expect(year1).toBeLessThan(100e7);
  });

  it("gives every scenario a plain label and description", () => {
    for (const scenario of Object.values(SCENARIOS)) {
      expect(scenario.label.length).toBeGreaterThan(0);
      expect(scenario.description.length).toBeGreaterThan(0);
    }
  });
});
