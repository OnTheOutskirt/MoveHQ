export type DocumentTemplateType = "quote" | "contract";

export type DocumentEmailSettings = {
  subject: string;
  body: string;
};

export type DocumentPortalSettings = {
  headline: string;
  intro: string;
  mainContent: string;
  footerNote: string;
  /** Terms shown when pricing is hourly — customer opens in a modal. */
  termsHourly: string;
  /** Terms shown when pricing is flat rate — customer opens in a modal. */
  termsFlat: string;
  /** Checkbox on quote booking — distinct from general terms. */
  bookingCardChargeAcknowledgment: string;
  /** YouTube, Vimeo, or direct MP4 URL — shown on quote portal only. */
  videoUrl: string;
  showPricingSummary: boolean;
  /** Flat-rate all-in cost breakdown on quote/contract portal. */
  showFlatBreakdown: boolean;
  showContents: boolean;
  showDepositLine: boolean;
  showTerms: boolean;
  showValuation: boolean;
  /** When move is unregulated: hide valuation block or show explanatory notice. */
  unregulatedValuationDisplay: "hidden" | "notice";
  showSignatureBlock: boolean;
};

export type DocumentTemplate = {
  id: DocumentTemplateType;
  name: string;
  description: string;
  /** Override global branding accent for this document's customer portal. */
  accentColor: string | null;
  email: DocumentEmailSettings;
  portal: DocumentPortalSettings;
  updatedAt: string;
};

export const DOCUMENT_TEMPLATE_TYPES: DocumentTemplateType[] = ["quote", "contract"];
