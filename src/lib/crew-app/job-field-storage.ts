import type { JobFieldMediaEntry } from "@/lib/crew-app/field-capture-types";
import { normalizeJobMediaEntry } from "@/lib/crew-app/field-capture-types";
import type { CrewAppCrewSlot, CrewAppJob } from "@/lib/crew-app/types";

export const TIME_CATEGORIES = ["move", "drive", "depot", "extra", "break"] as const;
export type TimeCategory = (typeof TIME_CATEGORIES)[number];

export const TIME_CATEGORY_LABELS: Record<TimeCategory, string> = {
  move: "Move time",
  drive: "Drive time",
  depot: "Depot / shop",
  extra: "Extra time",
  break: "Break",
};

export type TakeHomeSignOff = {
  description: string;
  reason: "customer_gift" | "donation" | "other";
  customerSignedAt: string;
  customerName: string;
};

export type TimeClockSlot = {
  clockIn: string | null;
  clockOut: string | null;
};

export type WrapUpCrewMember = {
  id: string;
  name: string;
  role: string;
  hours: number;
  fromOtherCrew?: boolean;
};

export type WrapUpAddedFee = {
  id: string;
  label: string;
  amount: number;
};

export type WrapUpMaterialUsed = {
  materialId: string;
  qty: number;
};

export type JobWrapUpState = {
  crewHours: WrapUpCrewMember[];
  addedFees: WrapUpAddedFee[];
  materialsUsed: WrapUpMaterialUsed[];
};

export const END_OF_DAY_CHECKLIST_ITEMS = [
  "Truck fueled and parked",
  "Materials restocked / counted",
  "Damage photos uploaded (if any)",
  "Paperwork handed to office",
] as const;

export type EndOfDayChecklist = Record<(typeof END_OF_DAY_CHECKLIST_ITEMS)[number], boolean>;

export type ClockGuideStep = {
  id: string;
  category: TimeCategory;
  label: string;
  description: string;
};

export const LOCAL_CLOCK_STEPS: ClockGuideStep[] = [
  {
    id: "drive-to-job",
    category: "drive",
    label: "Drive to job",
    description: "Clock drive time while heading to the customer.",
  },
  {
    id: "on-the-move",
    category: "move",
    label: "On the move",
    description:
      "Load, unload, and driving between stops — all move time on local jobs.",
  },
  {
    id: "drive-back",
    category: "drive",
    label: "Drive back",
    description: "Clock drive time heading back to the shop or next stop.",
  },
];

export const LONG_DISTANCE_CLOCK_STEPS: ClockGuideStep[] = [
  {
    id: "drive-to-origin",
    category: "drive",
    label: "Drive to origin",
    description: "In the truck en route to pickup.",
  },
  {
    id: "load-origin",
    category: "move",
    label: "Load at origin",
    description: "On site at pickup — move time only, not driving.",
  },
  {
    id: "drive-to-dest",
    category: "drive",
    label: "Drive to destination",
    description: "In the truck between homes.",
  },
  {
    id: "unload-dest",
    category: "move",
    label: "Unload at destination",
    description: "On site at delivery — move time only.",
  },
  {
    id: "return-office",
    category: "drive",
    label: "Return to office",
    description: "Drive time back to the shop when the job is done.",
  },
];

export type JobFieldState = {
  times: Record<TimeCategory, TimeClockSlot>;
  startSignature: { signedAt: string; signedBy: string } | null;
  endSignature: { signedAt: string; signedBy: string } | null;
  /** Skipper marked job complete (typically back at office / done for the day). */
  jobCompleteAt: string | null;
  clockGuideStep: number;
  wrapUp: JobWrapUpState;
  endOfDayChecklist: EndOfDayChecklist;
  takeHomeSignOff: TakeHomeSignOff | null;
  jobMedia: JobFieldMediaEntry[];
};

const STORAGE_KEY = "jm-crew-job-field-v1";

