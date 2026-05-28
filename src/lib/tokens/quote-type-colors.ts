export const quoteTypeColors = {
  hourly: { label: "Hourly", bg: "bg-sky-50", text: "text-sky-700" },
  flat_rate: { label: "Flat Rate", bg: "bg-emerald-50", text: "text-emerald-700" },
  hybrid: { label: "Hybrid", bg: "bg-violet-50", text: "text-violet-700" },
} as const;

export type QuoteTypeKey = keyof typeof quoteTypeColors;
