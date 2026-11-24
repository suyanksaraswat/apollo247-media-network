const DAY_MS = 86_400_000;

export function parseDay(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

export function toIso(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  return toIso(parseDay(iso) + days * DAY_MS);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((parseDay(to) - parseDay(from)) / DAY_MS);
}

export function weekStart(iso: string): string {
  const day = new Date(parseDay(iso)).getUTCDay();
  const sinceMonday = (day + 6) % 7;
  return addDays(iso, -sinceMonday);
}
