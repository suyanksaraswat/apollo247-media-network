"use client";

import { useMemo, useState } from "react";
import { ChipGroup, NumberField, Segmented, SelectField, toggleIn } from "@/components/fields";
import { StatusTag } from "@/components/status-tag";
import type { AiOutcome } from "@/packages/ai/outcome";
import { SAMPLE_BRIEFS } from "@/packages/catalog/briefs";
import {
  CATEGORIES,
  CHANNELS,
  CITIES,
  CLAIM_RULES,
  OBJECTIVES,
  PRODUCT_CLASSES,
} from "@/packages/catalog/taxonomy";
import type { BriefFields, CreativeReview, SampleBrief } from "@/packages/catalog/types";
import { formatCount, formatINR } from "@/packages/format";
import { buildPlan, type Plan, type PlanInput } from "@/packages/planner";

type Invalid = { kind: "invalid"; message: string };
type Reply<T> = AiOutcome<T> | Invalid;

const FIRST = SAMPLE_BRIEFS[0];
const DEFAULT_INPUT: PlanInput = {
  category: FIRST?.fields.category ?? "fmcg_food",
  productClass: FIRST?.fields.productClass ?? "fmcg",
  objective: FIRST?.fields.objective ?? "trial",
  cities: FIRST?.fields.cities ?? ["hyderabad"],
  budgetINR: FIRST?.fields.budgetINR ?? 2_500_000,
  weeks: FIRST?.fields.weeks ?? 6,
};

const channelLabel = (id: string) => CHANNELS.find((c) => c.id === id)?.label ?? id;
const ruleLabel = (id: string) => CLAIM_RULES.find((r) => r.id === id)?.label ?? id;

const OFFLINE: Invalid = {
  kind: "invalid",
  message: "Could not reach the server. Check your connection and try again.",
};

function isReply<T>(data: unknown): data is Reply<T> {
  return (
    typeof data === "object" &&
    data !== null &&
    "kind" in data &&
    (data.kind === "ok" || data.kind === "unavailable" || data.kind === "invalid")
  );
}

async function post<T>(url: string, body: unknown): Promise<Reply<T>> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const data: unknown = await response.json();
    return isReply<T>(data) ? data : OFFLINE;
  } catch {
    return OFFLINE;
  }
}

function applyFields(fields: BriefFields, current: PlanInput): PlanInput {
  return {
    category: fields.category,
    productClass: fields.productClass,
    objective: fields.objective,
    cities: fields.cities.length > 0 ? fields.cities : current.cities,
    budgetINR: fields.budgetINR ?? current.budgetINR,
    weeks: fields.weeks ?? current.weeks,
  };
}

function safePlan(input: PlanInput): Plan | { kind: "invalid"; message: string } {
  try {
    return buildPlan(input);
  } catch (error) {
    return {
      kind: "invalid",
      message: error instanceof RangeError ? error.message : "Check the campaign fields.",
    };
  }
}

