"use client";

import { useId, type ReactNode } from "react";

const inputClass =
  "num w-full rounded-md border border-line bg-surface px-2.5 py-1.5 font-mono text-sm text-ink focus:border-accent";

export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  hint,
  adornment,
  id,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  hint?: ReactNode;
  adornment?: ReactNode;
  id?: string;
}) {
  const generated = useId();
  const inputId = id ?? generated;
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label
        htmlFor={inputId}
        className="flex items-center justify-between gap-2 text-sm font-medium"
      >
        <span>{label}</span>
        {adornment}
      </label>
      <input
        id={inputId}
        type="number"
        inputMode="decimal"
        className={inputClass}
        value={Number.isFinite(value) ? value : ""}
        min={min}
        max={max}
        step={step}
        onChange={(event) => {
          const next = event.currentTarget.valueAsNumber;
          if (Number.isFinite(next)) onChange(next);
        }}
      />
      {hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </div>
  );
}

export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
  id,
}: {
  label: string;
  value: T;
  options: readonly { id: T; label: string }[];
  onChange: (value: T) => void;
  id?: string;
}) {
  const generated = useId();
  const inputId = id ?? generated;
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label htmlFor={inputId} className="text-sm font-medium">
        {label}
      </label>
      <select
        id={inputId}
        className="w-full rounded-md border border-line bg-surface px-2.5 py-1.5 text-sm text-ink focus:border-accent"
        value={value}
        onChange={(event) => {
          const picked = options.find((option) => option.id === event.currentTarget.value);
          if (picked) onChange(picked.id);
        }}
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function ChipGroup<T extends string>({
  legend,
  options,
  selected,
  onToggle,
}: {
  legend: string;
  options: readonly { id: T; label: string }[];
  selected: readonly T[];
  onToggle: (id: T) => void;
}) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-1.5">
      <legend className="mb-1.5 text-sm font-medium">{legend}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const on = selected.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(option.id)}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                on
                  ? "border-accent bg-accent-soft font-medium text-accent"
                  : "border-line bg-surface text-muted hover:text-ink"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function Segmented<T extends string>({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string;
  options: readonly { id: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-1.5">
      <legend className="mb-1.5 text-sm font-medium">{legend}</legend>
      <div className="inline-flex flex-wrap gap-1 rounded-lg border border-line bg-surface-2 p-1">
        {options.map((option) => {
          const on = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(option.id)}
              className={`rounded-md px-3 py-1 text-sm transition-colors ${
                on ? "bg-surface font-semibold text-ink shadow-sm" : "text-muted hover:text-ink"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function toggleIn<T>(list: readonly T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}
