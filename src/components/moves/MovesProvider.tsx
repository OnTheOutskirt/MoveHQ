"use client";

import { NewMoveDialog } from "@/components/moves/NewMoveDialog";
import { useSession } from "@/components/providers/SessionProvider";
import { useWorkspace } from "@/components/providers/WorkspaceProvider";
import {
  cancelAutomatedFollowUpsOnMove,
  openAutomatedFollowUps,
} from "@/lib/moves/cancel-automated-follow-ups";
import { applyAcquisitionFields, approveWebsiteBookingReview, dismissWebsiteQueueMove, websiteQueueConfig, type WebsiteQueueId } from "@/lib/moves/acquisition";
import { buildNewMoveFromPerson } from "@/lib/moves/create-move";
import { duplicateMoveRecord } from "@/lib/moves/duplicate-move";
import {
  type ManualPhonePaymentInput,
  manualPhonePaymentPurposeLabel,
} from "@/lib/moves/manual-phone-payment";
import { ensureMovesHaveRateSnapshots, lockMoveRatesOnContract } from "@/lib/pricing/rate-snapshot";
import {
  initialMovesState,
  MOVES_SESSION_KEY,
  movesSessionFingerprint,
  readMovesSession,
  writeMovesSession,
} from "@/lib/moves/moves-session-storage";
import {
  buildLostReasonDisplay,
  LOST_QUALIFICATION_LABELS,
  type MarkLostPayload,
} from "@/lib/moves/lost-reasons";
import {
  applyPipelineStage,
  applyWaitingSubstage,
  isMoveLost,
  markMoveLost,
  moveStageDisplayLabel,
  pipelineStageLabel,
  reopenLostMove,
  waitingSubstageLabel,
} from "@/lib/moves/move-pipeline";
import { buildMoveDocumentPortalUrl, resolveSentContract, resolveSentQuote } from "@/lib/moves/move-document-send";
import {
  crewFeedbackSummary,
  googleReviewUrlForMove,
  shouldOfferGoogleReview,
} from "@/lib/moves/move-feedback-portal";
import { loadSettings } from "@/lib/settings/storage";
import { loadWorkspaceConfig } from "@/lib/workspace/storage";
import type { DocumentSendKind } from "@/lib/moves/document-template-render";
import { relabelJobDaysByDate } from "@/lib/moves/job-day-form";
import { CHANNEL_TO_ROLES, isUnknownReferralContact } from "@/lib/moves/lead-referral";
import { applyIntakeToMove } from "@/lib/moves/sync-move-intake";
import { applyMoveTypeRuleToMove, moveMatchesCatalogType } from "@/lib/settings/move-type-migration";
import type { FieldCatalogSettings } from "@/lib/settings/field-catalog-types";
import type { MoveTypeRulesSettings } from "@/lib/settings/move-type-rules";
import { moveTypeCatalogIdToDisplay } from "@/lib/settings/field-catalog-defaults";
import { ensureMovesWorkspaceFields } from "@/lib/workspace/move-scope";
import { DEFAULT_COMPANY_ID } from "@/lib/workspace/constants";
import type { FlatRateIntake } from "@/lib/moves/flat-rate-intake";
import { linkPersonToMove } from "@/lib/people/people-storage";
import type { PersonRecord } from "@/lib/people/types";
import {
  createFollowUp,
  syncFollowUpDue,
} from "@/lib/moves/move-follow-ups";
import {
  scheduleWalkthroughOnMove,
  cancelWalkthroughOnMove,
  type WalkthroughScheduleDraft,
} from "@/lib/moves/walkthroughs";
import type {
  LeadChannel,
  MoveActivity,
  MoveActivityDocumentMeta,
  MoveCrewFeedback,
  MoveJobDay,
  MoveLinkedPerson,
  MoveRecord,
  MoveSentDocument,
  PipelineStageId,
  WaitingSubstage,
  FollowUpStatus,
} from "@/lib/moves/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type { FollowUpChannel } from "@/lib/moves/types";

export type AddFollowUpTaskInput = {
  title: string;
  dueAt: string;
  channel: Exclude<FollowUpChannel, "task">;
  notes?: string;
};