export function Planner() {
  const [brief, setBrief] = useState(FIRST?.text ?? "");
  const [input, setInput] = useState<PlanInput>(DEFAULT_INPUT);
  const [copy, setCopy] = useState((FIRST?.fields.creativeLines ?? []).join("\n"));
  const [conditionNote, setConditionNote] = useState<string | null>(null);
  const [briefState, setBriefState] = useState<{
    busy: boolean;
    note: string | null;
    error: string | null;
  }>({
    busy: false,
    note: FIRST ? "Sample brief loaded." : null,
    error: null,
  });
  const [review, setReview] = useState<{ busy: boolean; result: Reply<CreativeReview> | null }>({
    busy: false,
    result: FIRST?.review ? { kind: "ok", source: "sample", value: FIRST.review } : null,
  });

  const plan = useMemo(() => safePlan(input), [input]);

  function loadSample(sample: SampleBrief) {
    setBrief(sample.text);
    setInput((current) => applyFields(sample.fields, current));
    setCopy(sample.fields.creativeLines.join("\n"));
    setConditionNote(sample.fields.conditionTargeting.note);
    setBriefState({ busy: false, note: `Sample brief loaded: ${sample.title}.`, error: null });
    setReview({
      busy: false,
      result: sample.review ? { kind: "ok", source: "sample", value: sample.review } : null,
    });
  }

  async function readBrief() {
    setBriefState({ busy: true, note: null, error: null });
    const reply = await post<BriefFields>("/api/brief", { text: brief });
    if (reply.kind === "ok") {
      setInput((current) => applyFields(reply.value, current));
      if (reply.value.creativeLines.length > 0) setCopy(reply.value.creativeLines.join("\n"));
      setConditionNote(reply.value.conditionTargeting.note);
      setReview({ busy: false, result: null });
      setBriefState({
        busy: false,
        note:
          reply.source === "gemini"
            ? `Read by Gemini: ${reply.value.summary}`
            : "Sample brief loaded.",
        error: null,
      });
    } else {
      setBriefState({ busy: false, note: null, error: reply.message });
    }
  }

  async function checkCopy() {
    setReview({ busy: true, result: null });
    const lines = copy
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const result = await post<CreativeReview>("/api/review", {
      lines,
      category: input.category,
      productClass: input.productClass,
    });
    setReview({ busy: false, result });
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div className="flex min-w-0 flex-col gap-6">
        <section className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4">
          <h2 className="font-display text-lg font-semibold">1. The brand&apos;s brief</h2>
          <div className="flex flex-wrap gap-1.5" aria-label="Sample briefs">
            {SAMPLE_BRIEFS.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => loadSample(sample)}
                className="rounded-full border border-line bg-surface-2 px-3 py-1 text-xs hover:border-accent"
              >
                {sample.title}
              </button>
            ))}
          </div>
          <label htmlFor="brief" className="sr-only">
            Brief
          </label>
          <textarea
            id="brief"
            value={brief}
            maxLength={2000}
            rows={5}
            onChange={(event) => setBrief(event.currentTarget.value)}
            className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm focus:border-accent"
            placeholder="Paste a brand's brief: product, cities, budget, weeks, any ad copy."
          />
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={readBrief}
              disabled={briefState.busy || brief.trim().length === 0}
              className="rounded-md bg-accent px-3.5 py-1.5 text-sm font-semibold text-accent-ink disabled:opacity-50"
            >
              {briefState.busy ? "Reading…" : "Read brief with AI"}
            </button>
            {briefState.note ? <span className="text-xs text-muted">{briefState.note}</span> : null}
          </div>
          {briefState.error ? (
            <p role="alert" className="rounded-md bg-amber-soft px-3 py-2 text-sm text-amber">
              {briefState.error}
            </p>
          ) : null}
        </section>

        <section className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-4">
          <h2 className="font-display text-lg font-semibold">2. The campaign</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectField
              id="category"
              label="Category"
              value={input.category}
              options={CATEGORIES}
              onChange={(category) => setInput((s) => ({ ...s, category }))}
            />
            <SelectField
              id="product-class"
              label="What is advertised"
              value={input.productClass}
              options={PRODUCT_CLASSES}
              onChange={(productClass) => setInput((s) => ({ ...s, productClass }))}
            />
          </div>
          <Segmented
            legend="Objective"
            options={OBJECTIVES}
            value={input.objective}
            onChange={(objective) => setInput((s) => ({ ...s, objective }))}
          />
          <ChipGroup
            legend="Cities"
            options={CITIES}
            selected={input.cities}
            onToggle={(id) => setInput((s) => ({ ...s, cities: toggleIn(s.cities, id) }))}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <NumberField
              id="budget"
              label="Budget (₹)"
              value={input.budgetINR}
              min={10_000}
              step={50_000}
              hint={formatINR(input.budgetINR)}
              onChange={(budgetINR) => setInput((s) => ({ ...s, budgetINR }))}
            />
            <NumberField
              id="weeks"
              label="Weeks"
              value={input.weeks}
              min={1}
              max={26}
              step={1}
              onChange={(weeks) => setInput((s) => ({ ...s, weeks: Math.round(weeks) }))}
            />
          </div>
        </section>

        <section className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4">
          <h2 className="font-display text-lg font-semibold">3. The ad copy</h2>
          <label htmlFor="copy" className="sr-only">
            Ad copy, one line each
          </label>
          <textarea
            id="copy"
            value={copy}
            rows={3}
            onChange={(event) => setCopy(event.currentTarget.value)}
            className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm focus:border-accent"
            placeholder="One line of copy per row."
          />
          <div>
            <button
              type="button"
              onClick={checkCopy}
              disabled={review.busy}
              className="rounded-md border border-line bg-surface-2 px-3.5 py-1.5 text-sm font-semibold hover:border-accent disabled:opacity-50"
            >
              {review.busy ? "Checking…" : "Check copy"}
            </button>
          </div>
          <ReviewResult result={review.result} />
        </section>
      </div>

      <div className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
        <h2 className="font-display text-lg font-semibold">The plan</h2>
        {conditionNote ? (
          <p className="rounded-md bg-amber-soft px-3 py-2 text-sm text-amber">
            <span className="font-semibold">Audience request refused. </span>
            {conditionNote}
          </p>
        ) : null}
        <PlanView plan={plan} />
      </div>
    </div>
  );
}

