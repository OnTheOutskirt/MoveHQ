import type { OpsJobDayRow } from "@/lib/operations/ops-jobs";
import type { MoveRecord } from "@/lib/moves/types";

export type JobFieldDocumentKind =
  | "bill_of_lading"
  | "inventory"
  | "damage_waiver"
  | "job_completion"
  | "payment";

export type JobFieldDocument = {
  id: string;
  kind: JobFieldDocumentKind;
  label: string;
  status: "signed" | "submitted";
  signedAt: string;
  signedBy?: string;
  submittedBy: string;
};

export type JobFieldTimeEntry = {
  id: string;
  label: string;
  at: string;
  crewMember: string;
};

export type JobFieldPayment = {
  method: string;
  amountDue: number;
  amountCollected: number;
  tip: number;
  status: "paid" | "partial";
  collectedAt: string;
  collectedBy: string;
  reference?: string;
};

export type JobFieldPacket = {
  packetKey: string;
  moveId: string;
  jobDayId: string;
  moveRef: string;
  customerName: string;
  date: string;
  dayLabel: string;
  crewLead: string;
  documents: JobFieldDocument[];
  payment: JobFieldPayment;
  timeEntries: JobFieldTimeEntry[];
  crewNotes: string;
  photoCount: number;
};

export type JobFieldDocumentPreview = {
  title: string;
  subtitle: string;
  body: string[];
  signatureLine?: { name: string; at: string };
};

const DOCUMENT_LABELS: Record<JobFieldDocumentKind, string> = {
  bill_of_lading: "Bill of lading",
  inventory: "Inventory checklist",
  damage_waiver: "Damage waiver",
  job_completion: "Job completion",
  payment: "Payment receipt",
};

function packetKey(moveId: string, jobDayId: string): string {
  return `${moveId}:${jobDayId}`;
}

