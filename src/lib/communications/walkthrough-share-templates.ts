import { firstNameFromFullName } from "./message-templates";
import { formatMoveDate } from "@/lib/moves/format";
import { defaultSettings } from "@/lib/settings/defaults";
import { loadSettings } from "@/lib/settings/storage";
import { defaultWalkthroughShareTemplates } from "./walkthrough-share-templates-defaults";
import { loadWalkthroughShareTemplates } from "./walkthrough-share-templates-storage";
import type {
  WalkthroughShareFillContext,
  WalkthroughShareKind,
  WalkthroughShareTemplates,
} from "./walkthrough-share-templates-types";

export type {
  WalkthroughShareFillContext,
  WalkthroughShareKind,
  WalkthroughShareTemplateSet,
  WalkthroughShareTemplates,
} from "./walkthrough-share-templates-types";

export {
  WALKTHROUGH_SHARE_KIND_OPTIONS,
  WALKTHROUGH_SHARE_MERGE_FIELDS,
  WALKTHROUGH_SHARE_TEMPLATES_UPDATED_EVENT,
} from "./walkthrough-share-templates-types";

export {
  defaultWalkthroughShareTemplates,
  DEFAULT_WALKTHROUGH_SHARE_TEMPLATES,
} from "./walkthrough-share-templates-defaults";

export {
  loadWalkthroughShareTemplates,
  saveWalkthroughShareTemplates,
  walkthroughShareTemplatesSnapshot,
} from "./walkthrough-share-templates-storage";

export function getWalkthroughShareTemplates(): WalkthroughShareTemplates {
  return loadWalkthroughShareTemplates();
}

export function buildWalkthroughShareFillContext(input: {
  customerName: string;
  moveReference?: string;
  preferredDate?: string;
  linkUrl: string;
  assignee?: string;
  slotLabel?: string;
  cancelLinkUrl?: string;
  walkthroughMode?: "in_person" | "virtual";
  walkthroughLocation?: string;
}): WalkthroughShareFillContext {
  const fullName = input.customerName.split("(")[0]?.trim() || input.customerName;
  const firstName = firstNameFromFullName(fullName);
  const assignee = input.assignee?.trim() ?? "";
  const slot = input.slotLabel?.trim() ?? "";
  const company =
    typeof window !== "undefined"
      ? loadSettings().branding.companyName || defaultSettings.branding.companyName
      : defaultSettings.branding.companyName;
  const moveDate = input.preferredDate ? formatMoveDate(input.preferredDate) : "";

  let slot_sentence = "Your virtual walkthrough is ready.";
  if (slot && assignee) {
    slot_sentence = `Your virtual walkthrough with ${assignee} is ${slot}.`;
  } else if (slot) {
    slot_sentence = `Your virtual walkthrough is ${slot}.`;
  } else if (assignee) {
    slot_sentence = `Your virtual walkthrough with ${assignee} is ready.`;
  }

  const slot_sms = slot ? `virtual walkthrough ${slot}` : "join your virtual walkthrough";
  const cancelLink = input.cancelLinkUrl?.trim() ?? "";
  const mode =
    input.walkthroughMode === "virtual"
      ? "Virtual"
      : input.walkthroughMode === "in_person"
        ? "In-person"
        : "";
  const location_line =
    input.walkthroughMode === "virtual"
      ? "Join via video call — link sent separately for virtual walkthroughs."
      : input.walkthroughLocation?.trim()
        ? `Location: ${input.walkthroughLocation.trim()}`
        : "";

  return {
    firstName,
    fullName,
    link: input.linkUrl,
    assignee,
    assignee_with: assignee ? ` with ${assignee}` : "",
    company,
    moveDate,
    slot,
    slot_sentence,
    slot_sms,
    cancelLink,
    mode,
    location_line,
  };
}

function fillTemplateString(text: string, context: WalkthroughShareFillContext): string {
  return text
    .replace(/\{\{firstName\}\}/g, context.firstName)
    .replace(/\{\{name\}\}/g, context.firstName)
    .replace(/\{\{fullName\}\}/g, context.fullName)
    .replace(/\{\{link\}\}/g, context.link)
    .replace(/\{\{assignee\}\}/g, context.assignee)
    .replace(/\{\{assignee_with\}\}/g, context.assignee_with)
    .replace(/\{\{company\}\}/g, context.company)
    .replace(/\{\{moveDate\}\}/g, context.moveDate || "your move date")
    .replace(/\{\{slot\}\}/g, context.slot)
    .replace(/\{\{slot_sentence\}\}/g, context.slot_sentence)
    .replace(/\{\{slot_sms\}\}/g, context.slot_sms)
    .replace(/\{\{cancelLink\}\}/g, context.cancelLink)
    .replace(/\{\{mode\}\}/g, context.mode)
    .replace(/\{\{location_line\}\}/g, context.location_line)
    .replace(/\{\{reference\}\}/g, "");
}

export function fillWalkthroughShareEmail(
  kind: WalkthroughShareKind,
  context: WalkthroughShareFillContext,
  templates: WalkthroughShareTemplates = getWalkthroughShareTemplates(),
): { subject: string; body: string } {
  const set = templates[kind] ?? defaultWalkthroughShareTemplates()[kind];
  return {
    subject: fillTemplateString(set.emailSubject, context),
    body: fillTemplateString(set.emailBody, context),
  };
}

export function fillWalkthroughShareSms(
  kind: WalkthroughShareKind,
  context: WalkthroughShareFillContext,
  templates: WalkthroughShareTemplates = getWalkthroughShareTemplates(),
): string {
  const set = templates[kind] ?? defaultWalkthroughShareTemplates()[kind];
  return fillTemplateString(set.smsBody, context);
}
