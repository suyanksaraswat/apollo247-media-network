"use client";

import { useMemo, useState, type ReactNode } from "react";
import { CHANNEL_SERIES, StackedBarChart } from "@/components/charts/stacked-bar-chart";
import { EvidenceLink, KindTag } from "@/components/evidence";
import { NumberField, Segmented } from "@/components/fields";
import { formatINR } from "@/packages/format";
import {
  projectRevenue,
  SCENARIOS,
  type RevenueInputs,
  type ScenarioId,
  type Triple,
} from "@/packages/revenue";

const YEARS = ["FY27", "FY28", "FY29"] as const;
const SCENARIO_IDS: readonly ScenarioId[] = ["conservative", "base", "ambitious"];
const SCENARIO_OPTIONS = SCENARIO_IDS.map((id) => ({
  id,
  label: SCENARIOS[id].label,
}));

type TripleKey = {
  [K in keyof RevenueInputs]: RevenueInputs[K] extends Triple ? K : never;
}[keyof RevenueInputs];
type ScalarKey = {
  [K in keyof RevenueInputs]: RevenueInputs[K] extends number ? K : never;
}[keyof RevenueInputs];

const placeholder = <KindTag kind="placeholder" />;

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-3 rounded-xl border border-line bg-surface p-4">
      <legend className="px-1 font-display text-base font-semibold">{title}</legend>
      {children}
    </fieldset>
  );
}

