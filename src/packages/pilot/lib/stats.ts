const A = [
  -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2,
  -3.066479806614716e1, 2.506628277459239,
];
const B = [
  -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1,
  -1.328068155288572e1,
];
const C = [
  -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734,
  4.374664141464968, 2.938163982698783,
];
const D = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];
const P_LOW = 0.02425;

function poly(coefficients: number[], x: number): number {
  return coefficients.reduce((acc, c) => acc * x + c, 0);
}

export function inverseNormal(p: number): number {
  if (!(p > 0 && p < 1)) throw new RangeError("Probability must be between 0 and 1.");
  if (p < P_LOW) {
    const q = Math.sqrt(-2 * Math.log(p));
    return poly(C, q) / (poly(D, q) * q + 1);
  }
  if (p > 1 - P_LOW) {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    return -poly(C, q) / (poly(D, q) * q + 1);
  }
  const q = p - 0.5;
  const r = q * q;
  return (poly(A, r) * q) / (poly(B, r) * r + 1);
}

export function mde(
  pairs: number,
  weeks: number,
  cv: number,
  alpha: number,
  power: number,
): number {
  if (pairs <= 0 || weeks <= 0) return Number.POSITIVE_INFINITY;
  const z = inverseNormal(1 - alpha / 2) + inverseNormal(power);
  return (z * 2 * cv) / Math.sqrt(weeks * pairs);
}
