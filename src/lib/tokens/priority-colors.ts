export const priorityColors = {
  low: { label: "Low", bg: "bg-slate-100", text: "text-slate-600" },
  medium: { label: "Medium", bg: "bg-amber-50", text: "text-amber-700" },
  high: { label: "High", bg: "bg-orange-50", text: "text-orange-700" },
  urgent: { label: "Urgent", bg: "bg-red-50", text: "text-red-700" },
} as const;

export type PriorityKey = keyof typeof priorityColors;
