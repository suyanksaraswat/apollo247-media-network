import { CAMPAIGNS, DEMO_TODAY } from "../campaigns";
import { allCampaignViews, inventoryFill, overview, viewCampaign } from "../views";

const byId = (id: string) => {
  const campaign = CAMPAIGNS.find((c) => c.id === id);
  if (!campaign) throw new Error(`missing ${id}`);
  return campaign;
};

function fitsDates(view: ReturnType<typeof viewCampaign>): boolean {
  const { campaign, endDate } = view;
  switch (campaign.status) {
    case "live":
      return campaign.startDate <= DEMO_TODAY && DEMO_TODAY < endDate;
    case "completed":
      return endDate <= DEMO_TODAY;
    case "scheduled":
    case "in_review":
    case "draft":
      return campaign.startDate > DEMO_TODAY;
    case "rejected":
      return true;
  }
}

describe("demo campaigns", () => {
  it("have unique ids", () => {
    expect(new Set(CAMPAIGNS.map((c) => c.id)).size).toBe(CAMPAIGNS.length);
  });

  it("have statuses that match their dates", () => {
    const mismatched = allCampaignViews()
      .filter((view) => !fitsDates(view))
      .map((view) => view.campaign.id);
    expect(mismatched).toEqual([]);
  });

  it("are rejected exactly when the planner blocks them", () => {
    for (const view of allCampaignViews()) {
      expect(view.campaign.status === "rejected").toBe(view.plan.kind === "blocked");
    }
  });

  it("only has results for campaigns that have run, and always for finished ones", () => {
    const views = allCampaignViews();
    const notRunWithResult = views
      .filter((v) => v.campaign.status !== "live" && v.campaign.status !== "completed" && v.result)
      .map((v) => v.campaign.id);
    const finishedWithout = views
      .filter((v) => v.campaign.status === "completed" && !v.result)
      .map((v) => v.campaign.id);
    expect(notRunWithResult).toEqual([]);
    expect(finishedWithout).toEqual([]);
  });
});

describe("viewCampaign", () => {
  it("delivers spend in proportion to weeks run", () => {
    const view = viewCampaign(byId("bearly-winter-immunity"));
    expect(view.elapsedWeeks).toBe(2);
    expect(view.deliveredINR).toBe(Math.round(view.bookedINR / 2));
  });

  it("counts a completed campaign as fully delivered", () => {
    const view = viewCampaign(byId("saltwell-summer-launch"));
    expect(view.deliveredINR).toBe(view.bookedINR);
    expect(view.result?.weeksRead).toBe(6);
  });

  it("gives the same numbers every time", () => {
    const campaign = byId("glucora-glucose-check");
    expect(viewCampaign(campaign, "2026-11-25").result?.measuredLift).toBe(
      viewCampaign(campaign, "2026-11-25").result?.measuredLift,
    );
  });
});

describe("overview", () => {
  const data = overview();

  it("counts live and awaiting campaigns from the data", () => {
    expect(data.liveCount).toBe(CAMPAIGNS.filter((c) => c.status === "live").length);
    expect(data.awaitingApproval).toBe(CAMPAIGNS.filter((c) => c.status === "in_review").length);
  });

  it("shows twelve weeks ending this week, with totals that add up", () => {
    expect(data.weekly).toHaveLength(12);
    expect(data.weekly.at(-1)?.weekStart).toBe("2026-11-23");
    for (const week of data.weekly) {
      expect(
        Math.abs(week.app + week.stores + week.doorstep + week.insights - week.total),
      ).toBeLessThanOrEqual(2);
    }
  });

  it("flags copy issues waiting for approval", () => {
    expect(
      data.attention.some((a) => a.campaignId === "soothera-winter-throat" && a.tone === "warning"),
    ).toBe(true);
  });
});

describe("inventoryFill", () => {
  it("never reports more than fully sold", () => {
    for (const fill of inventoryFill()) {
      expect(fill.fill).toBeGreaterThanOrEqual(0);
      expect(fill.fill).toBeLessThanOrEqual(1);
    }
  });

  it("sells some store screens this week", () => {
    const screens = inventoryFill().find((f) => f.assetId === "store_screens");
    expect(screens?.bookedPerWeek).toBeGreaterThan(0);
  });
});
