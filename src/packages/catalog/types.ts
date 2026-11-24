export type CategoryId =
  | "fmcg_food"
  | "personal_care"
  | "nutrition"
  | "otc"
  | "devices"
  | "baby"
  | "insurance"
  | "fitness";

export type ProductClassId = "rx" | "otc" | "fmcg" | "device" | "service";

export type ObjectiveId = "awareness" | "trial" | "sales" | "loyalty";

export type CityId =
  "hyderabad" | "chennai" | "bengaluru" | "kolkata" | "delhi_ncr" | "mumbai" | "pune" | "ahmedabad";

export type ChannelId = "app_shelf" | "app_journey" | "store" | "doorstep" | "data";

export type AssetStatus = "exists" | "ready" | "careful" | "never";

export type StoreFormat = "neighbourhood" | "high_street" | "hospital";

export type ClaimRuleId =
  | "cure_claim"
  | "guarantee"
  | "unsupported_superlative"
  | "rx_promotion"
  | "condition_targeting"
  | "other";

export type EvidenceKind = "sourced" | "derived" | "placeholder";

export interface Category {
  id: CategoryId;
  label: string;
}

export interface ProductClass {
  id: ProductClassId;
  label: string;
  consumerAds: boolean;
  reason?: string;
}

export interface Objective {
  id: ObjectiveId;
  label: string;
  description: string;
}

export interface City {
  id: CityId;
  label: string;
  storeShare: number;
}

export interface Channel {
  id: ChannelId;
  label: string;
  description: string;
}

export interface ClaimRule {
  id: ClaimRuleId;
  label: string;
  description: string;
}

export type Pricing =
  | { model: "cpm"; rateINR: number }
  | { model: "cpc"; rateINR: number; ctr: number }
  | { model: "store_week"; rateINR: number }
  | { model: "per_unit"; rateINR: number; unit: string }
  | { model: "flat_week"; rateINR: number };

export type SupplyUnit = "impressions" | "stores" | "units" | "slots";

export interface Supply {
  perWeek: number;
  unit: SupplyUnit;
  basis: string;
}

interface AssetBase {
  id: string;
  name: string;
  channel: ChannelId;
  format: string;
  note: string;
  buyers: CategoryId[];
  objectiveFit: Record<ObjectiveId, 0 | 1 | 2 | 3>;
  allowedClasses?: ProductClassId[];
  rule?: string;
}

export interface NeverAsset extends AssetBase {
  status: "never";
  rule: string;
}

export interface SellableAsset extends AssetBase {
  status: "exists" | "ready" | "careful";
  pricing: Pricing;
  supply: Supply;
  viewsPerUnit: number;
}

export type MediaAsset = NeverAsset | SellableAsset;

export interface Source {
  id: string;
  label: string;
  publisher: string;
  url: string;
  accessed: string;
}

export type AssumptionId =
  | "stores"
  | "registeredUsers"
  | "onlineGmvCr"
  | "gmvGrowth"
  | "dailyOrders"
  | "healthcoRevenueCr"
  | "revenuePerStoreMonth"
  | "avgBillINR"
  | "weeklyBillsPerStore"
  | "sessionsPerOrder"
  | "homeDeliveryShare"
  | "consultShare"
  | "storesWithScreens"
  | "screenRateMonthly"
  | "otherInStoreMonthly"
  | "takeRateAnchor"
  | "optedInMessagingMonthly"
  | "screenCapexPerStore"
  | "weeklySalesNoiseCV";

export interface Assumption {
  id: AssumptionId;
  label: string;
  value: number;
  unit: string;
  kind: EvidenceKind;
  sourceIds: string[];
  note: string;
}

export interface Fact {
  id: string;
  value: string;
  label: string;
  detail: string;
  sourceIds: string[];
}

export interface CreativeIssue {
  quote: string;
  rule: ClaimRuleId;
  problem: string;
  rewrite: string;
}

export interface CreativeReview {
  verdict: "ok" | "revise" | "refuse";
  issues: CreativeIssue[];
}

export interface BriefFields {
  category: CategoryId;
  productClass: ProductClassId;
  objective: ObjectiveId;
  cities: CityId[];
  budgetINR: number | null;
  weeks: number | null;
  creativeLines: string[];
  conditionTargeting: { asked: boolean; note: string | null };
  summary: string;
}

export interface SampleBrief {
  id: string;
  title: string;
  text: string;
  fields: BriefFields;
  review: CreativeReview | null;
}
