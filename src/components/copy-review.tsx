import { CLAIM_RULES } from "@/packages/catalog/taxonomy";
import type { CreativeReview } from "@/packages/catalog/types";

const VERDICT = {
  ok: { label: "Copy passed checks", className: "bg-accent-soft text-accent" },
  revise: { label: "Changes needed", className: "bg-amber-soft text-amber" },
  refuse: { label: "Cannot run", className: "bg-red-soft text-red" },
} as const;

export function CopyReview({
  lines,
  review,
}: {
  lines: readonly string[];
  review: CreativeReview | null;
}) {
  if (lines.length === 0) {
    return <p className="text-sm text-muted">No ad copy added yet.</p>;
  }
  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-1.5">
        {lines.map((line) => (
          <li key={line} className="rounded-md bg-surface-2 px-3 py-2 text-sm">
            &ldquo;{line}&rdquo;
          </li>
        ))}
      </ul>
      {review ? (
        <div className="flex flex-col gap-2">
          <span
            className={`self-start rounded-sm px-2 py-0.5 text-xs font-semibold ${VERDICT[review.verdict].className}`}
          >
            {VERDICT[review.verdict].label}
          </span>
          {review.issues.map((issue) => (
            <div
              key={`${issue.rule}-${issue.quote}`}
              className="flex flex-col gap-0.5 rounded-md border border-line p-3 text-sm"
            >
              <span className="font-medium">&ldquo;{issue.quote}&rdquo;</span>
              <span className="text-xs text-muted">
                {CLAIM_RULES.find((rule) => rule.id === issue.rule)?.label ?? issue.rule}
              </span>
              <span>{issue.problem}</span>
              <span className="text-accent">
                <span className="font-medium">Suggested: </span>
                {issue.rewrite}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">Not checked yet.</p>
      )}
    </div>
  );
}
