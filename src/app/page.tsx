import Link from "next/link";
import { CampaignStatusPill, Pacing } from "@/components/campaign-status";
import { StackedBarChart } from "@/components/charts/stacked-bar-chart";
import { ICONS } from "@/components/icons";
import { PageHeader, Panel, Section, Stat } from "@/components/page-header";
import { CITIES } from "@/packages/catalog/taxonomy";
import { formatINR, formatPct } from "@/packages/format";
import { DEMO_TODAY } from "@/packages/workspace/campaigns";
import { longDate, shortDate } from "@/packages/workspace/format";
import { allCampaignViews, overview } from "@/packages/workspace/views";

const TONE = {
  critical: "bg-red",
  warning: "bg-amber",
  info: "bg-series-1",
} as const;

const cityList = (ids: readonly string[]) =>
  ids.map((id) => CITIES.find((c) => c.id === id)?.label ?? id).join(", ");

export default function OverviewPage() {
  const data = overview();
  const live = allCampaignViews().filter((view) => view.campaign.status === "live");

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Overview"
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
        Week of {longDate("2026-11-23")}. Demo data as of {longDate(DEMO_TODAY)}.
      </PageHeader>

      <dl
        className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line lg:grid-cols-3 xl:grid-cols-6"
        data-testid="kpis"
      >
        <Stat label="Booked" value={formatINR(data.bookedINR)} note="Live and scheduled" />
        <Stat
          label="Delivered this quarter"
          value={formatINR(data.deliveredThisQuarterINR)}
          note="Since 1 Oct"
        />
        <Stat
          label="Live campaigns"
          value={String(data.liveCount)}
          note="Across app, stores, doorstep"
        />
        <Stat
          label="Awaiting approval"
          value={String(data.awaitingApproval)}
          tone={data.awaitingApproval > 0 ? "amber" : undefined}
          note={
            <Link href="/approvals" className="underline underline-offset-2">
              Review now
            </Link>
          }
        />
        <Stat
          label="Average sales lift"
          value={data.averageLift === null ? "–" : formatPct(data.averageLift)}
          tone="accent"
          note="Against matched stores"
        />
        <Stat
          label="Store screens sold"
          value={formatPct(data.screenFill, 0)}
          note="This week. The rest is open to sell."
        />
      </dl>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Section title="Media revenue by week">
          <Panel className="p-4">
            <StackedBarChart
              ariaLabel="Delivered media revenue for the last twelve weeks, by channel"
              bars={data.weekly.map((week) => ({
                label: shortDate(week.weekStart),
                values: {
                  app: week.app,
                  stores: week.stores,
                  doorstep: week.doorstep,
                  insights: week.insights,
                },
                total: week.total,
              }))}
            />
          </Panel>
        </Section>

        <Section title="Needs attention">
          <Panel>
            <ul className="divide-y divide-line" data-testid="attention">
              {data.attention.map((item) => (
                <li key={`${item.campaignId}-${item.text}`}>
                  <Link
                    href={`/campaigns/${item.campaignId}`}
                    className="flex items-start gap-3 px-4 py-3 text-sm hover:bg-surface-2"
                  >
                    <span className={`mt-1.5 size-2 shrink-0 rounded-full ${TONE[item.tone]}`} />
                    <span>{item.text}</span>
                  </Link>
                </li>
              ))}
              {data.attention.length === 0 ? (
                <li className="px-4 py-3 text-sm text-muted">Nothing needs you right now.</li>
              ) : null}
            </ul>
          </Panel>
        </Section>
      </div>

      <Section
        title="Live campaigns"
        actions={
          <Link href="/campaigns" className="text-sm font-medium text-accent">
            All campaigns →
          </Link>
        }
      >
        <Panel className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="text-left">
              <tr className="border-b border-line">
                <th className="eyebrow px-4 py-2.5 font-medium">Campaign</th>
                <th className="eyebrow px-4 py-2.5 font-medium">Status</th>
                <th className="eyebrow px-4 py-2.5 font-medium">Cities</th>
                <th className="eyebrow px-4 py-2.5 font-medium">Week</th>
                <th className="eyebrow px-4 py-2.5 text-right font-medium">Booked</th>
                <th className="eyebrow px-4 py-2.5 font-medium">Delivered</th>
                <th className="eyebrow px-4 py-2.5 text-right font-medium">Lift so far</th>
              </tr>
            </thead>
            <tbody>
              {live.map((view) => (
                <tr
                  key={view.campaign.id}
                  className="border-b border-line last:border-0 hover:bg-surface-2"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/campaigns/${view.campaign.id}`}
                      aria-label={`${view.campaign.brand}: ${view.campaign.name}`}
                      className="flex flex-col"
                    >
                      <span className="font-medium hover:text-accent">{view.campaign.name}</span>
                      <span className="text-xs text-muted">{view.campaign.brand}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <CampaignStatusPill status={view.campaign.status} />
                  </td>
                  <td className="px-4 py-3 text-muted">{cityList(view.campaign.cities)}</td>
                  <td className="num px-4 py-3 font-mono text-xs">
                    {Math.min(view.campaign.weeks, view.elapsedWeeks + 1)} of {view.campaign.weeks}
                  </td>
                  <td className="num px-4 py-3 text-right font-mono">
                    {formatINR(view.bookedINR)}
                  </td>
                  <td className="px-4 py-3">
                    <Pacing delivered={view.deliveredINR} booked={view.bookedINR} />
                  </td>
                  <td className="num px-4 py-3 text-right font-mono">
                    {view.result ? formatPct(view.result.measuredLift) : "–"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </Section>
    </div>
  );
}