export function RevenueModel() {
  const [scenario, setScenario] = useState<ScenarioId>("base");
  const [inputs, setInputs] = useState<RevenueInputs>(SCENARIOS.base.inputs);
  const result = useMemo(() => projectRevenue(inputs), [inputs]);

  const pickScenario = (id: ScenarioId) => {
    setScenario(id);
    setInputs(SCENARIOS[id].inputs);
  };

  const scalar = (
    key: ScalarKey,
    label: string,
    evidence: ReactNode,
    options: { pct?: boolean; step?: number; hint?: string } = {},
  ) => (
    <NumberField
      id={key}
      label={label}
      adornment={evidence}
      value={options.pct ? Number((inputs[key] * 100).toFixed(2)) : inputs[key]}
      step={options.step}
      min={0}
      hint={options.hint}
      onChange={(value) => setInputs((s) => ({ ...s, [key]: options.pct ? value / 100 : value }))}
    />
  );

  const triple = (
    key: TripleKey,
    label: string,
    evidence: ReactNode,
    options: { pct?: boolean; step?: number } = {},
  ) => (
    <div className="flex flex-col gap-1.5">
      <span className="flex items-center justify-between gap-2 text-sm font-medium">
        {label}
        {evidence}
      </span>
      <div className="grid grid-cols-3 gap-2">
        {YEARS.map((year, index) => (
          <NumberField
            key={year}
            id={`${key}-${index}`}
            label={year}
            value={
              options.pct
                ? Number(((inputs[key][index] ?? 0) * 100).toFixed(2))
                : (inputs[key][index] ?? 0)
            }
            step={options.step}
            min={0}
            onChange={(value) =>
              setInputs((s) => {
                const next: [number, number, number] = [...s[key]];
                next[index] = options.pct ? value / 100 : value;
                return { ...s, [key]: next };
              })
            }
          />
        ))}
      </div>
    </div>
  );

  const total = result.years[2].total;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Segmented
          legend="Scenario"
          options={SCENARIO_OPTIONS}
          value={scenario}
          onChange={pickScenario}
        />
        <p className="max-w-3xl text-sm text-muted">{SCENARIOS[scenario].description}</p>
      </div>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div className="flex min-w-0 flex-col gap-4 rounded-xl border border-line bg-surface p-4">
          <div className="flex flex-col">
            <span className="eyebrow">FY29 media revenue</span>
            <span className="num font-display text-3xl font-bold" data-testid="year-three-total">
              {formatINR(total)}
            </span>
          </div>
          <StackedBarChart
            showTotals
            ariaLabel="Media revenue by year and line"
            bars={result.years.map((year, index) => ({
              label: YEARS[index] ?? "",
              values: {
                app: year.app,
                stores: year.stores,
                doorstep: year.doorstep,
                insights: year.insights,
              },
              total: year.total,
            }))}
          />
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <div className="overflow-x-auto rounded-xl border border-line bg-surface">
            <table className="w-full min-w-[360px] text-sm">
              <thead className="bg-surface-2 text-left">
                <tr>
                  <th className="eyebrow px-3 py-2 font-medium">Line</th>
                  {YEARS.map((year) => (
                    <th key={year} className="eyebrow px-3 py-2 text-right font-medium">
                      {year}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CHANNEL_SERIES.map((series) => (
                  <tr key={series.key} className="border-t border-line">
                    <td className="px-3 py-2">
                      <span className="flex items-center gap-1.5">
                        <span
                          className="size-2.5 rounded-sm"
                          style={{ background: series.color }}
                        />
                        {series.label}
                      </span>
                    </td>
                    {result.years.map((year) => (
                      <td key={year.year} className="num px-3 py-2 text-right font-mono">
                        {formatINR(year[series.key])}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="border-t border-line font-semibold">
                  <td className="px-3 py-2">Total</td>
                  {result.years.map((year) => (
                    <td key={year.year} className="num px-3 py-2 text-right font-mono">
                      {formatINR(year.total)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line">
            <div className="flex flex-col bg-surface p-3">
              <dt className="eyebrow">Screen payback</dt>
              <dd className="num font-display text-xl font-bold">
                {result.screenPaybackMonths === null
                  ? "Never"
                  : `${result.screenPaybackMonths.toFixed(1)} months`}
              </dd>
              <dd className="text-xs text-muted">From screen revenue in FY27</dd>
            </div>
            <div className="flex flex-col bg-surface p-3">
              <dt className="eyebrow">Screens to buy</dt>
              <dd className="num font-display text-xl font-bold">{formatINR(result.capexINR)}</dd>
              <dd className="text-xs text-muted">For the largest store count</dd>
            </div>
          </dl>
          <p className="text-xs text-muted">
            Revenue before costs. Store media per store a month:{" "}
            {result.storeRevenuePerStoreMonth.map((value) => formatINR(value)).join(", ")} across
            the three years.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-semibold">Assumptions</h2>
        <p className="max-w-3xl text-sm text-muted">
          Tags show where each input comes from. Open one to see its source on the Sources page.
        </p>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Group title="App and web">
            {scalar(
              "onlineGmvCr",
              "Online GMV, FY26 (₹ crore)",
              <EvidenceLink id="onlineGmvCr" />,
              { step: 50 },
            )}
            {scalar("gmvGrowth", "GMV growth a year (%)", <EvidenceLink id="gmvGrowth" />, {
              pct: true,
              step: 1,
            })}
            {triple("takeRate", "Ad revenue as % of GMV", <EvidenceLink id="takeRateAnchor" />, {
              pct: true,
              step: 0.25,
            })}
          </Group>
          <Group title="Stores">
            {triple(
              "storesLive",
              "Stores carrying media",
              <EvidenceLink id="storesWithScreens" />,
              { step: 100 },
            )}
            {triple("fillRate", "Share of store media sold (%)", placeholder, {
              pct: true,
              step: 5,
            })}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {scalar(
                "screenRateMonthly",
                "Screen rate a month (₹)",
                <EvidenceLink id="screenRateMonthly" />,
                { step: 250 },
              )}
              {scalar(
                "otherInStoreMonthly",
                "Other store media a month (₹)",
                <EvidenceLink id="otherInStoreMonthly" />,
                { step: 250 },
              )}
            </div>
            {scalar(
              "screenCapexPerStore",
              "Screen cost per store (₹)",
              <EvidenceLink id="screenCapexPerStore" />,
              { step: 1000 },
            )}
          </Group>
          <Group title="Doorstep">
            {scalar("dailyDeliveries", "Home deliveries a day", <EvidenceLink id="dailyOrders" />, {
              step: 1000,
              hint: "Orders a day × share delivered home",
            })}
            {triple("samplingShare", "Deliveries carrying a sample (%)", placeholder, {
              pct: true,
              step: 1,
            })}
            {scalar("feePerSample", "Fee per sample (₹)", placeholder, { step: 1 })}
          </Group>
          <Group title="Insights">
            {triple("insightBrands", "Brands subscribing", placeholder, { step: 1 })}
            {scalar("insightFeeAnnual", "Fee per brand a year (₹)", placeholder, { step: 100_000 })}
          </Group>
        </div>
      </section>
    </div>
  );
}
