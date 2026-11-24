import { ASSETS, assetById } from "@/packages/catalog/assets";
import type { ChannelId } from "@/packages/catalog/types";
import {
  designPilot,
  generateStores,
  simulatePilot,
  type Store,
  type WeeklyPoint,
} from "@/packages/pilot";
import { buildPlan, type Plan } from "@/packages/planner";
import { CAMPAIGNS, DEMO_TODAY, type Campaign } from "./campaigns";
import { addDays, daysBetween, weekStart } from "./lib/dates";

export interface CampaignResult {
  measuredLift: number;
  ciLow: number;
  ciHigh: number;
  naiveLift: number;
  incrementalSalesINR: number;
  iroas: number;
  significant: boolean;
  weeksRead: number;
  pairs: number;
  series: WeeklyPoint[];
}

export interface CampaignView {
  campaign: Campaign;
  plan: Plan;
  endDate: string;
  bookedINR: number;
  deliveredINR: number;
  elapsedWeeks: number;
  result: CampaignResult | null;
}

export type ChannelGroup = "app" | "stores" | "doorstep" | "insights";

export interface WeekRevenue {
  weekStart: string;
  app: number;
  stores: number;
  doorstep: number;
  insights: number;
  total: number;
}

export interface Attention {
  campaignId: string;
  tone: "warning" | "info" | "critical";
  text: string;
}

export interface Overview {
  bookedINR: number;
  deliveredThisQuarterINR: number;
  liveCount: number;
  awaitingApproval: number;
  screenFill: number;
  averageLift: number | null;
  weekly: WeekRevenue[];
  attention: Attention[];
}

export interface InventoryFill {
  assetId: string;
  bookedPerWeek: number;
  supplyPerWeek: number;
  fill: number;
}

const GROUP: Record<ChannelId, ChannelGroup> = {
  app_shelf: "app",
  app_journey: "app",
  store: "stores",
  doorstep: "doorstep",
  data: "insights",
};

const DELIVERING = new Set(["live", "completed"]);
const MIN_PILOT_STORES = 40;
const MAX_PILOT_STORES = 100;
const BUDGET_PER_PILOT_STORE = 25_000;
const EARLIEST_LIFT_WARNING_WEEKS = 3;

let network: Store[] | null = null;
const stores = () => (network ??= generateStores());

function seedFor(id: string): number {
  let hash = 2166136261;
  for (const char of id) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return hash >>> 0;
}

function planFor(campaign: Campaign): Plan {
  return buildPlan({
    category: campaign.category,
    productClass: campaign.productClass,
    objective: campaign.objective,
    cities: campaign.cities,
    budgetINR: campaign.budgetINR,
    weeks: campaign.weeks,
  });
}

function elapsedWeeks(campaign: Campaign, today: string): number {
  if (campaign.status === "completed") return campaign.weeks;
  if (campaign.status !== "live") return 0;
  const days = daysBetween(campaign.startDate, today);
  return Math.min(campaign.weeks, Math.max(0, Math.floor(days / 7)));
}

function resultFor(campaign: Campaign, plan: Plan, weeksRead: number): CampaignResult | null {
  if (!campaign.simulation || weeksRead < 1) return null;
  const planned = Math.round(campaign.budgetINR / BUDGET_PER_PILOT_STORE);
  const screen = assetById("store_screens");
  const design = designPilot(
    {
      cities: campaign.cities,
      testStores: Math.min(MAX_PILOT_STORES, Math.max(MIN_PILOT_STORES, planned)),
      weeks: weeksRead,
      pricePerStoreWeekINR: screen && screen.status !== "never" ? screen.pricing.rateINR : 0,
      weeklyNoiseCV: 0.25,
      screenOnly: true,
    },
    stores(),
  );
  if (design.pairs.length < 2) return null;
  const readout = simulatePilot({
    design,
    weeks: weeksRead,
    trueLift: campaign.simulation.trueLift,
    marketTrend: campaign.simulation.marketTrend,
    weeklyNoiseCV: 0.25,
    seed: seedFor(campaign.id),
  });
  return {
    measuredLift: readout.measuredLift,
    ciLow: readout.ciLow,
    ciHigh: readout.ciHigh,
    naiveLift: readout.naiveLift,
    incrementalSalesINR: readout.incrementalSalesINR,
    iroas: readout.iroas,
    significant: readout.significant,
    weeksRead,
    pairs: design.pairs.length,
    series: readout.series,
  };
}

const views = new Map<string, CampaignView>();

export function viewCampaign(campaign: Campaign, today: string = DEMO_TODAY): CampaignView {
  const key = `${campaign.id}@${today}`;
  const cached = views.get(key);
  if (cached) return cached;
  const plan = planFor(campaign);
  const booked = plan.kind === "plan" ? plan.totalSpendINR : 0;
  const weeks = elapsedWeeks(campaign, today);
  const view: CampaignView = {
    campaign,
    plan,
    endDate: addDays(campaign.startDate, campaign.weeks * 7),
    bookedINR: booked,
    deliveredINR: Math.round((booked * weeks) / campaign.weeks),
    elapsedWeeks: weeks,
    result: resultFor(campaign, plan, weeks),
  };
  views.set(key, view);
  return view;
}