type MovesContextValue = {
  moves: MoveRecord[];
  getMoveById: (id: string) => MoveRecord | undefined;
  updateMovePipelineStage: (
    moveId: string,
    stage: PipelineStageId,
    options?: { waitingSubstage?: WaitingSubstage },
  ) => void;
  updateWaitingSubstage: (moveId: string, substage: WaitingSubstage) => void;
  markAsLost: (moveId: string, payload: MarkLostPayload) => void;
  reopenMove: (moveId: string) => void;
  updateAssignedRep: (moveId: string, rep: string) => void;
  updateMoveLocation: (moveId: string, locationId: string, locationLabel?: string) => void;
  /** Repoint a move's contact / linked-person references from one person to another (merge). */
  reassignMoveContact: (moveId: string, fromPersonId: string, toPerson: PersonRecord) => void;
  addJobDay: (moveId: string, day: MoveJobDay) => void;
  updateJobDay: (moveId: string, day: MoveJobDay) => void;
  removeJobDay: (moveId: string, dayId: string) => void;
  addLinkedPerson: (moveId: string, person: MoveLinkedPerson) => void;
  setReferralContact: (moveId: string, person: MoveLinkedPerson) => void;
  clearReferralContact: (moveId: string) => void;
  clearShipper: (moveId: string) => void;
  setShipper: (moveId: string, person: PersonRecord) => void;
  updateMoveIntake: (
    moveId: string,
    patch: Partial<FlatRateIntake> | ((prev: FlatRateIntake) => FlatRateIntake),
  ) => void;
  updateMoveQuote: (
    moveId: string,
    patch: { quoteType?: MoveRecord["quoteType"]; quoteAmount?: number | null },
  ) => void;
  updateMoveQuoteDiscount: (
    moveId: string,
    discount: MoveRecord["quoteDiscount"],
  ) => void;
  recordMoveDocumentSent: (moveId: string, kind: DocumentSendKind) => void;
  recordMoveDocumentViewed: (moveId: string, kind: DocumentSendKind) => void;
  recordQuoteBookingRequested: (moveId: string) => void;
  recordContractSignedWithDeposit: (moveId: string, depositAmount: number) => void;
  recordPortalInventoryChangeRequest: (moveId: string, message: string) => void;
  recordCrewFeedback: (moveId: string, rating: number, comment: string) => void;
  updateLeadChannel: (moveId: string, channel: LeadChannel) => void;
  createMove: (person: PersonRecord) => string;
  duplicateMove: (moveId: string) => string;
  deleteMove: (moveId: string) => void;
  openNewMoveDialog: () => void;
  closeNewMoveDialog: () => void;
  scheduleWalkthrough: (
    moveId: string,
    draft: WalkthroughScheduleDraft,
    actor?: string,
  ) => void;
  cancelWalkthrough: (
    moveId: string,
    options?: { actor?: string; cancelledBy?: "staff" | "customer" },
  ) => void;
  cancelAutomatedFollowUps: (moveId: string) => void;
  addFollowUpTask: (moveId: string, input: AddFollowUpTaskInput) => void;
  updateFollowUpStatus: (
    moveId: string,
    followUpId: string,
    status: Exclude<FollowUpStatus, "open">,
  ) => void;
  recordManualPhonePayment: (moveId: string, input: ManualPhonePaymentInput) => void;
  approveWebsiteBookingReview: (moveId: string) => void;
  clearFromWebsiteQueue: (moveId: string, queue: WebsiteQueueId) => void;
  recordWalkthroughLinkSent: (
    moveId: string,
    assignee: string,
    linkUrl: string,
    linkModeLabel?: string,
  ) => void;
  /** Reassign active moves when a catalog move type is deleted. */
  reassignMovesFromDeletedMoveType: (
    fromCatalogId: string,
    toCatalogId: string,
    moveTypeRules: MoveTypeRulesSettings,
    catalog: FieldCatalogSettings,
  ) => void;
  /** Merge imported / migrated moves by id (setup CSV import). */
  importMoves: (imported: MoveRecord[]) => void;
};

type MovesDataContextValue = Pick<MovesContextValue, "moves" | "getMoveById">;
type MovesActionsContextValue = Omit<MovesContextValue, keyof MovesDataContextValue>;

const MovesDataContext = createContext<MovesDataContextValue | null>(null);
const MovesActionsContext = createContext<MovesActionsContextValue | null>(null);

function hydrateMovesFromSession(companyId: string): MoveRecord[] {
  const base = readMovesSession() ?? initialMovesState();
  return ensureMovesHaveRateSnapshots(ensureMovesWorkspaceFields(base, companyId));
}

