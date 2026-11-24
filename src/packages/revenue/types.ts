export type Triple = readonly [number, number, number];

export interface RevenueInputs {
  onlineGmvCr: number;
  gmvGrowth: number;
  takeRate: Triple;
  storesLive: Triple;
  screenRateMonthly: number;
  otherInStoreMonthly: number;
  fillRate: Triple;
  dailyDeliveries: number;
  samplingShare: Triple;
  feePerSample: number;
  insightBrands: Triple;
  insightFeeAnnual: number;
  screenCapexPerStore: number;
}

export type ScenarioId = "conservative" | "base" | "ambitious";

export interface Scenario {
  label: string;
  description: string;
  inputs: RevenueInputs;
}

export interface YearResult {
  year: 1 | 2 | 3;
  app: number;
  stores: number;
  doorstep: number;
  insights: number;
  total: number;
}

export interface RevenueResult {
  years: readonly [YearResult, YearResult, YearResult];
  storeRevenuePerStoreMonth: Triple;
  screenPaybackMonths: number | null;
  capexINR: number;
}
