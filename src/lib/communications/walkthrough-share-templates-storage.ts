import { defaultWalkthroughShareTemplates } from "./walkthrough-share-templates-defaults";
import type {
  WalkthroughShareKind,
  WalkthroughShareTemplateSet,
  WalkthroughShareTemplates,
} from "./walkthrough-share-templates-types";
import { WALKTHROUGH_SHARE_TEMPLATES_UPDATED_EVENT } from "./walkthrough-share-templates-types";

const STORAGE_KEY = "jm-walkthrough-share-templates-v1";

const KINDS: WalkthroughShareKind[] = ["scheduling", "virtual_meeting", "liveswitch"];

function normalizeSet(raw: unknown, fallback: WalkthroughShareTemplateSet): WalkthroughShareTemplateSet {
  if (!raw || typeof raw !== "object") return { ...fallback };
  const s = raw as Partial<WalkthroughShareTemplateSet>;
  return {
    emailSubject:
      typeof s.emailSubject === "string" && s.emailSubject.trim()
        ? s.emailSubject
        : fallback.emailSubject,
    emailBody: typeof s.emailBody === "string" ? s.emailBody : fallback.emailBody,
    smsBody: typeof s.smsBody === "string" ? s.smsBody : fallback.smsBody,
  };
}

function normalizeTemplates(raw: unknown): WalkthroughShareTemplates {
  const defaults = defaultWalkthroughShareTemplates();
  if (!raw || typeof raw !== "object") return defaults;
  const parsed = raw as Partial<Record<WalkthroughShareKind, unknown>>;
  const next = { ...defaults };
  for (const kind of KINDS) {
    next[kind] = normalizeSet(parsed[kind], defaults[kind]);
  }
  return next;
}

export function loadWalkthroughShareTemplates(): WalkthroughShareTemplates {
  if (typeof window === "undefined") return defaultWalkthroughShareTemplates();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultWalkthroughShareTemplates();
    return normalizeTemplates(JSON.parse(raw) as unknown);
  } catch {
    return defaultWalkthroughShareTemplates();
  }
}

export function saveWalkthroughShareTemplates(templates: WalkthroughShareTemplates): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  window.dispatchEvent(new CustomEvent(WALKTHROUGH_SHARE_TEMPLATES_UPDATED_EVENT));
}

export function walkthroughShareTemplatesSnapshot(templates: WalkthroughShareTemplates): string {
  return JSON.stringify(templates);
}
