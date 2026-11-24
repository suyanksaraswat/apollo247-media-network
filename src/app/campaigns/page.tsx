import type { Metadata } from "next";
import Link from "next/link";
import { CampaignsTable, type CampaignRow } from "@/components/campaigns-table";
import { ICONS } from "@/components/icons";
import { PageHeader } from "@/components/page-header";
import { CITIES } from "@/packages/catalog/taxonomy";
import { dateRange } from "@/packages/workspace/format";
import { allCampaignViews } from "@/packages/workspace/views";

export const metadata: Metadata = { title: "Campaigns" };

export default function CampaignsPage() {
  const rows: CampaignRow[] = allCampaignViews().map((view) => ({
    id: view.campaign.id,
    name: view.campaign.name,
    brand: view.campaign.brand,
    status: view.campaign.status,
    dates: dateRange(view.campaign.startDate, view.endDate),
    cities: view.campaign.cities
      .map((id) => CITIES.find((c) => c.id === id)?.label ?? id)
      .join(", "),
    bookedINR: view.bookedINR,
    deliveredINR: view.deliveredINR,
    lift: view.result?.measuredLift ?? null,
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Campaigns"
        actions={
          <Link
            href="/campaigns/new"
            className="flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-semibold text-accent-ink hover:opacity-90"
          >
            {ICONS.plus}
            New campaign
          </Link>
        }
      >
        Every brand campaign across the app, stores and doorstep, from draft to measured result.
      </PageHeader>
      <CampaignsTable rows={rows} />
    </div>
  );
}
