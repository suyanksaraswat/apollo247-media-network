import Link from "next/link";
import { SourceLinks } from "@/components/evidence";
import { FACTS } from "@/packages/catalog/evidence";
import { formatINR } from "@/packages/format";
import { projectRevenue, SCENARIOS } from "@/packages/revenue";

const HOME_FACTS = ["stores", "users", "gmv", "orders", "healthco", "osmos"];

const GAPS = [
  {
    title: "Stores as media",
    body: "7,289 stores with screens, endcaps, counters, carry bags and bills. Little of it is sold to brands as packaged, measured inventory.",
  },
  {
    title: "One report, online and in store",
    body: "A brand sees its sales lift at the counter as well as in the app, measured against matched stores that did not run the campaign.",
  },
  {
    title: "Brands that don't sell on Apollo",
    body: "Insurers, device makers and fitness brands buying reach at health moments: order tracking, teleconsult waits, member perks.",
  },
  {
    title: "Compliance built in",
    body: "Prescription medicines, cure claims and condition targeting are refused by the product before a person has to.",
  },
];

const MODULES = [
  {
    href: "/plan",
    title: "90-day plan",
    body: "What to audit, sell and prove first, and what I need from Apollo.",
  },
  {
    href: "/media-kit",
    title: "Media kit",
    body: "Every surface, its price, its weekly supply and its rules.",
  },
  {
    href: "/planner",
    title: "Campaign planner",
    body: "A brand's brief becomes a plan across app, stores and doorstep.",
  },
  {
    href: "/pilot",
    title: "Store pilot",
    body: "Matched test and control stores, and how a lift is measured honestly.",
  },
  {
    href: "/revenue",
    title: "Revenue model",
    body: "Three years of media revenue under three scenarios you can edit.",
  },
  {
    href: "/sources",
    title: "Sources",
    body: "Every number with its source, or marked as a placeholder.",
  },
];

export default function HomePage() {
  const base = projectRevenue(SCENARIOS.base.inputs);
  const yearThree = base.years[2].total;
  const facts = HOME_FACTS.flatMap((id) => FACTS.filter((fact) => fact.id === id));

  return (
    <div className="flex flex-col gap-14">
      <section className="flex flex-col gap-6">
        <p className="eyebrow">An unofficial working concept for Apollo 24|7</p>
        <h1 className="max-w-4xl font-display text-4xl leading-[1.08] font-bold tracking-tight sm:text-5xl">
          One media network across the app, 7,289 stores and every doorstep
        </h1>
        <p className="max-w-2xl text-lg text-muted">
          Apollo 24|7 already sells sponsored products in its app. The media network is the layer
          around it: store media, doorstep sampling, rules that protect patients, and one report
          that shows a brand its sales lift online and in store.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/plan"
            className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-ink hover:opacity-90"
          >
            Read the 90-day plan
          </Link>
          <Link
            href="/planner"
            className="rounded-md border border-line bg-surface px-4 py-2 text-sm font-semibold hover:bg-surface-2"
          >
            Plan a campaign
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {facts.map((fact) => (
          <div key={fact.id} className="flex flex-col gap-1 bg-surface p-4">
            <span className="num font-display text-2xl font-bold">{fact.value}</span>
            <span className="text-sm">{fact.label}</span>
            <span className="text-xs text-muted">{fact.detail}</span>
            <SourceLinks ids={fact.sourceIds} />
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-5">
        <div className="flex max-w-3xl flex-col gap-2">
          <p className="eyebrow">Where the next rupee comes from</p>
          <h2 className="font-display text-2xl font-bold tracking-tight">
            Four things a sponsored-products engine doesn&apos;t cover
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {GAPS.map((gap) => (
            <div
              key={gap.title}
              className="flex flex-col gap-2 rounded-xl border border-line bg-surface p-5"
            >
              <h3 className="font-display text-lg font-semibold">{gap.title}</h3>
              <p className="text-muted">{gap.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-xl border border-accent/30 bg-accent-soft p-6">
        <p className="eyebrow">Base case, FY29</p>
        <p className="num font-display text-4xl font-bold text-accent">
          {formatINR(yearThree)} a year
        </p>
        <p className="max-w-2xl text-muted">
          Media revenue in year three if online ads reach 2% of GMV and 4,000 stores carry media.
          Every input is editable and linked to its source.{" "}
          <Link href="/revenue" className="font-medium text-accent underline underline-offset-2">
            Open the model
          </Link>
        </p>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="font-display text-2xl font-bold tracking-tight">Inside the concept</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((module) => (
            <Link
              key={module.href}
              href={module.href}
              className="group flex flex-col gap-1.5 rounded-xl border border-line bg-surface p-5 transition-colors hover:border-accent"
            >
              <span className="font-display text-lg font-semibold group-hover:text-accent">
                {module.title} →
              </span>
              <span className="text-sm text-muted">{module.body}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