const MOCK_PACKETS: Record<string, JobFieldPacket> = {
  "mv-complete:mv-complete-jd1": {
    packetKey: "mv-complete:mv-complete-jd1",
    moveId: "mv-complete",
    jobDayId: "mv-complete-jd1",
    moveRef: "MV-DONE",
    customerName: "Angela Brooks",
    date: "2026-05-18",
    dayLabel: "Day 1",
    crewLead: "Marcus Webb",
    documents: [
      {
        id: "bol",
        kind: "bill_of_lading",
        label: DOCUMENT_LABELS.bill_of_lading,
        status: "signed",
        signedAt: "2026-05-18T16:32:00-04:00",
        signedBy: "Angela Brooks",
        submittedBy: "Marcus Webb",
      },
      {
        id: "inv",
        kind: "inventory",
        label: DOCUMENT_LABELS.inventory,
        status: "submitted",
        signedAt: "2026-05-18T15:05:00-04:00",
        submittedBy: "Marcus Webb",
      },
      {
        id: "waiver",
        kind: "damage_waiver",
        label: DOCUMENT_LABELS.damage_waiver,
        status: "signed",
        signedAt: "2026-05-18T15:08:00-04:00",
        signedBy: "Angela Brooks",
        submittedBy: "Marcus Webb",
      },
      {
        id: "complete",
        kind: "job_completion",
        label: DOCUMENT_LABELS.job_completion,
        status: "signed",
        signedAt: "2026-05-18T16:35:00-04:00",
        signedBy: "Angela Brooks",
        submittedBy: "Marcus Webb",
      },
      {
        id: "pay",
        kind: "payment",
        label: DOCUMENT_LABELS.payment,
        status: "submitted",
        signedAt: "2026-05-18T16:36:00-04:00",
        submittedBy: "Marcus Webb",
      },
    ],
    payment: {
      method: "Card on file (Stripe)",
      amountDue: 1650,
      amountCollected: 1650,
      tip: 120,
      status: "paid",
      collectedAt: "2026-05-18T16:36:00-04:00",
      collectedBy: "Marcus Webb",
      reference: "pi_demo_3k9f2a",
    },
    timeEntries: [
      { id: "t1", label: "Clock in — warehouse", at: "2026-05-18T07:58:00-04:00", crewMember: "Marcus Webb" },
      { id: "t2", label: "Arrived origin", at: "2026-05-18T08:42:00-04:00", crewMember: "Marcus Webb" },
      { id: "t3", label: "Departed destination", at: "2026-05-18T16:28:00-04:00", crewMember: "Marcus Webb" },
      { id: "t4", label: "Clock out", at: "2026-05-18T17:05:00-04:00", crewMember: "Marcus Webb" },
    ],
    crewNotes: "Customer added wardrobe boxes on site (+2). No damage noted.",
    photoCount: 14,
  },
  "mv-complete-2day:mv-complete-2day-jd1": {
    packetKey: "mv-complete-2day:mv-complete-2day-jd1",
    moveId: "mv-complete-2day",
    jobDayId: "mv-complete-2day-jd1",
    moveRef: "MV-2DAY",
    customerName: "Robert & Diana Chen",
    date: "2026-05-10",
    dayLabel: "Day 1",
    crewLead: "Elena Vasquez",
    documents: [
      {
        id: "bol-d1",
        kind: "bill_of_lading",
        label: DOCUMENT_LABELS.bill_of_lading,
        status: "signed",
        signedAt: "2026-05-10T19:38:00-04:00",
        signedBy: "Diana Chen",
        submittedBy: "Elena Vasquez",
      },
      {
        id: "inv-d1",
        kind: "inventory",
        label: DOCUMENT_LABELS.inventory,
        status: "submitted",
        signedAt: "2026-05-10T10:15:00-04:00",
        submittedBy: "Elena Vasquez",
      },
      {
        id: "waiver-d1",
        kind: "damage_waiver",
        label: DOCUMENT_LABELS.damage_waiver,
        status: "signed",
        signedAt: "2026-05-10T10:18:00-04:00",
        signedBy: "Diana Chen",
        submittedBy: "Elena Vasquez",
      },
    ],
    payment: {
      method: "Deposit on file",
      amountDue: 2425,
      amountCollected: 2425,
      tip: 0,
      status: "paid",
      collectedAt: "2026-05-10T19:40:00-04:00",
      collectedBy: "Elena Vasquez",
      reference: "Day 1 pack/load deposit",
    },
    timeEntries: [
      { id: "t1", label: "Clock in", at: "2026-05-10T07:55:00-04:00", crewMember: "Elena Vasquez" },
      { id: "t2", label: "Load complete", at: "2026-05-10T19:35:00-04:00", crewMember: "Elena Vasquez" },
    ],
    crewNotes: "Finished 7:42 PM — 0.5 hr over on fragile wrap.",
    photoCount: 22,
  },
  "mv-complete-2day:mv-complete-2day-jd2": {
    packetKey: "mv-complete-2day:mv-complete-2day-jd2",
    moveId: "mv-complete-2day",
    jobDayId: "mv-complete-2day-jd2",
    moveRef: "MV-2DAY",
    customerName: "Robert & Diana Chen",
    date: "2026-05-11",
    dayLabel: "Day 2",
    crewLead: "Elena Vasquez",
    documents: [
      {
        id: "bol-d2",
        kind: "bill_of_lading",
        label: DOCUMENT_LABELS.bill_of_lading,
        status: "signed",
        signedAt: "2026-05-11T17:12:00-04:00",
        signedBy: "Robert Chen",
        submittedBy: "Elena Vasquez",
      },
      {
        id: "complete-d2",
        kind: "job_completion",
        label: DOCUMENT_LABELS.job_completion,
        status: "signed",
        signedAt: "2026-05-11T17:15:00-04:00",
        signedBy: "Robert Chen",
        submittedBy: "Elena Vasquez",
      },
      {
        id: "pay-d2",
        kind: "payment",
        label: DOCUMENT_LABELS.payment,
        status: "submitted",
        signedAt: "2026-05-11T17:18:00-04:00",
        submittedBy: "Elena Vasquez",
      },
    ],
    payment: {
      method: "Card — tap to pay",
      amountDue: 2425,
      amountCollected: 2425,
      tip: 200,
      status: "paid",
      collectedAt: "2026-05-11T17:18:00-04:00",
      collectedBy: "Elena Vasquez",
      reference: "pi_demo_7h2k9b",
    },
    timeEntries: [
      { id: "t1", label: "Clock in", at: "2026-05-11T07:50:00-04:00", crewMember: "Elena Vasquez" },
      { id: "t2", label: "Unload complete", at: "2026-05-11T17:05:00-04:00", crewMember: "Elena Vasquez" },
      { id: "t3", label: "Clock out", at: "2026-05-11T17:45:00-04:00", crewMember: "Elena Vasquez" },
    ],
    crewNotes: "BOL signed on site. Elevator reserved 8–11 AM — no issues.",
    photoCount: 18,
  },
};

