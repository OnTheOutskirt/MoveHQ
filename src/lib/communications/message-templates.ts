import { formatMoveDate } from "@/lib/moves/format";
import { buildMoveFeedbackPortalUrl } from "@/lib/moves/move-feedback-portal";
import { defaultSettings } from "@/lib/settings/defaults";
import { loadSettings } from "@/lib/settings/storage";
import { googleReviewUrlForLocation } from "@/lib/workspace/location-profile";
import { loadWorkspaceConfig } from "@/lib/workspace/storage";
import { loadMessageTemplates } from "./message-templates-storage";
import type {
  MessageChannel,
  MessageTemplate,
  MessageTemplateCategory,
  MessageTemplateContext,
} from "./message-templates-types";

export type {
  MessageChannel,
  MessageTemplate,
  MessageTemplateCategory,
  MessageTemplateContext,
  MessageTemplateEditorChannel,
} from "./message-templates-types";

export {
  MESSAGE_TEMPLATE_MERGE_FIELDS,
  MESSAGE_TEMPLATES_UPDATED_EVENT,
} from "./message-templates-types";

export { defaultMessageTemplates, DEFAULT_MESSAGE_TEMPLATES } from "./message-templates-defaults";
export {
  loadMessageTemplates,
  saveMessageTemplates,
  templatesSnapshot,
  generateMessageTemplateId,
  resetChannelTemplates,
  resetCategoryTemplates,
} from "./message-templates-storage";

export function getMessageTemplates(): MessageTemplate[] {
  return loadMessageTemplates();
}

export function templatesForChannel(
  channel: MessageChannel,
  category?: MessageTemplateCategory,
): MessageTemplate[] {
  return getMessageTemplates().filter((t) => {
    if (t.channel !== channel) return false;
    if (!category) return true;
    return (t.category ?? "sales") === category;
  });
}

export function firstNameFromFullName(full?: string): string {
  if (!full?.trim()) return "there";
  const base = full.split("(")[0]?.trim() || full.trim();
  const first = base.split(/\s+/)[0]?.trim();
  return first || "there";
}

function cityFromAddress(address?: string): string {
  if (!address?.trim()) return "";
  const parts = address.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) return parts[parts.length - 2] ?? parts[0] ?? "";
  return parts[0] ?? "";
}

function companyNameFromSettings(): string {
  if (typeof window === "undefined") return defaultSettings.branding.companyName;
  return loadSettings().branding.companyName || defaultSettings.branding.companyName;
}

function companyPhoneFromSettings(): string {
  if (typeof window === "undefined") return defaultSettings.company.phone;
  return loadSettings().company.phone || defaultSettings.company.phone;
}

function reviewLinkForLocation(locationId?: string): string {
  if (typeof window === "undefined") return "";
  const config = loadWorkspaceConfig();
  return googleReviewUrlForLocation(config.locations, locationId);
}

export function buildMessageTemplateContext(input: {
  customerName?: string;
  contactName?: string;
  moveReference?: string;
  preferredDate?: string;
  originAddress?: string;
  destinationAddress?: string;
  assignedRep?: string;
  portalLink?: string;
  feedbackLink?: string;
  reviewLink?: string;
  locationId?: string;
}): MessageTemplateContext {
  const fullName = input.customerName || input.contactName;
  return {
    customerName: input.customerName,
    contactName: input.contactName,
    moveReference: input.moveReference,
    moveDate: input.preferredDate ? formatMoveDate(input.preferredDate) : undefined,
    origin: cityFromAddress(input.originAddress),
    destination: cityFromAddress(input.destinationAddress),
    assignedRep: input.assignedRep,
    companyName: companyNameFromSettings(),
    companyPhone: companyPhoneFromSettings(),
    portalLink: input.portalLink,
    feedbackLink: input.feedbackLink,
    reviewLink:
      input.reviewLink?.trim() ||
      reviewLinkForLocation(input.locationId),
  };
}

export function buildMessageTemplateContextFromMove(
  move: Pick<
    import("@/lib/moves/types").MoveRecord,
    | "customerName"
    | "reference"
    | "preferredDate"
    | "originAddress"
    | "destinationAddress"
    | "assignedRep"
  > & {
    id?: string;
    locationId?: string;
  },
): MessageTemplateContext {
  return buildMessageTemplateContext({
    customerName: move.customerName,
    moveReference: move.reference,
    preferredDate: move.preferredDate,
    originAddress: move.originAddress,
    destinationAddress: move.destinationAddress,
    assignedRep: move.assignedRep,
    locationId: move.locationId,
    feedbackLink: move.id ? buildMoveFeedbackPortalUrl(move.id) : undefined,
  });
}

export function fillMessageTemplate(
  template: MessageTemplate,
  context: MessageTemplateContext,
): string {
  return fillTemplateString(template.body, context);
}

export function fillEmailTemplate(
  template: MessageTemplate,
  context: MessageTemplateContext,
): { subject: string; body: string } {
  const defaultSubject = `Message from ${context.companyName ?? companyNameFromSettings()}`;

  return {
    subject: fillTemplateString(template.subject?.trim() || defaultSubject, context),
    body: fillTemplateString(template.body, context),
  };
}

function fillTemplateString(text: string, context: MessageTemplateContext): string {
  const fullName = context.customerName || context.contactName || "";
  const firstName = firstNameFromFullName(fullName);
  const company = context.companyName ?? companyNameFromSettings();
  const phone = context.companyPhone ?? companyPhoneFromSettings();

  return text
    .replace(/\{\{firstName\}\}/g, firstName)
    .replace(/\{\{name\}\}/g, firstName)
    .replace(/\{\{fullName\}\}/g, fullName || "there")
    .replace(/\{\{moveDate\}\}/g, context.moveDate ?? "your move date")
    .replace(/\{\{origin\}\}/g, context.origin ?? "origin")
    .replace(/\{\{destination\}\}/g, context.destination ?? "destination")
    .replace(/\{\{rep\}\}/g, context.assignedRep ?? "your rep")
    .replace(/\{\{company\}\}/g, company)
    .replace(/\{\{phone\}\}/g, phone || "our office")
    .replace(/\{\{time\}\}/g, "this afternoon")
    .replace(/\{\{reference\}\}/g, "")
    .replace(/\{\{portalLink\}\}/g, context.portalLink ?? "your customer portal link")
    .replace(
      /\{\{feedbackLink\}\}/g,
      context.feedbackLink?.trim() || "your crew feedback portal link",
    )
    .replace(/\{\{reviewLink\}\}/g, context.reviewLink?.trim() || "your Google review link");
}

export function draftMessageWithAi(
  channel: MessageChannel,
  context: MessageTemplateContext,
): string {
  const firstName = firstNameFromFullName(context.customerName || context.contactName);
  const company = context.companyName ?? companyNameFromSettings();

  if (channel === "call") {
    return `Called ${firstName}. Brief, friendly check-in — confirmed they're still planning the move and offered to answer any questions. Next step: send contract if ready.`;
  }

  if (channel === "email") {
    return `Hi ${firstName},\n\nI wanted to follow up on your move. Please let me know if you have any questions about the estimate, timing, or next steps — happy to help you get scheduled.\n\nBest regards,`;
  }

  return `Hi ${firstName}! Quick check-in from ${company} — wanted to see if you had any questions about your estimate or if you're ready to pick a date. Happy to help whenever works for you.`;
}
