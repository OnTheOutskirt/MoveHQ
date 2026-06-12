import type { MessageTemplateContext } from "./message-templates-types";

export type VendorTypeMessageTemplates = {
  vendorTypeId: string;
  smsBody: string;
  emailSubject: string;
  emailBody: string;
};

/** Keyed by vendor type id from Setup → Pipeline & fields. */
export type VendorMessageTemplatesStore = Record<string, VendorTypeMessageTemplates>;

export type VendorMessageTemplateContext = MessageTemplateContext & {
  vendorName?: string;
  vendorType?: string;
  claimReference?: string;
  claimTitle?: string;
  claimAmount?: string;
  damageDetails?: string;
  moveReference?: string;
};

export const VENDOR_MESSAGE_TEMPLATE_MERGE_FIELDS = [
  { token: "{{vendorName}}", label: "Vendor name" },
  { token: "{{vendorType}}", label: "Vendor type label" },
  { token: "{{claimReference}}", label: "Claim reference (e.g. CLM-1042)" },
  { token: "{{claimTitle}}", label: "Claim title" },
  { token: "{{claimAmount}}", label: "Amount claimed" },
  { token: "{{damageDetails}}", label: "Issue / damage documentation" },
  { token: "{{moveReference}}", label: "Move reference" },
  { token: "{{firstName}}", label: "Customer first name" },
  { token: "{{fullName}}", label: "Customer full name" },
  { token: "{{moveDate}}", label: "Move date" },
  { token: "{{origin}}", label: "Origin city" },
  { token: "{{destination}}", label: "Destination city" },
  { token: "{{rep}}", label: "Assigned sales rep" },
  { token: "{{company}}", label: "Company name" },
  { token: "{{phone}}", label: "Company phone" },
] as const;

export const VENDOR_MESSAGE_TEMPLATES_UPDATED_EVENT = "jm-vendor-message-templates-updated";
