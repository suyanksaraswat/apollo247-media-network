import { project } from "./lib/model";
import type { RevenueInputs, RevenueResult } from "./types";

export { SCENARIOS } from "./lib/scenarios";
export type {
  RevenueInputs,
  RevenueResult,
  Scenario,
  ScenarioId,
  Triple,
  YearResult,
} from "./types";

export function projectRevenue(inputs: RevenueInputs): RevenueResult {
  return project(inputs);
}
