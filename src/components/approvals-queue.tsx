"use client";

import Link from "next/link";
import { useState } from "react";
import { CopyReview } from "@/components/copy-review";
import type { CreativeReview } from "@/packages/catalog/types";
import { formatINR } from "@/packages/format";

export interface ApprovalItem {
  id: string;
  name: string;
  brand: string;
  dates: string;
  cities: string;
  bookedINR: number;
  lines: { name: string; summary: string; spendINR: number }[];
  creativeLines: string[];
  review: CreativeReview | null;
}

type Decision = "approved" | "returned";

export function ApprovalsQueue({ items }: { items: readonly ApprovalItem[] }) {
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const decide = (id: string, decision: Decision) =>
    setDecisions((d) => ({ ...d, [id]: decision }));

  return (
    <div className="flex flex-col gap-4">
      {items.map((item) => {
        const issues = item.review?.issues.length ?? 0;
        const decision = decisions[item.id];
        return (
          <article
            key={item.id}
            data-testid={`approval-${item.id}`}
            className="grid grid-cols-1 gap-4 rounded-xl border border-line bg-surface p-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]"
          >
            <div className="flex min-w-0 flex-col gap-3">
              <div className="flex flex-col">
                <span className="eyebrow">{item.brand}</span>
                <Link
                  href={`/campaigns/${item.id}`}
                  className="font-display text-lg font-bold hover:text-accent"
                >
                  {item.name}
                </Link>
                <span className="text-sm text-muted">
                  {item.dates} · {item.cities} ·{" "}
                  <span className="num font-mono">{formatINR(item.bookedINR)}</span>
                </span>
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {item.lines.map((line) => (
                    <tr key={line.name} className="border-t border-line">
                      <td className="py-1.5 pr-3 font-medium">{line.name}</td>
                      <td className="num py-1.5 pr-3 font-mono text-xs text-muted">
                        {line.summary}
                      </td>
                      <td className="num py-1.5 text-right font-mono">
                        {formatINR(line.spendINR)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex min-w-0 flex-col gap-3">
              <CopyReview lines={item.creativeLines} review={item.review} />
              {decision ? (
                <output
                  className={`block rounded-md px-3 py-2 text-sm ${decision === "approved" ? "bg-accent-soft text-accent" : "bg-amber-soft text-amber"}`}
                >
                  {decision === "approved"
                    ? "Approved. It will go live on its start date."
                    : "Sent back to the brand with the suggested changes."}{" "}
                  <span className="text-muted">(Demo: not saved.)</span>
                </output>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={issues > 0}
                    onClick={() => decide(item.id, "approved")}
                    className="rounded-md bg-accent px-3 py-1.5 text-sm font-semibold text-accent-ink disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => decide(item.id, "returned")}
                    className="rounded-md border border-line px-3 py-1.5 text-sm font-semibold hover:bg-surface-2"
                  >
                    Send back
                  </button>
                  {issues > 0 ? (
                    <span className="text-xs text-muted">
                      Resolve {issues} copy {issues === 1 ? "issue" : "issues"} before approving.
                    </span>
                  ) : null}
                </div>
              )}
            </div>
          </article>
        );
      })}
      {items.length === 0 ? (
        <p className="text-sm text-muted">Nothing waiting for approval.</p>
      ) : null}
    </div>
  );
}
