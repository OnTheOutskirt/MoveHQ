/** Per-user Outlook connection — shared by Account settings and Walkthroughs availability. */

export type UserOutlookSettings = {
  connected: boolean;
  accountEmail: string | null;
  calendarSyncEnabled: boolean;
  mailSyncEnabled: boolean;
  lastSyncedAt: string | null;
};

export function defaultUserOutlookSettings(
  email: string | null = null,
): UserOutlookSettings {
  return {
    connected: false,
    accountEmail: email,
    calendarSyncEnabled: true,
    mailSyncEnabled: true,
    lastSyncedAt: null,
  };
}
