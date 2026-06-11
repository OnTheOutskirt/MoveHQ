export type CrewOpsMessage = {
  id: string;
  crewId: string;
  crewName: string;
  body: string;
  flagOff: boolean;
  createdAt: string;
  read: boolean;
  /** Pay / hours discrepancy tied to a completed job */
  jobId?: string;
  moveRef?: string;
};

const STORAGE_KEY = "jm-crew-ops-messages-v1";

function readAll(): CrewOpsMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CrewOpsMessage[]) : [];
  } catch {
    return [];
  }
}

function writeAll(messages: CrewOpsMessage[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

export function submitCrewOpsMessage(input: {
  crewId: string;
  crewName: string;
  body: string;
  flagOff: boolean;
  jobId?: string;
  moveRef?: string;
}): CrewOpsMessage {
  const msg: CrewOpsMessage = {
    id: `ops-msg-${Date.now()}`,
    crewId: input.crewId,
    crewName: input.crewName,
    body: input.body.trim(),
    flagOff: input.flagOff,
    createdAt: new Date().toISOString(),
    read: false,
    jobId: input.jobId,
    moveRef: input.moveRef,
  };
  writeAll([msg, ...readAll()]);
  return msg;
}

export function listCrewOpsMessages(): CrewOpsMessage[] {
  return readAll().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
