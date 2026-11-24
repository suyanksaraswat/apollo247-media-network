import type { Metadata } from "next";
import { ApprovalsQueue, type ApprovalItem } from "@/components/approvals-queue";
import { PageHeader } from "@/components/page-header";
import { CITIES } from "@/packages/catalog/taxonomy";
import { dateRange } from "@/packages/workspace/format";
import { allCampaignViews } from "@/packages/workspace/views";

export const metadata: Metadata = { title: "Approvals" };

const TOP_LINES = 4;

export default function ApprovalsPage() {
  const items: ApprovalItem[] = allCampaignViews()
    .filter((view) => view.campaign.status === "in_review")
    .map((view) => ({
      id: view.campaign.id,
      name: view.campaign.name,
      brand: view.campaign.brand,
      dates: dateRange(view.campaign.startDate, view.endDate),
      cities: view.campaign.cities
        .map((id) => CITIES.find((c) => c.id === id)?.label ?? id)
        .join(", "),
      bookedINR: view.bookedINR,
      lines:
        view.plan.kind === "plan"
          ? view.plan.lines.slice(0, TOP_LINES).map((line) => ({
              name: line.assetName,
              summary: line.summary,
              spendINR: line.spendINR,
            }))
          : [],
      creativeLines: view.campaign.creativeLines,
      review: view.campaign.review,
    }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Approvals">
        Campaigns waiting for sign-off before they go live. Copy that breaks the advertising rules
        has to be fixed before it can be approved.
      </PageHeader>
      <ApprovalsQueue items={items} />
    </div>
  );
}
