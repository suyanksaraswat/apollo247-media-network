"use client";

import { useState } from "react";
import { formatINR } from "@/packages/format";
import { niceScale, topRoundedRect, useWidth } from "./chart-utils";

export const CHANNEL_SERIES = [
  { key: "app", label: "App and web", color: "var(--series-1)" },
  { key: "stores", label: "Stores", color: "var(--series-2)" },
  { key: "doorstep", label: "Doorstep", color: "var(--series-3)" },
  { key: "insights", label: "Insights", color: "var(--series-4)" },
] as const;

export type ChannelKey = (typeof CHANNEL_SERIES)[number]["key"];

export interface Bar {
  label: string;
  values: Record<ChannelKey, number>;
  total: number;
}

const GAP = 2;

export function StackedBarChart({
  bars,
  ariaLabel,
  height = 280,
  showTotals = false,
}: {
  bars: readonly Bar[];
  ariaLabel: string;
  height?: number;
  showTotals?: boolean;
}) {
  const [ref, width] = useWidth<HTMLDivElement>(640);
  const [hover, setHover] = useState<{ bar: number; key: ChannelKey; x: number; y: number } | null>(
    null,
  );
  const compact = width < 460;
  const margin = { top: showTotals ? 28 : 12, right: 12, bottom: 30, left: compact ? 64 : 76 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;
  const { top, ticks } = niceScale(Math.max(...bars.map((b) => b.total), 1));
  const y = (value: number) => margin.top + plotH - (value / top) * plotH;
  const slot = plotW / Math.max(1, bars.length);
  const barW = Math.min(64, slot * 0.62);
  const labelEvery = bars.length > 8 && compact ? 3 : bars.length > 8 ? 2 : 1;

  const hoveredBar = hover ? bars[hover.bar] : undefined;
  const hoveredSeries = hover ? CHANNEL_SERIES.find((s) => s.key === hover.key) : undefined;

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted" aria-label="Legend">
        {CHANNEL_SERIES.map((series) => (
          <li key={series.key} className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm" style={{ background: series.color }} />
            {series.label}
          </li>
        ))}
      </ul>
      <div ref={ref} className="relative w-full" onPointerLeave={() => setHover(null)}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          height={height}
          preserveAspectRatio="xMinYMin meet"
          role="img"
          aria-label={ariaLabel}
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
              />
              <text
                x={margin.left - 8}
                y={y(tick)}
                dy="0.32em"
                textAnchor="end"
                className="num fill-muted font-mono text-[11px]"
              >
                {formatINR(tick)}
              </text>
            </g>
          ))}
          {bars.map((bar, index) => {
            const x = margin.left + slot * index + (slot - barW) / 2;
            const visible = CHANNEL_SERIES.filter((series) => bar.values[series.key] > 0);
            let base = 0;
            return (
              <g key={bar.label}>
                {visible.map((series, segment) => {
                  const value = bar.values[series.key];
                  const y0 = y(base);
                  const y1 = y(base + value);
                  base += value;
                  const h = Math.max(0, y0 - y1 - (segment > 0 ? GAP : 0));
                  const show = () =>
                    setHover({ bar: index, key: series.key, x: x + barW / 2, y: y1 });
                  const common = {
                    fill: series.color,
                    tabIndex: 0,
                    "aria-label": `${bar.label} ${series.label}: ${formatINR(value)}`,
                    onPointerEnter: show,
                    onFocus: show,
                    onBlur: () => setHover(null),
                    opacity: hover && (hover.bar !== index || hover.key !== series.key) ? 0.55 : 1,
                  };
                  return segment === visible.length - 1 ? (
                    <path key={series.key} d={topRoundedRect(x, y1, barW, h, 4)} {...common} />
                  ) : (
                    <rect key={series.key} x={x} y={y1} width={barW} height={h} {...common} />
                  );
                })}
                {showTotals && bar.total > 0 ? (
                  <text
                    x={x + barW / 2}
                    y={y(bar.total) - 8}
                    textAnchor="middle"
                    className="num fill-ink font-mono text-[12px] font-medium"
                  >
                    {formatINR(bar.total)}
                  </text>
                ) : null}
                {index % labelEvery === (bars.length - 1) % labelEvery ? (
                  <text
                    x={x + barW / 2}
                    y={height - margin.bottom + 18}
                    textAnchor="middle"
                    className="fill-muted text-[11px]"
                  >
                    {bar.label}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
        {hover && hoveredBar && hoveredSeries ? (
          <output
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md border border-line bg-surface px-2.5 py-1.5 text-xs shadow-md"
            style={{ left: hover.x, top: hover.y - 6 }}
          >
            <span className="block font-medium">
              {hoveredBar.label} · {hoveredSeries.label}
            </span>
            <span className="num block font-mono">{formatINR(hoveredBar.values[hover.key])}</span>
            <span className="num block font-mono text-muted">
              Total {formatINR(hoveredBar.total)}
            </span>
          </output>
        ) : null}
      </div>
    </div>
  );
}
