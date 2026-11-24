import type { City } from "@/packages/catalog/types";
import type { PlanInput } from "../types";

const MAX_WEEKS = 26;

export function validate(input: PlanInput, cities: readonly City[]): number {
  if (!(input.budgetINR > 0)) throw new RangeError("The budget must be more than zero.");
  if (!Number.isInteger(input.weeks) || input.weeks < 1 || input.weeks > MAX_WEEKS) {
    throw new RangeError(`Weeks must be a whole number from 1 to ${MAX_WEEKS}.`);
  }
  if (input.cities.length === 0) throw new RangeError("Pick at least one city.");
  let share = 0;
  for (const id of new Set(input.cities)) {
    const city = cities.find((c) => c.id === id);
    if (!city) throw new RangeError(`Unknown city: ${id}.`);
    share += city.storeShare;
  }
  return share;
}
