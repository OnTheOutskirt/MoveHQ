/** In-tab section anchors for move detail workspace tabs. */

export const SCOPE_SECTION_IDS = {
  moveDetails: "scope-move-details",
  locations: "scope-locations",
  inventory: "scope-inventory",
  appliances: "scope-appliances",
  wardrobe: "scope-wardrobe",
  specialty: "scope-specialty",
} as const;

export const MOVE_PLAN_SECTION_IDS = {
  jobDays: "plan-job-days",
  ...SCOPE_SECTION_IDS,
} as const;

/** Move Scope tab: job days first, then scope sections. */
export const MOVE_PLAN_SECTIONS = [
  { id: MOVE_PLAN_SECTION_IDS.jobDays, label: "Job days" },
  { id: MOVE_PLAN_SECTION_IDS.moveDetails, label: "Move Details" },
  { id: MOVE_PLAN_SECTION_IDS.locations, label: "Locations & Access" },
  { id: MOVE_PLAN_SECTION_IDS.inventory, label: "Inventory" },
  { id: MOVE_PLAN_SECTION_IDS.appliances, label: "Appliances" },
  { id: MOVE_PLAN_SECTION_IDS.wardrobe, label: "Wardrobe boxes" },
  { id: MOVE_PLAN_SECTION_IDS.specialty, label: "Specialty & high-value" },
] as const;

export const QUOTE_CONTRACT_SECTION_IDS = {
  pricing: "qc-pricing",
  liability: "qc-liability",
  contracts: "qc-contracts",
  payment: "qc-payment",
} as const;

export const QUOTE_CONTRACT_SECTIONS = [
  { id: QUOTE_CONTRACT_SECTION_IDS.pricing, label: "Quote" },
  { id: QUOTE_CONTRACT_SECTION_IDS.liability, label: "Liability" },
  { id: QUOTE_CONTRACT_SECTION_IDS.contracts, label: "Contracts" },
  { id: QUOTE_CONTRACT_SECTION_IDS.payment, label: "Payment" },
] as const;

export const OPERATIONS_SECTION_IDS = {
  moveDays: "ops-move-days",
  claims: "ops-claims",
  dispatch: "ops-dispatch",
} as const;

export const OPERATIONS_SECTIONS = [
  { id: OPERATIONS_SECTION_IDS.moveDays, label: "Move days" },
  { id: OPERATIONS_SECTION_IDS.claims, label: "Claims" },
  { id: OPERATIONS_SECTION_IDS.dispatch, label: "Dispatch" },
] as const;

export const PROFITABILITY_SECTION_IDS = {
  summary: "profit-summary",
  costBreakdown: "profit-cost-breakdown",
  byJobDay: "profit-by-job-day",
} as const;

export const PROFITABILITY_SECTIONS = [
  { id: PROFITABILITY_SECTION_IDS.summary, label: "Summary" },
  { id: PROFITABILITY_SECTION_IDS.costBreakdown, label: "Cost breakdown" },
  { id: PROFITABILITY_SECTION_IDS.byJobDay, label: "By job day" },
] as const;

export type MoveDetailSectionItem = { id: string; label: string };
