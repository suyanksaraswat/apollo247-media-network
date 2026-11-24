import { formatCount, formatINR } from "@/packages/format";
import type { Pricing, SellableAsset } from "@/packages/catalog/types";

export interface Bought {
  spendINR: number;
  units: number;
  unitLabel: string;
  summary: string;
  estViews: number;
}

function unreachable(value: never): never {
  throw new Error(`Unknown pricing: ${JSON.stringify(value)}`);
}

function floorSafe(x: number): number {
  return Math.floor(x + 1e-9 * Math.max(1, Math.abs(x)));
}

function plural(n: number, word: string): string {
  return `${formatCount(n)} ${word}${n === 1 ? "" : "s"}`;
}

function weeksText(weeks: number): string {
  return `${weeks} week${weeks === 1 ? "" : "s"}`;
}

export function scaledCap(asset: SellableAsset, weeks: number, cityShare: number): number {
  const { perWeek } = asset.supply;
  const p = asset.pricing;
  switch (p.model) {
    case "cpm":
    case "cpc":
    case "per_unit":
      return floorSafe(perWeek * weeks * cityShare);
    case "store_week":
      return floorSafe(perWeek * cityShare);
    case "flat_week":
      return floorSafe(perWeek);
    default:
      return unreachable(p);
  }
}

export function costCap(asset: SellableAsset, weeks: number, cityShare: number): number {
  const cap = scaledCap(asset, weeks, cityShare);
  const p = asset.pricing;
  switch (p.model) {
    case "cpm":
      return (cap * p.rateINR) / 1000;
    case "cpc":
      return floorSafe(cap * p.ctr) * p.rateINR;
    case "per_unit":
      return cap * p.rateINR;
    case "store_week":
    case "flat_week":
      return cap * weeks * p.rateINR;
    default:
      return unreachable(p);
  }
}

export function smallestBuy(pricing: Pricing, weeks: number): { what: string; costINR: number } {
  switch (pricing.model) {
    case "cpm":
      return { what: "1,000 impressions", costINR: pricing.rateINR };
    case "cpc":
      return { what: "click", costINR: pricing.rateINR };
    case "per_unit":
      return { what: pricing.unit, costINR: pricing.rateINR };
    case "store_week":
      return { what: `store for ${weeksText(weeks)}`, costINR: pricing.rateINR * weeks };
    case "flat_week":
      return { what: `slot for ${weeksText(weeks)}`, costINR: pricing.rateINR * weeks };
    default:
      return unreachable(pricing);
  }
}

export function tooSmallReason(pricing: Pricing, weeks: number): string {
  const { what, costINR } = smallestBuy(pricing, weeks);
  return `One ${what} costs ${formatINR(costINR)}, more than its share of this budget.`;
}

export function buy(
  asset: SellableAsset,
  budget: number,
  weeks: number,
  cityShare: number,
): Bought {
  const cap = scaledCap(asset, weeks, cityShare);
  const views = asset.viewsPerUnit;
  const p = asset.pricing;
  switch (p.model) {
    case "cpm": {
      const spendINR = floorSafe(Math.min(budget, costCap(asset, weeks, cityShare)));
      const impressions = Math.min(cap, floorSafe((spendINR * 1000) / p.rateINR));
      return {
        spendINR: impressions > 0 ? spendINR : 0,
        units: impressions,
        unitLabel: "impressions",
        summary: plural(impressions, "impression"),
        estViews: Math.round(impressions * views),
      };
    }
    case "cpc": {
      const clicks = Math.min(floorSafe(cap * p.ctr), floorSafe(budget / p.rateINR));
      const impressions = Math.round(clicks / p.ctr);
      return {
        spendINR: Math.round(clicks * p.rateINR),
        units: clicks,
        unitLabel: "clicks",
        summary: `${plural(clicks, "click")} from about ${plural(impressions, "impression")}`,
        estViews: Math.round(impressions * views),
      };
    }
    case "per_unit": {
      const units = Math.min(cap, floorSafe(budget / p.rateINR));
      return {
        spendINR: Math.round(units * p.rateINR),
        units,
        unitLabel: `${p.unit}s`,
        summary: plural(units, p.unit),
        estViews: Math.round(units * views),
      };
    }
    case "store_week": {
      const stores = Math.min(cap, floorSafe(budget / (p.rateINR * weeks)));
      return {
        spendINR: Math.round(stores * weeks * p.rateINR),
        units: stores * weeks,
        unitLabel: "store-weeks",
        summary: `${plural(stores, "store")} × ${weeksText(weeks)}`,
        estViews: Math.round(stores * weeks * views),
      };
    }
    case "flat_week": {
      const slots = Math.min(cap, floorSafe(budget / (p.rateINR * weeks)));
      return {
        spendINR: Math.round(slots * weeks * p.rateINR),
        units: slots * weeks,
        unitLabel: "slot-weeks",
        summary: `${plural(slots, "slot")} × ${weeksText(weeks)}`,
        estViews: Math.round(slots * weeks * views),
      };
    }
    default:
      return unreachable(p);
  }
}

export function isImpressionBased(pricing: Pricing): boolean {
  return pricing.model === "cpm" || pricing.model === "cpc";
}
