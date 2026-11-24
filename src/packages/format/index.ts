import { indianScale } from "./lib/indian";

export function formatINR(value: number): string {
  const scaled = indianScale(value);
  return scaled.startsWith("-") ? `-₹${scaled.slice(1)}` : `₹${scaled}`;
}

export function formatCount(value: number): string {
  return indianScale(value);
}

export function formatPct(fraction: number, digits = 1): string {
  return `${(fraction * 100).toFixed(digits)}%`;
}

export function formatMultiple(x: number): string {
  return `${x.toFixed(1)}×`;
}
