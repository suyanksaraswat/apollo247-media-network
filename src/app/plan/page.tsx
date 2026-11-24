import type { Metadata } from "next";
import Link from "next/link";
import { SourceLinks } from "@/components/evidence";
import { PageHeader, Section } from "@/components/page-header";
import { assetById } from "@/packages/catalog/assets";
import { assumption, FACTS } from "@/packages/catalog/evidence";
import { formatINR, formatPct } from "@/packages/format";
import { minimumDetectableLift } from "@/packages/pilot";

export const metadata: Metadata = { title: "90-day plan" };

const PILOT_PAIRS = 50;
const PILOT_WEEKS = 6;

const UNSOLD = [
  {
    surface: "App search and categories",
    today: "Sponsored products, run on Osmos",
    offer:
      "Keep it. Add seasonal category takeovers and cart suggestions, and merge Osmos results into one report.",
  },
  {
    surface: "Order and consult screens",
    today: "Not sold as media, as far as public information shows",
    offer:
      "Order tracking banners and member perks for brands that don't sell on Apollo; wellness-only teleconsult waits.",
  },
  {
    surface: "Stores",
    today: "Brand presence negotiated store by store, if at all",
    offer: "Screens, endcaps, bags and bills sold by city and week, with proof of play.",
  },
  {
    surface: "Home deliveries",
    today: "A bag that carries only the order",
    offer: "Samples matched to the basket, measured by trial and repeat purchase.",
  },
  {
    surface: "Data",
    today: "Used for operations",
    offer:
      "Aggregated category insights sold as a quarterly subscription. No personal data leaves Apollo.",
  },
];

const RISKS = [
  {
    risk: "Pharmacists' trust",
    answer:
      "No paid recommendations. Sampling days are labelled as sponsored and pharmacists hand out facts, not advice for sale.",
  },
  {
    risk: "Patient privacy",
    answer:
      "No targeting by diagnosis, prescriptions or test results. Brands see aggregated results only, under the DPDP Act, 2023.",
  },
  {
    risk: "Load on store staff",
    answer:
      "Screens are scheduled centrally. Sampling runs one day a week in one store in ten at most.",
  },
  {
    risk: "Brands shifting trade discounts into ads",
    answer:
      "Sell measured lift to marketing budgets, not trade budgets, so media is new money rather than a moved discount.",
  },
  {
    risk: "Overlap with Osmos",
    answer:
      "The media network sits around it. App search stays where it is; its results join the same report as stores and doorstep.",
  },
];