function ReviewResult({ result }: { result: Reply<CreativeReview> | null }) {
  if (!result) return null;
  if (result.kind !== "ok") {
    return (
      <p role="alert" className="rounded-md bg-amber-soft px-3 py-2 text-sm text-amber">
        {result.message}
      </p>
    );
  }
  const { verdict, issues } = result.value;
  const tone =
    verdict === "ok"
      ? "bg-accent-soft text-accent"
      : verdict === "revise"
        ? "bg-amber-soft text-amber"
        : "bg-red-soft text-red";
  const label =
    verdict === "ok" ? "Copy is fine" : verdict === "revise" ? "Needs changes" : "Can't run";
  return (
    <div className="flex flex-col gap-2" data-testid="review">
      <span className={`self-start rounded-sm px-2 py-0.5 text-xs font-semibold ${tone}`}>
        {label}
      </span>
      {issues.map((issue) => (
        <div
          key={`${issue.rule}-${issue.quote}`}
          className="flex flex-col gap-1 rounded-md border border-line p-3 text-sm"
        >
          {issue.quote ? <q className="font-medium">{issue.quote}</q> : null}
          <span className="text-xs text-muted">{ruleLabel(issue.rule)}</span>
          <span>{issue.problem}</span>
          {issue.rewrite ? (
            <span className="text-accent">
              <span className="font-medium">Try: </span>
              {issue.rewrite}
            </span>
          ) : null}
        </div>
      ))}
      {result.source === "sample" ? (
        <span className="text-xs text-muted">Stored review for this sample.</span>
      ) : null}
      {result.source === "gemini" ? (
        <span className="text-xs text-muted">Reviewed by Gemini.</span>
      ) : null}
    </div>
  );
}

function PlanView({ plan }: { plan: Plan | { kind: "invalid"; message: string } }) {
  if (plan.kind === "invalid") {
    return <p className="rounded-md bg-amber-soft px-3 py-2 text-sm text-amber">{plan.message}</p>;
  }
  if (plan.kind === "blocked") {
    return (
      <div
        role="alert"
        data-testid="plan-blocked"
        className="flex flex-col gap-1 rounded-xl bg-red-soft p-4 text-red"
      >
        <span className="font-semibold">No consumer plan is possible</span>
        <span className="text-sm">{plan.reason}</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4" data-testid="plan">
      <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-line bg-line">
        <div className="flex flex-col bg-surface p-3">
          <dt className="eyebrow">Planned</dt>
          <dd className="num font-display text-xl font-bold">{formatINR(plan.totalSpendINR)}</dd>
        </div>
        <div className="flex flex-col bg-surface p-3">
          <dt className="eyebrow">Est. views</dt>
          <dd className="num font-display text-xl font-bold">{formatCount(plan.estViews)}</dd>
        </div>
        <div className="flex flex-col bg-surface p-3">
          <dt className="eyebrow">Unplanned</dt>
          <dd className="num font-display text-xl font-bold">{formatINR(plan.unallocatedINR)}</dd>
        </div>
      </dl>
      {plan.warnings.map((warning) => (
        <p key={warning} className="rounded-md bg-amber-soft px-3 py-2 text-sm text-amber">
          {warning}
        </p>
      ))}
      <div className="overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full min-w-[520px] text-sm">
          <thead className="bg-surface-2 text-left">
            <tr>
              <th className="eyebrow px-3 py-2 font-medium">Surface</th>
              <th className="eyebrow px-3 py-2 font-medium">What the brand gets</th>
              <th className="eyebrow px-3 py-2 text-right font-medium">Spend</th>
              <th className="eyebrow px-3 py-2 text-right font-medium">Views</th>
            </tr>
          </thead>
          <tbody>
            {plan.lines.map((line) => (
              <tr
                key={line.assetId}
                className="border-t border-line align-top"
                data-testid={`line-${line.assetId}`}
              >
                <td className="px-3 py-2.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-medium">{line.assetName}</span>
                    <StatusTag status={line.status} />
                  </div>
                  <div className="text-xs text-muted">{channelLabel(line.channel)}</div>
                  {line.rule ? <div className="mt-1 text-xs text-amber">{line.rule}</div> : null}
                </td>
                <td className="num px-3 py-2.5 font-mono text-xs">{line.summary}</td>
                <td className="num px-3 py-2.5 text-right font-mono whitespace-nowrap">
                  {formatINR(line.spendINR)}
                </td>
                <td className="num px-3 py-2.5 text-right font-mono whitespace-nowrap">
                  {formatCount(line.estViews)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {plan.exclusions.length > 0 ? (
        <details className="rounded-xl border border-line bg-surface p-3 text-sm">
          <summary className="cursor-pointer font-medium">
            Left out and why ({plan.exclusions.length})
          </summary>
          <ul className="mt-2 flex flex-col gap-1.5">
            {plan.exclusions.map((item) => (
              <li key={item.assetId} className="flex flex-col sm:flex-row sm:gap-2">
                <span className="font-medium">{item.assetName}</span>
                <span className="text-muted">{item.reason}</span>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
      <p className="text-xs text-muted">
        Views are estimates from the media kit&apos;s weekly supply, scaled to the chosen cities.
        Sales lift is measured in the store pilot, not promised here.
      </p>
    </div>
  );
}
