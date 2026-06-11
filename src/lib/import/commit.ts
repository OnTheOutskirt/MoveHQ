import { enrichMockMove } from "@/lib/moves/mock-extras";
import { relabelJobDaysByDate } from "@/lib/moves/job-day-form";
import { defaultLocationsForNewDay, syncLegacyLocationNotes } from "@/lib/moves/job-day-locations";
import type { MoveJobDay, MoveRecord } from "@/lib/moves/types";
import {
  PIPELINE_STAGE_IDS,
  MOVE_CONDITION_STATUSES,
  LEAD_CHANNELS,
  MOVE_SOURCES,
} from "@/lib/moves/types";
import { createDefaultChecklist } from "@/lib/operations/claims-workflow";
import type { MoveClaim } from "@/lib/operations/claims-types";
import {
  CLAIM_CATEGORIES,
  CLAIM_RESOLUTION_TYPES,
  CLAIM_STATUSES,
} from "@/lib/operations/claims-types";
import { bulkUpsertCustomOrganizations } from "@/lib/people/organizations-storage";
import { bulkUpsertCustomPeople, listAllPeople } from "@/lib/people/people-storage";
import { listAllOrganizations } from "@/lib/people/organizations-storage";
import type {
  OrganizationRecord,
  OrganizationType,
  PersonRecord,
  ReferralPartnerType,
} from "@/lib/people/types";
import { ORGANIZATION_TYPES, PERSON_KINDS, REFERRAL_PARTNER_TYPES } from "@/lib/people/types";
import { DEFAULT_COMPANY_ID, DEFAULT_PRIMARY_LOCATION_ID } from "@/lib/workspace/constants";
import {
  importClaimId,
  importJobDayId,
  importMoveId,
  importOrgId,
  importPersonId,
  normalizeImportKey,
} from "./ids";
import type { JobDayLocation, JobDayLocationRole } from "@/lib/moves/types";
import type { ImportCommitResult, ImportCommitRowResult, ImportRowPreview } from "./types";

export type ImportContext = {
  existingMoves: MoveRecord[];
  existingClaims: MoveClaim[];
  companyId?: string;
  defaultLocationId?: string;
};

function rowResult(
  row: number,
  externalKey: string,
  status: ImportCommitRowResult["status"],
  extra?: Partial<ImportCommitRowResult>,
): ImportCommitRowResult {
  return { row, externalKey, status, ...extra };
}

function normalizeEnum<T extends string>(value: string, allowed: readonly T[], fallback: T): T {
  const v = value.trim().toLowerCase().replace(/\s+/g, "_") as T;
  return allowed.includes(v) ? v : fallback;
}

