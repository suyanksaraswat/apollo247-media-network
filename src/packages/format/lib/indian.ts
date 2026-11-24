const CRORE = 1e7;
const LAKH = 1e5;

function trimDecimal(value: number): string {
  return (Math.round(value * 10) / 10).toLocaleString("en-IN", { maximumFractionDigits: 1 });
}

export function indianScale(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= CRORE) return `${sign}${trimDecimal(abs / CRORE)} cr`;
  if (abs >= LAKH) return `${sign}${trimDecimal(abs / LAKH)} lakh`;
  return `${sign}${Math.round(abs).toLocaleString("en-IN")}`;
}
