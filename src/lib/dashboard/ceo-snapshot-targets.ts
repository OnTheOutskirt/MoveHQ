/** Default monthly CEO targets — replace with persisted company goals later. */
export type CeoMetricTargetKey =
  | "revenue"
  | "uncollected_revenue"
  | "gross_margin_pct"
  | "leads_by_move_date"
  | "conv_lead_contract_move_date"
  | "leads_created"
  | "booked_movers"
  | "fte"
  | "mover_utilization"
  | "local_rate_per_mover"
  | "billable_moving_hours"
  | "lom"
  | "hot_leads_move_date"
  | "hot_leads_conv_move_date"
  | "warm_leads_move_date"
  | "warm_leads_conv_move_date"
  | "new_referral_relationships"
  | "truck_utilization"
  | "open_claims"
  | "skipper_issues"
  | "driver_issues"
  | "team_issues"
  | "new_five_star_reviews"
  | "real_complaints"
  | "financial_concessions";

export const CEO_MONTHLY_TARGETS: Record<CeoMetricTargetKey, number> = {
  revenue: 300_000,
  uncollected_revenue: 5_000,
  gross_margin_pct: 56,
  leads_by_move_date: 360,
  conv_lead_contract_move_date: 35,
  leads_created: 450,
  booked_movers: 410,
  fte: 25,
  mover_utilization: 95,
  local_rate_per_mover: 72,
  billable_moving_hours: 3_400,
  lom: 7.8,
  hot_leads_move_date: 160,
  hot_leads_conv_move_date: 65,
  warm_leads_move_date: 200,
  warm_leads_conv_move_date: 30,
  new_referral_relationships: 3,
  truck_utilization: 85,
  open_claims: 10,
  skipper_issues: 20,
  driver_issues: 19,
  team_issues: 19,
  new_five_star_reviews: 10,
  real_complaints: 5,
  financial_concessions: 0,
};
