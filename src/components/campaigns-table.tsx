"use client";

import Link from "next/link";
import { useState } from "react";
import { CampaignStatusPill, Pacing } from "@/components/campaign-status";
import { formatINR, formatPct } from "@/packages/format";
import { STATUS_LABELS, type CampaignStatus } from "@/packages/workspace/campaigns";

export interface CampaignRow {
  id: string;
  name: string;
  brand: string;
  status: CampaignStatus;
  dates: string;
  cities: string;
  bookedINR: number;
  deliveredINR: number;
  lift: number | null;
}

const TABS: readonly (CampaignStatus | "all")[] = [
  "all",
  "live",
  "scheduled",
  "in_review",
  "draft",
  "completed",
  "rejected",
];

export function CampaignsTable({ rows }: { rows: readonly CampaignRow[] }) {
  const [tab, setTab] = useState<CampaignStatus | "all">("all");
  const visible = tab === "all" ? rows : rows.filter((row) => row.status === tab);
  const count = (status: CampaignStatus | "all") =>
    status === "all" ? rows.length : rows.filter((row) => row.status === status).length;

  return (
    <div className="flex flex-col gap-4">
      <div role="tablist" aria-label="Filter by status" className="flex flex-wrap gap-1">
        {TABS.map((status) => {
          const on = tab === status;
          return (
            <button
              key={status}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setTab(status)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors ${
                on
                  ? "bg-surface font-semibold shadow-sm ring-1 ring-line"
                  : "text-muted hover:text-ink"
              }`}
            >
              {status === "all" ? "All" : STATUS_LABELS[status]}
              <span className="num font-mono text-xs text-muted">{count(status)}</span>
            </button>
          );
        })}
      </div>

      <div className="overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full min-w-[820px] text-sm" data-testid="campaigns">
          <thead className="text-left">
            <tr className="border-b border-line">
              <th className="eyebrow px-4 py-2.5 font-medium">Campaign</th>
              <th className="eyebrow px-4 py-2.5 font-medium">Status</th>
              <th className="eyebrow px-4 py-2.5 font-medium">Dates</th>
              <th className="eyebrow px-4 py-2.5 font-medium">Cities</th>
              <th className="eyebrow px-4 py-2.5 text-right font-medium">Booked</th>
              <th className="eyebrow px-4 py-2.5 font-medium">Delivered</th>
              <th className="eyebrow px-4 py-2.5 text-right font-medium">Sales lift</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.id} className="border-b border-line last:border-0 hover:bg-surface-2">
                <td className="px-4 py-3">
                  <Link
                    href={`/campaigns/${row.id}`}
                    aria-label={`${row.brand}: ${row.name}`}
                    className="flex flex-col"
                  >
                    <span className="font-medium hover:text-accent">{row.name}</span>
                    <span className="text-xs text-muted">{row.brand}</span>
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <CampaignStatusPill status={row.status} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-muted">{row.dates}</td>
                <td className="px-4 py-3 text-muted">{row.cities}</td>
                <td className="num px-4 py-3 text-right font-mono">
                  {row.bookedINR > 0 ? formatINR(row.bookedINR) : "–"}
                </td>
                <td className="px-4 py-3">
                  {row.status === "live" || row.status === "completed" ? (
                    <Pacing delivered={row.deliveredINR} booked={row.bookedINR} />
                  ) : (
                    <span className="text-xs text-muted">Not started</span>
                  )}
                </td>
                <td className="num px-4 py-3 text-right font-mono">
                  {row.lift === null ? "–" : formatPct(row.lift)}
                </td>
              </tr>
            ))}
            {visible.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-muted">
                  No campaigns with this status.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
