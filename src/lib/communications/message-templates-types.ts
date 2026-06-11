export type MessageChannel = "call" | "sms" | "email";

export type MessageTemplateCategory = "sales" | "ops" | "automations";

export type MessageTemplateContext = {
  customerName?: string;
  contactName?: string;
  moveReference?: string;
  moveDate?: string;
  origin?: string;
  destination?: string;
  assignedRep?: string;
  companyName?: string;
  companyPhone?: string;
  portalLink?: string;
  /** Post-move crew feedback portal — customer rates crew before any Google review prompt. */
  feedbackLink?: string;
  /** Google Business Profile review URL for the move's branch (shown on feedback portal only). */
  reviewLink?: string;
};

export type MessageTemplate = {
  id: string;
  channel: MessageChannel;
  label: string;
  body: string;
  /** Email templates only — optional subject line with merge fields. */
  subject?: string;
  /** Sales quick replies, ops manual messages, or pipeline automations. */
  category?: MessageTemplateCategory;
};

export type MessageTemplateEditorChannel = "sms" | "email" | "call";

export const MESSAGE_TEMPLATE_MERGE_FIELDS = [
  { token: "{{firstName}}", label: "Customer first name" },
  { token: "{{fullName}}", label: "Customer full name" },
  { token: "{{moveDate}}", label: "Preferred move date" },
  { token: "{{origin}}", label: "Origin city" },
  { token: "{{destination}}", label: "Destination city" },
  { token: "{{rep}}", label: "Assigned sales rep" },
  { token: "{{company}}", label: "Company name" },
  { token: "{{phone}}", label: "Company phone" },
  { token: "{{time}}", label: "Callback time (call notes)" },
  { token: "{{portalLink}}", label: "Customer portal link (crew / documents)" },
  {
    token: "{{feedbackLink}}",
    label: "Crew feedback portal (rate 1–5 before Google review)",
  },
  {
    token: "{{reviewLink}}",
    label: "Google review link (internal — use on feedback portal, not automations)",
  },
] as const;

export const MESSAGE_TEMPLATES_UPDATED_EVENT = "jm-message-templates-updated";
