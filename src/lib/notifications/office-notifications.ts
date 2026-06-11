import { formatActivityTime } from "@/lib/moves/format";
import {
  getFollowUpDueBucket,
  getOpenFollowUps,
} from "@/lib/moves/move-follow-ups";
import type { MoveRecord } from "@/lib/moves/types";
import { isWaitingOnVendor } from "@/lib/operations/claims-workflow";
import type { MoveClaim } from "@/lib/operations/claims-types";
import type { InventoryStockLine } from "@/lib/operations/inventory-types";
import { salesMovePath, ROUTES } from "@/lib/navigation/routes";
import type { WorkspaceRole } from "@/lib/workspace/types";
import {
  enabledOutboundChannels,
  isCategoryEnabledInApp,
  notificationPrefsFromLegacy,
} from "./notification-preferences";
import type {
  NotificationCategory,
  NotificationPrefs,
  OfficeNotification,
  OfficeNotificationCategory,
} from "./notification-types";
import { NOTIFICATION_ROLE_DEFAULTS } from "./notification-types";

export type { OfficeNotification, OfficeNotificationCategory };

const READ_STORAGE_KEY = "jm-office-notifications-read-v1";

const CUSTOMER_DOCUMENT_EVENTS = new Set([
  "viewed",
  "booking_requested",
  "signed",
  "deposit_paid",
]);

function readDismissedStore(): Record<string, true> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(READ_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, true>;
  } catch {
    return {};
  }
}

function writeDismissedStore(store: Record<string, true>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(store));
}

export function getDismissedNotificationIds(): Set<string> {
  return new Set(Object.keys(readDismissedStore()));
}

export function dismissNotification(id: string): void {
  const store = readDismissedStore();
  store[id] = true;
  writeDismissedStore(store);
}

export function dismissAllNotifications(ids: string[]): void {
  const store = readDismissedStore();
  for (const id of ids) store[id] = true;
  writeDismissedStore(store);
}

function roleAllowsCategory(role: WorkspaceRole, category: NotificationCategory): boolean {
  return NOTIFICATION_ROLE_DEFAULTS[role]?.[category] ?? false;
}

function pushNotification(
  items: OfficeNotification[],
  input: Omit<OfficeNotification, "channels"> & { prefCategory: NotificationCategory },
  prefs: NotificationPrefs,
  role: WorkspaceRole,
) {
  if (!roleAllowsCategory(role, input.prefCategory)) return;
  if (!isCategoryEnabledInApp(prefs, input.prefCategory)) return;
  items.push({
    ...input,
    channels: enabledOutboundChannels(prefs, input.prefCategory),
  });
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, days: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
}