export function MovesProvider({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const { filterByActiveScope, locationIdForNewRecords, config } = useWorkspace();
  const [allMoves, setAllMoves] = useState<MoveRecord[]>(initialMovesState);
  const [newMoveDialogOpen, setNewMoveDialogOpen] = useState(false);
  const persistFingerprintRef = useRef("");

  const moves = useMemo(
    () => filterByActiveScope(allMoves),
    [allMoves, filterByActiveScope],
  );

  useEffect(() => {
    const normalized = hydrateMovesFromSession(config.company.id);
    setAllMoves((prev) => {
      if (movesSessionFingerprint(prev) === movesSessionFingerprint(normalized)) {
        return prev;
      }
      return normalized;
    });
    persistFingerprintRef.current = movesSessionFingerprint(normalized);
  }, [config.company.id]);

  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key !== MOVES_SESSION_KEY) return;
      const stored = readMovesSession();
      if (stored) {
        setAllMoves(
          ensureMovesHaveRateSnapshots(
            ensureMovesWorkspaceFields(stored, config.company.id),
          ),
        );
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [config.company.id]);

  useEffect(() => {
    const fingerprint = movesSessionFingerprint(allMoves);
    if (fingerprint === persistFingerprintRef.current) return;

    const timer = window.setTimeout(() => {
      persistFingerprintRef.current = fingerprint;
      writeMovesSession(allMoves);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [allMoves]);

  const getMoveById = useCallback(
    (id: string) => allMoves.find((m) => m.id === id),
    [allMoves],
  );

  const appendActivity = (
    move: MoveRecord,
    summary: string,
    at = new Date().toISOString(),
    options?: {
      type?: MoveActivity["type"];
      actor?: string;
      document?: MoveActivityDocumentMeta;
    },
  ): MoveRecord => ({
    ...move,
    updatedAt: at,
    activities: [
      {
        id: `activity-${move.id}-${at}`,
        type: options?.type ?? "status_change",
        at,
        summary,
        actor: options?.actor,
        document: options?.document,
      },
      ...move.activities,
    ],
  });

  function patchSentDocument(
    move: MoveRecord,
    kind: DocumentSendKind,
    patch: Partial<MoveSentDocument>,
  ): MoveRecord {
    if (kind === "quote") {
      const base = move.sentQuote ?? {
        sentAt: move.updatedAt,
        portalUrl: buildMoveDocumentPortalUrl(move.id, "quote"),
      };
      return { ...move, sentQuote: { ...base, ...patch } };
    }
    const base = move.sentContract ?? {
      sentAt: move.updatedAt,
      portalUrl: buildMoveDocumentPortalUrl(move.id, "contract"),
    };
    return { ...move, sentContract: { ...base, ...patch } };
  }

  const updateMovePipelineStage = useCallback(
    (
      moveId: string,
      stage: PipelineStageId,
      options?: { waitingSubstage?: WaitingSubstage },
    ) => {
      setAllMoves((prev) =>
        prev.map((move) => {
          if (move.id !== moveId || isMoveLost(move) || move.pipelineStage === stage) return move;
          const next = applyPipelineStage(move, stage, options?.waitingSubstage);
          return appendActivity(
            next,
            `Pipeline → ${moveStageDisplayLabel(next)}`,
          );
        }),
      );
    },
    [],
  );

  const updateWaitingSubstage = useCallback((moveId: string, substage: WaitingSubstage) => {
    setAllMoves((prev) =>
      prev.map((move) => {
        if (move.id !== moveId || isMoveLost(move)) return move;
        const next = applyWaitingSubstage(move, substage);
        return appendActivity(
          next,
          `Waiting → ${waitingSubstageLabel(substage)}`,
        );
      }),
    );
  }, []);

  const markAsLost = useCallback((moveId: string, payload: MarkLostPayload) => {
    setAllMoves((prev) =>
      prev.map((move) => {
        if (move.id !== moveId || isMoveLost(move)) return move;
        const next = markMoveLost(move, payload);
        const summary = buildLostReasonDisplay(payload);
        return appendActivity(
          next,
          `Marked lost (${LOST_QUALIFICATION_LABELS[payload.qualification]}) from ${pipelineStageLabel(move.pipelineStage)} — ${summary}`,
        );
      }),
    );
  }, []);

  const reopenMove = useCallback((moveId: string) => {
    setAllMoves((prev) =>
      prev.map((move) => {
        if (move.id !== moveId || !isMoveLost(move)) return move;
        const next = reopenLostMove(move);
        return appendActivity(next, "Re-opened — cleared lost status");
      }),
    );
  }, []);

  const updateAssignedRep = useCallback((moveId: string, rep: string) => {
    setAllMoves((prev) =>
      prev.map((move) => {
        if (move.id !== moveId || move.assignedRep === rep) return move;
        return appendActivity({ ...move, assignedRep: rep }, `Sales rep → ${rep}`);
      }),
    );
  }, []);

  const updateMoveLocation = useCallback(
    (moveId: string, locationId: string, locationLabel?: string) => {
      setAllMoves((prev) =>
        prev.map((move) => {
          if (move.id !== moveId || move.locationId === locationId) return move;
          return appendActivity(
            { ...move, locationId },
            `Location → ${locationLabel ?? locationId}`,
          );
        }),
      );
    },
    [],
  );

  const reassignMoveContact = useCallback(
    (moveId: string, fromPersonId: string, toPerson: PersonRecord) => {
      setAllMoves((prev) =>
        prev.map((move) => {
          if (move.id !== moveId) return move;

          const wasContact = move.contactId === fromPersonId;
          const touchesLinked = move.linkedPeople.some((p) => p.personId === fromPersonId);
          if (!wasContact && !touchesLinked) return move;

          const linkedPeople = move.linkedPeople.map((p) =>
            p.personId === fromPersonId
              ? {
                  ...p,
                  personId: toPerson.id,
                  name: toPerson.name,
                  phone: toPerson.phone ?? undefined,
                  email: toPerson.email ?? undefined,
                }
              : p,
          );

          const next: MoveRecord = {
            ...move,
            linkedPeople,
            ...(wasContact
              ? {
                  contactId: toPerson.id,
                  customerName: toPerson.name,
                  customerPhone: toPerson.phone ?? "",
                  customerEmail: toPerson.email ?? "",
                }
              : {}),
          };
          return appendActivity(next, `Contact merged → ${toPerson.name}`);
        }),
      );
    },
    [],
  );

  const addJobDay = useCallback((moveId: string, day: MoveJobDay) => {
    setAllMoves((prev) =>
      prev.map((move) => {
        if (move.id !== moveId) return move;
        const jobDays = relabelJobDaysByDate([...move.jobDays, day]);
        const added = jobDays.find((d) => d.id === day.id) ?? day;
        return appendActivity({ ...move, jobDays }, `Job day added — ${added.label}`);
      }),
    );
  }, []);

  const updateJobDay = useCallback((moveId: string, day: MoveJobDay) => {
    setAllMoves((prev) =>
      prev.map((move) => {
        if (move.id !== moveId) return move;
        const merged = move.jobDays.map((d) => (d.id === day.id ? day : d));
        if (merged.every((d, i) => d === move.jobDays[i])) return move;
        const jobDays = relabelJobDaysByDate(merged);
        const updated = jobDays.find((d) => d.id === day.id) ?? day;
        return appendActivity({ ...move, jobDays }, `Job day updated — ${updated.label}`);
      }),
    );
  }, []);

  const removeJobDay = useCallback((moveId: string, dayId: string) => {
    setAllMoves((prev) =>
      prev.map((move) => {
        if (move.id !== moveId) return move;
        const removed = move.jobDays.find((d) => d.id === dayId);
        if (!removed) return move;
        const jobDays = relabelJobDaysByDate(move.jobDays.filter((d) => d.id !== dayId));
        return appendActivity(
          { ...move, jobDays },
          `Job day removed — ${removed.label}`,
        );
      }),
    );
  }, []);

  const addLinkedPerson = useCallback((moveId: string, person: MoveLinkedPerson) => {
    setAllMoves((prev) =>
      prev.map((move) => {
        if (move.id !== moveId) return move;
        const referralRoles = CHANNEL_TO_ROLES[move.leadChannel] ?? [];
        if (referralRoles.includes(person.role)) {
          return move;
        }
        const exists = move.linkedPeople.some(
          (p) =>
            (person.personId && p.personId === person.personId && p.role === person.role) ||
            (p.id === person.id && p.role === person.role),
        );
        if (exists) return move;
        return appendActivity(
          { ...move, linkedPeople: [...move.linkedPeople, person] },
          `Added ${person.name} as ${person.role.replace("_", " ")}`,
        );
      }),
    );
  }, []);

  const clearShipper = useCallback((moveId: string) => {
    setAllMoves((prev) =>
      prev.map((move) => {
        if (move.id !== moveId) return move;
        const name = move.customerName.trim() || "Shipper";
        return appendActivity(
          {
            ...move,
            contactId: "",
            customerName: "",
            customerPhone: "",
            customerEmail: "",
            linkedPeople: move.linkedPeople.filter((p) => p.role !== "customer"),
          },
          `Shipper removed — ${name}`,
        );
      }),
    );
  }, []);

  const setShipper = useCallback((moveId: string, person: PersonRecord) => {
    setAllMoves((prev) =>
      prev.map((move) => {
        if (move.id !== moveId) return move;
        const customerLink: MoveLinkedPerson = {
          id: `${moveId}-customer-${person.id}`,
          personId: person.id,
          name: person.name,
          role: "customer",
          phone: person.phone ?? undefined,
          email: person.email ?? undefined,
          isPrimary: true,
        };
        const linkedPeople = [
          ...move.linkedPeople.filter((p) => p.role !== "customer"),
          customerLink,
        ];
        return appendActivity(
          {
            ...move,
            contactId: person.id,
            customerName: person.name,
            customerPhone: person.phone ?? "",
            customerEmail: person.email ?? "",
            linkedPeople,
          },
          `Shipper set to ${person.name}`,
        );
      }),
    );
  }, []);

  const clearReferralContact = useCallback((moveId: string) => {
    setAllMoves((prev) =>
      prev.map((move) => {
        if (move.id !== moveId) return move;
        const referralRoles = CHANNEL_TO_ROLES[move.leadChannel] ?? [];
        const removed = move.linkedPeople.find((p) => referralRoles.includes(p.role));
        const kept = move.linkedPeople.filter((p) => !referralRoles.includes(p.role));
        if (!removed) return move;
        return appendActivity(
          { ...move, linkedPeople: kept },
          `Referral contact removed — ${removed.name}`,
        );
      }),
    );
  }, []);

  const updateMoveIntake = useCallback(
    (
      moveId: string,
      patch: Partial<FlatRateIntake> | ((prev: FlatRateIntake) => FlatRateIntake),
    ) => {
      setAllMoves((prev) =>
        prev.map((move) => {
          if (move.id !== moveId) return move;
          const nextIntake =
            typeof patch === "function" ? patch(move.intake) : { ...move.intake, ...patch };
          const next = applyIntakeToMove(move, nextIntake);
          return appendActivity(next, "Move plan updated");
        }),
      );
    },
    [],
  );

  const updateMoveQuote = useCallback(
    (
      moveId: string,
      patch: { quoteType?: MoveRecord["quoteType"]; quoteAmount?: number | null },
    ) => {
      setAllMoves((prev) =>
        prev.map((move) => {
          if (move.id !== moveId) return move;
          const nextType = patch.quoteType ?? move.quoteType;
          const nextAmount =
            patch.quoteAmount !== undefined ? patch.quoteAmount : move.quoteAmount;
          const typeChanged = nextType !== move.quoteType;
          const amountChanged = nextAmount !== move.quoteAmount;
          if (!typeChanged && !amountChanged) return move;

          const clearDiscount = typeChanged || patch.quoteAmount === null;
          const label =
            nextType === "flat"
              ? `Flat rate quote set — ${nextAmount != null ? `$${nextAmount.toLocaleString()}` : "—"}`
              : nextType === "hourly"
                ? `Hourly rate set — ${nextAmount != null ? `$${nextAmount}/hr` : "—"}`
                : "Quote updated";

          return appendActivity(
            {
              ...move,
              quoteType: nextType,
              quoteAmount: nextAmount ?? move.quoteAmount,
              quoteDiscount: clearDiscount ? null : move.quoteDiscount,
            },
            label,
          );
        }),
      );
    },
    [],
  );

  const updateMoveQuoteDiscount = useCallback(
    (moveId: string, discount: MoveRecord["quoteDiscount"]) => {
      setAllMoves((prev) =>
        prev.map((move) => {
          if (move.id !== moveId) return move;
          const same =
            move.quoteDiscount?.reasonId === discount?.reasonId &&
            move.quoteDiscount?.kind === discount?.kind &&
            move.quoteDiscount?.value === discount?.value &&
            (discount == null) === (move.quoteDiscount == null);
          if (same) return move;

          const label = discount
            ? `Quote discount applied — ${discount.kind === "percent" ? `${discount.value}%` : `$${discount.value}`}`
            : "Quote discount removed";

          return appendActivity({ ...move, quoteDiscount: discount }, label);
        }),
      );
    },
    [],
  );

  const recordMoveDocumentSent = useCallback((moveId: string, kind: DocumentSendKind) => {
    const now = new Date().toISOString();
    setAllMoves((prev) =>
      prev.map((move) => {
        if (move.id !== moveId) return move;

        const portalUrl = buildMoveDocumentPortalUrl(moveId, kind);
        const resent = kind === "quote" ? move.sentQuote != null : move.sentContract != null;
        const sentDoc: MoveSentDocument = {
          sentAt: now,
          portalUrl,
          firstViewedAt: null,
          lastViewedAt: null,
          viewCount: 0,
          bookingRequestedAt: kind === "quote" ? null : undefined,
          signedAt: kind === "contract" ? null : undefined,
          depositPaidAt: kind === "contract" ? null : undefined,
          depositAmount: null,
        };

        if (kind === "quote") {
          const next = applyPipelineStage({ ...move, sentQuote: sentDoc }, "quote_sent");
          const summary = resent ? "Quote resent to customer" : "Quote sent to customer";
          return appendActivity(next, summary, now, {
            type: "document",
            document: { kind: "quote", event: resent ? "resent" : "sent" },
          });
        }

        const withRates = lockMoveRatesOnContract(
          { ...move, sentContract: sentDoc },
          now,
        );
        const next = applyPipelineStage(withRates, "booked");
        const summary = resent
          ? "Contract resent — move booked"
          : "Contract sent — move booked";
        return appendActivity(next, summary, now, {
          type: "document",
          document: { kind: "contract", event: resent ? "resent" : "sent" },
        });
      }),
    );
  }, []);

  const recordMoveDocumentViewed = useCallback((moveId: string, kind: DocumentSendKind) => {
    const now = new Date().toISOString();
    setAllMoves((prev) =>
      prev.map((move) => {
        if (move.id !== moveId) return move;

        const resolved = kind === "quote" ? resolveSentQuote(move) : resolveSentContract(move);
        if (!resolved) return move;

        const stored = kind === "quote" ? move.sentQuote : move.sentContract;
        const existing = stored ?? resolved;
        const firstView = existing.firstViewedAt ?? now;
        const alreadyViewed = existing.firstViewedAt != null;
        const viewCount = (existing.viewCount ?? 0) + 1;

        const withDoc = patchSentDocument(move, kind, {
          firstViewedAt: firstView,
          lastViewedAt: now,
          viewCount,
        });

        if (alreadyViewed) return withDoc;

        const label = kind === "quote" ? "Customer viewed quote" : "Customer viewed contract";
        return appendActivity(withDoc, label, now, {
          type: "document",
          document: { kind, event: "viewed" },
        });
      }),
    );
  }, []);

  const recordQuoteBookingRequested = useCallback((moveId: string) => {
    const now = new Date().toISOString();
    setAllMoves((prev) =>
      prev.map((move) => {
        if (move.id !== moveId) return move;
        if (["needs_contract", "booked", "completed"].includes(move.pipelineStage)) return move;
        if (move.pipelineStage !== "quote_sent") return move;

        const withDoc = patchSentDocument(move, "quote", { bookingRequestedAt: now });
        const next = applyPipelineStage(withDoc, "needs_contract");
        return appendActivity(next, "Customer requested to book via quote portal", now, {
          type: "document",
          document: { kind: "quote", event: "booking_requested" },
        });
      }),
    );
  }, []);

  const recordPortalInventoryChangeRequest = useCallback((moveId: string, message: string) => {
    const trimmed = message.trim();
    if (!trimmed) return;

    const now = new Date().toISOString();
    setAllMoves((prev) =>
      prev.map((move) => {
        if (move.id !== moveId) return move;
        return appendActivity(
          move,
          `Customer requested inventory change via portal: ${trimmed}`,
          now,
          { type: "note" },
        );
      }),
    );
  }, []);

  const recordCrewFeedback = useCallback(
    (moveId: string, rating: number, comment: string) => {
      const now = new Date().toISOString();
      const settings = loadSettings();
      const locations = loadWorkspaceConfig().locations;
      const clampedRating = Math.min(5, Math.max(1, Math.round(rating)));

      setAllMoves((prev) =>
        prev.map((move) => {
          if (move.id !== moveId) return move;

          const googleUrl = googleReviewUrlForMove(move, locations);
          const minStars = settings.defaults.postMoveGoogleReviewMinStars;
          const googleReviewOffered = shouldOfferGoogleReview(
            clampedRating,
            minStars,
            googleUrl,
          );
          const feedback: MoveCrewFeedback = {
            rating: clampedRating,
            comment: comment.trim(),
            submittedAt: now,
            googleReviewOffered,
          };

          let next: MoveRecord = { ...move, crewFeedback: feedback };
          next = appendActivity(next, crewFeedbackSummary(feedback), now);
          next = appendActivity(
            next,
            "Customer crew feedback received — ops team notified",
            now,
          );
          return next;
        }),
      );
    },
    [],
  );

  const recordContractSignedWithDeposit = useCallback(
    (moveId: string, depositAmount: number) => {
      const now = new Date().toISOString();
      setAllMoves((prev) =>
        prev.map((move) => {
          if (move.id !== moveId) return move;

          let next = patchSentDocument(move, "contract", {
            signedAt: now,
            depositPaidAt: now,
            depositAmount,
          });

          if (!["booked", "completed"].includes(next.pipelineStage)) {
            next = applyPipelineStage(next, "booked");
          }

          next = appendActivity(next, `Deposit paid — $${depositAmount.toLocaleString()}`, now, {
            type: "document",
            document: { kind: "contract", event: "deposit_paid" },
          });

          return appendActivity(next, "Contract signed via portal", now, {
            type: "document",
            document: { kind: "contract", event: "signed" },
          });
        }),
      );
    },
    [],
  );

  const updateLeadChannel = useCallback((moveId: string, channel: LeadChannel) => {
    setAllMoves((prev) =>
      prev.map((move) => {
        if (move.id !== moveId || move.leadChannel === channel) return move;
        return appendActivity(
          { ...move, leadChannel: channel },
          `Lead source updated`,
        );
      }),
    );
  }, []);

  const setReferralContact = useCallback((moveId: string, person: MoveLinkedPerson) => {
    setAllMoves((prev) =>
      prev.map((move) => {
        if (move.id !== moveId) return move;
        const referralRoles = CHANNEL_TO_ROLES[move.leadChannel] ?? [];
        const kept = move.linkedPeople.filter((p) => !referralRoles.includes(p.role));
        const same =
          kept.length === move.linkedPeople.length - 1 &&
          move.linkedPeople.some(
            (p) =>
              referralRoles.includes(p.role) &&
              p.personId === person.personId &&
              p.name === person.name,
          );
        if (same) return move;
        const summary = isUnknownReferralContact(person)
          ? "Referral source marked as unknown"
          : `Lead source contact set to ${person.name}`;
        return appendActivity(
          { ...move, linkedPeople: [...kept, person] },
          summary,
        );
      }),
    );
  }, []);

  const openNewMoveDialog = useCallback(() => setNewMoveDialogOpen(true), []);
  const closeNewMoveDialog = useCallback(() => setNewMoveDialogOpen(false), []);

  const scheduleWalkthrough = useCallback(
    (moveId: string, draft: WalkthroughScheduleDraft, actor?: string) => {
      setAllMoves((prev) =>
        prev.map((move) => {
          if (move.id !== moveId || isMoveLost(move)) return move;
          return scheduleWalkthroughOnMove(move, draft, actor ?? user.name);
        }),
      );
    },
    [user.name],
  );

  const cancelWalkthrough = useCallback(
    (
      moveId: string,
      options?: { actor?: string; cancelledBy?: "staff" | "customer" },
    ) => {
      setAllMoves((prev) =>
        prev.map((move) => {
          if (move.id !== moveId || isMoveLost(move)) return move;
          return cancelWalkthroughOnMove(move, {
            actor: options?.actor ?? user.name,
            cancelledBy: options?.cancelledBy ?? "staff",
          });
        }),
      );
    },
    [user.name],
  );

  const cancelAutomatedFollowUps = useCallback((moveId: string) => {
    setAllMoves((prev) =>
      prev.map((move) => {
        if (move.id !== moveId) return move;
        const openAuto = openAutomatedFollowUps(move);
        if (openAuto.length === 0 && move.automationsSuppressed) return move;
        const next = cancelAutomatedFollowUpsOnMove(move);
        return appendActivity(
          next,
          `Cancelled ${openAuto.length} automated follow-up${openAuto.length === 1 ? "" : "s"}`,
          undefined,
          { type: "follow_up", actor: user.name },
        );
      }),
    );
  }, [user.name]);

  const addFollowUpTask = useCallback(
    (moveId: string, input: AddFollowUpTaskInput) => {
      setAllMoves((prev) =>
        prev.map((move) => {
          if (move.id !== moveId || isMoveLost(move)) return move;
          const followUp = createFollowUp(move, {
            type: "custom",
            title: input.title.trim() || "Follow up",
            dueAt: input.dueAt,
            assignedTo: move.assignedRep,
            channel: input.channel,
            status: "open",
            linkedStage: move.pipelineStage,
            source: "manual",
            notes: input.notes?.trim() || undefined,
          });
          const next = syncFollowUpDue({
            ...move,
            followUps: [...move.followUps, followUp],
            updatedAt: new Date().toISOString(),
          });
          return appendActivity(next, `Follow-up task added: ${followUp.title}`, undefined, {
            type: "follow_up",
            actor: user.name,
          });
        }),
      );
    },
    [user.name],
  );

  const updateFollowUpStatus = useCallback(
    (moveId: string, followUpId: string, status: Exclude<FollowUpStatus, "open">) => {
      setAllMoves((prev) =>
        prev.map((move) => {
          if (move.id !== moveId) return move;
          const target = move.followUps.find((f) => f.id === followUpId);
          if (!target || target.status !== "open") return move;

          const followUps = move.followUps.map((f) =>
            f.id === followUpId ? { ...f, status } : f,
          );
          const next = syncFollowUpDue({ ...move, followUps });
          const verb = status === "completed" ? "completed" : "skipped";
          return appendActivity(next, `Follow-up ${verb}: ${target.title}`, undefined, {
            type: "follow_up",
            actor: user.name,
          });
        }),
      );
    },
    [user.name],
  );

  const recordManualPhonePayment = useCallback(
    (moveId: string, input: ManualPhonePaymentInput) => {
      const now = new Date().toISOString();
      setAllMoves((prev) =>
        prev.map((move) => {
          if (move.id !== moveId || isMoveLost(move)) return move;

          let next: MoveRecord = move;
          if (input.purpose === "deposit" && move.sentContract) {
            next = patchSentDocument(move, "contract", {
              depositPaidAt: now,
              depositAmount: input.amount,
            });
            if (!["booked", "completed"].includes(next.pipelineStage)) {
              next = applyPipelineStage(next, "booked");
            }
          }

          const noteSuffix = input.note ? ` — ${input.note}` : "";
          return appendActivity(
            next,
            `${manualPhonePaymentPurposeLabel(input.purpose)} charged over phone — $${input.amount.toLocaleString()} (Stripe ·••• ${input.last4})${noteSuffix}`,
            now,
            { type: "note", actor: user.name },
          );
        }),
      );
    },
    [user.name],
  );

  const approveWebsiteBookingReviewAction = useCallback((moveId: string) => {
    setAllMoves((prev) =>
      prev.map((move) => {
        if (move.id !== moveId) return move;
        const next = approveWebsiteBookingReview(move);
        if (next.bookingReviewStatus === move.bookingReviewStatus) return move;
        return appendActivity(next, "Web booking marked reviewed — cleared from AI Web Quotes queue");
      }),
    );
  }, []);

  const clearFromWebsiteQueue = useCallback((moveId: string, queue: WebsiteQueueId) => {
    setAllMoves((prev) =>
      prev.map((move) => {
        if (move.id !== moveId) return move;
        const next = dismissWebsiteQueueMove(move, queue);
        if (next === move) return move;
        const summary =
          queue === "booked_review"
            ? "Web booking marked reviewed — cleared from AI Web Quotes queue"
            : `Marked handled — cleared from AI Web Quotes (${websiteQueueConfig[queue].label})`;
        return appendActivity(next, summary);
      }),
    );
  }, []);

  const recordWalkthroughLinkSent = useCallback(
    (moveId: string, assignee: string, linkUrl: string, linkModeLabel?: string) => {
      const modeNote = linkModeLabel ? ` · ${linkModeLabel}` : "";
      setAllMoves((prev) =>
        prev.map((move) => {
          if (move.id !== moveId || isMoveLost(move)) return move;
          return appendActivity(
            move,
            `Walkthrough link sent${assignee ? ` — ${assignee}` : ""}${modeNote} (${linkUrl})`,
            undefined,
            { type: "note", actor: user.name },
          );
        }),
      );
    },
    [user.name],
  );

  const reassignMovesFromDeletedMoveType = useCallback(
    (
      fromCatalogId: string,
      toCatalogId: string,
      moveTypeRules: MoveTypeRulesSettings,
      catalog: FieldCatalogSettings,
    ) => {
      const toLabel = moveTypeCatalogIdToDisplay(toCatalogId, catalog);
      setAllMoves((prev) =>
        prev.map((move) => {
          if (!moveMatchesCatalogType(move, fromCatalogId)) return move;
          if (move.conditionStatus === "lost" || move.conditionStatus === "cancelled") {
            return move;
          }
          const next = applyMoveTypeRuleToMove(move, toCatalogId, moveTypeRules, catalog);
          return appendActivity(
            next,
            `Move type → ${toLabel} (removed type reassigned)`,
          );
        }),
      );
    },
    [],
  );

  const createMove = useCallback(
    (person: PersonRecord): string => {
      let createdId = "";
      setAllMoves((prev) => {
        const move = buildNewMoveFromPerson(
          person,
          prev,
          {
            companyId: config.company.id ?? DEFAULT_COMPANY_ID,
            locationId: locationIdForNewRecords(),
          },
          { name: user.name, assignedRep: user.assignedRep },
        );
        createdId = move.id;
        return [move, ...prev];
      });
      return createdId;
    },
    [config.company.id, locationIdForNewRecords, user.name, user.assignedRep],
  );

  const duplicateMove = useCallback(
    (moveId: string): string => {
      let createdId = "";
      setAllMoves((prev) => {
        const source = prev.find((m) => m.id === moveId);
        if (!source) return prev;
        const copy = duplicateMoveRecord(source, prev, user.name);
        createdId = copy.id;
        if (source.contactId) {
          linkPersonToMove(source.contactId, copy.id);
        }
        return [copy, ...prev];
      });
      return createdId;
    },
    [user.name],
  );

  const deleteMove = useCallback((moveId: string) => {
    setAllMoves((prev) => prev.filter((m) => m.id !== moveId));
  }, []);

  const importMoves = useCallback((imported: MoveRecord[]) => {
    if (imported.length === 0) return;
    setAllMoves((prev) => {
      const byId = new Map(imported.map((m) => [m.id, m] as const));
      const existingIds = new Set(prev.map((m) => m.id));
      const updated = prev.map((m) => byId.get(m.id) ?? m);
      const newOnes = imported.filter((m) => !existingIds.has(m.id));
      return [...newOnes, ...updated];
    });
    for (const move of imported) {
      if (move.contactId?.startsWith("imp-person-")) {
        linkPersonToMove(move.contactId, move.id);
      }
    }
  }, []);

  const dataValue = useMemo(
    () => ({ moves, getMoveById }),
    [moves, getMoveById],
  );

  const actionsValue = useMemo(
    () => ({
      updateMovePipelineStage,
      updateWaitingSubstage,
      markAsLost,
      reopenMove,
      updateAssignedRep,
      updateMoveLocation,
      reassignMoveContact,
      addJobDay,
      updateJobDay,
      removeJobDay,
      addLinkedPerson,
      setReferralContact,
      clearReferralContact,
      clearShipper,
      setShipper,
      updateMoveIntake,
      updateMoveQuote,
      updateMoveQuoteDiscount,
      recordMoveDocumentSent,
      recordMoveDocumentViewed,
      recordQuoteBookingRequested,
      recordContractSignedWithDeposit,
      recordPortalInventoryChangeRequest,
      recordCrewFeedback,
      updateLeadChannel,
      createMove,
      duplicateMove,
      deleteMove,
      openNewMoveDialog,
      closeNewMoveDialog,
      scheduleWalkthrough,
      cancelWalkthrough,
      cancelAutomatedFollowUps,
      addFollowUpTask,
      updateFollowUpStatus,
      recordManualPhonePayment,
      approveWebsiteBookingReview: approveWebsiteBookingReviewAction,
      clearFromWebsiteQueue,
      recordWalkthroughLinkSent,
      reassignMovesFromDeletedMoveType,
      importMoves,
    }),
    [
      updateMovePipelineStage,
      updateWaitingSubstage,
      markAsLost,
      reopenMove,
      updateAssignedRep,
      updateMoveLocation,
      reassignMoveContact,
      addJobDay,
      updateJobDay,
      removeJobDay,
      addLinkedPerson,
      setReferralContact,
      clearReferralContact,
      clearShipper,
      setShipper,
      updateMoveIntake,
      updateMoveQuote,
      updateMoveQuoteDiscount,
      recordMoveDocumentSent,
      recordMoveDocumentViewed,
      recordQuoteBookingRequested,
      recordContractSignedWithDeposit,
      recordPortalInventoryChangeRequest,
      recordCrewFeedback,
      updateLeadChannel,
      createMove,
      duplicateMove,
      deleteMove,
      openNewMoveDialog,
      closeNewMoveDialog,
      scheduleWalkthrough,
      cancelWalkthrough,
      cancelAutomatedFollowUps,
      addFollowUpTask,
      updateFollowUpStatus,
      recordManualPhonePayment,
      approveWebsiteBookingReviewAction,
      clearFromWebsiteQueue,
      recordWalkthroughLinkSent,
      reassignMovesFromDeletedMoveType,
      importMoves,
    ],
  );

  return (
    <MovesActionsContext.Provider value={actionsValue}>
      <MovesDataContext.Provider value={dataValue}>
        {children}
        <NewMoveDialog open={newMoveDialogOpen} onClose={closeNewMoveDialog} />
      </MovesDataContext.Provider>
    </MovesActionsContext.Provider>
  );
}

export function useMovesData() {
  const ctx = useContext(MovesDataContext);
  if (!ctx) {
    throw new Error("useMovesData must be used within MovesProvider");
  }
  return ctx;
}

/** Stable action callbacks — does not re-render when moves list changes. */
export function useMovesActions() {
  const ctx = useContext(MovesActionsContext);
  if (!ctx) {
    throw new Error("useMovesActions must be used within MovesProvider");
  }
  return ctx;
}

export function useMoves(): MovesContextValue {
  const data = useMovesData();
  const actions = useMovesActions();
  return useMemo(() => ({ ...data, ...actions }), [data, actions]);
}
