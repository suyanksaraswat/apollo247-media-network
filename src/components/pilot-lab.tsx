"use client";

import { useMemo, useState } from "react";
import { PilotChart } from "@/components/charts/pilot-chart";
import { ChipGroup, NumberField, toggleIn } from "@/components/fields";
import { assetById } from "@/packages/catalog/assets";
import { assumption } from "@/packages/catalog/evidence";
import { CITIES, STORE_FORMATS } from "@/packages/catalog/taxonomy";
import type { CityId } from "@/packages/catalog/types";
import { formatINR, formatMultiple, formatPct } from "@/packages/format";
import { designPilot, generateStores, simulatePilot, type Store } from "@/packages/pilot";

const screen = assetById("store_screens");
const SCREEN_RATE = screen && screen.status !== "never" ? screen.pricing.rateINR : 1150;
const cityLabel = (id: CityId) => CITIES.find((c) => c.id === id)?.label ?? id;
const formatLabel = (id: Store["format"]) => STORE_FORMATS.find((f) => f.id === id)?.label ?? id;

let network: Store[] | null = null;
function stores(): Store[] {
  network ??= generateStores();
  return network;
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="flex flex-col bg-surface p-3">
      <dt className="eyebrow">{label}</dt>
      <dd className="num font-display text-xl font-bold">{value}</dd>
      {note ? <dd className="text-xs text-muted">{note}</dd> : null}
    </div>
  );
}

