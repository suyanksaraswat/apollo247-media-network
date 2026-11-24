import type {
  CategoryId,
  ChannelId,
  CityId,
  ObjectiveId,
  ProductClassId,
} from "@/packages/catalog/types";

export interface PlanInput {
  category: CategoryId;
  productClass: ProductClassId;
  objective: ObjectiveId;
  cities: CityId[];
  budgetINR: number;
  weeks: number;
}

export interface PlanLine {
  assetId: string;
  assetName: string;
  channel: ChannelId;
  status: "exists" | "ready" | "careful";
  spendINR: number;
  units: number;
  unitLabel: string;
  summary: string;
  estViews: number;
  rule?: string;
}

export interface Exclusion {
  assetId: string;
  assetName: string;
  reason: string;
}

export type Plan =
  | { kind: "blocked"; reason: string }
  | {
      kind: "plan";
      lines: PlanLine[];
      exclusions: Exclusion[];
      totalSpendINR: number;
      unallocatedINR: number;
      estViews: number;
      cityShare: number;
      warnings: string[];
    };

export type Eligibility = { eligible: true } | { eligible: false; reason: string };
