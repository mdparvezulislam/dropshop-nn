export function roundTo(num: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round((num + Number.EPSILON) * factor) / factor;
}

export function safeParseNumber(value: unknown, fallback: number = 0): number {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "number") return isNaN(value) ? fallback : value;
  const parsed = Number(value);
  return isNaN(parsed) ? fallback : parsed;
}

export function calculatePercentage(partial: number, total: number): number {
  if (total === 0) return 0;
  return roundTo((partial / total) * 100, 2);
}
