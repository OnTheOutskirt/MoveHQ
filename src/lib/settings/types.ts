export type BrandingSettings = {
  companyName: string;
  productName: string;
  logoDataUrl: string | null;
  accentColor: string;
  sidebarColor: string;
};

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
};

export type DepositDefaultMode = "percent" | "fixed";

import type { PipelineCopySettings } from "@/lib/settings/pipeline-copy";
import type { FieldCatalogSettings } from "@/lib/settings/field-catalog-types";
import type { TerminologySettings } from "@/lib/terminology/types";

export type DefaultsSettings = {
  depositMode: DepositDefaultMode;
  /** Percent (0–100) when mode is percent; dollars when mode is fixed. */
  depositValue: number;
  quoteValidityDays: number;
  defaultPricingType: "hourly" | "flat_rate";
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
};

export type {
  DocumentEmailSettings,
  DocumentPortalSettings,
  DocumentTemplate,
  DocumentTemplateType,
} from "@/lib/settings/document-template-types";
export { DOCUMENT_TEMPLATE_TYPES } from "@/lib/settings/document-template-types";