export function buildOfficeNotifications(input: {
  moves: MoveRecord[];
  claims: MoveClaim[];
  stockLines: InventoryStockLine[];
  assignedRep: string;
  workspaceRole: WorkspaceRole;
  preferences: {
    notifyFollowUps?: boolean;
    notifyDocumentActivity?: boolean;
    notificationPrefs?: Partial<NotificationPrefs>;
  };
}): OfficeNotification[] {
  const {
    moves,
    claims,
    stockLines,
    assignedRep,
    workspaceRole,
    preferences,
  } = input;

  const prefs = notificationPrefsFromLegacy({
    notifyFollowUps: preferences.notifyFollowUps,
    notifyDocumentActivity: preferences.notifyDocumentActivity,
    notificationPrefs: preferences.notificationPrefs,
    workspaceRole,
  });

  const mine =
    assignedRep === "all" ? moves : moves.filter((m) => m.assignedRep === assignedRep);
  const items: OfficeNotification[] = [];
  const today = isoDate(new Date());
  const tomorrow = isoDate(addDays(new Date(), 1));

  for (const move of mine) {
    for (const followUp of getOpenFollowUps(move)) {
      const bucket = getFollowUpDueBucket(followUp);
      if (bucket !== "overdue" && bucket !== "today") continue;

      pushNotification(
        items,
        {
          id: `follow-up-${followUp.id}`,
          at: followUp.dueAt,
          title: followUp.title,
          body: `${move.customerName} · ${bucket === "overdue" ? "Overdue" : "Due today"}`,
          href: salesMovePath(move.id),
          category: "follow_up",
          prefCategory: "follow_ups",
          timeLabel: formatActivityTime(followUp.dueAt),
        },
        prefs,
        workspaceRole,
      );
    }
  }

  for (const move of mine) {
    for (const activity of move.activities) {
      const event = activity.document?.event;
      if (!event || !CUSTOMER_DOCUMENT_EVENTS.has(event)) continue;

      pushNotification(
        items,
        {
          id: `activity-${activity.id}`,
          at: activity.at,
          title: activity.summary,
          body: `${move.customerName} · ${move.reference}`,
          href: salesMovePath(move.id),
          category: "document",
          prefCategory: "document_activity",
          timeLabel: formatActivityTime(activity.at),
        },
        prefs,
        workspaceRole,
      );
    }
  }

  const openClaims = claims.filter(
    (c) => c.status !== "completed" && c.status !== "denied",
  );
  for (const claim of openClaims) {
    if (claim.status === "new") {
      pushNotification(
        items,
        {
          id: `claim-new-${claim.id}`,
          at: claim.reportedDate,
          title: `New claim — ${claim.reference}`,
          body: `${claim.customerName} · ${claim.title}`,
          href: `/operations/claims?claim=${claim.id}`,
          category: "claim",
          prefCategory: "claims",
          timeLabel: formatActivityTime(claim.reportedDate),
        },
        prefs,
        workspaceRole,
      );
    }
    if (isWaitingOnVendor(claim)) {
      pushNotification(
        items,
        {
          id: `claim-vendor-${claim.id}`,
          at: claim.vendorSentAt ?? claim.updatedAt,
          title: `Waiting on vendor — ${claim.reference}`,
          body: `${claim.title} · response due ${claim.vendorResponseDue ?? "soon"}`,
          href: `/operations/claims?claim=${claim.id}`,
          category: "claim",
          prefCategory: "claims",
          timeLabel: formatActivityTime(claim.vendorSentAt ?? claim.updatedAt),
        },
        prefs,
        workspaceRole,
      );
    }
  }

  const lowStock = stockLines.filter((l) => l.isLow);
  if (lowStock.length > 0) {
    const top = lowStock.slice(0, 3).map((l) => l.label).join(", ");
    pushNotification(
      items,
      {
        id: `inventory-low-${lowStock.length}`,
        at: new Date().toISOString(),
        title: `${lowStock.length} supply item${lowStock.length === 1 ? "" : "s"} low`,
        body: top + (lowStock.length > 3 ? "…" : ""),
        href: "/operations/inventory",
        category: "inventory",
        prefCategory: "inventory_alerts",
        timeLabel: "Now",
      },
      prefs,
      workspaceRole,
    );
  }

  for (const move of moves) {
    const jobDate = move.jobDays[0]?.date ?? move.preferredDate;
    if (!jobDate || (jobDate !== today && jobDate !== tomorrow)) continue;
    if (move.pipelineStage === "completed" || move.conditionStatus === "lost") continue;

    pushNotification(
      items,
      {
        id: `job-day-${move.id}-${jobDate}`,
        at: `${jobDate}T08:00:00Z`,
        title: jobDate === today ? "Move today" : "Move tomorrow",
        body: `${move.customerName} · ${move.reference}`,
        href: salesMovePath(move.id),
        category: "job_day",
        prefCategory: "job_day",
        timeLabel: jobDate === today ? "Today" : "Tomorrow",
      },
      prefs,
      workspaceRole,
    );
  }

  const recentLeads = moves.filter(
    (m) =>
      (m.pipelineStage === "new_lead" || m.leadChannel === "website") &&
      m.conditionStatus === "active" &&
      new Date(m.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000,
  );
  for (const move of recentLeads.slice(0, 5)) {
    pushNotification(
      items,
      {
        id: `lead-${move.id}`,
        at: move.createdAt,
        title: "New lead / intake",
        body: `${move.customerName} · ${move.reference}`,
        href: salesMovePath(move.id),
        category: "new_lead",
        prefCategory: "new_leads",
        timeLabel: formatActivityTime(move.createdAt),
      },
      prefs,
      workspaceRole,
    );
  }

  return items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

export function filterUnreadNotifications(
  notifications: OfficeNotification[],
  dismissed: Set<string>,
): OfficeNotification[] {
  return notifications.filter((n) => !dismissed.has(n.id));
}

export function unreadNotificationCount(
  notifications: OfficeNotification[],
  dismissed: Set<string>,
): number {
  return filterUnreadNotifications(notifications, dismissed).length;
}

export const NOTIFICATIONS_FOLLOW_UPS_HREF = ROUTES.salesFollowUps;
