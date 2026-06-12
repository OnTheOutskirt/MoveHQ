import { defaultFieldCatalog } from "@/lib/settings/field-catalog-defaults";
import type { FieldCatalogEntry } from "@/lib/settings/field-catalog-types";
import type {
  VendorMessageTemplatesStore,
  VendorTypeMessageTemplates,
} from "./vendor-message-templates-types";

function defaultTemplateForVendorType(
  vendorTypeId: string,
  label: string,
): VendorTypeMessageTemplates {
  const typeLabel = label.toLowerCase();
  const claimBlock =
    vendorTypeId === "claim_repairs"
      ? "Issue / damage details:\n{{damageDetails}}\n\nClaimed amount: {{claimAmount}}\n"
      : "Scope / notes:\n{{damageDetails}}\n";

  return {
    vendorTypeId,
    smsBody: `Hi {{vendorName}} — {{company}} has a ${typeLabel} referral for move {{moveReference}} ({{customerName}}). Details in email — please confirm receipt.`,
    emailSubject: `${label} referral — {{moveReference}} · {{customerName}}`,
    emailBody: `Hi {{vendorName}},

We're reaching out regarding a ${typeLabel} need tied to a customer move.

Customer: {{fullName}}
Move: {{moveReference}} on {{moveDate}}
Route: {{origin}} → {{destination}}
Claim: {{claimReference}} — {{claimTitle}}

${claimBlock}
Please reply with availability, quote, or next steps.

Thank you,
{{company}}
{{phone}}`,
  };
}

export function defaultVendorMessageTemplates(
  vendorTypes: FieldCatalogEntry[] = defaultFieldCatalog().vendorTypes,
): VendorMessageTemplatesStore {
  const store: VendorMessageTemplatesStore = {};
  for (const entry of vendorTypes) {
    store[entry.id] = defaultTemplateForVendorType(entry.id, entry.label);
  }
  return store;
}
