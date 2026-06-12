export type BrandingSettings = {
  companyName: string;
  productName: string;
  logoDataUrl: string | null;
  accentColor: string;
  sidebarColor: string;
};

import type { WeekdayId } from "@/lib/operations/fleet-types";
import type { PipelineCopySettings } from "@/lib/settings/pipeline-copy";
import type { FieldCatalogSettings } from "@/lib/settings/field-catalog-types";
import type { PipelineAutomationSettings } from "@/lib/settings/pipeline-automation-rules";
import type { LeadRoutingSettings } from "@/lib/settings/lead-routing-rules";
import type { MoveTypeRulesSettings } from "@/lib/settings/move-type-rules";
import type { OpsPrepRulesSettings } from "@/lib/settings/ops-prep-rules";
import type { PriorityTierRulesSettings } from "@/lib/settings/priority-tier-rules";
import type { TerminologySettings } from "@/lib/terminology/types";

export type WeekStartsOn = "sunday" | "monday";

export type CompanySettings = {
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  website: string;
  timezone: string;
  businessHoursStart: string;
  businessHoursEnd: string;
  weekStartsOn: WeekStartsOn;
  /** Days the business operates (0 = Sun … 6 = Sat). */
  openDays: WeekdayId[];
};

export type DepositDefaultMode = "percent" | "fixed";

export type FlatRateInventoryBasis = "cubic_feet" | "weight";

export type DefaultsSettings = {
  depositMode: DepositDefaultMode;
  /** Percent (0–100) when mode is percent; dollars when mode is fixed. */
  depositValue: number;
  quoteValidityDays: number;
  defaultPricingType: "hourly" | "flat_rate";
  /** Whether AI flat-rate quotes and inventory display use cubic feet or weight. */
  flatRateInventoryBasis: FlatRateInventoryBasis;
  /** Hourly jobs: not-to-exceed ceiling shown on quotes and contracts. */
  hourlyNotToExceedAmount: number;
  /** Crew shop departure default for new job days (24-hour HH:mm, e.g. "07:15"). */
  defaultCrewDepartureTime: string;
  /** Customer-facing arrival window length for first-job mornings (minutes). */
  defaultCustomerArrivalWindowMinutes: 30 | 45 | 60;
  /** Fallback depot → first job drive time until Google Maps is connected (minutes). */
  defaultDepotToJobDriveMinutes: number;
  /** Follow-on job flexible arrival window start (24-hour HH:mm, e.g. "11:00"). */
  defaultFollowOnArrivalStartTime: string;
  /** Follow-on job flexible arrival window end (24-hour HH:mm, e.g. "16:00"). */
  defaultFollowOnArrivalEndTime: string;
  /** Minimum crew rating (1–5) before offering the Google review link on the feedback portal. */
  postMoveGoogleReviewMinStars: 3 | 4 | 5;
};

export type AutomationSettings = {
  notifyOfficeOnNewLead: boolean;
  sendQuoteConfirmationSms: boolean;
  sendBookingConfirmationEmail: boolean;
  dayBeforeCustomerReminder: boolean;
  dayBeforeCrewReminder: boolean;
  autoFollowUpOnQuoteSent: boolean;
};

export type FollowUpSettings = {
  quotedFollowUpDays: number;
  bookedCheckInDays: number;
  waitingLeadFollowUpDays: number;
  escalateOverdueAfterHours: number;
  enableAutoQuotedFollowUp: boolean;
  enableAutoBookedCheckIn: boolean;
  enableWaitingLeadNudge: boolean;
};

export type AppSettings = {
  branding: BrandingSettings;
  company: CompanySettings;
  defaults: DefaultsSettings;
  terminology: TerminologySettings;
  automations: AutomationSettings;
  followUps: FollowUpSettings;
  pipelineCopy: PipelineCopySettings;
  fieldCatalog: FieldCatalogSettings;
  priorityTierRules: PriorityTierRulesSettings;
  pipelineAutomations: PipelineAutomationSettings;
  leadRouting: LeadRoutingSettings;
  moveTypeRules: MoveTypeRulesSettings;
  opsPrepRules: OpsPrepRulesSettings;
};

export type {
  DocumentEmailSettings,
  DocumentPortalSettings,
  DocumentTemplate,
  DocumentTemplateType,
} from "@/lib/settings/document-template-types";
export { DOCUMENT_TEMPLATE_TYPES } from "@/lib/settings/document-template-types";
