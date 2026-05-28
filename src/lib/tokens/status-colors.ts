export const statusColors = {
  lead: { label: "Lead", bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-400" },
  qualified: { label: "Qualified", bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  quoted: { label: "Quoted", bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500" },
  booked: { label: "Booked", bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-500" },
  scheduled: { label: "Scheduled", bg: "bg-cyan-50", text: "text-cyan-700", dot: "bg-cyan-500" },
  in_progress: { label: "In Progress", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  completed: { label: "Completed", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  invoiced: { label: "Invoiced", bg: "bg-teal-50", text: "text-teal-700", dot: "bg-teal-500" },
  paid: { label: "Paid", bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  lost: { label: "Lost", bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  cancelled: { label: "Cancelled", bg: "bg-zinc-100", text: "text-zinc-600", dot: "bg-zinc-400" },
} as const;

export type StatusKey = keyof typeof statusColors;
