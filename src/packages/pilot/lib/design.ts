import { formatCount, formatPct } from "@/packages/format";
import type { CityId } from "@/packages/catalog/types";
import type { MatchedPair, PilotDesign, PilotInput, Store } from "../types";
import { apportion } from "./random";
import { mde } from "./stats";

const MAX_WEEKS = 26;
const DETECTABLE_LIFT_LIMIT = 0.15;

function validate(input: PilotInput): void {
  if (input.cities.length === 0) throw new RangeError("Pick at least one city.");
  if (!Number.isInteger(input.testStores) || input.testStores < 1) {
    throw new RangeError("Test stores must be a whole number of at least 1.");
  }
  if (!Number.isInteger(input.weeks) || input.weeks < 1 || input.weeks > MAX_WEEKS) {
    throw new RangeError(`Weeks must be a whole number from 1 to ${MAX_WEEKS}.`);
  }
  if (!(input.pricePerStoreWeekINR >= 0) || !Number.isFinite(input.pricePerStoreWeekINR)) {
    throw new RangeError("The price must be zero or more.");
  }
  if (!(input.weeklyNoiseCV > 0)) throw new RangeError("Weekly sales swing must be above zero.");
}

function byTrafficThenId(a: Store, b: Store): number {
  return b.weeklyBills - a.weeklyBills || a.id.localeCompare(b.id);
}

function spread<T>(sorted: readonly T[], k: number): T[] {
  const n = sorted.length;
  return Array.from({ length: Math.min(k, n) }, (_, i) => sorted[Math.floor(((i + 0.5) * n) / k)]!);
}

function pickTests(
  eligible: readonly Store[],
  cities: readonly CityId[],
  requested: number,
): Store[] {
  const groups = cities.map((city) =>
    eligible.filter((s) => s.city === city).toSorted(byTrafficThenId),
  );
  const counts = apportion(
    Math.min(requested, eligible.length),
    groups.map((g) => g.length),
  );
  return groups.flatMap((group, i) => spread(group, counts[i] ?? 0));
}

function gap(test: Store, control: Store): number {
  return Math.abs(Math.log(control.baselineWeeklySalesINR / test.baselineWeeklySalesINR));
}

function groupKey(store: Store): string {
  return `${store.city}|${store.format}`;
}

function matchControls(
  tests: readonly Store[],
  stores: readonly Store[],
): { pairs: MatchedPair[]; unmatched: number } {
  const testIds = new Set(tests.map((t) => t.id));
  const pools = new Map<string, Store[]>();
  for (const store of stores) {
    if (testIds.has(store.id)) continue;
    const pool = pools.get(groupKey(store));
    if (pool) pool.push(store);
    else pools.set(groupKey(store), [store]);
  }
  const order = tests.toSorted(
    (a, b) => b.baselineWeeklySalesINR - a.baselineWeeklySalesINR || a.id.localeCompare(b.id),
  );
  const pairs: MatchedPair[] = [];
  let unmatched = 0;
  for (const test of order) {
    const pool = pools.get(groupKey(test)) ?? [];
    let bestIndex = -1;
    let bestGap = Number.POSITIVE_INFINITY;
    pool.forEach((candidate, index) => {
      const g = gap(test, candidate);
      const current = pool[bestIndex];
      if (g < bestGap || (g === bestGap && current && candidate.id < current.id)) {
        bestGap = g;
        bestIndex = index;
      }
    });
    const best = pool[bestIndex];
    if (!best) {
      unmatched += 1;
      continue;
    }
    pool.splice(bestIndex, 1);
    pairs.push({
      test,
      control: best,
      baselineGap: Math.abs(best.baselineWeeklySalesINR / test.baselineWeeklySalesINR - 1),
    });
  }
  return { pairs, unmatched };
}

export function design(input: PilotInput, stores: readonly Store[]): PilotDesign {
  validate(input);
  const cities = [...new Set(input.cities)];
  const eligible = stores.filter(
    (s) => cities.includes(s.city) && (!input.screenOnly || s.hasScreen),
  );
  const tests = pickTests(eligible, cities, input.testStores);
  const { pairs, unmatched } = matchControls(tests, stores);
  const lift = mde(pairs.length, input.weeks, input.weeklyNoiseCV, 0.05, 0.8);

  const warnings: string[] = [];
  if (unmatched > 0) {
    warnings.push(
      `${formatCount(unmatched)} test store${unmatched === 1 ? " had" : "s had"} no similar store left to compare with, so ${unmatched === 1 ? "it was" : "they were"} dropped.`,
    );
  }
  if (pairs.length < input.testStores) {
    warnings.push(
      `Only ${formatCount(pairs.length)} matched pairs fit in these cities; you asked for ${formatCount(input.testStores)}.`,
    );
  }
  if (lift > DETECTABLE_LIFT_LIMIT) {
    warnings.push(
      Number.isFinite(lift)
        ? `With ${formatCount(pairs.length)} pairs over ${input.weeks} weeks this pilot is too small to detect a lift under ${formatPct(lift)}. Add stores or weeks.`
        : "No store pairs could be formed, so this pilot is too small to detect a lift under any size. Pick other cities.",
    );
  }

  return {
    pairs,
    eligibleStores: eligible.length,
    requestedTestStores: input.testStores,
    mediaRevenueINR: pairs.length * input.weeks * input.pricePerStoreWeekINR,
    mde: lift,
    avgBaselineGap:
      pairs.length === 0 ? 0 : pairs.reduce((sum, p) => sum + p.baselineGap, 0) / pairs.length,
    warnings,
  };
}
