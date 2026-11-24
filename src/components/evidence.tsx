import Link from "next/link";
import { ASSUMPTIONS, sourceById } from "@/packages/catalog/evidence";
import type { AssumptionId, EvidenceKind } from "@/packages/catalog/types";

const KIND: Record<EvidenceKind, { label: string; className: string }> = {
  sourced: { label: "Sourced", className: "bg-accent-soft text-accent" },
  derived: { label: "Derived", className: "bg-surface-2 text-ink" },
  placeholder: { label: "Placeholder", className: "bg-amber-soft text-amber" },
};

export function KindTag({ kind }: { kind: EvidenceKind }) {
  const meta = KIND[kind];
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-sm px-1.5 py-0.5 font-mono text-[10.5px] tracking-[0.06em] uppercase ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}

export function EvidenceLink({ id }: { id: AssumptionId }) {
  const item = ASSUMPTIONS[id];
  return (
    <Link href={`/about/sources#a-${id}`} className="inline-flex" title={item.note}>
      <KindTag kind={item.kind} />
    </Link>
  );
}

export function SourceLinks({ ids }: { ids: readonly string[] }) {
  const sources = ids.flatMap((id) => {
    const source = sourceById(id);
    return source ? [source] : [];
  });
  if (sources.length === 0) return null;
  return (
    <span className="text-xs text-muted">
      {sources.map((source, index) => (
        <span key={source.id}>
          {index > 0 ? " · " : ""}
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-line underline-offset-2 hover:text-ink"
          >
            {source.publisher}
          </a>
        </span>
      ))}
    </span>
  );
}
