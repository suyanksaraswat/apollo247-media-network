import { assumption } from "@/packages/catalog/evidence";
import { design } from "./lib/design";
import { buildNetwork } from "./lib/network";
import { simulate } from "./lib/simulate";
import { mde } from "./lib/stats";
import type { PilotDesign, PilotInput, PilotReadout, SimulationInput, Store } from "./types";

export type {
  MatchedPair,
  PilotDesign,
  PilotInput,
  PilotReadout,
  SimulationInput,
  Store,
  WeeklyPoint,
} from "./types";

export function generateStores(options: { seed?: number; count?: number } = {}): Store[] {
  return buildNetwork(options.seed ?? 7289, options.count ?? assumption("stores"));
}

export function minimumDetectableLift(
  pairs: number,
  weeks: number,
  cv: number,
  alpha = 0.05,
  power = 0.8,
): number {
  return mde(pairs, weeks, cv, alpha, power);
}

export function designPilot(input: PilotInput, stores: readonly Store[]): PilotDesign {
  return design(input, stores);
}

export function simulatePilot(input: SimulationInput): PilotReadout {
  return simulate(input);
}
