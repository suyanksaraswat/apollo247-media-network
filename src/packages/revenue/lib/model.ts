import type { RevenueInputs, RevenueResult, Triple, YearResult } from "../types";

const CRORE = 1e7;
const MONTHS = 12;
const YEARS = [1, 2, 3] as const;
const DAYS = 365;

function yearResult(inputs: RevenueInputs, index: 0 | 1 | 2, perStoreMonth: number): YearResult {
  const gmv = inputs.onlineGmvCr * CRORE * (1 + inputs.gmvGrowth) ** (index + 1);
  const app = gmv * inputs.takeRate[index];
  const stores = inputs.storesLive[index] * perStoreMonth * MONTHS;
  const doorstep =
    inputs.dailyDeliveries * DAYS * inputs.samplingShare[index] * inputs.feePerSample;
  const insights = inputs.insightBrands[index] * inputs.insightFeeAnnual;
  return {
    year: YEARS[index],
    app,
    stores,
    doorstep,
    insights,
    total: app + stores + doorstep + insights,
  };
}

export function project(inputs: RevenueInputs): RevenueResult {
  const monthlyRate = inputs.screenRateMonthly + inputs.otherInStoreMonthly;
  const perStoreMonth: Triple = [
    monthlyRate * inputs.fillRate[0],
    monthlyRate * inputs.fillRate[1],
    monthlyRate * inputs.fillRate[2],
  ];
  const firstYearScreenIncome = inputs.screenRateMonthly * inputs.fillRate[0];
  return {
    years: [
      yearResult(inputs, 0, perStoreMonth[0]),
      yearResult(inputs, 1, perStoreMonth[1]),
      yearResult(inputs, 2, perStoreMonth[2]),
    ],
    storeRevenuePerStoreMonth: perStoreMonth,
    screenPaybackMonths:
      firstYearScreenIncome > 0 ? inputs.screenCapexPerStore / firstYearScreenIncome : null,
    capexINR: Math.max(...inputs.storesLive) * inputs.screenCapexPerStore,
  };
}
