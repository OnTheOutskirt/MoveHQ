"use client";

import { useMoves } from "@/components/moves/MovesProvider";
import { isMoveLost } from "@/lib/moves/move-pipeline";
import type { IntakeAddress, IntakeRoomInventory } from "@/lib/moves/flat-rate-intake";
import type { FlatRateIntake } from "@/lib/moves/flat-rate-intake";
import type { MoveRecord } from "@/lib/moves/types";

export function useMoveIntakeEdit(moveId: string) {
  const { moves, updateMoveIntake } = useMoves();
  const move = moves.find((m) => m.id === moveId);
  const disabled = !move || isMoveLost(move);

  function patch(partial: Partial<FlatRateIntake>) {
    if (disabled) return;
    updateMoveIntake(moveId, partial);
  }

  function patchFn(fn: (prev: FlatRateIntake) => FlatRateIntake) {
    if (disabled) return;
    updateMoveIntake(moveId, fn);
  }

  function patchAddress(which: "origin" | "destination", partial: Partial<IntakeAddress>) {
    patchFn((prev) => ({
      ...prev,
      [which]: { ...prev[which], ...partial },
    }));
  }

  function patchRoom(roomId: string, partial: Partial<IntakeRoomInventory>) {
    patchFn((prev) => ({
      ...prev,
      rooms: prev.rooms.map((r) => (r.id === roomId ? { ...r, ...partial } : r)),
    }));
  }

  return {
    move: move as MoveRecord | undefined,
    intake: move?.intake,
    disabled,
    patch,
    patchFn,
    patchAddress,
    patchRoom,
  };
}
