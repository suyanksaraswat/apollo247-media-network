import { addDays, parseDay } from "./lib/dates";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function shortDate(iso: string): string {
  const date = new Date(parseDay(iso));
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()] ?? ""}`;
}

export function longDate(iso: string): string {
  const date = new Date(parseDay(iso));
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()] ?? ""} ${date.getUTCFullYear()}`;
}

export function dateRange(start: string, endExclusive: string): string {
  const end = addDays(endExclusive, -1);
  const sameYear = start.slice(0, 4) === end.slice(0, 4);
  return sameYear
    ? `${shortDate(start)} – ${longDate(end)}`
    : `${longDate(start)} – ${longDate(end)}`;
}
