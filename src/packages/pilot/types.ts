import type { CityId, StoreFormat } from "@/packages/catalog/types";

export interface Store {
  id: string;
  city: CityId;
  format: StoreFormat;
  weeklyBills: number;
  baselineWeeklySalesINR: number;
  hasScreen: boolean;
}

export interface PilotInput {
  cities: CityId[];
  testStores: number;
  weeks: number;
  pricePerStoreWeekINR: number;
  weeklyNoiseCV: number;
  screenOnly: boolean;
}

export interface MatchedPair {
  test: Store;
  control: Store;
  baselineGap: number;
}

export interface PilotDesign {
  pairs: MatchedPair[];
  eligibleStores: number;
  requestedTestStores: number;
  mediaRevenueINR: number;
  mde: number;
  avgBaselineGap: number;
  warnings: string[];
}

export interface SimulationInput {
  design: PilotDesign;
  weeks: number;
  trueLift: number;
  marketTrend: number;
  weeklyNoiseCV: number;
  seed: number;
}

export interface WeeklyPoint {
  week: number;
  test: number;
  control: number;
}

export interface PilotReadout {
  series: WeeklyPoint[];
  measuredLift: number;
  ciLow: number;
  ciHigh: number;
  naiveLift: number;
  incrementalSalesINR: number;
  mediaCostINR: number;
  iroas: number;
  significant: boolean;
}
