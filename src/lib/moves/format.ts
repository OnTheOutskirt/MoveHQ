export function formatMoveDate(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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
