import { assumption } from "@/packages/catalog/evidence";
import { CITIES, STORE_FORMATS } from "@/packages/catalog/taxonomy";
import type { StoreFormat } from "@/packages/catalog/types";
import type { Store } from "../types";
import { apportion, lognormalFactor, mulberry32, pickByShare, shuffle } from "./random";

const FORMAT_TRAFFIC: Record<StoreFormat, number> = {
  neighbourhood: 0.85,
  high_street: 1.3,
  hospital: 1.5,
};
const BILLS_CV = 0.35;
const BRAND_SALES_PER_BILL_INR = 12;
const BRAND_SALES_CV = 0.3;

export function buildNetwork(seed: number, count: number): Store[] {
  const rng = mulberry32(seed);
  const counts = apportion(
    count,
    CITIES.map((c) => c.storeShare),
  );
  const cityOfStore = shuffle(
    rng,
    CITIES.flatMap((c, i) => Array.from({ length: counts[i] ?? 0 }, () => c.id)),
  );
  const billsBase = assumption("weeklyBillsPerStore");
  const width = String(count).length;
  const stores: Store[] = cityOfStore.map((city, i) => {
    const format = pickByShare(rng, STORE_FORMATS).id;
    const weeklyBills = Math.max(
      1,
      Math.round(billsBase * FORMAT_TRAFFIC[format] * lognormalFactor(rng, BILLS_CV)),
    );
    const baselineWeeklySalesINR = Math.max(
      1,
      Math.round(weeklyBills * BRAND_SALES_PER_BILL_INR * lognormalFactor(rng, BRAND_SALES_CV)),
    );
    return {
      id: `S-${String(i + 1).padStart(Math.max(4, width), "0")}`,
      city,
      format,
      weeklyBills,
      baselineWeeklySalesINR,
      hasScreen: false,
    };
  });
  const screens = Math.min(count, assumption("storesWithScreens"));
  const busiest = stores
    .toSorted((a, b) => b.weeklyBills - a.weeklyBills || a.id.localeCompare(b.id))
    .slice(0, screens);
  for (const store of busiest) store.hasScreen = true;
  return stores;
}
