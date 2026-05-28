"use client";

import { MOCK_MOVES } from "@/lib/moves/mock-data";
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
import { relabelJobDaysByDate } from "@/lib/moves/job-day-form";
import { CHANNEL_TO_ROLES } from "@/lib/moves/lead-referral";
import { applyIntakeToMove } from "@/lib/moves/sync-move-intake";
import type { FlatRateIntake } from "@/lib/moves/flat-rate-intake";
import type { PersonRecord } from "@/lib/people/types";
import type {
  MoveJobDay,
  MoveLinkedPerson,
  MoveRecord,
  PipelineStageId,
  WaitingSubstage,
} from "@/lib/moves/types";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type MovesContextValue = {
  moves: MoveRecord[];
  getMoveById: (id: string) => MoveRecord | undefined;
  updateMovePipelineStage: (moveId: string, stage: PipelineStageId) => void;
  updateWaitingSubstage: (moveId: string, substage: WaitingSubstage) => void;
  markAsLost: (moveId: string, reason?: string) => void;
  reopenMove: (moveId: string) => void;
  updateAssignedRep: (moveId: string, rep: string) => void;
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
};

const MovesContext = createContext<MovesContextValue | null>(null);

export function MovesProvider({ children }: { children: ReactNode }) {
  const [moves, setMoves] = useState<MoveRecord[]>(() => [...MOCK_MOVES]);

  const getMoveById = useCallback(
    (id: string) => moves.find((m) => m.id === id),
    [moves],
  );

  const appendActivity = (
    move: MoveRecord,
    summary: string,
    at = new Date().toISOString(),
  ): MoveRecord => ({
    ...move,
    updatedAt: at,
    activities: [
      { id: `activity-${move.id}-${at}`, type: "status_change", at, summary },
      ...move.activities,
    ],
  });

  const updateMovePipelineStage = useCallback((moveId: string, stage: PipelineStageId) => {
    setMoves((prev) =>
      prev.map((move) => {
        if (move.id !== moveId || isMoveLost(move) || move.pipelineStage === stage) return move;
        const next = applyPipelineStage(move, stage);
        return appendActivity(
          next,
          `Pipeline → ${moveStageDisplayLabel(next)}`,
        );
      }),
    );
  }, []);

  const updateWaitingSubstage = useCallback((moveId: string, substage: WaitingSubstage) => {
    setMoves((prev) =>
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

  const markAsLost = useCallback((moveId: string, reason?: string) => {
    setMoves((prev) =>
      prev.map((move) => {
        if (move.id !== moveId || isMoveLost(move)) return move;
        const next = markMoveLost(move, reason);
        return appendActivity(
          next,
          `Marked lost from ${pipelineStageLabel(move.pipelineStage)}${reason ? ` — ${reason}` : ""}`,
        );
      }),
    );
  }, []);

  const reopenMove = useCallback((moveId: string) => {
    setMoves((prev) =>
      prev.map((move) => {
        if (move.id !== moveId || !isMoveLost(move)) return move;
        const next = reopenLostMove(move);
        return appendActivity(next, "Re-opened — cleared lost status");
      }),
    );
  }, []);

  const updateAssignedRep = useCallback((moveId: string, rep: string) => {
    setMoves((prev) =>
      prev.map((move) => {
        if (move.id !== moveId || move.assignedRep === rep) return move;
        return appendActivity({ ...move, assignedRep: rep }, `Sales rep → ${rep}`);
      }),
    );
  }, []);

  const addJobDay = useCallback((moveId: string, day: MoveJobDay) => {
    setMoves((prev) =>
      prev.map((move) => {
        if (move.id !== moveId) return move;
        const jobDays = relabelJobDaysByDate([...move.jobDays, day]);
        const added = jobDays.find((d) => d.id === day.id) ?? day;
        return appendActivity({ ...move, jobDays }, `Job day added — ${added.label}`);
      }),
    );
  }, []);

  const updateJobDay = useCallback((moveId: string, day: MoveJobDay) => {
    setMoves((prev) =>
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
    setMoves((prev) =>
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
    setMoves((prev) =>
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
    setMoves((prev) =>
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
    setMoves((prev) =>
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
    setMoves((prev) =>
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
      setMoves((prev) =>
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

  const setReferralContact = useCallback((moveId: string, person: MoveLinkedPerson) => {
    setMoves((prev) =>
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
        return appendActivity(
          { ...move, linkedPeople: [...kept, person] },
          `Lead source contact set to ${person.name}`,
        );
      }),
    );
  }, []);

  const value = useMemo(
    () => ({
      moves,
      getMoveById,
      updateMovePipelineStage,
      updateWaitingSubstage,
      markAsLost,
      reopenMove,
      updateAssignedRep,
      addJobDay,
      updateJobDay,
      removeJobDay,
      addLinkedPerson,
      setReferralContact,
      clearReferralContact,
      clearShipper,
      setShipper,
      updateMoveIntake,
    }),
    [
      moves,
      getMoveById,
      updateMovePipelineStage,
      updateWaitingSubstage,
      markAsLost,
      reopenMove,
      updateAssignedRep,
      addJobDay,
      updateJobDay,
      removeJobDay,
      addLinkedPerson,
      setReferralContact,
      clearReferralContact,
      clearShipper,
      setShipper,
      updateMoveIntake,
    ],
  );

  return <MovesContext.Provider value={value}>{children}</MovesContext.Provider>;
}

export function useMoves() {
  const ctx = useContext(MovesContext);
  if (!ctx) {
    throw new Error("useMoves must be used within MovesProvider");
  }
  return ctx;
}
