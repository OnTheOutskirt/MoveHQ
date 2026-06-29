/**
 * Mock widget data for the Reports workspace. Keyed by `${section}:${subtab}`.
 * Replace with live aggregates when reporting is wired to the backend.
 */

export type ReportStatWidget = {
  kind: "stat";
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
};

export type ReportBarItem = { label: string; value: number; display?: string };

export type ReportBarsWidget = {
  kind: "bars";
  title: string;
  items: ReportBarItem[];
};

export type ReportTrendWidget = {
  kind: "trend";
  title: string;
  points: { label: string; value: number; display?: string }[];
  caption?: string;
};

export type ReportTableWidget = {
  kind: "table";
  title: string;
  columns: string[];
  rows: string[][];
};

export type ReportListWidget = {
  kind: "list";
  title: string;
  items: { label: string; value: string; hint?: string }[];
};

export type ReportWidget =
  | ReportStatWidget
  | ReportBarsWidget
  | ReportTrendWidget
  | ReportTableWidget
  | ReportListWidget;

export const REPORT_WIDGETS: Record<string, ReportWidget[]> = {
  // ===== SALES =====
  "sales:pipeline": [
    { kind: "stat", title: "Pipeline value", value: "$486,200", change: "+8.2% vs last period", trend: "up" },
    { kind: "stat", title: "Forecasted revenue", value: "$182,400", change: "Weighted by stage", trend: "neutral" },
    {
      kind: "bars",
      title: "Leads by stage",
      items: [
        { label: "New", value: 42 },
        { label: "Contacted", value: 31 },
        { label: "Quoted", value: 24 },
        { label: "Negotiation", value: 12 },
        { label: "Booked", value: 9 },
      ],
    },
  ],
  "sales:quotes": [
    { kind: "stat", title: "Quotes sent", value: "142", change: "+12 vs last period", trend: "up" },
    { kind: "stat", title: "Quote acceptance", value: "38%", change: "+3 pts", trend: "up" },
    { kind: "stat", title: "Average quote value", value: "$2,380", change: "+$120", trend: "up" },
    {
      kind: "bars",
      title: "Hourly vs Flat Rate",
      items: [
        { label: "Hourly", value: 88 },
        { label: "Flat rate", value: 54 },
      ],
    },
  ],
  "sales:bookings": [
    { kind: "stat", title: "Booked jobs", value: "72", change: "+6 vs last period", trend: "up" },
    { kind: "stat", title: "Revenue booked", value: "$168,400", change: "+9.1%", trend: "up" },
    {
      kind: "trend",
      title: "Booking trends",
      caption: "Jobs booked per month",
      points: [
        { label: "Jan", value: 9 },
        { label: "Feb", value: 11 },
        { label: "Mar", value: 12 },
        { label: "Apr", value: 10 },
        { label: "May", value: 14 },
        { label: "Jun", value: 16 },
      ],
    },
  ],
  "sales:performance": [
    { kind: "stat", title: "Close rate", value: "34%", change: "+2 pts", trend: "up" },
    { kind: "stat", title: "Lost opportunities", value: "18", change: "$41.9k potential", trend: "neutral" },
    {
      kind: "table",
      title: "Salesperson leaderboard",
      columns: ["Salesperson", "Jobs", "Revenue", "Close rate"],
      rows: [
        ["Web AI", "27", "$52,400", "41%"],
        ["Jordan M.", "18", "$42,850", "36%"],
        ["Sam K.", "15", "$36,200", "33%"],
        ["Alex R.", "12", "$29,100", "29%"],
      ],
    },
    {
      kind: "bars",
      title: "Referral performance",
      items: [
        { label: "Whitfield Realty", value: 18400, display: "$18.4k" },
        { label: "Sunset Ridge", value: 12200, display: "$12.2k" },
        { label: "Rapid Restore", value: 7600, display: "$7.6k" },
        { label: "Lakewood Heights", value: 5400, display: "$5.4k" },
      ],
    },
  ],

  // ===== MARKETING =====
  "marketing:lead-sources": [
    {
      kind: "bars",
      title: "Where leads came from",
      items: [
        { label: "Website", value: 84 },
        { label: "Phone", value: 56 },
        { label: "Google", value: 39 },
        { label: "Referral", value: 28 },
        { label: "Repeat customer", value: 14 },
      ],
    },
    {
      kind: "bars",
      title: "Close rate by source",
      items: [
        { label: "Repeat customer", value: 63, display: "63%" },
        { label: "Referral", value: 52, display: "52%" },
        { label: "Phone", value: 41, display: "41%" },
        { label: "Website", value: 28, display: "28%" },
        { label: "Google", value: 24, display: "24%" },
      ],
    },
    {
      kind: "bars",
      title: "Revenue by source",
      items: [
        { label: "Website", value: 62400, display: "$62.4k" },
        { label: "Phone", value: 38100, display: "$38.1k" },
        { label: "Referral", value: 31200, display: "$31.2k" },
        { label: "Google", value: 19800, display: "$19.8k" },
        { label: "Repeat customer", value: 14600, display: "$14.6k" },
      ],
    },
  ],
  "marketing:campaigns": [
    { kind: "stat", title: "Google Ads", value: "64 leads", change: "$3,200 spend", trend: "neutral" },
    { kind: "stat", title: "Organic", value: "58 leads", change: "No spend", trend: "up" },
    { kind: "stat", title: "Facebook", value: "29 leads", change: "$1,450 spend", trend: "neutral" },
    { kind: "stat", title: "Referral", value: "42 leads", change: "No spend", trend: "up" },
  ],
  "marketing:roi": [
    { kind: "stat", title: "Cost per lead", value: "$42", change: "-$6 vs last period", trend: "up" },
    { kind: "stat", title: "Cost per booking", value: "$186", change: "-$14 vs last period", trend: "up" },
    {
      kind: "bars",
      title: "Revenue by source",
      items: [
        { label: "Website", value: 62400, display: "$62.4k" },
        { label: "Phone", value: 38100, display: "$38.1k" },
        { label: "Referral", value: 31200, display: "$31.2k" },
        { label: "Google", value: 19800, display: "$19.8k" },
      ],
    },
    {
      kind: "bars",
      title: "Profit by source",
      items: [
        { label: "Referral", value: 24800, display: "$24.8k" },
        { label: "Website", value: 21200, display: "$21.2k" },
        { label: "Phone", value: 14600, display: "$14.6k" },
        { label: "Google", value: 4200, display: "$4.2k" },
      ],
    },
  ],

  // ===== OPERATIONS =====
  "operations:jobs": [
    { kind: "stat", title: "Scheduled", value: "48", change: "Next 14 days", trend: "neutral" },
    { kind: "stat", title: "Completed", value: "39", change: "+5 vs last period", trend: "up" },
    { kind: "stat", title: "Cancelled", value: "5", change: "2 rescheduled", trend: "neutral" },
    {
      kind: "trend",
      title: "Job timeline",
      caption: "Completed jobs per week",
      points: [
        { label: "W1", value: 6 },
        { label: "W2", value: 8 },
        { label: "W3", value: 7 },
        { label: "W4", value: 9 },
        { label: "W5", value: 5 },
        { label: "W6", value: 4 },
      ],
    },
  ],
  "operations:crews": [
    { kind: "stat", title: "Hours worked", value: "1,284 h", change: "+62 h vs last period", trend: "up" },
    { kind: "stat", title: "Overtime", value: "96 h", change: "7.5% of hours", trend: "neutral" },
    {
      kind: "bars",
      title: "Crew utilization",
      items: [
        { label: "Crew A — Marcus", value: 88, display: "88%" },
        { label: "Crew B — Diego", value: 76, display: "76%" },
        { label: "Crew C — Will", value: 64, display: "64%" },
        { label: "Crew D — Temp", value: 52, display: "52%" },
      ],
    },
    {
      kind: "table",
      title: "Performance",
      columns: ["Crew", "Jobs", "Avg variance", "Rating"],
      rows: [
        ["Crew A — Marcus", "22", "-0.3 h", "4.9"],
        ["Crew B — Diego", "19", "+0.4 h", "4.7"],
        ["Crew C — Will", "16", "+0.1 h", "4.6"],
        ["Crew D — Temp", "11", "+0.8 h", "4.3"],
      ],
    },
  ],
  "operations:fleet": [
    { kind: "stat", title: "Fuel", value: "$4,820", change: "+$310 vs last period", trend: "neutral" },
    {
      kind: "bars",
      title: "Truck utilization",
      items: [
        { label: "Truck 12 — 26 ft", value: 82, display: "82%" },
        { label: "Truck 08 — 16 ft", value: 71, display: "71%" },
        { label: "Truck 03 — 26 ft", value: 64, display: "64%" },
        { label: "Truck 21 — 16 ft", value: 48, display: "48%" },
      ],
    },
    {
      kind: "table",
      title: "Maintenance",
      columns: ["Truck", "Last service", "Next due", "Status"],
      rows: [
        ["Truck 12", "May 2", "Jul 1", "OK"],
        ["Truck 08", "Apr 18", "Jun 30", "Due soon"],
        ["Truck 03", "Mar 28", "Jun 25", "Overdue"],
      ],
    },
  ],
  "operations:schedule": [
    { kind: "stat", title: "Crew availability", value: "5 / 6", change: "1 crew off today", trend: "neutral" },
    { kind: "stat", title: "Truck availability", value: "7 / 8", change: "1 in maintenance", trend: "neutral" },
    {
      kind: "bars",
      title: "Capacity this week",
      items: [
        { label: "Mon", value: 92, display: "92%" },
        { label: "Tue", value: 78, display: "78%" },
        { label: "Wed", value: 85, display: "85%" },
        { label: "Thu", value: 70, display: "70%" },
        { label: "Fri", value: 96, display: "96%" },
      ],
    },
    {
      kind: "list",
      title: "Calendar views",
      items: [
        { label: "Today", value: "6 jobs", hint: "3 crews out" },
        { label: "Tomorrow", value: "5 jobs", hint: "2 crews out" },
        { label: "This week", value: "28 jobs", hint: "6 working days" },
      ],
    },
  ],

  // ===== FINANCIAL =====
  "financial:revenue": [
    {
      kind: "trend",
      title: "Revenue by month",
      caption: "Recognized revenue per month",
      points: [
        { label: "Jan", value: 128, display: "$128k" },
        { label: "Feb", value: 142, display: "$142k" },
        { label: "Mar", value: 151, display: "$151k" },
        { label: "Apr", value: 139, display: "$139k" },
        { label: "May", value: 168, display: "$168k" },
        { label: "Jun", value: 182, display: "$182k" },
      ],
    },
    {
      kind: "bars",
      title: "Revenue by service",
      items: [
        { label: "Moving", value: 124000, display: "$124k" },
        { label: "Packing", value: 38600, display: "$38.6k" },
        { label: "Storage", value: 21400, display: "$21.4k" },
        { label: "Materials", value: 12800, display: "$12.8k" },
      ],
    },
    {
      kind: "table",
      title: "Revenue by customer",
      columns: ["Customer", "Jobs", "Revenue"],
      rows: [
        ["Northside Dental", "3", "$18,400"],
        ["Sunset Ridge", "5", "$14,200"],
        ["Brooks LLC", "2", "$9,800"],
        ["Patel family", "1", "$3,295"],
      ],
    },
  ],
  "financial:expenses": [
    { kind: "stat", title: "Labor", value: "$72,400", change: "58% of costs", trend: "neutral" },
    { kind: "stat", title: "Materials", value: "$14,800", change: "12% of costs", trend: "neutral" },
    { kind: "stat", title: "Fuel", value: "$8,200", change: "7% of costs", trend: "neutral" },
    { kind: "stat", title: "Other costs", value: "$28,600", change: "23% of costs", trend: "neutral" },
  ],
  "financial:payments": [
    { kind: "stat", title: "Deposits", value: "$42,300", change: "Collected this period", trend: "up" },
    { kind: "stat", title: "Outstanding balances", value: "$18,900", change: "11 open invoices", trend: "neutral" },
    {
      kind: "bars",
      title: "Payment methods",
      items: [
        { label: "Card", value: 48, display: "48%" },
        { label: "ACH / bank", value: 27, display: "27%" },
        { label: "Cash", value: 15, display: "15%" },
        { label: "Check", value: 10, display: "10%" },
      ],
    },
  ],
  "financial:profit-loss": [
    { kind: "stat", title: "Gross profit", value: "$72,800", change: "43.2% margin", trend: "up" },
    { kind: "stat", title: "Net profit", value: "$31,600", change: "18.8% margin", trend: "up" },
    {
      kind: "table",
      title: "P&L summary",
      columns: ["Line item", "Amount"],
      rows: [
        ["Revenue", "$168,400"],
        ["Cost of services", "-$95,600"],
        ["Gross profit", "$72,800"],
        ["Operating expenses", "-$41,200"],
        ["Net profit", "$31,600"],
      ],
    },
    {
      kind: "bars",
      title: "Profit margins",
      items: [
        { label: "Gross", value: 43, display: "43%" },
        { label: "Operating", value: 27, display: "27%" },
        { label: "Net", value: 19, display: "19%" },
      ],
    },
  ],

  // ===== PROFITABILITY =====
  "profitability:jobs": [
    {
      kind: "table",
      title: "Individual job profitability",
      columns: ["Job", "Revenue", "Cost", "Profit", "Margin"],
      rows: [
        ["MV-1042 Patel", "$1,895", "$1,212", "$683", "36%"],
        ["MV-1038 Chen", "$1,295", "$815", "$480", "37%"],
        ["MV-1044 Harrison", "$3,295", "$2,499", "$796", "24%"],
      ],
    },
    {
      kind: "table",
      title: "Estimated vs Actual",
      columns: ["Job", "Estimated", "Actual", "Variance"],
      rows: [
        ["MV-1042", "32%", "26%", "-6 pts"],
        ["MV-1038", "35%", "37%", "+2 pts"],
        ["MV-1044", "28%", "24%", "-4 pts"],
      ],
    },
    {
      kind: "bars",
      title: "Job cost breakdown",
      items: [
        { label: "Labor", value: 58, display: "58%" },
        { label: "Truck & fuel", value: 16, display: "16%" },
        { label: "Overhead", value: 14, display: "14%" },
        { label: "Materials", value: 12, display: "12%" },
      ],
    },
  ],
  "profitability:crews": [
    {
      kind: "bars",
      title: "Profit by crew",
      items: [
        { label: "Crew A — Marcus", value: 18600, display: "$18.6k" },
        { label: "Crew B — Diego", value: 14200, display: "$14.2k" },
        { label: "Crew C — Will", value: 9800, display: "$9.8k" },
        { label: "Crew D — Temp", value: 5400, display: "$5.4k" },
      ],
    },
    {
      kind: "bars",
      title: "Revenue per labor hour",
      items: [
        { label: "Crew A — Marcus", value: 96, display: "$96/h" },
        { label: "Crew B — Diego", value: 88, display: "$88/h" },
        { label: "Crew C — Will", value: 81, display: "$81/h" },
        { label: "Crew D — Temp", value: 72, display: "$72/h" },
      ],
    },
  ],
  "profitability:services": [
    { kind: "stat", title: "Moving", value: "$44,200", change: "29% margin", trend: "neutral" },
    { kind: "stat", title: "Packing", value: "$12,600", change: "32% margin", trend: "up" },
    { kind: "stat", title: "Storage", value: "$9,400", change: "61% margin", trend: "up" },
    {
      kind: "bars",
      title: "Profit by service",
      items: [
        { label: "Moving", value: 44200, display: "$44.2k" },
        { label: "Packing", value: 12600, display: "$12.6k" },
        { label: "Storage", value: 9400, display: "$9.4k" },
        { label: "Materials", value: 4800, display: "$4.8k" },
      ],
    },
  ],
  "profitability:lead-sources": [
    {
      kind: "bars",
      title: "Profit by source",
      items: [
        { label: "Referral", value: 24800, display: "$24.8k" },
        { label: "Website", value: 21200, display: "$21.2k" },
        { label: "Phone", value: 14600, display: "$14.6k" },
        { label: "Google", value: 4200, display: "$4.2k" },
      ],
    },
    {
      kind: "table",
      title: "Customer acquisition value",
      columns: ["Source", "CAC", "LTV", "LTV : CAC"],
      rows: [
        ["Referral", "$0", "$3,400", "∞"],
        ["Phone", "$36", "$3,100", "86x"],
        ["Website", "$48", "$2,900", "60x"],
        ["Google", "$162", "$2,600", "16x"],
      ],
    },
  ],

  // ===== SALES · CUSTOMERS (combined: overview + repeat customers + reviews) =====
  "sales:customers": [
    { kind: "stat", title: "Active customers", value: "486", change: "+31 this period", trend: "up" },
    { kind: "stat", title: "Repeat rate", value: "22%", change: "+3 pts", trend: "up" },
    { kind: "stat", title: "Lifetime value", value: "$3,180", change: "Avg per customer", trend: "up" },
    { kind: "stat", title: "Review score", value: "4.8 / 5", change: "212 reviews", trend: "up" },
    {
      kind: "trend",
      title: "Customer growth",
      caption: "New customers per month",
      points: [
        { label: "Jan", value: 18 },
        { label: "Feb", value: 22 },
        { label: "Mar", value: 19 },
        { label: "Apr", value: 26 },
        { label: "May", value: 24 },
        { label: "Jun", value: 31 },
      ],
    },
    {
      kind: "trend",
      title: "Reviews over time",
      caption: "New reviews per month",
      points: [
        { label: "Jan", value: 14 },
        { label: "Feb", value: 18 },
        { label: "Mar", value: 22 },
        { label: "Apr", value: 19 },
        { label: "May", value: 26 },
        { label: "Jun", value: 24 },
      ],
    },
    {
      kind: "bars",
      title: "Customers by city",
      items: [
        { label: "Cleveland", value: 142 },
        { label: "Lakewood", value: 78 },
        { label: "Westlake", value: 54 },
        { label: "Mentor", value: 41 },
        { label: "Akron", value: 33 },
      ],
    },
    {
      kind: "table",
      title: "Top repeat & referral customers",
      columns: ["Customer", "Referrals", "Revenue"],
      rows: [
        ["Sunset Ridge", "5", "$14,200"],
        ["Patel family", "3", "$6,400"],
        ["Brooks LLC", "2", "$4,100"],
      ],
    },
  ],

  // ===== SALES · AI & ESTIMATING (combined: quotes + accuracy + pricing) =====
  "sales:ai-estimating": [
    { kind: "stat", title: "AI quotes generated", value: "318", change: "72% of all quotes", trend: "up" },
    { kind: "stat", title: "Manual quotes", value: "124", change: "28% of all quotes", trend: "neutral" },
    { kind: "stat", title: "Est vs Actual hours", value: "+4.2%", change: "Slightly over estimate", trend: "neutral" },
    { kind: "stat", title: "Est vs Actual cost", value: "-1.8%", change: "Under estimate", trend: "up" },
    { kind: "stat", title: "Est vs Actual profit", value: "+2.6%", change: "Above plan", trend: "up" },
    { kind: "stat", title: "Underpriced jobs", value: "14", change: "$8.2k left on table", trend: "neutral" },
    { kind: "stat", title: "Overpriced jobs", value: "6", change: "9 quotes lost", trend: "neutral" },
    {
      kind: "bars",
      title: "Hourly vs Flat",
      items: [
        { label: "Flat rate", value: 246 },
        { label: "Hourly", value: 196 },
      ],
    },
    {
      kind: "trend",
      title: "Pricing trends",
      caption: "Average quote value per month",
      points: [
        { label: "Jan", value: 2180, display: "$2,180" },
        { label: "Feb", value: 2240, display: "$2,240" },
        { label: "Mar", value: 2210, display: "$2,210" },
        { label: "Apr", value: 2305, display: "$2,305" },
        { label: "May", value: 2360, display: "$2,360" },
        { label: "Jun", value: 2380, display: "$2,380" },
      ],
    },
    {
      kind: "table",
      title: "Recent quote accuracy",
      columns: ["Job", "AI quote", "Booked", "Variance"],
      rows: [
        ["MV-WEB-881 Okonkwo", "$1,245", "$1,295", "+4.0%"],
        ["MV-WEB-879 Rivera", "$1,895", "$1,895", "0.0%"],
        ["MV-1042 Patel", "$1,820", "$1,895", "+4.1%"],
      ],
    },
    {
      kind: "list",
      title: "AI recommendations",
      items: [
        { label: "Raise local hourly rate", value: "+$15/h", hint: "Demand up 12% in Cleveland" },
        { label: "Add stair surcharge", value: "+$45", hint: "Underbilled on 18 recent jobs" },
        { label: "Long-distance fuel adjustment", value: "+6%", hint: "Diesel up since Q1" },
      ],
    },
  ],
};
