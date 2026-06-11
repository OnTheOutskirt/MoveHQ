import { defaultMessageTemplates } from "./message-templates-defaults";
import type {
  MessageChannel,
  MessageTemplate,
  MessageTemplateCategory,
} from "./message-templates-types";
import { MESSAGE_TEMPLATES_UPDATED_EVENT } from "./message-templates-types";

const STORAGE_KEY = "jm-message-templates-v2";

const CHANNELS: MessageChannel[] = ["call", "sms", "email"];

function normalizeChannel(value: unknown): MessageChannel {
  if (value === "email" || value === "sms" || value === "call") return value;
  return "sms";
}

/** Re-home templates when defaults move between tabs/categories. */
const TEMPLATE_CATEGORY_OVERRIDES: Record<string, MessageTemplateCategory> = {
  "sms-day-before": "ops",
  "sms-quote-sent-confirm": "automations",
  "sms-day-before-crew": "automations",
  "sms-ops-day-confirm": "automations",
  "sms-review-request": "automations",
  "email-contract-ready": "automations",
  "email-booking-confirm": "automations",
  "email-day-before-crew": "automations",
  "email-review-request": "automations",
};

function normalizeCategory(value: unknown, id?: string): MessageTemplateCategory {
  if (id && TEMPLATE_CATEGORY_OVERRIDES[id]) {
    return TEMPLATE_CATEGORY_OVERRIDES[id];
  }
  if (value === "ops" || value === "automations") return value;
  return "sales";
}

function normalizeTemplate(raw: unknown): MessageTemplate | null {
  if (!raw || typeof raw !== "object") return null;
  const t = raw as Partial<MessageTemplate>;
  if (!t.id || typeof t.id !== "string") return null;
  const channel = normalizeChannel(t.channel);
  return {
    id: t.id,
    channel,
    label: typeof t.label === "string" && t.label.trim() ? t.label.trim() : "Untitled",
    body: typeof t.body === "string" ? t.body : "",
    subject: channel === "email" && typeof t.subject === "string" ? t.subject : undefined,
    category: normalizeCategory(t.category, t.id),
  };
}

function applyCategoryOverrides(template: MessageTemplate): MessageTemplate {
  const override = TEMPLATE_CATEGORY_OVERRIDES[template.id];
  if (!override) return template;
  return { ...template, category: override };
}

function mergeWithDefaults(stored: MessageTemplate[]): MessageTemplate[] {
  const defaults = defaultMessageTemplates();
  const byId = new Map(
    stored.map((t) => [t.id, applyCategoryOverrides(t)]),
  );
  for (const template of defaults) {
    if (!byId.has(template.id)) {
      byId.set(template.id, template);
    } else {
      const existing = byId.get(template.id)!;
      byId.set(template.id, {
        ...existing,
        category: template.category ?? existing.category,
      });
    }
  }
  return [...byId.values()];
}

export function loadMessageTemplates(): MessageTemplate[] {
  if (typeof window === "undefined") return defaultMessageTemplates();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultMessageTemplates();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return defaultMessageTemplates();
    const normalized = parsed
      .map(normalizeTemplate)
      .filter((t): t is MessageTemplate => t != null);
    return normalized.length > 0 ? mergeWithDefaults(normalized) : defaultMessageTemplates();
  } catch {
    return defaultMessageTemplates();
  }
}

export function saveMessageTemplates(templates: MessageTemplate[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  window.dispatchEvent(new CustomEvent(MESSAGE_TEMPLATES_UPDATED_EVENT));
}

export function templatesSnapshot(templates: MessageTemplate[]): string {
  return JSON.stringify(templates);
}

export function generateMessageTemplateId(channel: MessageChannel): string {
  return `${channel}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function resetChannelTemplates(
  templates: MessageTemplate[],
  channel: MessageChannel,
): MessageTemplate[] {
  const defaults = defaultMessageTemplates().filter((t) => t.channel === channel);
  const kept = templates.filter((t) => t.channel !== channel);
  return [...kept, ...defaults];
}

export function resetCategoryTemplates(
  templates: MessageTemplate[],
  channel: MessageChannel,
  category: MessageTemplateCategory,
): MessageTemplate[] {
  const defaults = defaultMessageTemplates().filter(
    (t) => t.channel === channel && (t.category ?? "sales") === category,
  );
  const kept = templates.filter(
    (t) => t.channel !== channel || (t.category ?? "sales") !== category,
  );
  return [...kept, ...defaults];
}
