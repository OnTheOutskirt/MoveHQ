/** Afternoon (PM) jobs — indigo, distinct from confirmation pill colors. */
export const pmJobBlockClass = {
  base: "border-indigo-300 bg-indigo-50 hover:border-indigo-400 hover:bg-indigo-50",
  selected: "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-300",
} as const;

export const pmJobRowClass = {
  rowSelected: "bg-indigo-50/40",
  name: "text-indigo-900",
  nameButtonSelected: "bg-indigo-50/60",
  pairedName: "text-indigo-800 hover:text-indigo-950",
  pairedSelected: "bg-indigo-50 ring-1 ring-indigo-200",
  unpairButton: "text-indigo-600/80 hover:bg-indigo-100 hover:text-indigo-900",
  pairDropRow: "bg-indigo-50/50 ring-2 ring-inset ring-indigo-200",
} as const;
