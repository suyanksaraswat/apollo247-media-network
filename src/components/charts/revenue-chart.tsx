"use client";

import { useState } from "react";
import { formatINR } from "@/packages/format";
import type { YearResult } from "@/packages/revenue";
import { niceScale, topRoundedRect, useWidth } from "./chart-utils";

export const REVENUE_SERIES = [
  { key: "app", label: "App and web", color: "var(--series-1)" },
  { key: "stores", label: "Stores", color: "var(--series-2)" },
  { key: "doorstep", label: "Doorstep", color: "var(--series-3)" },
  { key: "insights", label: "Insights", color: "var(--series-4)" },
] as const;

type SeriesKey = (typeof REVENUE_SERIES)[number]["key"];

const CRORE = 1e7;
const HEIGHT = 300;
const MARGIN = { top: 28, right: 96, bottom: 34, left: 58 };
const GAP = 2;

export function RevenueChart({
  years,
  yearLabels,
}: {
  years: readonly YearResult[];
  yearLabels: readonly string[];
}) {
  const [ref, width] = useWidth<HTMLDivElement>(640);
  const [hover, setHover] = useState<{ year: number; key: SeriesKey; x: number; y: number } | null>(
    null,
  );
  const compact = width < 460;
  const margin = {
    ...MARGIN,
    right: compact ? 12 : MARGIN.right,
    left: compact ? 62 : MARGIN.left,
  };
  const plotW = width - margin.left - margin.right;
  const plotH = HEIGHT - margin.top - margin.bottom;
  const { top, ticks } = niceScale(Math.max(...years.map((y) => y.total)) / CRORE);
  const y = (crore: number) => margin.top + plotH - (crore / top) * plotH;
  const slot = plotW / years.length;
  const barW = Math.min(88, slot * 0.56);

  const hovered = hover ? years[hover.year] : undefined;
  const hoveredSeries = hover ? REVENUE_SERIES.find((s) => s.key === hover.key) : undefined;

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted" aria-label="Legend">
        {REVENUE_SERIES.map((series) => (
          <li key={series.key} className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm" style={{ background: series.color }} />
            {series.label}
          </li>
        ))}
      </ul>
      <div ref={ref} className="relative w-full" onPointerLeave={() => setHover(null)}>
        <svg
          viewBox={`0 0 ${width} ${HEIGHT}`}
          width="100%"
          height={HEIGHT}
          preserveAspectRatio="xMinYMin meet"
          role="img"
          aria-label="Media revenue by year and line, in rupees crore"
          className="block"
        >
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={margin.left}
                x2={width - margin.right}
                y1={y(tick)}
                y2={y(tick)}
                stroke="var(--line)"
                strokeWidth={1}
              />
              <text
                x={margin.left - 8}
                y={y(tick)}
                dy="0.32em"
                textAnchor="end"
                className="num fill-muted font-mono text-[11px]"
              >
                ₹{tick.toLocaleString("en-IN")} cr
              </text>
            </g>
          ))}
          {years.map((year, index) => {
            const x = margin.left + slot * index + (slot - barW) / 2;
            let base = 0;
            const visible = REVENUE_SERIES.filter((series) => year[series.key] > 0);
            return (
              <g key={year.year}>
                {visible.map((series, segment) => {
                  const value = year[series.key] / CRORE;
                  const y0 = y(base);
                  const y1 = y(base + value);
                  base += value;
                  const h = Math.max(0, y0 - y1 - (segment > 0 ? GAP : 0));
                  const isTop = segment === visible.length - 1;
                  const common = {
                    fill: series.color,
                    tabIndex: 0,
                    "aria-label": `${yearLabels[index] ?? ""} ${series.label}: ${formatINR(year[series.key])}`,
                    onPointerEnter: () =>
                      setHover({ year: index, key: series.key, x: x + barW / 2, y: y1 }),
                    onFocus: () =>
                      setHover({ year: index, key: series.key, x: x + barW / 2, y: y1 }),
                    onBlur: () => setHover(null),
                    opacity: hover && (hover.year !== index || hover.key !== series.key) ? 0.55 : 1,
                  };
                  return isTop ? (
                    <path key={series.key} d={topRoundedRect(x, y1, barW, h, 4)} {...common} />
                  ) : (
                    <rect key={series.key} x={x} y={y1} width={barW} height={h} {...common} />
                  );
                })}
                <text
                  x={x + barW / 2}
                  y={y(year.total / CRORE) - 8}
                  textAnchor="middle"
                  className="num fill-ink font-mono text-[12px] font-medium"
                >
                  {formatINR(year.total)}
                </text>
                <text
                  x={x + barW / 2}
                  y={HEIGHT - margin.bottom + 20}
                  textAnchor="middle"
                  className="fill-muted text-[12px]"
                >
                  {yearLabels[index]}
                </text>
              </g>
            );
          })}
          {!compact &&
            (() => {
              const last = years[years.length - 1];
              if (!last) return null;
              const x = margin.left + slot * (years.length - 1) + (slot + barW) / 2 + 8;
              let base = 0;
              return REVENUE_SERIES.map((series) => {
                const value = last[series.key] / CRORE;
                const mid = y(base + value / 2);
                const tall = y(base) - y(base + value) >= 14;
                base += value;
                return tall ? (
                  <text
                    key={series.key}
                    x={x}
                    y={mid}
                    dy="0.32em"
                    className="fill-muted text-[11px]"
                  >
                    {series.label}
                  </text>
                ) : null;
              });
            })()}
        </svg>
        {hover && hovered && hoveredSeries ? (
          <output
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md border border-line bg-surface px-2.5 py-1.5 text-xs shadow-md"
            style={{ left: hover.x, top: hover.y - 6 }}
          >
            <span className="block font-medium">
              {yearLabels[hover.year]} · {hoveredSeries.label}
            </span>
            <span className="num block font-mono">{formatINR(hovered[hover.key])}</span>
          </output>
        ) : null}
      </div>
    </div>
  );
}
