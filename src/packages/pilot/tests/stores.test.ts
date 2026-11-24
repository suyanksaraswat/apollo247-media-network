import { assumption } from "@/packages/catalog/evidence";
import { CITIES } from "@/packages/catalog/taxonomy";
import { generateStores, type Store } from "../index";

function avgBills(stores: Store[], format: string): number {
  const group = stores.filter((s) => s.format === format);
  return group.reduce((sum, s) => sum + s.weeklyBills, 0) / group.length;
}

describe("generateStores", () => {
  const stores = generateStores();

  it("builds one store per Apollo pharmacy by default, with stable ids", () => {
    expect(stores).toHaveLength(assumption("stores"));
    expect(stores[0]!.id).toBe("S-0001");
    expect(new Set(stores.map((s) => s.id)).size).toBe(stores.length);
  });

  it("gives the same network for the same seed and a different one for another seed", () => {
    expect(generateStores({ seed: 1, count: 200 })).toEqual(
      generateStores({ seed: 1, count: 200 }),
    );
    expect(generateStores({ seed: 2, count: 200 })).not.toEqual(
      generateStores({ seed: 1, count: 200 }),
    );
  });

  it("spreads stores across cities by each city's share", () => {
    for (const city of CITIES) {
      const share = stores.filter((s) => s.city === city.id).length / stores.length;
      expect(share).toBeCloseTo(city.storeShare, 2);
    }
  });

  it("puts screens in exactly the planned number of stores, the busiest ones", () => {
    const withScreens = stores.filter((s) => s.hasScreen);
    expect(withScreens).toHaveLength(assumption("storesWithScreens"));
    const quietestWithScreen = Math.min(...withScreens.map((s) => s.weeklyBills));
    const busiestWithout = Math.max(
      ...stores.filter((s) => !s.hasScreen).map((s) => s.weeklyBills),
    );
    expect(quietestWithScreen).toBeGreaterThanOrEqual(busiestWithout);
  });

  it("makes hospital and high-street stores busier than neighbourhood stores", () => {
    expect(avgBills(stores, "high_street")).toBeGreaterThan(avgBills(stores, "neighbourhood"));
    expect(avgBills(stores, "hospital")).toBeGreaterThan(avgBills(stores, "high_street"));
  });

  it("keeps the network's average bills near the sourced figure", () => {
    const networkAverage = stores.reduce((sum, s) => sum + s.weeklyBills, 0) / stores.length;
    expect(networkAverage / assumption("weeklyBillsPerStore")).toBeGreaterThan(0.85);
    expect(networkAverage / assumption("weeklyBillsPerStore")).toBeLessThan(1.25);
  });

  it("gives every store whole, positive numbers", () => {
    for (const s of stores) {
      expect(Number.isInteger(s.weeklyBills) && s.weeklyBills > 0).toBe(true);
      expect(Number.isInteger(s.baselineWeeklySalesINR) && s.baselineWeeklySalesINR > 0).toBe(true);
    }
  });
});
