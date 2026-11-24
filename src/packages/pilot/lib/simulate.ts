import type { PilotReadout, SimulationInput, WeeklyPoint } from "../types";
import { lognormalFactor, mulberry32 } from "./random";

const Z_95 = 1.959963984540054;

function weekNumbers(weeks: number): number[] {
  return [
    ...Array.from({ length: weeks }, (_, i) => i - weeks),
    ...Array.from({ length: weeks }, (_, i) => i + 1),
  ];
}

export function simulate(input: SimulationInput): PilotReadout {
  const { design, weeks, trueLift, marketTrend, weeklyNoiseCV } = input;
  const mediaCostINR = design.mediaRevenueINR;
  const n = design.pairs.length;
  if (n === 0) {
    return {
      series: [],
      measuredLift: 0,
      ciLow: 0,
      ciHigh: 0,
      naiveLift: 0,
      incrementalSalesINR: 0,
      mediaCostINR,
      iroas: 0,
      significant: false,
    };
  }

  const rng = mulberry32(input.seed);
  const labels = weekNumbers(weeks);
  const testTotals = labels.map(() => 0);
  const controlTotals = labels.map(() => 0);
  const lifts: number[] = [];
  let preTestAll = 0;
  let postTestAll = 0;

  for (const { test, control } of design.pairs) {
    let preT = 0;
    let postT = 0;
    let preC = 0;
    let postC = 0;
    labels.forEach((week, i) => {
      const after = week > 0;
      const market = after ? 1 + marketTrend : 1;
      const t =
        test.baselineWeeklySalesINR *
        market *
        (after ? 1 + trueLift : 1) *
        lognormalFactor(rng, weeklyNoiseCV);
      const c = control.baselineWeeklySalesINR * market * lognormalFactor(rng, weeklyNoiseCV);
      testTotals[i]! += t;
      controlTotals[i]! += c;
      if (after) {
        postT += t;
        postC += c;
      } else {
        preT += t;
        preC += c;
      }
    });
    lifts.push(postT / preT / (postC / preC) - 1);
    preTestAll += preT;
    postTestAll += postT;
  }

  const measuredLift = lifts.reduce((a, b) => a + b, 0) / n;
  const variance = n > 1 ? lifts.reduce((sum, l) => sum + (l - measuredLift) ** 2, 0) / (n - 1) : 0;
  const halfWidth = n > 1 ? (Z_95 * Math.sqrt(variance)) / Math.sqrt(n) : 0;
  const ciLow = measuredLift - halfWidth;
  const incrementalSalesINR = (postTestAll * measuredLift) / (1 + measuredLift);
  const series: WeeklyPoint[] = labels.map((week, i) => ({
    week,
    test: testTotals[i]! / n,
    control: controlTotals[i]! / n,
  }));

  return {
    series,
    measuredLift,
    ciLow,
    ciHigh: measuredLift + halfWidth,
    naiveLift: postTestAll / preTestAll - 1,
    incrementalSalesINR,
    mediaCostINR,
    iroas: mediaCostINR > 0 ? incrementalSalesINR / mediaCostINR : 0,
    significant: n > 1 && ciLow > 0,
  };
}