type Store = Record<string, JobFieldState>;

function emptyEndOfDayChecklist(): EndOfDayChecklist {
  return END_OF_DAY_CHECKLIST_ITEMS.reduce(
    (acc, item) => {
      acc[item] = false;
      return acc;
    },
    {} as EndOfDayChecklist,
  );
}

function emptyWrapUp(): JobWrapUpState {
  return {
    crewHours: [],
    addedFees: [],
    materialsUsed: [],
  };
}

export function emptyJobFieldState(): JobFieldState {
  return {
    times: {
      move: { clockIn: null, clockOut: null },
      drive: { clockIn: null, clockOut: null },
      depot: { clockIn: null, clockOut: null },
      extra: { clockIn: null, clockOut: null },
      break: { clockIn: null, clockOut: null },
    },
    startSignature: null,
    endSignature: null,
    jobCompleteAt: null,
    clockGuideStep: 0,
    wrapUp: emptyWrapUp(),
    endOfDayChecklist: emptyEndOfDayChecklist(),
    takeHomeSignOff: null,
    jobMedia: [],
  };
}

function normalizeState(raw: Partial<JobFieldState> | undefined): JobFieldState {
  const base = emptyJobFieldState();
  if (!raw) return base;
  return {
    times: { ...base.times, ...raw.times },
    startSignature: raw.startSignature ?? null,
    endSignature: raw.endSignature ?? null,
    jobCompleteAt: raw.jobCompleteAt ?? null,
    clockGuideStep: raw.clockGuideStep ?? 0,
    wrapUp: {
      crewHours: raw.wrapUp?.crewHours ?? [],
      addedFees: raw.wrapUp?.addedFees ?? [],
      materialsUsed: raw.wrapUp?.materialsUsed ?? [],
    },
    endOfDayChecklist: {
      ...emptyEndOfDayChecklist(),
      ...raw.endOfDayChecklist,
    },
    takeHomeSignOff: raw.takeHomeSignOff ?? null,
    jobMedia: (raw.jobMedia ?? []).map((entry) =>
      normalizeJobMediaEntry(entry as JobFieldMediaEntry, {
        moveRef: "",
        capturedByCrewId: "unknown",
        capturedByName: "Crew",
      }),
    ),
  };
}

export function normalizeJobFieldMediaForJob(
  job: CrewAppJob,
  media: JobFieldMediaEntry[],
  capturedBy: { crewId: string; name: string },
): JobFieldMediaEntry[] {
  return media.map((entry) =>
    normalizeJobMediaEntry(entry, {
      moveRef: job.moveRef,
      capturedByCrewId: capturedBy.crewId,
      capturedByName: capturedBy.name,
    }),
  );
}

export function pendingFieldMedia(state: JobFieldState): JobFieldMediaEntry[] {
  return state.jobMedia.filter((m) => m.syncStatus === "pending" || m.syncStatus === "failed");
}

export function countSyncedFieldMedia(state: JobFieldState): number {
  return state.jobMedia.filter((m) => m.syncStatus === "synced").length;
}

function readStore(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, Partial<JobFieldState>>;
    const store: Store = {};
    for (const [id, state] of Object.entries(parsed)) {
      store[id] = normalizeState(state);
    }
    return store;
  } catch {
    return {};
  }
}

function writeStore(store: Store): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function readJobFieldState(jobId: string): JobFieldState {
  return readStore()[jobId] ?? emptyJobFieldState();
}

export function writeJobFieldState(jobId: string, state: JobFieldState): void {
  const store = readStore();
  store[jobId] = state;
  writeStore(store);
  notifyJobFieldStore();
}

type JobFieldListener = () => void;
const jobFieldListeners = new Set<JobFieldListener>();

export function subscribeJobFieldStore(listener: JobFieldListener): () => void {
  jobFieldListeners.add(listener);
  return () => {
    jobFieldListeners.delete(listener);
  };
}

