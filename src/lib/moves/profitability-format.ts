export function formatProfitCurrency(amount: number | null | undefined): string {
  if (amount == null || Number.isNaN(amount)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatProfitHours(hours: number | null | undefined): string {
  if (hours == null || hours === 0) return "—";
  const rounded = Math.round(hours * 10) / 10;
  return `${rounded} hr${rounded === 1 ? "" : "s"}`;
}

export function formatProfitMargin(pct: number | null | undefined): string {
  if (pct == null) return "—";
  return `${pct}%`;
}

export function formatVarianceCurrency(
  value: number | null,
  pct: number | null,
  options?: { invertGood?: boolean },
): { text: string; tone: "neutral" | "good" | "bad" } {
  if (value == null) return { text: "—", tone: "neutral" };
  if (value === 0) return { text: "On target", tone: "neutral" };
  const sign = value > 0 ? "+" : "";
  const pctStr = pct != null ? ` (${sign}${pct}%)` : "";
  const text = `${sign}${formatProfitCurrency(value)}${pctStr}`;
  const isPositive = value > 0;
  const good = options?.invertGood ? !isPositive : isPositive;
  return { text, tone: good ? "good" : "bad" };
}

export function formatVarianceHours(
  value: number | null,
  pct: number | null,
): { text: string; tone: "neutral" | "good" | "bad" } {
  if (value == null) return { text: "—", tone: "neutral" };
  if (value === 0) return { text: "On target", tone: "neutral" };
  const sign = value > 0 ? "+" : "";
  const pctStr = pct != null ? ` (${sign}${pct}%)` : "";
  const text = `${sign}${Math.round(value * 10) / 10} hrs${pctStr}`;
  const tone = value > 0 ? "bad" : "good";
  return { text, tone };
}
