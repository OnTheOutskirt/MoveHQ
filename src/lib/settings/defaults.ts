import {
  FALLBACK_ARRIVAL_WINDOW_MINUTES,
  FALLBACK_DEPOT_DRIVE_MINUTES,
  FALLBACK_FOLLOW_ON_ARRIVAL_END,
  FALLBACK_FOLLOW_ON_ARRIVAL_START,
} from "@/lib/moves/job-day-arrival";
import { DEFAULT_GOOGLE_REVIEW_MIN_STARS } from "@/lib/moves/move-feedback-portal";
import { FALLBACK_CREW_DEPARTURE_TIME } from "@/lib/moves/crew-departure";
import { DEFAULT_COMPANY_OPEN_DAYS } from "@/lib/settings/business-calendar";
import { defaultFieldCatalog, normalizeFieldCatalog } from "@/lib/settings/field-catalog-defaults";
import { defaultPipelineCopySettings } from "@/lib/settings/pipeline-copy";
import { defaultPipelineAutomations } from "@/lib/settings/pipeline-automation-rules";
import { defaultLeadRoutingRules } from "@/lib/settings/lead-routing-rules";
import { defaultMoveTypeRules } from "@/lib/settings/move-type-rules";
import { defaultOpsPrepRules } from "@/lib/settings/ops-prep-rules";
import { defaultPriorityTierRules } from "@/lib/settings/priority-tier-rules";
import { DEFAULT_TERMINOLOGY } from "@/lib/terminology/defaults";
import type { AppSettings } from "./types";

export { defaultDocumentTemplates } from "./document-template-normalize";

export const defaultSettings: AppSettings = {
  branding: {
    companyName: "Jonah's Movers",
    productName: "MoveHQ",
    logoDataUrl: null,
    accentColor: "#2563eb",
    sidebarColor: "#0f172a",
  },
  company: {
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    website: "",
    timezone: "America/Denver",
    businessHoursStart: "07:00",
    businessHoursEnd: "18:00",
    weekStartsOn: "monday",
    openDays: [...DEFAULT_COMPANY_OPEN_DAYS],
  },
  defaults: {
    depositMode: "fixed",
    depositValue: 100,
    quoteValidityDays: 14,
    defaultPricingType: "flat_rate",
    flatRateInventoryBasis: "cubic_feet",
    hourlyNotToExceedAmount: 25_000,
    defaultCrewDepartureTime: FALLBACK_CREW_DEPARTURE_TIME,
    defaultCustomerArrivalWindowMinutes: FALLBACK_ARRIVAL_WINDOW_MINUTES,
    defaultDepotToJobDriveMinutes: FALLBACK_DEPOT_DRIVE_MINUTES,
    defaultFollowOnArrivalStartTime: FALLBACK_FOLLOW_ON_ARRIVAL_START,
    defaultFollowOnArrivalEndTime: FALLBACK_FOLLOW_ON_ARRIVAL_END,
    postMoveGoogleReviewMinStars: DEFAULT_GOOGLE_REVIEW_MIN_STARS,
  },
  terminology: DEFAULT_TERMINOLOGY,
  automations: {
    notifyOfficeOnNewLead: true,
    sendQuoteConfirmationSms: true,
    sendBookingConfirmationEmail: true,
    dayBeforeCustomerReminder: true,
    dayBeforeCrewReminder: true,
    autoFollowUpOnQuoteSent: false,
  },
  followUps: {
    quotedFollowUpDays: 2,
    bookedCheckInDays: 3,
    waitingLeadFollowUpDays: 1,
    escalateOverdueAfterHours: 4,
    enableAutoQuotedFollowUp: true,
    enableAutoBookedCheckIn: true,
    enableWaitingLeadNudge: true,
  },
  pipelineCopy: defaultPipelineCopySettings(),
  fieldCatalog: defaultFieldCatalog(),
  priorityTierRules: defaultPriorityTierRules(),
  pipelineAutomations: defaultPipelineAutomations(),
  leadRouting: defaultLeadRoutingRules(),
  moveTypeRules: defaultMoveTypeRules(),
  opsPrepRules: defaultOpsPrepRules(defaultFieldCatalog().vendorTypes),
};
