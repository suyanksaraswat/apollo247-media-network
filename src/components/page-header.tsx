import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <header className="flex max-w-3xl flex-col gap-3">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="font-display text-3xl leading-tight font-bold tracking-tight sm:text-4xl">
        {title}
      </h1>
      {children ? <div className="text-base text-muted sm:text-lg">{children}</div> : null}
    </header>
  );
}

export function Section({
  eyebrow,
  title,
  children,
  id,
}: {
  eyebrow?: string;
  title: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-col gap-1">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
      </div>
      {children}
    </section>
  );
}
