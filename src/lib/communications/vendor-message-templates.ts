import { formatMoveDate } from "@/lib/moves/format";
import type { MoveRecord } from "@/lib/moves/types";
import { formatClaimMoney } from "@/lib/operations/claims";
import type { MoveClaim } from "@/lib/operations/claims-types";
import { claimVendorLabel } from "@/lib/operations/claims-vendors";
import { catalogVendorTypeLabel } from "@/lib/settings/field-catalog-runtime";
import {
  buildMessageTemplateContext,
  buildMessageTemplateContextFromMove,
  firstNameFromFullName,
} from "./message-templates";
import { defaultVendorMessageTemplates } from "./vendor-message-templates-defaults";
import { loadVendorMessageTemplates } from "./vendor-message-templates-storage";
import type {
  VendorMessageTemplateContext,
  VendorMessageTemplatesStore,
  VendorTypeMessageTemplates,
} from "./vendor-message-templates-types";

export type {
  VendorMessageTemplateContext,
  VendorMessageTemplatesStore,
  VendorTypeMessageTemplates,
} from "./vendor-message-templates-types";

export {
  VENDOR_MESSAGE_TEMPLATE_MERGE_FIELDS,
  VENDOR_MESSAGE_TEMPLATES_UPDATED_EVENT,
} from "./vendor-message-templates-types";

export {
  defaultVendorMessageTemplates,
} from "./vendor-message-templates-defaults";

export {
  loadVendorMessageTemplates,
  mergeVendorMessageTemplates,
  resetVendorTypeTemplates,
  saveVendorMessageTemplates,
  vendorMessageTemplatesSnapshot,
} from "./vendor-message-templates-storage";

export function getVendorMessageTemplatesStore(): VendorMessageTemplatesStore {
  return loadVendorMessageTemplates();
}

export function getVendorTypeTemplate(vendorTypeId: string): VendorTypeMessageTemplates {
  const store = getVendorMessageTemplatesStore();
  return (
    store[vendorTypeId] ??
    defaultVendorMessageTemplates()[vendorTypeId] ??
    defaultVendorMessageTemplates()[Object.keys(defaultVendorMessageTemplates())[0]!]
  );
}

function fillVendorTemplateString(text: string, context: VendorMessageTemplateContext): string {
  const fullName = context.customerName || context.contactName || "";
  const firstName = firstNameFromFullName(fullName);
  const company = context.companyName ?? "our team";
  const phone = context.companyPhone ?? "";

  return text
    .replace(/\{\{vendorName\}\}/g, context.vendorName ?? "there")
    .replace(/\{\{vendorType\}\}/g, context.vendorType ?? "vendor")
    .replace(/\{\{claimReference\}\}/g, context.claimReference ?? "claim")
    .replace(/\{\{claimTitle\}\}/g, context.claimTitle ?? "Customer issue")
    .replace(/\{\{claimAmount\}\}/g, context.claimAmount ?? "—")
    .replace(/\{\{damageDetails\}\}/g, context.damageDetails ?? "See attached photos and move notes.")
    .replace(/\{\{moveReference\}\}/g, context.moveReference ?? "move")
    .replace(/\{\{firstName\}\}/g, firstName)
    .replace(/\{\{name\}\}/g, firstName)
    .replace(/\{\{fullName\}\}/g, fullName || "the customer")
    .replace(/\{\{moveDate\}\}/g, context.moveDate ?? "the move date")
    .replace(/\{\{origin\}\}/g, context.origin ?? "origin")
    .replace(/\{\{destination\}\}/g, context.destination ?? "destination")
    .replace(/\{\{rep\}\}/g, context.assignedRep ?? "our team")
    .replace(/\{\{company\}\}/g, company)
    .replace(/\{\{phone\}\}/g, phone || "our office");
}

export function fillVendorSmsTemplate(
  template: VendorTypeMessageTemplates,
  context: VendorMessageTemplateContext,
): string {
  return fillVendorTemplateString(template.smsBody, context);
}

export function fillVendorEmailTemplate(
  template: VendorTypeMessageTemplates,
  context: VendorMessageTemplateContext,
): { subject: string; body: string } {
  return {
    subject: fillVendorTemplateString(template.emailSubject, context),
    body: fillVendorTemplateString(template.emailBody, context),
  };
}

export function buildClaimVendorTemplateContext(input: {
  claim: MoveClaim;
  move?: MoveRecord;
  vendorTypeId: string;
  vendorDirectoryId?: string;
}): VendorMessageTemplateContext {
  const moveContext = input.move
    ? buildMessageTemplateContextFromMove(input.move)
    : buildMessageTemplateContext({
        customerName: input.claim.customerName,
        moveReference: input.claim.moveReference,
      });

  const damageDetails =
    input.claim.damageDocumentation?.trim() ||
    input.claim.description?.trim() ||
    input.claim.title;

  return {
    ...moveContext,
    moveReference: input.claim.moveReference,
    vendorName: input.vendorDirectoryId
      ? claimVendorLabel(input.vendorDirectoryId)
      : undefined,
    vendorType: catalogVendorTypeLabel(input.vendorTypeId),
    claimReference: input.claim.reference,
    claimTitle: input.claim.title,
    claimAmount:
      input.claim.amountClaimed > 0
        ? formatClaimMoney(input.claim.amountClaimed)
        : undefined,
    damageDetails,
  };
}
