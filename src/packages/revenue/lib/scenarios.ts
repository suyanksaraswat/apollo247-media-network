import { assumption } from "@/packages/catalog/evidence";
import type { RevenueInputs, Scenario, ScenarioId } from "../types";

const sourced = {
  onlineGmvCr: assumption("onlineGmvCr"),
  screenRateMonthly: assumption("screenRateMonthly"),
  otherInStoreMonthly: assumption("otherInStoreMonthly"),
  screenCapexPerStore: assumption("screenCapexPerStore"),
  dailyDeliveries: Math.round(assumption("dailyOrders") * assumption("homeDeliveryShare")),
  feePerSample: 6,
  insightFeeAnnual: 1_600_000,
};

const base: RevenueInputs = {
  ...sourced,
  gmvGrowth: assumption("gmvGrowth"),
  takeRate: [0.01, 0.015, 0.02],
  storesLive: [1000, 2500, 4000],
  fillRate: [0.4, 0.55, 0.65],
  samplingShare: [0.05, 0.1, 0.15],
  insightBrands: [10, 25, 40],
};

export const SCENARIOS: Record<ScenarioId, Scenario> = {
  conservative: {
    label: "Conservative",
    description:
      "Slower growth, a light ad load in the app and a cautious store roll-out with half the screen time sold.",
    inputs: {
      ...sourced,
      gmvGrowth: 0.2,
      takeRate: [0.0075, 0.01, 0.0125],
      storesLive: [500, 1200, 2000],
      fillRate: [0.3, 0.4, 0.5],
      samplingShare: [0.03, 0.05, 0.08],
      insightBrands: [5, 12, 20],
    },
  },
  base: {
    label: "Base",
    description:
      "Growth at the reported target, ad revenue rising from 1% to 2% of online GMV and screens in 4,000 stores by year three.",
    inputs: base,
  },
  ambitious: {
    label: "Ambitious",
    description:
      "Faster growth, an ad load closer to quick commerce and screens in most stores by year three.",
    inputs: {
      ...sourced,
      gmvGrowth: 0.3,
      takeRate: [0.015, 0.02, 0.03],
      storesLive: [2000, 4000, 6000],
      fillRate: [0.5, 0.65, 0.75],
      samplingShare: [0.08, 0.15, 0.2],
      insightBrands: [15, 40, 70],
    },
  },
};
