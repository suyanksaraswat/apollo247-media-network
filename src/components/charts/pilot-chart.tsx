"use client";

import { useState } from "react";
import { formatINR } from "@/packages/format";
import type { WeeklyPoint } from "@/packages/pilot";
import { niceScale, useWidth } from "./chart-utils";

const SERIES = [
  { key: "test", label: "Campaign stores", color: "var(--series-1)" },
  { key: "control", label: "Matched stores", color: "var(--series-2)" },
] as const;

const HEIGHT = 280;

function weekLabel(week: number): string {
  return week < 0 ? `Week ${week}` : `Week +${week}`;
}

export function PilotChart({ series }: { series: readonly WeeklyPoint[] }) {
  const [ref, width] = useWidth<HTMLDivElement>(640);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const compact = width < 460;
  const margin = { top: 16, right: compact ? 14 : 118, bottom: 34, left: compact ? 58 : 66 };
  const plotW = width - margin.left - margin.right;
  const plotH = HEIGHT - margin.top - margin.bottom;
  const values = series.flatMap((p) => [p.test, p.control]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const floor = Math.max(0, Math.floor((min * 0.9) / 500) * 500);
  const { top, ticks } = niceScale(max - floor);
  const y = (value: number) => margin.top + plotH - ((value - floor) / top) * plotH;
  const x = (index: number) =>
    margin.left + (series.length <= 1 ? plotW / 2 : (index / (series.length - 1)) * plotW);
  const startIndex = series.findIndex((p) => p.week > 0);
  const boundaryX = startIndex > 0 ? (x(startIndex - 1) + x(startIndex)) / 2 : null;
  const hovered = hoverIndex === null ? undefined : series[hoverIndex];

  const path = (key: "test" | "control") =>
    series
      .map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p[key]).toFixed(1)}`)
      .join(" ");

  const last = series[series.length - 1];

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted" aria-label="Legend">
        {SERIES.map((s) => (
          <li key={s.key} className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded-full" style={{ background: s.color }} />
            {s.label}
          </li>
        ))}
      </ul>
      <div ref={ref} className="relative w-full">
        <svg
          viewBox={`0 0 ${width} ${HEIGHT}`}
          width="100%"
          height={HEIGHT}
          preserveAspectRatio="xMinYMin meet"
          role="img"
          aria-label="Average weekly brand sales per store, campaign stores against matched stores"
          className="block touch-none"
          onPointerMove={(event) => {
            const box = event.currentTarget.getBoundingClientRect();
            const px = event.clientX - box.left;
            if (series.length === 0) return;
            const ratio = (px - margin.left) / Math.max(1, plotW);
            const index = Math.round(ratio * (series.length - 1));
            setHoverIndex(Math.min(series.length - 1, Math.max(0, index)));
          }}
          onPointerLeave={() => setHoverIndex(null)}
        >
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={margin.left}
                x2={width - margin.right}
                y1={y(floor + tick)}
                y2={y(floor + tick)}
                stroke="var(--line)"
              />
              <text
                x={margin.left - 8}
                y={y(floor + tick)}
                dy="0.32em"
                textAnchor="end"
                className="num fill-muted font-mono text-[11px]"
              >
                {formatINR(floor + tick)}
              </text>
            </g>
          ))}
          {boundaryX !== null ? (
            <g>
              <line
                x1={boundaryX}
                x2={boundaryX}
                y1={margin.top}
                y2={margin.top + plotH}
                stroke="var(--muted)"
                strokeDasharray="4 4"
              />
              <text x={boundaryX + 6} y={margin.top + 10} className="fill-muted text-[11px]">
                Campaign starts
              </text>
            </g>
          ) : null}
          {series.map((p, i) =>
            i === 0 || i === series.length - 1 || i === startIndex ? (
              <text
                key={p.week}
                x={x(i)}
                y={HEIGHT - margin.bottom + 20}
                textAnchor={i === 0 ? "start" : i === series.length - 1 ? "end" : "middle"}
                className="fill-muted text-[11px]"
              >
                {weekLabel(p.week)}
              </text>
            ) : null,
          )}
          {SERIES.map((s) => (
            <path
              key={s.key}
              d={path(s.key)}
              fill="none"
              stroke={s.color}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}
          {last
            ? SERIES.map((s) => (
                <circle
                  key={s.key}
                  cx={x(series.length - 1)}
                  cy={y(last[s.key])}
                  r={4}
                  fill={s.color}
                  stroke="var(--surface)"
                  strokeWidth={2}
                />
              ))
            : null}
          {!compact && last
            ? (() => {
                const testY = y(last.test);
                const controlY = y(last.control);
                const apart = Math.abs(testY - controlY) >= 14;
                const nudge = apart ? 0 : 8;
                return SERIES.map((s) => {
                  const base = s.key === "test" ? testY : controlY;
                  const offset =
                    s.key === "test"
                      ? testY <= controlY
                        ? -nudge
                        : nudge
                      : controlY < testY
                        ? -nudge
                        : nudge;
                  return (
                    <text
                      key={s.key}
                      x={x(series.length - 1) + 10}
                      y={base + offset}
                      dy="0.32em"
                      className="fill-muted text-[11px]"
                    >
                      {s.label}
                    </text>
                  );
                });
              })()
            : null}
          {hovered && hoverIndex !== null ? (
            <g pointerEvents="none">
              <line
                x1={x(hoverIndex)}
                x2={x(hoverIndex)}
                y1={margin.top}
                y2={margin.top + plotH}
                stroke="var(--muted)"
              />
              {SERIES.map((s) => (
                <circle
                  key={s.key}
                  cx={x(hoverIndex)}
                  cy={y(hovered[s.key])}
                  r={4}
                  fill={s.color}
                  stroke="var(--surface)"
                  strokeWidth={2}
                />
              ))}
            </g>
          ) : null}
        </svg>
        {hovered && hoverIndex !== null ? (
          <output
            className="pointer-events-none absolute top-2 z-10 rounded-md border border-line bg-surface px-2.5 py-1.5 text-xs shadow-md"
            style={
              x(hoverIndex) > width / 2
                ? { right: width - x(hoverIndex) + 10 }
                : { left: x(hoverIndex) + 10 }
            }
          >
            <span className="block font-medium">{weekLabel(hovered.week)}</span>
            {SERIES.map((s) => (
              <span key={s.key} className="flex items-center gap-1.5">
                <span className="h-0.5 w-3 rounded-full" style={{ background: s.color }} />
                <span className="text-muted">{s.label}</span>
                <span className="num ml-auto pl-3 font-mono">{formatINR(hovered[s.key])}</span>
              </span>
            ))}
          </output>
        ) : null}
      </div>
    </div>
  );
}
