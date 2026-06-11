export type TimeOffStatus = "pending" | "approved" | "denied";

export type CrewTimeOffRequest = {
  id: string;
  startDate: string;
  endDate: string;
  note?: string;
  status: TimeOffStatus;
  submittedAt: string;
  statusAt?: string;
};

export type CrewInboxNotification = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  category: "time_off" | "schedule" | "general";
};

type CrewInboxStore = {
  timeOff: CrewTimeOffRequest[];
  notifications: CrewInboxNotification[];
};

const STORAGE_KEY = "jm-crew-inbox-v1";

function emptyStore(): CrewInboxStore {
  return { timeOff: [], notifications: [] };
}

function demoSeed(): CrewInboxStore {
  return {
    timeOff: [
      {
        id: "to-demo-approved",
        startDate: "2026-07-04",
        endDate: "2026-07-05",
        note: "Family trip",
        status: "approved",
        submittedAt: "2026-05-28T14:00:00.000Z",
        statusAt: "2026-05-29T09:15:00.000Z",
      },
      {
        id: "to-demo-pending",
        startDate: "2026-06-20",
        endDate: "2026-06-20",
        note: "Doctor appointment",
        status: "pending",
        submittedAt: "2026-06-01T10:30:00.000Z",
      },
      {
        id: "to-demo-denied",
        startDate: "2026-06-14",
        endDate: "2026-06-14",
        status: "denied",
        submittedAt: "2026-05-20T08:00:00.000Z",
        statusAt: "2026-05-21T11:00:00.000Z",
      },
    ],
    notifications: [
      {
        id: "n-demo-1",
        title: "Time off approved",
        body: "Jul 4–5 is approved — you're off the schedule.",
        read: false,
        createdAt: "2026-05-29T09:15:00.000Z",
        category: "time_off",
      },
      {
        id: "n-demo-2",
        title: "Time off pending review",
        body: "Jun 20 request sent to dispatch — we'll notify you when it's reviewed.",
        read: false,
        createdAt: "2026-06-01T10:30:00.000Z",
        category: "time_off",
      },
      {
        id: "n-demo-3",
        title: "Time off not approved",
        body: "Jun 14 — we're fully booked that day. Talk to your lead if you need to swap.",
        read: true,
        createdAt: "2026-05-21T11:00:00.000Z",
        category: "time_off",
      },
      {
        id: "n-demo-4",
        title: "Schedule published",
        body: "Next week's crew schedule is live — check Schedule for your days.",
        read: true,
        createdAt: "2026-05-30T16:00:00.000Z",
        category: "schedule",
      },
    ],
  };
}

function readAllStores(): Record<string, CrewInboxStore> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, CrewInboxStore>;
  } catch {
    return {};
  }
}

function writeAllStores(stores: Record<string, CrewInboxStore>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stores));
}

export function readCrewInbox(crewId: string): CrewInboxStore {
  const stores = readAllStores();
  const existing = stores[crewId];
  if (existing) return existing;
  const seeded = demoSeed();
  stores[crewId] = seeded;
  writeAllStores(stores);
  return seeded;
}

export function writeCrewInbox(crewId: string, store: CrewInboxStore): void {
  const stores = readAllStores();
  stores[crewId] = store;
  writeAllStores(stores);
}

export function unreadNotificationCount(store: CrewInboxStore): number {
  return store.notifications.filter((n) => !n.read).length;
}

export function submitTimeOffRequest(
  crewId: string,
  input: { startDate: string; endDate: string; note: string },
): CrewInboxStore {
  const store = readCrewInbox(crewId);
  const id = `to-${Date.now()}`;
  const submittedAt = new Date().toISOString();
  const note = input.note.trim();
  if (!note) {
    throw new Error("Time off reason is required.");
  }
  const request: CrewTimeOffRequest = {
    id,
    startDate: input.startDate,
    endDate: input.endDate,
    note,
    status: "pending",
    submittedAt,
  };
  const notification: CrewInboxNotification = {
    id: `n-${Date.now()}`,
    title: "Time off request sent",
    body: "Dispatch will review your request — you'll get a notification when it's approved or denied.",
    read: false,
    createdAt: submittedAt,
    category: "time_off",
  };
  const next: CrewInboxStore = {
    timeOff: [request, ...store.timeOff],
    notifications: [notification, ...store.notifications],
  };
  writeCrewInbox(crewId, next);
  return next;
}

export function markNotificationRead(
  crewId: string,
  notificationId: string,
): CrewInboxStore {
  const store = readCrewInbox(crewId);
  const next: CrewInboxStore = {
    ...store,
    notifications: store.notifications.map((n) =>
      n.id === notificationId ? { ...n, read: true } : n,
    ),
  };
  writeCrewInbox(crewId, next);
  return next;
}

export function markAllNotificationsRead(crewId: string): CrewInboxStore {
  const store = readCrewInbox(crewId);
  const next: CrewInboxStore = {
    ...store,
    notifications: store.notifications.map((n) => ({ ...n, read: true })),
  };
  writeCrewInbox(crewId, next);
  return next;
}

export function timeOffStatusLabel(status: TimeOffStatus): string {
  if (status === "approved") return "Approved";
  if (status === "denied") return "Denied";
  return "Pending";
}

/** Notify crew app inbox when ops approves or denies a time-off request. */
export function notifyCrewTimeOffDecision(
  crewId: string,
  request: CrewTimeOffRequest,
  status: "approved" | "denied",
): CrewInboxStore {
  const store = readCrewInbox(crewId);
  const range =
    request.startDate === request.endDate
      ? request.startDate
      : `${request.startDate} – ${request.endDate}`;
  const notification: CrewInboxNotification = {
    id: `n-to-${request.id}-${status}`,
    title: status === "approved" ? "Time off approved" : "Time off not approved",
    body:
      status === "approved"
        ? `${range} is approved — you're off the schedule.`
        : `${range} was not approved. Talk to dispatch if you need to adjust.`,
    read: false,
    createdAt: new Date().toISOString(),
    category: "time_off",
  };
  const next: CrewInboxStore = {
    timeOff: store.timeOff.map((r) =>
      r.id === request.id ? { ...r, status, statusAt: notification.createdAt } : r,
    ),
    notifications: [notification, ...store.notifications],
  };
  writeCrewInbox(crewId, next);
  return next;
}
