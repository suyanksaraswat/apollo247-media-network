import type { SellableAsset } from "@/packages/catalog/types";

export interface Candidate {
  asset: SellableAsset;
  weight: number;
  cap: number;
  alloc: number;
}

export function waterFill(candidates: Candidate[], budget: number): void {
  let remaining = budget;
  let active = candidates.filter((c) => c.cap > 0 && c.weight > 0);
  while (active.length > 0 && remaining > 0) {
    const totalWeight = active.reduce((sum, c) => sum + c.weight, 0);
    const capped = active.filter((c) => (remaining * c.weight) / totalWeight >= c.cap - c.alloc);
    if (capped.length === 0) {
      for (const c of active) c.alloc += (remaining * c.weight) / totalWeight;
      return;
    }
    for (const c of capped) {
      remaining -= c.cap - c.alloc;
      c.alloc = c.cap;
    }
    active = active.filter((c) => !capped.includes(c));
  }
}
