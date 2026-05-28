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
};

import type { TerminologySettings } from "@/lib/terminology/types";

export type DefaultsSettings = {
  depositPercent: number;
  quoteValidityDays: number;
  businessHoursStart: string;
  businessHoursEnd: string;
  defaultPricingType: "hourly" | "flat_rate";
};

export type AppSettings = {
  branding: BrandingSettings;
  company: CompanySettings;
  defaults: DefaultsSettings;
  terminology: TerminologySettings;
};

export type DocumentTemplateType =
  | "quote"
  | "contract"
  | "proposal"
  | "confirmation"
  | "waiver";

export type DocumentTemplate = {
  id: DocumentTemplateType;
  name: string;
  description: string;
  body: string;
  updatedAt: string;
};
