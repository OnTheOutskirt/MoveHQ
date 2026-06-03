export function formatReportMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatReportPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatReportHours(hours: number): string {
  return `${hours.toFixed(1)}h`;
}

export function formatReportMinutes(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
