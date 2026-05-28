export const jobTypeColors = {
  local: { label: "Local Move", bg: "bg-blue-50", text: "text-blue-700" },
  long_distance: { label: "Long Distance", bg: "bg-indigo-50", text: "text-indigo-700" },
  commercial: { label: "Commercial", bg: "bg-violet-50", text: "text-violet-700" },
  packing: { label: "Packing Only", bg: "bg-cyan-50", text: "text-cyan-700" },
  storage: { label: "Storage", bg: "bg-teal-50", text: "text-teal-700" },
  labor_only: { label: "Labor Only", bg: "bg-amber-50", text: "text-amber-700" },
} as const;

export type JobTypeKey = keyof typeof jobTypeColors;
