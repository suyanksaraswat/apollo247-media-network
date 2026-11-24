import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  children,
  actions,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-3 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex max-w-3xl min-w-0 flex-col gap-1.5">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1 className="font-display text-2xl leading-tight font-bold tracking-tight sm:text-[28px]">
          {title}
        </h1>
        {children ? <div className="text-sm text-muted sm:text-[15px]">{children}</div> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}

export function Section({
  eyebrow,
  title,
  children,
  id,
  actions,
}: {
  eyebrow?: string;
  title: string;
  children: ReactNode;
  id?: string;
  actions?: ReactNode;
}) {
  return (
    <section id={id} className="flex min-w-0 flex-col gap-3">
      <div className="flex items-end justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h2 className="font-display text-lg font-bold tracking-tight">{title}</h2>
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`min-w-0 rounded-xl border border-line bg-surface ${className}`}>
      {children}
    </div>
  );
}

export function Stat({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: string;
  note?: ReactNode;
  tone?: "accent" | "amber";
}) {
  const color = tone === "accent" ? "text-accent" : tone === "amber" ? "text-amber" : "";
  return (
    <div className="flex min-w-0 flex-col gap-0.5 bg-surface p-4">
      <dt className="eyebrow">{label}</dt>
      <dd className={`num font-display text-2xl font-bold ${color}`}>{value}</dd>
      {note ? <dd className="text-xs text-muted">{note}</dd> : null}
    </div>
  );
}
