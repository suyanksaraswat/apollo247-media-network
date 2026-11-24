import { ASSETS } from "@/packages/catalog/assets";
import { CITIES } from "@/packages/catalog/taxonomy";
import type {
  CategoryId,
  City,
  MediaAsset,
  ObjectiveId,
  ProductClassId,
} from "@/packages/catalog/types";
import { eligibility } from "./lib/eligibility";
import { plan } from "./lib/plan";
import type { Eligibility, Plan, PlanInput } from "./types";

export type { Eligibility, Exclusion, Plan, PlanInput, PlanLine } from "./types";

export function buildPlan(
  input: PlanInput,
  assets: readonly MediaAsset[] = ASSETS,
  cities: readonly City[] = CITIES,
): Plan {
  return plan(input, assets, cities);
}

export function checkEligibility(
  asset: MediaAsset,
  category: CategoryId,
  productClass: ProductClassId,
  objective: ObjectiveId,
): Eligibility {
  return eligibility(asset, category, productClass, objective);
}
