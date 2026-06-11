import {
  defaultDocumentTemplate,
  defaultDocumentTemplates,
} from "./document-template-defaults";
import type { DocumentTemplate, DocumentTemplateType } from "./document-template-types";
import { DOCUMENT_TEMPLATE_TYPES } from "./document-template-types";

type LegacyDocumentTemplate = {
  id?: string;
  name?: string;
  description?: string;
  body?: string;
  email?: Partial<DocumentTemplate["email"]>;
  portal?: Partial<DocumentTemplate["portal"]>;
  updatedAt?: string;
};

export function normalizeDocumentTemplates(raw: unknown): DocumentTemplate[] {
  const defaults = defaultDocumentTemplates();
  if (!Array.isArray(raw)) return defaults;

  const byId = new Map<DocumentTemplateType, DocumentTemplate>();

  for (const item of raw as LegacyDocumentTemplate[]) {
    const id = item.id;
    if (id !== "quote" && id !== "contract") continue;

    const base = defaultDocumentTemplate(id);
    byId.set(id, {
      ...base,
      name: item.name ?? base.name,
      description: item.description ?? base.description,
      accentColor:
        typeof (item as { accentColor?: unknown }).accentColor === "string"
          ? (item as { accentColor: string }).accentColor
          : (item as { accentColor?: null }).accentColor === null
            ? null
            : base.accentColor,
      email: {
        subject: item.email?.subject ?? base.email.subject,
        body: item.email?.body ?? (item.body ? migrateBodyToEmail(item.body, id) : base.email.body),
      },
      portal: {
        ...base.portal,
        ...item.portal,
        termsHourly: item.portal?.termsHourly ?? base.portal.termsHourly,
        termsFlat: item.portal?.termsFlat ?? base.portal.termsFlat,
        showTerms: item.portal?.showTerms ?? base.portal.showTerms,
        showValuation: item.portal?.showValuation ?? base.portal.showValuation,
        showContents: item.portal?.showContents ?? base.portal.showContents,
        showFlatBreakdown: item.portal?.showFlatBreakdown ?? base.portal.showFlatBreakdown,
        bookingCardChargeAcknowledgment:
          item.portal?.bookingCardChargeAcknowledgment ??
          base.portal.bookingCardChargeAcknowledgment,
        unregulatedValuationDisplay:
          item.portal?.unregulatedValuationDisplay ?? base.portal.unregulatedValuationDisplay,
        mainContent:
          item.portal?.mainContent ??
          (item.body && !item.email?.body ? migrateBodyToPortal(item.body) : base.portal.mainContent),
      },
      updatedAt: item.updatedAt ?? base.updatedAt,
    });
  }

  return DOCUMENT_TEMPLATE_TYPES.map((id) => byId.get(id) ?? defaultDocumentTemplate(id));
}

function migrateBodyToEmail(body: string, id: DocumentTemplateType): string {
  if (id === "quote") {
    return `Hi {{customer_first_name}},\n\nPlease review your moving quote:\n\n{{portal_link}}\n\nThank you,\n{{company_name}}`;
  }
  return `Hi {{customer_first_name}},\n\nPlease sign your moving agreement:\n\n{{portal_link}}\n\nThank you,\n{{company_name}}`;
}

function migrateBodyToPortal(body: string): string {
  return body;
}

export { defaultDocumentTemplates, defaultDocumentTemplate };