function formatSignedAt(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function fallbackPacket(row: OpsJobDayRow, move?: MoveRecord): JobFieldPacket {
  const amount = move?.quoteAmount ?? 0;
  const ref = move?.reference ?? row.moveId;
  const signedAt = `${row.date}T17:00:00-04:00`;
  return {
    packetKey: packetKey(row.moveId, row.jobDayId),
    moveId: row.moveId,
    jobDayId: row.jobDayId,
    moveRef: ref,
    customerName: row.customerName,
    date: row.date,
    dayLabel: row.dayLabel,
    crewLead: row.crewLine?.split("·")[0]?.trim() ?? "Crew lead",
    documents: [
      {
        id: "bol-fb",
        kind: "bill_of_lading",
        label: DOCUMENT_LABELS.bill_of_lading,
        status: "signed",
        signedAt,
        signedBy: row.customerName,
        submittedBy: "Crew app",
      },
      {
        id: "complete-fb",
        kind: "job_completion",
        label: DOCUMENT_LABELS.job_completion,
        status: "signed",
        signedAt,
        signedBy: row.customerName,
        submittedBy: "Crew app",
      },
      {
        id: "pay-fb",
        kind: "payment",
        label: DOCUMENT_LABELS.payment,
        status: "submitted",
        signedAt,
        submittedBy: "Crew app",
      },
    ],
    payment: {
      method: "Card on file",
      amountDue: amount,
      amountCollected: amount,
      tip: 0,
      status: amount > 0 ? "paid" : "partial",
      collectedAt: signedAt,
      collectedBy: "Crew app",
    },
    timeEntries: [
      {
        id: "t-in",
        label: "Clock in",
        at: `${row.date}T08:00:00-04:00`,
        crewMember: "Crew app",
      },
      {
        id: "t-out",
        label: "Clock out",
        at: `${row.date}T17:00:00-04:00`,
        crewMember: "Crew app",
      },
    ],
    crewNotes: "Submitted from the crew app — demo packet for this job day.",
    photoCount: 6,
  };
}

export function getJobFieldPacket(
  row: OpsJobDayRow,
  move?: MoveRecord,
): JobFieldPacket | null {
  if (row.status !== "completed") return null;
  const key = packetKey(row.moveId, row.jobDayId);
  return MOCK_PACKETS[key] ?? fallbackPacket(row, move);
}

export function jobFieldPacketSummary(packet: JobFieldPacket): string {
  const signed = packet.documents.filter((d) => d.status === "signed").length;
  return `${signed}/${packet.documents.length} forms · ${packet.payment.status === "paid" ? "Paid" : "Balance due"}`;
}

export function buildDocumentPreview(
  packet: JobFieldPacket,
  doc: JobFieldDocument,
): JobFieldDocumentPreview {
  const signedLabel = formatSignedAt(doc.signedAt);
  const base = [
    `${packet.moveRef} · ${packet.dayLabel}`,
    `${packet.customerName}`,
    `Job date ${packet.date}`,
    "",
  ];

  switch (doc.kind) {
    case "bill_of_lading":
      return {
        title: doc.label,
        subtitle: "Crew app · customer signed on site",
        body: [
          ...base,
          "Origin → destination load verified. High-value items noted on inventory.",
          "Crew lead: " + packet.crewLead,
          packet.crewNotes,
        ],
        signatureLine: doc.signedBy
          ? { name: doc.signedBy, at: signedLabel }
          : undefined,
      };
    case "inventory":
      return {
        title: doc.label,
        subtitle: "Room-by-room counts confirmed",
        body: [
          ...base,
          "Living room, bedrooms, kitchen, and garage walk-through completed.",
          "Appliances: washer/dryer disconnected per scope.",
          `${packet.photoCount} photos attached from the crew app.`,
        ],
      };
    case "damage_waiver":
      return {
        title: doc.label,
        subtitle: "Released value protection selection",
        body: [
          ...base,
          "Customer elected standard coverage per company terms.",
          "Pre-existing scratches documented on dining table — photos on file.",
        ],
        signatureLine: doc.signedBy
          ? { name: doc.signedBy, at: signedLabel }
          : undefined,
      };
    case "job_completion":
      return {
        title: doc.label,
        subtitle: "Move day sign-off",
        body: [
          ...base,
          "All agreed services performed. No new damage reported at completion.",
          packet.crewNotes,
        ],
        signatureLine: doc.signedBy
          ? { name: doc.signedBy, at: signedLabel }
          : undefined,
      };
    case "payment":
      return {
        title: doc.label,
        subtitle: packet.payment.method,
        body: [
          ...base,
          `Amount due: $${packet.payment.amountDue.toLocaleString()}`,
          `Collected: $${packet.payment.amountCollected.toLocaleString()}`,
          packet.payment.tip > 0 ? `Tip: $${packet.payment.tip.toLocaleString()}` : "No tip recorded",
          packet.payment.reference ? `Reference: ${packet.payment.reference}` : "",
          `Collected by ${packet.payment.collectedBy} · ${formatSignedAt(packet.payment.collectedAt)}`,
        ],
      };
    default:
      return { title: doc.label, subtitle: "", body: base };
  }
}

export { formatSignedAt, DOCUMENT_LABELS };
