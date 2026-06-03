import { defaultFieldCatalog, normalizeFieldCatalog } from "@/lib/settings/field-catalog-defaults";
import { defaultPipelineCopySettings } from "@/lib/settings/pipeline-copy";
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
  },
  defaults: {
    depositMode: "fixed",
    depositValue: 100,
    quoteValidityDays: 14,
    defaultPricingType: "flat_rate",
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
};
