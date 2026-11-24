import type { AssetStatus } from "@/packages/catalog/types";

export const STATUS_META: Record<AssetStatus, { label: string; hint: string; className: string }> =
  {
    exists: { label: "Exists", hint: "Sold today", className: "border border-line text-muted" },
    ready: { label: "Ready", hint: "Sell now", className: "bg-accent-soft text-accent" },
    careful: {
      label: "Careful",
      hint: "Sellable under rules the product enforces",
      className: "bg-amber-soft text-amber",
    },
    never: { label: "Never", hint: "The product refuses it", className: "bg-red-soft text-red" },
  };

export function StatusTag({ status }: { status: AssetStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      title={meta.hint}
      className={`inline-flex shrink-0 items-center rounded-sm px-1.5 py-0.5 font-mono text-[10.5px] tracking-[0.08em] uppercase ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}
