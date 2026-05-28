export const mockDashboardStats = [
  { label: "Open Deals", value: "12", change: "+3 this week", trend: "up" as const },
  { label: "Quotes Pending", value: "8", change: "4 expiring soon", trend: "neutral" as const },
  { label: "Jobs This Week", value: "6", change: "2 in progress today", trend: "up" as const },
  { label: "Revenue (MTD)", value: "$48.2k", change: "+12% vs last month", trend: "up" as const },
];

export const mockPipelineStages = [
  { stage: "Leads", count: 5, value: "$18,400" },
  { stage: "Qualified", count: 4, value: "$22,100" },
  { stage: "Quoted", count: 6, value: "$31,800" },
  { stage: "Booked", count: 3, value: "$9,650" },
  { stage: "Won", count: 2, value: "$14,200" },
];
