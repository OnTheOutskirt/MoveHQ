import {
  defaultUserOutlookSettings,
  type UserOutlookSettings,
} from "@/lib/integrations/outlook-user-settings";
import {
  defaultNotificationPrefs,
  notificationPrefsFromLegacy,
} from "@/lib/notifications/notification-preferences";
import type { NotificationPrefs } from "@/lib/notifications/notification-types";
import { REAL_ADMIN_PERSONA } from "@/lib/session/personas";
import type { WorkspaceRole } from "@/lib/workspace/types";

export type UserPreferences = {
  /** Avatar in header, account menu, and profile. */
  profileImageDataUrl: string | null;
  emailSignature: string;
  /** Headshot or logo shown above signature text in HTML emails. */
  signatureImageDataUrl: string | null;
  includeEmailSignature: boolean;
  /** @deprecated Prefer `notificationPrefs` — kept for migration */
  notifyFollowUps: boolean;
  /** @deprecated Prefer `notificationPrefs` — kept for migration */
  notifyDocumentActivity: boolean;
  /** Per-category delivery: in-app, email, SMS, push */
  notificationPrefs: NotificationPrefs;
  /** Mobile number for SMS 2FA when auth is wired. */
  phone: string;
  /** Per-user Outlook mail + calendar — wired at Microsoft Graph go-live. */
  outlook: UserOutlookSettings;
};

const STORAGE_KEY = "jm-user-preferences-v1";

type Store = Record<string, UserPreferences>;

export function defaultEmailSignature(name: string): string {
  return `Best,
${name}
Jonah's Movers
(832) 728-6675
info@jonahsmovers.com`;
}

function defaultPreferences(
  userName = REAL_ADMIN_PERSONA.name,
  phone = REAL_ADMIN_PERSONA.phone,
  email = REAL_ADMIN_PERSONA.email,
  workspaceRole: WorkspaceRole = "owner",
): UserPreferences {
  const notificationPrefs = defaultNotificationPrefs(workspaceRole);
  return {
    profileImageDataUrl: null,
    emailSignature: defaultEmailSignature(userName),
    signatureImageDataUrl: null,
    includeEmailSignature: true,
    notifyFollowUps: true,
    notifyDocumentActivity: true,
    notificationPrefs,
    phone,
    outlook: defaultUserOutlookSettings(email),
  };
}

function readStore(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Store;
  } catch {
    return {};
  }
}

function writeStore(store: Store): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function readUserPreferences(
  userId: string,
  userName?: string,
  userEmail?: string,
  workspaceRole?: WorkspaceRole,
): UserPreferences {
  const persona =
    userId === REAL_ADMIN_PERSONA.id ? REAL_ADMIN_PERSONA : undefined;
  const role = workspaceRole ?? persona?.workspaceRole ?? "owner";
  const defaults = defaultPreferences(
    userName ?? persona?.name ?? REAL_ADMIN_PERSONA.name,
    persona?.phone,
    userEmail ?? persona?.email ?? REAL_ADMIN_PERSONA.email,
    role,
  );
  const stored = readStore()[userId];
  const merged = {
    ...defaults,
    ...stored,
    outlook: {
      ...defaults.outlook,
      ...(stored?.outlook ?? {}),
    },
  };
  return {
    ...merged,
    notificationPrefs: notificationPrefsFromLegacy({
      notifyFollowUps: merged.notifyFollowUps,
      notifyDocumentActivity: merged.notifyDocumentActivity,
      notificationPrefs: stored?.notificationPrefs,
      workspaceRole: role,
    }),
  };
}

export function writeUserPreferences(userId: string, prefs: UserPreferences): void {
  const store = readStore();
  store[userId] = prefs;
  writeStore(store);
}

export function appendEmailSignature(body: string, signature: string): string {
  const trimmedBody = body.trimEnd();
  const trimmedSig = signature.trim();
  if (!trimmedSig) return trimmedBody;
  if (!trimmedBody) return trimmedSig;
  return `${trimmedBody}\n\n--\n${trimmedSig}`;
}

export function buildEmailSignatureHtml(
  prefs: Pick<UserPreferences, "emailSignature" | "signatureImageDataUrl">,
): string {
  const lines = prefs.emailSignature.trim().split("\n").map(escapeHtml);
  const textBlock = lines.join("<br />");
  const img = prefs.signatureImageDataUrl
    ? `<img src="${prefs.signatureImageDataUrl}" alt="" width="96" style="max-width:96px;height:auto;display:block;margin:0 0 10px;border-radius:8px;" />`
    : "";
  return `${img}<div style="font-family:system-ui,sans-serif;font-size:14px;line-height:1.5;color:#334155;">${textBlock}</div>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
