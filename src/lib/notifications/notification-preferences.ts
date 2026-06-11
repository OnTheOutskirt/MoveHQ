import type { WorkspaceRole } from "@/lib/workspace/types";
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_ROLE_DEFAULTS,
  type NotificationCategory,
  type NotificationChannel,
  type NotificationChannelPrefs,
  type NotificationPrefs,
} from "./notification-types";

export function defaultChannelPrefs(enabled = true): NotificationChannelPrefs {
  return {
    inApp: enabled,
    email: enabled,
    sms: false,
    push: false,
  };
}

export function defaultNotificationPrefs(role: WorkspaceRole = "owner"): NotificationPrefs {
  const roleDefaults = NOTIFICATION_ROLE_DEFAULTS[role];
  return Object.fromEntries(
    NOTIFICATION_CATEGORIES.map((category) => [
      category,
      defaultChannelPrefs(roleDefaults[category] ?? false),
    ]),
  ) as NotificationPrefs;
}

/** Migrate legacy boolean toggles into the channel matrix. */
export function notificationPrefsFromLegacy(input: {
  notifyFollowUps?: boolean;
  notifyDocumentActivity?: boolean;
  notificationPrefs?: Partial<NotificationPrefs>;
  workspaceRole?: WorkspaceRole;
}): NotificationPrefs {
  const base = defaultNotificationPrefs(input.workspaceRole ?? "owner");

  if (input.notificationPrefs) {
    for (const category of NOTIFICATION_CATEGORIES) {
      const patch = input.notificationPrefs[category];
      if (patch) {
        base[category] = { ...base[category], ...patch };
      }
    }
  }

  if (input.notifyFollowUps != null) {
    base.follow_ups = { ...base.follow_ups, inApp: input.notifyFollowUps };
  }
  if (input.notifyDocumentActivity != null) {
    base.document_activity = {
      ...base.document_activity,
      inApp: input.notifyDocumentActivity,
    };
  }

  return base;
}

export function isCategoryEnabledInApp(
  prefs: NotificationPrefs,
  category: NotificationCategory,
): boolean {
  return prefs[category]?.inApp ?? false;
}

export function enabledOutboundChannels(
  prefs: NotificationPrefs,
  category: NotificationCategory,
): NotificationChannel[] {
  const row = prefs[category];
  if (!row) return [];
  const channels: NotificationChannel[] = [];
  if (row.inApp) channels.push("in_app");
  if (row.email) channels.push("email");
  if (row.sms) channels.push("sms");
  if (row.push) channels.push("push");
  return channels;
}

export function patchNotificationCategory(
  prefs: NotificationPrefs,
  category: NotificationCategory,
  patch: Partial<NotificationChannelPrefs>,
): NotificationPrefs {
  return {
    ...prefs,
    [category]: { ...prefs[category], ...patch },
  };
}

export function setAllChannelsForCategory(
  prefs: NotificationPrefs,
  category: NotificationCategory,
  enabled: boolean,
): NotificationPrefs {
  return patchNotificationCategory(prefs, category, {
    inApp: enabled,
    email: enabled,
    sms: enabled,
    push: enabled,
  });
}