function notifyJobFieldStore(): void {
  jobFieldListeners.forEach((listener) => listener());
}

export function isJobComplete(state: JobFieldState): boolean {
  return Boolean(state.jobCompleteAt || state.endSignature);
}

export function formatElapsedMs(ms: number): string {
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function slotElapsedMs(slot: TimeClockSlot, now = Date.now()): number {
  if (!slot.clockIn) return 0;
  const start = new Date(slot.clockIn).getTime();
  const end = slot.clockOut ? new Date(slot.clockOut).getTime() : now;
  return Math.max(0, end - start);
}

export function slotElapsed(slot: TimeClockSlot, now = Date.now()): string {
  if (!slot.clockIn) return "—";
  return formatElapsedMs(slotElapsedMs(slot, now));
}

export function totalClockedMs(
  state: JobFieldState,
  opts?: { excludeBreak?: boolean },
): number {
  let ms = 0;
  const now = Date.now();
  for (const cat of TIME_CATEGORIES) {
    if (opts?.excludeBreak && cat === "break") continue;
    ms += slotElapsedMs(state.times[cat], now);
  }
  return ms;
}

export function totalBillableHours(state: JobFieldState): number {
  const ms =
    slotElapsedMs(state.times.move) +
    slotElapsedMs(state.times.drive) +
    slotElapsedMs(state.times.extra);
  return Math.round((ms / 3_600_000) * 100) / 100;
}

export function activeCategory(state: JobFieldState): TimeCategory | null {
  for (const cat of TIME_CATEGORIES) {
    const slot = state.times[cat];
    if (slot.clockIn && !slot.clockOut) return cat;
  }
  return null;
}

export function clockStepsForJob(job: CrewAppJob): ClockGuideStep[] {
  return job.moveType === "long_distance" ? LONG_DISTANCE_CLOCK_STEPS : LOCAL_CLOCK_STEPS;
}

export function crewMemberId(member: CrewAppCrewSlot, index: number): string {
  return `${member.role}-${member.name}-${index}`;
}

export function buildDefaultWrapUpCrewHours(
  job: CrewAppJob,
  state: JobFieldState,
): WrapUpCrewMember[] {
  const hours = totalBillableHours(state);
  return job.crew.map((member, index) => ({
    id: crewMemberId(member, index),
    name: member.name,
    role: member.role,
    hours,
  }));
}

export function ensureWrapUpCrewHours(
  job: CrewAppJob,
  state: JobFieldState,
): JobFieldState {
  if (state.wrapUp.crewHours.length > 0) return state;
  return {
    ...state,
    wrapUp: {
      ...state.wrapUp,
      crewHours: buildDefaultWrapUpCrewHours(job, state),
    },
  };
}

export function jobProgressLabel(state: JobFieldState): "Not started" | "On site" | "Complete" {
  if (isJobComplete(state)) return "Complete";
  if (state.startSignature) return "On site";
  return "Not started";
}

export type TodayJobListGroup = "scheduled" | "in_progress" | "completed";

export const TODAY_JOB_LIST_GROUP_ORDER: TodayJobListGroup[] = [
  "scheduled",
  "in_progress",
  "completed",
];

export const TODAY_JOB_LIST_GROUP_LABELS: Record<TodayJobListGroup, string> = {
  scheduled: "Scheduled",
  in_progress: "In progress",
  completed: "Completed",
};

export function todayJobListGroup(state: JobFieldState): TodayJobListGroup {
  if (isJobComplete(state)) return "completed";
  if (state.startSignature) return "in_progress";
  for (const cat of TIME_CATEGORIES) {
    if (state.times[cat].clockIn) return "in_progress";
  }
  return "scheduled";
}

export function endOfDayChecklistComplete(state: JobFieldState): boolean {
  return END_OF_DAY_CHECKLIST_ITEMS.every((item) => state.endOfDayChecklist[item]);
}
