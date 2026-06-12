const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** Format a `YYYY-MM-DD` date key — deterministic for SSR and hydration. */
export function formatMoveDate(
  dateKey: string,
  options?: { omitYear?: boolean },
): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateKey);
  if (!match) return dateKey;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const label = MONTH_SHORT[month - 1];
  if (!label) return dateKey;
  if (options?.omitYear) return `${label} ${day}`;
  return `${label} ${day}, ${year}`;
}

export function formatQuote(amount: number | null, type: "hourly" | "flat" | null): string {
  if (amount == null) return "—";
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
  if (type === "hourly") return `${formatted}/hr est.`;
  if (type === "flat") return `${formatted} flat`;
  return formatted;
}

export function formatActivityTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  if (sameDay) {
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function moveRouteLabel(origin: string, destination: string): string {
  const from = origin.split(",")[0]?.trim() ?? origin;
  const to = destination.split(",")[0]?.trim() ?? destination;
  return `${from} → ${to}`;
}