export default function PlanPage() {
  const cv = assumption("weeklySalesNoiseCV");
  const mde = minimumDetectableLift(PILOT_PAIRS, PILOT_WEEKS, cv);
  const screen = assetById("store_screens");
  const screenRate = screen && screen.status !== "never" ? screen.pricing.rateINR : 0;
  const pilotStoreMedia = PILOT_PAIRS * PILOT_WEEKS * screenRate;
  const facts = FACTS.filter((fact) =>
    ["stores", "users", "gmv", "orders", "osmos", "onemg", "market", "market2031"].includes(
      fact.id,
    ),
  );

  const phases = [
    {
      days: "Days 1–30",
      title: "Audit and price",
      actions: [
        "Walk 20 stores in Hyderabad and Chennai and count every surface: screens, endcaps, counters, bags, bills.",
        "Pull a year of weekly store sales for ten brands to measure how much sales swing week to week. The pilot's size depends on it.",
        "Publish rate card version one and the advertising policy: what the network sells, what it sells under rules, and what it never sells.",
        `Choose ${PILOT_PAIRS} pilot stores and ${PILOT_PAIRS} matched control stores.`,
      ],
      measure: "Rate card and policy signed off by category, legal and store operations.",
    },
    {
      days: "Days 31–60",
      title: "Sell the pilot",
      actions: [
        "Sign three anchor brands: one everyday product, one OTC medicine, one health device.",
        `Run a ${PILOT_WEEKS}-week campaign for each across app, ${PILOT_PAIRS} store screens and delivery sampling.`,
        "Feed proof of play, store sales and Osmos results into one report.",
      ],
      measure: "Three brands live with one shared report.",
    },
    {
      days: "Days 61–90",
      title: "Prove and scale",
      actions: [
        "Deliver each brand its lift against matched stores, with the confidence range shown, not just a headline.",
        "Turn the best result into a case study and the rate card into version two.",
        "Open the brief-to-plan tool to the next 20 brands and plan the move to 500 stores.",
        "Launch the quarterly category insights subscription.",
      ],
      measure: "Two of three anchor brands renew, and a funded plan for 500 stores.",
    },
  ];

  return (
    <div className="flex flex-col gap-14">
      <PageHeader eyebrow="The first 90 days" title="Audit, sell a measured pilot, then scale">
        Apollo 24|7 already earns from sponsored products in the app. The first 90 days add the
        stores and the doorstep, and prove with matched stores that the money spent there moved
        sales.
      </PageHeader>

      <Section eyebrow="Starting point" title="Where Apollo and the market stand">
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {facts.map((fact) => (
            <li
              key={fact.id}
              className="flex flex-col gap-0.5 rounded-lg border border-line bg-surface p-4"
            >
              <span className="flex flex-wrap items-baseline gap-x-2">
                <span className="num font-display text-xl font-bold">{fact.value}</span>
                <span className="text-sm">{fact.label}</span>
              </span>
              <span className="text-sm text-muted">{fact.detail}</span>
              <SourceLinks ids={fact.sourceIds} />
            </li>
          ))}
        </ul>
      </Section>

      <Section eyebrow="The opening" title="What is sold today, and what the network adds">
        <div className="overflow-x-auto rounded-xl border border-line bg-surface">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-surface-2 text-left">
              <tr>
                <th className="eyebrow px-4 py-2.5 font-medium">Surface</th>
                <th className="eyebrow px-4 py-2.5 font-medium">Today</th>
                <th className="eyebrow px-4 py-2.5 font-medium">The network adds</th>
              </tr>
            </thead>
            <tbody>
              {UNSOLD.map((row) => (
                <tr key={row.surface} className="border-t border-line align-top">
                  <td className="px-4 py-3 font-medium">{row.surface}</td>
                  <td className="px-4 py-3 text-muted">{row.today}</td>
                  <td className="px-4 py-3">{row.offer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section eyebrow="Sequence" title="The 90 days">
        <ol className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {phases.map((phase) => (
            <li
              key={phase.days}
              className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-5"
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-xs text-accent">{phase.days}</span>
                <h3 className="font-display text-lg font-semibold">{phase.title}</h3>
              </div>
              <ul className="flex list-disc flex-col gap-2 pl-5 text-sm">
                {phase.actions.map((action) => (
                  <li key={action}>{action}</li>
                ))}
              </ul>
              <p className="mt-auto border-t border-line pt-3 text-sm">
                <span className="font-medium">Done when: </span>
                <span className="text-muted">{phase.measure}</span>
              </p>
            </li>
          ))}
        </ol>
        <p className="max-w-3xl text-sm text-muted">
          Why {PILOT_PAIRS} stores for {PILOT_WEEKS} weeks: with the placeholder week-to-week swing
          of {formatPct(cv, 0)}, that design can detect a sales lift of about{" "}
          <span className="num font-medium text-ink">{formatPct(mde)}</span>. Store screens alone
          bring in {formatINR(pilotStoreMedia)} per brand at rate-card prices; the pilot is for
          proof, not revenue.{" "}
          <Link href="/pilot" className="text-accent underline underline-offset-2">
            Change the design
          </Link>
        </p>
      </Section>

      <Section eyebrow="Dependencies" title="What I need from Apollo">
        <ul className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <li className="rounded-lg border border-line bg-surface p-4">
            Weekly sales by brand and store for the pilot and control stores, from a year before.
          </li>
          <li className="rounded-lg border border-line bg-surface p-4">
            One owner in legal or medical affairs for the advertising policy.
          </li>
          <li className="rounded-lg border border-line bg-surface p-4">
            A store operations partner for screens and sampling days.
          </li>
          <li className="rounded-lg border border-line bg-surface p-4">
            Access to Osmos reporting, so app results join the same report.
          </li>
        </ul>
      </Section>

      <Section eyebrow="Risks" title="What could go wrong, and the answer to each">
        <div className="overflow-x-auto rounded-xl border border-line bg-surface">
          <table className="w-full min-w-[560px] text-sm">
            <tbody>
              {RISKS.map((row, index) => (
                <tr
                  key={row.risk}
                  className={`align-top ${index > 0 ? "border-t border-line" : ""}`}
                >
                  <td className="w-1/3 px-4 py-3 font-medium">{row.risk}</td>
                  <td className="px-4 py-3 text-muted">{row.answer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}
