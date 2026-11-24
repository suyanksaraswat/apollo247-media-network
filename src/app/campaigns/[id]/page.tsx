import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CampaignStatusPill } from "@/components/campaign-status";
import { PilotChart } from "@/components/charts/pilot-chart";
import { CopyReview } from "@/components/copy-review";
import { PageHeader, Panel, Section, Stat } from "@/components/page-header";
import { PlanView } from "@/components/planner";
import { CATEGORIES, CITIES, OBJECTIVES } from "@/packages/catalog/taxonomy";
import { formatCount, formatINR, formatPct } from "@/packages/format";
import { CAMPAIGNS, campaignById } from "@/packages/workspace/campaigns";
import { dateRange } from "@/packages/workspace/format";
import { viewCampaign } from "@/packages/workspace/views";

export function generateStaticParams() {
  return CAMPAIGNS.map((campaign) => ({ id: campaign.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/campaigns/[id]">): Promise<Metadata> {
  const { id } = await params;
  const campaign = campaignById(id);
  return { title: campaign ? `${campaign.brand} · ${campaign.name}` : "Campaign" };
}

const label = <T extends string>(list: readonly { id: T; label: string }[], id: T) =>
  list.find((item) => item.id === id)?.label ?? id;

export default async function CampaignPage({ params }: PageProps<"/campaigns/[id]">) {
  const { id } = await params;
  const campaign = campaignById(id);
  if (!campaign) notFound();
  const view = viewCampaign(campaign);
  const { plan, result } = view;
  const running = campaign.status === "live" || campaign.status === "completed";

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Link href="/campaigns" className="text-sm text-muted hover:text-ink">
          ← Campaigns
        </Link>
        <PageHeader
          eyebrow={campaign.brand}
          title={campaign.name}
          actions={<CampaignStatusPill status={campaign.status} />}
        >
          {dateRange(campaign.startDate, view.endDate)} ·{" "}
          {campaign.cities.map((c) => label(CITIES, c)).join(", ")} ·{" "}
          {label(OBJECTIVES, campaign.objective)} · {label(CATEGORIES, campaign.category)}
        </PageHeader>
      </div>

      {campaign.note ? (
        <p
          className={`rounded-lg px-4 py-3 text-sm ${
            campaign.status === "rejected" ? "bg-red-soft text-red" : "bg-amber-soft text-amber"
          }`}
        >
          {campaign.note}
        </p>
      ) : null}

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line lg:grid-cols-4">
        <Stat label="Booked" value={formatINR(view.bookedINR)} note={`${campaign.weeks} weeks`} />
        <Stat
          label="Delivered"
          value={formatINR(view.deliveredINR)}
          note={running ? `${view.elapsedWeeks} of ${campaign.weeks} weeks run` : "Not started"}
        />
        <Stat
          label="Estimated views"
          value={plan.kind === "plan" ? formatCount(plan.estViews) : "–"}
          note="Across every surface in the plan"
        />
        <Stat
          label="Sales lift"
          value={result ? formatPct(result.measuredLift) : "–"}
          tone={result?.significant ? "accent" : undefined}
          note={
            result
              ? `95% range ${formatPct(result.ciLow)} to ${formatPct(result.ciHigh)}`
              : running
                ? "First read after week one"
                : "Measured once it runs"
          }
        />
      </dl>

      {result ? (
        <Section title="Sales lift against matched stores">
          <Panel className="flex flex-col gap-4 p-4">
            <p className="max-w-3xl text-sm text-muted">
              {result.pairs} campaign stores, each paired with a store of the same kind in the same
              city that did not run the campaign. Before-and-after on campaign stores alone says{" "}
              <span className="num font-medium text-ink">{formatPct(result.naiveLift)}</span>; the
              matched stores show the real effect is{" "}
              <span className="num font-medium text-ink">{formatPct(result.measuredLift)}</span>,
              worth{" "}
              <span className="num font-medium text-ink">
                {formatINR(result.incrementalSalesINR)}
              </span>{" "}
              in extra sales.
            </p>
            <PilotChart series={result.series} />
          </Panel>
        </Section>
      ) : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Section title="Media plan">
          <PlanView plan={plan} />
        </Section>
        <Section title="Ad copy and checks">
          <Panel className="p-4">
            <CopyReview lines={campaign.creativeLines} review={campaign.review} />
          </Panel>
        </Section>
      </div>
    </div>
  );
}