function parseMoney(value: string): number {
  const n = Number(value.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function commitOrganizations(
  rows: ImportRowPreview[],
  ctx: ImportContext,
): ImportCommitResult {
  const results: ImportCommitRowResult[] = [];
  const toUpsert: OrganizationRecord[] = [];
  const existing = new Map(listAllOrganizations().map((o) => [o.id, o] as const));
  const peopleByExternal = buildPersonExternalMap();

  for (const preview of rows) {
    const { data, row } = preview;
    const externalId = data.external_id.trim();
    const id = importOrgId(externalId);
    const isUpdate = existing.has(id);

    let primaryContactId: string | null = null;
    if (data.primary_contact_external_id.trim()) {
      primaryContactId =
        peopleByExternal.get(normalizeImportKey(data.primary_contact_external_id)) ?? null;
      if (!primaryContactId) {
        results.push(
          rowResult(row, externalId, "failed", {
            message: `Primary contact "${data.primary_contact_external_id}" not found — import people first or leave blank.`,
          }),
        );
        continue;
      }
    }

    const ts = nowIso();
    const org: OrganizationRecord = {
      id,
      name: data.name.trim(),
      orgType: normalizeEnum(data.org_type, ORGANIZATION_TYPES, "other"),
      phone: data.phone.trim() || null,
      email: data.email.trim() || null,
      address: data.address.trim() || null,
      website: data.website.trim() || null,
      primaryContactId,
      moveIds: existing.get(id)?.moveIds ?? [],
      notes: data.notes.trim() || null,
      createdAt: existing.get(id)?.createdAt ?? ts,
      updatedAt: ts,
    };
    toUpsert.push(org);
    results.push(
      rowResult(row, externalId, isUpdate ? "updated" : "created", { entityId: id }),
    );
  }

  bulkUpsertCustomOrganizations(toUpsert);
  return summarize("organizations", results);
}

export function commitPeople(rows: ImportRowPreview[], ctx: ImportContext): ImportCommitResult {
  const results: ImportCommitRowResult[] = [];
  const toUpsert: PersonRecord[] = [];
  const existingPeople = new Map(listAllPeople().map((p) => [p.id, p] as const));
  const orgByExternal = buildOrgExternalMap();

  for (const preview of rows) {
    const { data, row } = preview;
    const externalId = data.external_id.trim();
    const id = importPersonId(externalId);
    const isUpdate = existingPeople.has(id);

    let organizationId: string | null = null;
    if (data.organization_external_id.trim()) {
      organizationId = orgByExternal.get(normalizeImportKey(data.organization_external_id)) ?? null;
      if (!organizationId) {
        results.push(
          rowResult(row, externalId, "failed", {
            message: `Organization "${data.organization_external_id}" not found — import organizations first.`,
          }),
        );
        continue;
      }
    }

    const kind = normalizeEnum(data.kind, PERSON_KINDS, "customer");
    const referralType =
      kind === "referral" && data.referral_type.trim()
        ? normalizeEnum(data.referral_type, REFERRAL_PARTNER_TYPES, "other")
        : null;

    const ts = nowIso();
    const person: PersonRecord = {
      id,
      name: data.name.trim(),
      kind,
      referralType,
      phone: data.phone.trim() || null,
      email: data.email.trim() || null,
      organizationId,
      title: data.title.trim() || null,
      moveIds: existingPeople.get(id)?.moveIds ?? [],
      notes: data.notes.trim() || null,
      createdAt: existingPeople.get(id)?.createdAt ?? ts,
      updatedAt: ts,
    };
    toUpsert.push(person);
    results.push(
      rowResult(row, externalId, isUpdate ? "updated" : "created", { entityId: id }),
    );
  }

  bulkUpsertCustomPeople(toUpsert);
  return summarize("people", results);
}

export function commitMoves(
  rows: ImportRowPreview[],
  ctx: ImportContext,
): { result: ImportCommitResult; moves: MoveRecord[] } {
  const results: ImportCommitRowResult[] = [];
  const movesById = new Map(ctx.existingMoves.map((m) => [m.id, m] as const));
  const movesByRef = new Map(ctx.existingMoves.map((m) => [m.reference.toLowerCase(), m] as const));
  const peopleByExternal = buildPersonExternalMap();
  const companyId = ctx.companyId ?? DEFAULT_COMPANY_ID;
  const locationId = ctx.defaultLocationId ?? DEFAULT_PRIMARY_LOCATION_ID;

  for (const preview of rows) {
    const { data, row } = preview;
    const reference = data.move_reference.trim();
    const externalKey = reference;
    const id = importMoveId(reference);
    const existing = movesById.get(id) ?? movesByRef.get(reference.toLowerCase());
    const isUpdate = Boolean(existing);

    const personId = peopleByExternal.get(normalizeImportKey(data.customer_external_id.trim()));
    if (!personId) {
      results.push(
        rowResult(row, externalKey, "failed", {
          message: `Customer "${data.customer_external_id}" not found — import people first.`,
        }),
      );
      continue;
    }

    const person = listAllPeople().find((p) => p.id === personId);
    const ts = nowIso();
    const pipelineStage = data.pipeline_stage.trim()
      ? normalizeEnum(data.pipeline_stage, PIPELINE_STAGE_IDS, "completed")
      : "completed";
    const conditionStatus = data.condition_status.trim()
      ? normalizeEnum(data.condition_status, MOVE_CONDITION_STATUSES, "closed")
      : pipelineStage === "completed"
        ? "closed"
        : "active";

    const core = {
      id: existing?.id ?? id,
      companyId: existing?.companyId ?? companyId,
      locationId: data.location_id.trim() || existing?.locationId || locationId,
      reference,
      pipelineStage,
      waitingSubstage: existing?.waitingSubstage ?? null,
      conditionStatus,
      bookingReviewStatus: existing?.bookingReviewStatus ?? "not_required",
      lostAt: data.lost_at.trim() || existing?.lostAt || null,
      lostFromStage: existing?.lostFromStage ?? null,
      lostReason: data.lost_reason.trim() || existing?.lostReason || null,
      leadChannel: data.lead_channel.trim()
        ? normalizeEnum(data.lead_channel, LEAD_CHANNELS, "phone")
        : "phone",
      quoteChannel: existing?.quoteChannel ?? "office",
      intakeProgress: existing?.intakeProgress ?? "started",
      websiteIntake: existing?.websiteIntake ?? null,
      contactId: personId,
      customerName: data.customer_name.trim() || person?.name || reference,
      customerPhone: data.customer_phone.trim() || person?.phone || "",
      customerEmail: data.customer_email.trim() || person?.email || "",
      status: existing?.status ?? "completed",
      source: data.source.trim()
        ? normalizeEnum(data.source, MOVE_SOURCES, "Manual entry")
        : "Manual entry",
      assignedRep: data.assigned_rep.trim() || existing?.assignedRep || "",
      coordinator: data.coordinator.trim() || existing?.coordinator || null,
      moveType: (data.move_type.trim() || existing?.moveType || "Local") as MoveRecord["moveType"],
      originAddress: data.origin_address.trim() || existing?.originAddress || "",
      destinationAddress: data.destination_address.trim() || existing?.destinationAddress || "",
      preferredDate: data.preferred_date.trim() || existing?.preferredDate || "",
      quoteAmount: data.quote_amount.trim() ? parseMoney(data.quote_amount) : existing?.quoteAmount ?? null,
      quoteType: (data.quote_type.trim() || existing?.quoteType || null) as MoveRecord["quoteType"],
      bedrooms: data.bedrooms.trim() ? Number(data.bedrooms) : existing?.bedrooms ?? null,
      createdAt: data.created_at.trim() || existing?.createdAt || ts,
      updatedAt: ts,
      activities: existing?.activities ?? [],
      jobDays: existing?.jobDays ?? [],
      linkedPeople: existing?.linkedPeople,
    };

    const move = enrichMockMove(core);
    if (data.notes.trim()) {
      move.activities = [
        {
          id: `activity-${move.id}-import-note`,
          type: "note",
          at: ts,
          summary: data.notes.trim(),
          actor: "Data import",
        },
        ...move.activities,
      ];
    }

    movesById.set(move.id, move);
    movesByRef.set(reference.toLowerCase(), move);
    results.push(
      rowResult(row, externalKey, isUpdate ? "updated" : "created", { entityId: move.id }),
    );
  }

  return {
    result: summarize("moves", results),
    moves: [...movesById.values()],
  };
}

export function commitJobDays(
  rows: ImportRowPreview[],
  moves: MoveRecord[],
): { result: ImportCommitResult; moves: MoveRecord[] } {
  const results: ImportCommitRowResult[] = [];
  const movesByRef = new Map(moves.map((m) => [m.reference.toLowerCase(), { ...m }] as const));
  const dayCounts = new Map<string, number>();

  for (const preview of rows) {
    const { data, row } = preview;
    const moveRef = data.move_reference.trim();
    const externalKey = `${moveRef}|${data.date}`;
    const move = movesByRef.get(moveRef.toLowerCase());

    if (!move) {
      results.push(
        rowResult(row, externalKey, "failed", {
          message: `Move "${moveRef}" not found — import moves first.`,
        }),
      );
      continue;
    }

    const count = (dayCounts.get(moveRef.toLowerCase()) ?? move.jobDays.length) + 1;
    dayCounts.set(moveRef.toLowerCase(), count);

    const services = data.services
      .split(/[,;|]/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean) as MoveJobDay["services"];

    const jobDay: MoveJobDay = {
      id: importJobDayId(moveRef, count),
      label: data.day_label.trim() || `Day ${count}`,
      date: data.date.trim(),
      status: data.status.trim()
        ? normalizeEnum(
            data.status,
            ["proposed", "scheduled", "in_progress", "completed", "cancelled"] as const,
            "completed",
          )
        : "completed",
      crewSize: data.crew_size.trim() ? Number(data.crew_size) : undefined,
      truckCount: data.truck_count.trim() ? Number(data.truck_count) : undefined,
      services: services && services.length > 0 ? services : ["moving"],
      hoursEstimated: data.hours_estimated.trim() ? Number(data.hours_estimated) : undefined,
      hoursActual: data.hours_actual.trim() ? Number(data.hours_actual) : undefined,
      arrivalWindow: data.arrival_window.trim() || undefined,
      departureWindow: data.departure_window.trim() || undefined,
      dispatchNotes: data.dispatch_notes.trim() || undefined,
      customerNotes: data.customer_notes.trim() || undefined,
    };

    const withLocations = applyDayAddresses(jobDay, move, data);
    const existingIndex = move.jobDays.findIndex(
      (d) => d.date === jobDay.date && d.label === jobDay.label,
    );
    const nextDays =
      existingIndex >= 0
        ? move.jobDays.map((d, i) => (i === existingIndex ? withLocations : d))
        : [...move.jobDays, withLocations];

    const updated: MoveRecord = {
      ...move,
      jobDays: relabelJobDaysByDate(
        nextDays.map((d) => {
          const locations =
            d.locations && d.locations.length > 0
              ? d.locations
              : defaultLocationsForNewDay(move);
          const patched = { ...d, locations };
          return { ...patched, ...syncLegacyLocationNotes(patched) };
        }),
      ),
      updatedAt: nowIso(),
    };

    movesByRef.set(moveRef.toLowerCase(), updated);
    results.push(
      rowResult(row, externalKey, existingIndex >= 0 ? "updated" : "created", {
        entityId: withLocations.id,
      }),
    );
  }

  return {
    result: summarize("job_days", results),
    moves: [...movesByRef.values()],
  };
}

export function commitClaims(
  rows: ImportRowPreview[],
  ctx: ImportContext,
): { result: ImportCommitResult; claims: MoveClaim[] } {
  const results: ImportCommitRowResult[] = [];
  const claimsById = new Map(ctx.existingClaims.map((c) => [c.id, c] as const));
  const movesByRef = new Map(ctx.existingMoves.map((m) => [m.reference.toLowerCase(), m] as const));
  const imported: MoveClaim[] = [];

  for (const preview of rows) {
    const { data, row } = preview;
    const moveRef = data.move_reference.trim();
    const move = movesByRef.get(moveRef.toLowerCase());
    if (!move) {
      results.push(
        rowResult(row, moveRef, "failed", {
          message: `Move "${moveRef}" not found.`,
        }),
      );
      continue;
    }

    const claimRef = data.claim_reference.trim() || `CLM-IMP-${slug(moveRef)}-${row}`;
    const id = importClaimId(claimRef);
    const existing = claimsById.get(id);
    const ts = nowIso();
    const category = normalizeEnum(data.category, CLAIM_CATEGORIES, "other");
    const status = data.status.trim()
      ? normalizeEnum(data.status, CLAIM_STATUSES, "completed")
      : "completed";

    const claim: MoveClaim = {
      id,
      reference: claimRef,
      moveId: move.id,
      customerName: move.customerName,
      moveReference: move.reference,
      status,
      category,
      title: data.title.trim(),
      description: data.description.trim() || undefined,
      reportedDate: data.reported_date.trim(),
      amountClaimed: parseMoney(data.amount_claimed),
      amountPaid: parseMoney(data.amount_paid),
      reportedBy: "Data import",
      notes: data.notes.trim() || undefined,
      checklist: existing?.checklist ?? createDefaultChecklist(category),
      commsLog: existing?.commsLog ?? [],
      resolutionType: data.resolution_type.trim()
        ? normalizeEnum(data.resolution_type, CLAIM_RESOLUTION_TYPES, "credit")
        : undefined,
      createdAt: existing?.createdAt ?? ts,
      updatedAt: ts,
      resolvedAt: data.resolved_at.trim() || (status === "completed" || status === "denied" ? ts : undefined),
    };

    claimsById.set(id, claim);
    imported.push(claim);
    results.push(
      rowResult(row, claimRef, existing ? "updated" : "created", { entityId: id }),
    );
  }

  return { result: summarize("claims", results), claims: [...claimsById.values()] };
}

export type InventoryCommitInput = {
  catalogId: string;
  quantityOnHand: number;
  reorderPoint: number;
  note?: string;
};

export function commitInventoryRows(rows: ImportRowPreview[]): {
  result: ImportCommitResult;
  lines: InventoryCommitInput[];
} {
  const results: ImportCommitRowResult[] = [];
  const lines: InventoryCommitInput[] = [];

  for (const preview of rows) {
    const { data, row } = preview;
    const catalogId = data.catalog_id.trim();
    lines.push({
      catalogId,
      quantityOnHand: parseMoney(data.quantity_on_hand),
      reorderPoint: data.reorder_point.trim() ? parseMoney(data.reorder_point) : 0,
      note: data.note.trim() || undefined,
    });
    results.push(rowResult(row, catalogId, "updated", { entityId: catalogId }));
  }

  return { result: summarize("inventory", results), lines };
}

function applyDayAddresses(
  day: MoveJobDay,
  move: MoveRecord,
  data: Record<string, string>,
): MoveJobDay {
  const origin = data.origin_address.trim();
  const dest = data.destination_address.trim();
  if (!origin && !dest) return day;

  const locations: JobDayLocation[] = [];
  if (origin) {
    locations.push(freeformLocation(origin, "origin", `${day.id}-origin`));
  }
  if (dest) {
    locations.push(freeformLocation(dest, "destination", `${day.id}-dest`));
  }
  const patched = { ...day, locations };
  return { ...patched, ...syncLegacyLocationNotes(patched) };
}

function freeformLocation(
  address: string,
  role: JobDayLocationRole,
  id: string,
): JobDayLocation {
  return {
    id,
    role,
    label: role === "origin" ? "Origin" : "Destination",
    formattedAddress: address,
    street: address,
    cityStateZip: "",
    locationType: "",
  };
}

function buildOrgExternalMap(): Map<string, string> {
  const map = new Map<string, string>();
  for (const org of listAllOrganizations()) {
    if (org.id.startsWith("imp-org-")) {
      map.set(org.id.replace(/^imp-org-/, ""), org.id);
    }
  }
  return map;
}

function buildPersonExternalMap(): Map<string, string> {
  const map = new Map<string, string>();
  for (const person of listAllPeople()) {
    if (person.id.startsWith("imp-person-")) {
      map.set(person.id.replace(/^imp-person-/, ""), person.id);
    }
  }
  return map;
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function summarize(
  dataset: ImportCommitResult["dataset"],
  rows: ImportCommitRowResult[],
): ImportCommitResult {
  return {
    dataset,
    created: rows.filter((r) => r.status === "created").length,
    updated: rows.filter((r) => r.status === "updated").length,
    skipped: rows.filter((r) => r.status === "skipped").length,
    failed: rows.filter((r) => r.status === "failed").length,
    rows,
  };
}
