import { STATUS_LABELS, type CampaignStatus } from "@/packages/workspace/campaigns";

const STYLE: Record<CampaignStatus, { pill: string; dot: string }> = {
  live: { pill: "bg-accent-soft text-accent", dot: "bg-accent" },
  scheduled: { pill: "bg-surface-2 text-ink", dot: "bg-series-1" },
  in_review: { pill: "bg-amber-soft text-amber", dot: "bg-amber" },
  draft: { pill: "border border-line text-muted", dot: "bg-muted" },
  completed: { pill: "bg-surface-2 text-muted", dot: "bg-muted" },
  rejected: { pill: "bg-red-soft text-red", dot: "bg-red" },
};

export function CampaignStatusPill({ status }: { status: CampaignStatus }) {
  const style = STYLE[status];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${style.pill}`}
    >
      <span className={`size-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
      {STATUS_LABELS[status]}
    </span>
  );
}

export function Pacing({ delivered, booked }: { delivered: number; booked: number }) {
  const share = booked > 0 ? Math.min(1, delivered / booked) : 0;
  return (
    <span className="flex items-center gap-2" title={`${Math.round(share * 100)}% delivered`}>
      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-2">
        <span
          className="block h-full rounded-full bg-accent"
          style={{ width: `${share * 100}%` }}
        />
      </span>
      <span className="num font-mono text-xs text-muted">{Math.round(share * 100)}%</span>
    </span>
  );
}