export function allCampaignViews(today: string = DEMO_TODAY): CampaignView[] {
  return CAMPAIGNS.map((campaign) => viewCampaign(campaign, today));
}

function weeklyRevenue(list: readonly CampaignView[], today: string, count: number): WeekRevenue[] {
  const last = weekStart(today);
  const weeks: WeekRevenue[] = Array.from({ length: count }, (_, i) => ({
    weekStart: addDays(last, (i - count + 1) * 7),
    app: 0,
    stores: 0,
    doorstep: 0,
    insights: 0,
    total: 0,
  }));
  for (const view of list) {
    if (view.plan.kind !== "plan" || !DELIVERING.has(view.campaign.status)) continue;
    for (const week of weeks) {
      const offset = daysBetween(view.campaign.startDate, week.weekStart);
      if (offset < 0 || offset >= view.campaign.weeks * 7) continue;
      if (daysBetween(week.weekStart, today) < 0) continue;
      for (const line of view.plan.lines) {
        const amount = line.spendINR / view.campaign.weeks;
        week[GROUP[line.channel]] += amount;
        week.total += amount;
      }
    }
  }
  for (const week of weeks) {
    week.app = Math.round(week.app);
    week.stores = Math.round(week.stores);
    week.doorstep = Math.round(week.doorstep);
    week.insights = Math.round(week.insights);
    week.total = Math.round(week.total);
  }
  return weeks;
}

export function inventoryFill(today: string = DEMO_TODAY): InventoryFill[] {
  const live = allCampaignViews(today).filter((view) => view.campaign.status === "live");
  return ASSETS.flatMap((asset) => {
    if (asset.status === "never") return [];
    let booked = 0;
    for (const view of live) {
      if (view.plan.kind !== "plan") continue;
      const line = view.plan.lines.find((l) => l.assetId === asset.id);
      if (!line) continue;
      booked +=
        asset.pricing.model === "cpc"
          ? line.estViews / view.campaign.weeks
          : line.units / view.campaign.weeks;
    }
    const supply = asset.supply.perWeek;
    return [
      {
        assetId: asset.id,
        bookedPerWeek: Math.round(booked),
        supplyPerWeek: supply,
        fill: supply > 0 ? Math.min(1, booked / supply) : 0,
      },
    ];
  });
}

function quarterStart(today: string): string {
  const [y, m] = today.split("-").map(Number);
  const month = (m ?? 1) - 1;
  const first = month - (month % 3);
  return `${y}-${String(first + 1).padStart(2, "0")}-01`;
}

export function overview(today: string = DEMO_TODAY): Overview {
  const list = allCampaignViews(today);
  const weekly = weeklyRevenue(list, today, 12);
  const quarter = quarterStart(today);
  const quarterWeeks = weeklyRevenue(list, today, 26).filter(
    (week) => daysBetween(quarter, week.weekStart) >= 0,
  );
  const results = list.flatMap((view) => (view.result ? [view.result.measuredLift] : []));
  const screen = inventoryFill(today).find((fill) => fill.assetId === "store_screens");

  const attention: Attention[] = [];
  for (const view of list) {
    const { campaign } = view;
    if (campaign.status === "in_review") {
      const flagged = campaign.review?.issues.length ?? 0;
      attention.push({
        campaignId: campaign.id,
        tone: flagged > 0 ? "warning" : "info",
        text:
          flagged > 0
            ? `${campaign.brand}: ${flagged} copy ${flagged === 1 ? "issue" : "issues"} to resolve before approval`
            : `${campaign.brand}: ready for approval`,
      });
    }
    if (campaign.status === "scheduled") {
      const days = daysBetween(today, campaign.startDate);
      if (days >= 0 && days <= 7) {
        attention.push({
          campaignId: campaign.id,
          tone: "info",
          text: `${campaign.brand}: starts in ${days} ${days === 1 ? "day" : "days"}, creatives due to stores`,
        });
      }
    }
    if (
      campaign.status === "live" &&
      view.result &&
      !view.result.significant &&
      view.result.weeksRead >= EARLIEST_LIFT_WARNING_WEEKS
    ) {
      attention.push({
        campaignId: campaign.id,
        tone: "info",
        text: `${campaign.brand}: lift not yet clear of zero after ${view.result.weeksRead} ${view.result.weeksRead === 1 ? "week" : "weeks"}`,
      });
    }
  }

  return {
    bookedINR: list
      .filter((view) => view.campaign.status === "live" || view.campaign.status === "scheduled")
      .reduce((sum, view) => sum + view.bookedINR, 0),
    deliveredThisQuarterINR: quarterWeeks.reduce((sum, week) => sum + week.total, 0),
    liveCount: list.filter((view) => view.campaign.status === "live").length,
    awaitingApproval: list.filter((view) => view.campaign.status === "in_review").length,
    screenFill: screen?.fill ?? 0,
    averageLift: results.length > 0 ? results.reduce((a, b) => a + b, 0) / results.length : null,
    weekly,
    attention,
  };
}
