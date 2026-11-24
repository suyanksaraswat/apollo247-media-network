export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function normal(rng: Rng): number {
  let u = 0;
  while (u === 0) u = rng();
  const v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function lognormalFactor(rng: Rng, cv: number): number {
  const sigma = Math.sqrt(Math.log(1 + cv * cv));
  return Math.exp(normal(rng) * sigma - (sigma * sigma) / 2);
}

export function pickByShare<T extends { share: number }>(rng: Rng, items: readonly T[]): T {
  const total = items.reduce((sum, i) => sum + i.share, 0);
  let roll = rng() * total;
  for (const item of items) {
    roll -= item.share;
    if (roll < 0) return item;
  }
  const last = items[items.length - 1];
  if (!last) throw new RangeError("Nothing to pick from.");
  return last;
}

export function shuffle<T>(rng: Rng, items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [items[i], items[j]] = [items[j]!, items[i]!];
  }
  return items;
}

export function apportion(total: number, shares: readonly number[]): number[] {
  const sum = shares.reduce((a, b) => a + b, 0);
  const exact = shares.map((s) => (total * s) / sum);
  const counts = exact.map(Math.floor);
  let left = total - counts.reduce((a, b) => a + b, 0);
  const order = exact
    .map((x, i) => ({ i, rest: x - Math.floor(x) }))
    .toSorted((a, b) => b.rest - a.rest || a.i - b.i);
  for (const { i } of order) {
    if (left <= 0) break;
    counts[i]! += 1;
    left -= 1;
  }
  return counts;
}
