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
  /** YouTube, Vimeo, or direct MP4 URL — shown on quote portal only. */
  videoUrl: string;
  showPricingSummary: boolean;
  showDepositLine: boolean;
  showSignatureBlock: boolean;
};

export type DocumentTemplate = {
  id: DocumentTemplateType;
  name: string;
  description: string;
  email: DocumentEmailSettings;
  portal: DocumentPortalSettings;
  updatedAt: string;
};

export const DOCUMENT_TEMPLATE_TYPES: DocumentTemplateType[] = ["quote", "contract"];