export function PilotLab() {
  const [cities, setCities] = useState<CityId[]>(["hyderabad", "chennai"]);
  const [testStores, setTestStores] = useState(50);
  const [weeks, setWeeks] = useState(6);
  const [price, setPrice] = useState(SCREEN_RATE);
  const [cvPct, setCvPct] = useState(Math.round(assumption("weeklySalesNoiseCV") * 100));
  const [screenOnly, setScreenOnly] = useState(true);
  const [liftPct, setLiftPct] = useState(8);
  const [trendPct, setTrendPct] = useState(6);
  const [seed, setSeed] = useState(1);

  const design = useMemo(
    () =>
      designPilot(
        {
          cities,
          testStores: Math.max(1, Math.round(testStores)),
          weeks: Math.max(1, Math.round(weeks)),
          pricePerStoreWeekINR: Math.max(0, price),
          weeklyNoiseCV: Math.max(0.01, cvPct / 100),
          screenOnly,
        },
        stores(),
      ),
    [cities, testStores, weeks, price, cvPct, screenOnly],
  );

  const readout = useMemo(
    () =>
      design.pairs.length >= 2
        ? simulatePilot({
            design,
            weeks: Math.max(1, Math.round(weeks)),
            trueLift: liftPct / 100,
            marketTrend: trendPct / 100,
            weeklyNoiseCV: Math.max(0.01, cvPct / 100),
            seed,
          })
        : null,
    [design, weeks, liftPct, trendPct, cvPct, seed],
  );

  return (
    <div className="flex flex-col gap-10">
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="flex min-w-0 flex-col gap-4 rounded-xl border border-line bg-surface p-4">
          <h2 className="font-display text-lg font-semibold">1. Design the pilot</h2>
          <ChipGroup
            legend="Cities"
            options={CITIES}
            selected={cities}
            onToggle={(id) => setCities((list) => toggleIn(list, id))}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <NumberField
              id="test-stores"
              label="Campaign stores"
              value={testStores}
              min={2}
              max={500}
              step={10}
              onChange={setTestStores}
            />
            <NumberField
              id="weeks"
              label="Weeks"
              value={weeks}
              min={1}
              max={12}
              step={1}
              onChange={setWeeks}
            />
            <NumberField
              id="price"
              label="Price per store a week (₹)"
              value={price}
              min={0}
              step={50}
              hint="Store screen rate card"
              onChange={setPrice}
            />
            <NumberField
              id="noise"
              label="Week-to-week swing (%)"
              value={cvPct}
              min={1}
              max={100}
              step={1}
              hint="Placeholder until real store sales are in"
              onChange={setCvPct}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              id="screen-only"
              type="checkbox"
              checked={screenOnly}
              onChange={(event) => setScreenOnly(event.currentTarget.checked)}
              className="size-4 accent-[var(--accent)]"
            />
            Only stores that already have a screen
          </label>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <dl
            className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3"
            data-testid="design"
          >
            <Stat
              label="Matched pairs"
              value={design.pairs.length.toLocaleString("en-IN")}
              note={`${design.eligibleStores.toLocaleString("en-IN")} stores eligible`}
            />
            <Stat
              label="Smallest lift it can detect"
              value={formatPct(design.mde)}
              note="95% confidence, 80% power"
            />
            <Stat
              label="Media revenue"
              value={formatINR(design.mediaRevenueINR)}
              note="At the price above"
            />
          </dl>
          {design.warnings.map((warning) => (
            <p key={warning} className="rounded-md bg-amber-soft px-3 py-2 text-sm text-amber">
              {warning}
            </p>
          ))}
          <p className="text-sm text-muted">
            Each campaign store is matched to a store in the same city and of the same kind with the
            closest sales. The average gap between pairs is{" "}
            <span className="num font-medium text-ink">{formatPct(design.avgBaselineGap)}</span>.
          </p>
          <div className="overflow-x-auto rounded-xl border border-line bg-surface">
            <table className="w-full min-w-[480px] text-sm">
              <thead className="bg-surface-2 text-left">
                <tr>
                  <th className="eyebrow px-3 py-2 font-medium">Campaign store</th>
                  <th className="eyebrow px-3 py-2 font-medium">Matched store</th>
                  <th className="eyebrow px-3 py-2 text-right font-medium">Sales gap</th>
                </tr>
              </thead>
              <tbody>
                {design.pairs.slice(0, 6).map((pair) => (
                  <tr key={pair.test.id} className="border-t border-line">
                    <td className="px-3 py-2">
                      <span className="font-mono">{pair.test.id}</span>{" "}
                      <span className="text-muted">
                        {cityLabel(pair.test.city)}, {formatLabel(pair.test.format)}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono">{pair.control.id}</td>
                    <td className="num px-3 py-2 text-right font-mono">
                      {formatPct(pair.baselineGap)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted">First six pairs shown. Stores are synthetic.</p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-lg font-semibold">
            2. What the brand&apos;s report would show
          </h2>
          <p className="max-w-3xl text-sm text-muted">
            A simulation on synthetic stores. Set the true effect of the campaign and a market-wide
            swing, such as a summer bump, that every store gets. The matched stores take the swing
            out; a simple before-and-after does not.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-4 rounded-xl border border-line bg-surface p-4">
          <div className="w-40">
            <NumberField
              id="true-lift"
              label="True lift (%)"
              value={liftPct}
              min={0}
              max={50}
              step={1}
              onChange={setLiftPct}
            />
          </div>
          <div className="w-40">
            <NumberField
              id="trend"
              label="Market swing (%)"
              value={trendPct}
              min={-30}
              max={50}
              step={1}
              onChange={setTrendPct}
            />
          </div>
          <button
            type="button"
            onClick={() => setSeed((s) => s + 1)}
            className="rounded-md border border-line bg-surface-2 px-3.5 py-1.5 text-sm font-semibold hover:border-accent"
          >
            Run again
          </button>
        </div>

        {readout ? (
          <div className="flex flex-col gap-4">
            <dl
              className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line lg:grid-cols-4"
              data-testid="readout"
            >
              <Stat
                label="Measured lift"
                value={formatPct(readout.measuredLift)}
                note={`95% range ${formatPct(readout.ciLow)} to ${formatPct(readout.ciHigh)}`}
              />
              <Stat
                label="Before and after only"
                value={formatPct(readout.naiveLift)}
                note="Includes the market swing"
              />
              <Stat
                label="Extra sales"
                value={formatINR(readout.incrementalSalesINR)}
                note={`For ${formatINR(readout.mediaCostINR)} of store media`}
              />
              <Stat
                label="Return on store media"
                value={formatMultiple(readout.iroas)}
                note={readout.significant ? "The lift is clear of zero" : "Not clear of zero yet"}
              />
            </dl>
            <div className="rounded-xl border border-line bg-surface p-4">
              <PilotChart series={readout.series} />
            </div>
          </div>
        ) : (
          <p className="rounded-md bg-amber-soft px-3 py-2 text-sm text-amber">
            Pick at least one city with enough stores to form two matched pairs.
          </p>
        )}
      </section>
    </div>
  );
}
