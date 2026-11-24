import { formatINR } from "@/packages/format";
import type { City, MediaAsset, SellableAsset } from "@/packages/catalog/types";
import type { Exclusion, Plan, PlanInput, PlanLine } from "../types";
import { waterFill, type Candidate } from "./allocate";
import { classBlock, eligibility } from "./eligibility";
import { buy, costCap, isImpressionBased, tooSmallReason, type Bought } from "./units";
import { validate } from "./validate";

const UNSPENT_WARNING_SHARE = 0.1;

interface Bid {
  candidate: Candidate;
  bought: Bought;
}

function toLine(asset: SellableAsset, bought: Bought): PlanLine {
  const line: PlanLine = {
    assetId: asset.id,
    assetName: asset.name,
    channel: asset.channel,
    status: asset.status,
    ...bought,
  };
  if (asset.status === "careful" && asset.rule) line.rule = asset.rule;
  return line;
}

function topUp(bids: Bid[], budget: number, weeks: number, cityShare: number): void {
  const order = bids.toSorted(
    (a, b) =>
      Number(isImpressionBased(b.candidate.asset.pricing)) -
        Number(isImpressionBased(a.candidate.asset.pricing)) ||
      b.candidate.weight - a.candidate.weight,
  );
  for (const bid of order) {
    const spent = bids.reduce((sum, b) => sum + b.bought.spendINR, 0);
    const leftover = budget - spent;
    if (leftover <= 0) return;
    const target = Math.min(bid.candidate.cap, bid.bought.spendINR + leftover);
    const better = buy(bid.candidate.asset, target, weeks, cityShare);
    if (
      better.spendINR > bid.bought.spendINR &&
      better.spendINR - bid.bought.spendINR <= leftover
    ) {
      bid.bought = better;
    }
  }
}

export function plan(
  input: PlanInput,
  assets: readonly MediaAsset[],
  cities: readonly City[],
): Plan {
  const cityShare = validate(input, cities);
  const blocked = classBlock(input.productClass);
  if (blocked) return { kind: "blocked", reason: blocked };

  const exclusions: Exclusion[] = [];
  const candidates: Candidate[] = [];
  for (const asset of assets) {
    const result = eligibility(asset, input.category, input.productClass, input.objective);
    if (!result.eligible) {
      exclusions.push({ assetId: asset.id, assetName: asset.name, reason: result.reason });
    } else if (asset.status !== "never") {
      candidates.push({
        asset,
        weight: asset.objectiveFit[input.objective] ** 2,
        cap: costCap(asset, input.weeks, cityShare),
        alloc: 0,
      });
    }
  }

  waterFill(candidates, input.budgetINR);

  const bids: Bid[] = [];
  for (const candidate of candidates) {
    const bought = buy(candidate.asset, candidate.alloc, input.weeks, cityShare);
    if (bought.units > 0) {
      bids.push({ candidate, bought });
    } else if (candidate.alloc > 0) {
      exclusions.push({
        assetId: candidate.asset.id,
        assetName: candidate.asset.name,
        reason: tooSmallReason(candidate.asset.pricing, input.weeks),
      });
    }
  }

  topUp(bids, input.budgetINR, input.weeks, cityShare);

  const lines = bids
    .map((b) => toLine(b.candidate.asset, b.bought))
    .toSorted((a, b) => b.spendINR - a.spendINR);
  const totalSpendINR = lines.reduce((sum, l) => sum + l.spendINR, 0);
  const unallocatedINR = input.budgetINR - totalSpendINR;
  const warnings: string[] = [];
  if (unallocatedINR > input.budgetINR * UNSPENT_WARNING_SHARE) {
    warnings.push(
      `${formatINR(unallocatedINR)} of the budget is unspent because the chosen cities and weeks have no more matching space. Add cities or weeks, or lower the budget.`,
    );
  }

  return {
    kind: "plan",
    lines,
    exclusions,
    totalSpendINR,
    unallocatedINR,
    estViews: lines.reduce((sum, l) => sum + l.estViews, 0),
    cityShare,
    warnings,
  };
}
