import type { WorkspaceRole } from "@/lib/workspace/types";

export const NOTIFICATION_CHANNELS = ["in_app", "email", "sms", "push"] as const;

export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

export const NOTIFICATION_CATEGORIES = [
  "follow_ups",
  "document_activity",
  "claims",
  "inventory_alerts",
  "job_day",
  "new_leads",
  "crew_schedule",
] as const;

export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

export type NotificationChannelPrefs = {
  inApp: boolean;
  email: boolean;
  sms: boolean;
  push: boolean;
};

export type NotificationPrefs = Record<NotificationCategory, NotificationChannelPrefs>;

export type OfficeNotificationCategory =
  | "follow_up"
  | "document"
  | "claim"
  | "inventory"
  | "job_day"
  | "new_lead";

export type OfficeNotification = {
  id: string;
  at: string;
  title: string;
  body: string;
  href: string;
  category: OfficeNotificationCategory;
  timeLabel: string;
  /** Categories this maps to for preference filtering */
  prefCategory: NotificationCategory;
  /** Channels that would fire for this event (demo — in-app is live) */
  channels: NotificationChannel[];
};

export const NOTIFICATION_CHANNEL_LABELS: Record<NotificationChannel, string> = {
  in_app: "In-app",
  email: "Email",
  sms: "SMS",
  push: "Push",
};

export const NOTIFICATION_CATEGORY_LABELS: Record<NotificationCategory, string> = {
  follow_ups: "Follow-ups & tasks",
  document_activity: "Quote & contract activity",
  claims: "Claims & damage",
  inventory_alerts: "Inventory & supplies",
  job_day: "Job day & dispatch",
  new_leads: "New leads & web intake",
  crew_schedule: "Crew schedule changes",
};

export const NOTIFICATION_CATEGORY_DESCRIPTIONS: Record<NotificationCategory, string> = {
  follow_ups: "Callbacks and tasks due today or overdue.",
  document_activity: "Customer viewed, booked, signed, or paid on a document.",
  claims: "New claims, vendor delays, and resolution updates.",
  inventory_alerts: "Low stock and reorder reminders for packing supplies.",
  job_day: "Moves on the schedule today and tomorrow.",
  new_leads: "Website quotes and new intake needing review.",
  crew_schedule: "Schedule changes, time-off decisions, and crew messages.",
};

/** Which roles see each category by default in the in-app bell. */
export const NOTIFICATION_ROLE_DEFAULTS: Record<
  WorkspaceRole,
  Partial<Record<NotificationCategory, boolean>>
> = {
  owner: {
    follow_ups: true,
    document_activity: true,
    claims: true,
    inventory_alerts: true,
    job_day: true,
    new_leads: true,
    crew_schedule: true,
  },
  admin: {
    follow_ups: true,
    document_activity: true,
    claims: true,
    inventory_alerts: true,
    job_day: true,
    new_leads: true,
    crew_schedule: true,
  },
  manager: {
    follow_ups: true,
    document_activity: true,
    claims: true,
    inventory_alerts: true,
    job_day: true,
    new_leads: true,
    crew_schedule: true,
  },
  sales: {
    follow_ups: true,
    document_activity: true,
    new_leads: true,
    job_day: false,
    claims: false,
    inventory_alerts: false,
    crew_schedule: false,
  },
  operations: {
    follow_ups: true,
    claims: true,
    inventory_alerts: true,
    job_day: true,
    crew_schedule: true,
    document_activity: false,
    new_leads: false,
  },
  crew: {
    crew_schedule: true,
    job_day: true,
    follow_ups: false,
    document_activity: false,
    claims: false,
    inventory_alerts: false,
    new_leads: false,
  },
};
