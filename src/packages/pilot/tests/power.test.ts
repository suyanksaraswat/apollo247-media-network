import { minimumDetectableLift } from "../index";

describe("minimumDetectableLift", () => {
  it("needs about an 8% lift for 50 pairs over 6 weeks with 25% weekly swings", () => {
    expect(minimumDetectableLift(50, 6, 0.25)).toBeCloseTo(0.0809, 3);
  });

  it("matches the textbook z-scores for 5% significance and 80% power", () => {
    expect(minimumDetectableLift(1, 1, 0.5)).toBeCloseTo(1.95996 + 0.84162, 3);
  });

  it("shrinks with more pairs and more weeks, and grows with noisier sales", () => {
    const base = minimumDetectableLift(50, 6, 0.25);
    expect(minimumDetectableLift(100, 6, 0.25)).toBeLessThan(base);
    expect(minimumDetectableLift(50, 12, 0.25)).toBeLessThan(base);
    expect(minimumDetectableLift(50, 6, 0.4)).toBeGreaterThan(base);
  });

  it("needs a bigger lift for stricter significance or more power", () => {
    const base = minimumDetectableLift(50, 6, 0.25);
    expect(minimumDetectableLift(50, 6, 0.25, 0.01)).toBeGreaterThan(base);
    expect(minimumDetectableLift(50, 6, 0.25, 0.05, 0.9)).toBeGreaterThan(base);
  });

  it("can detect nothing with no pairs", () => {
    expect(minimumDetectableLift(0, 6, 0.25)).toBe(Number.POSITIVE_INFINITY);
  });
});
