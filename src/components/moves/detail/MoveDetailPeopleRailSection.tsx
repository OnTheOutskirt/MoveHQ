"use client";

import { useState } from "react";
import { MoveDetailContactCard } from "@/components/moves/detail/MoveDetailContactCard";
import {
  ShipperPersonPicker,
  type ShipperPersonValue,
} from "@/components/moves/ShipperPersonPicker";
import { useMovesActions } from "@/components/moves/MovesProvider";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { moveHasShipper } from "@/lib/moves/get-move-contact";
import { addCustomPerson } from "@/lib/people/people-storage";
import { getStoredPersonById } from "@/lib/people/people-storage";
import type { MoveRecord } from "@/lib/moves/types";
import { User } from "lucide-react";

type MoveDetailPeopleRailSectionProps = {
  move: MoveRecord;
  onOpenContact: () => void;
};

export function MoveDetailPeopleRailSection({
  move,
  onOpenContact,
}: MoveDetailPeopleRailSectionProps) {
  const { clearShipper, setShipper } = useMovesActions();
  const hasShipper = moveHasShipper(move);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [shipperDraft, setShipperDraft] = useState<ShipperPersonValue>(null);

  const shipperName =
    move.customerName.trim() ||
    move.linkedPeople.find((p) => p.role === "customer")?.name ||
    "this shipper";

  function applyShipper() {
    if (!shipperDraft) return;
    if (shipperDraft.mode === "existing") {
      const person = getStoredPersonById(shipperDraft.personId);
      if (person) setShipper(move.id, person);
    } else {
      const person = addCustomPerson(shipperDraft.draft);
      setShipper(move.id, person);
    }
    setShipperDraft(null);
    setPickerOpen(false);
  }

  return (
    <div className="min-w-0 shrink-0 border-b border-slate-200 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Shipper</p>

      {hasShipper ? (
        <MoveDetailContactCard
          move={move}
          onOpenContact={onOpenContact}
          onRemove={() => setConfirmRemove(true)}
        />
      ) : (
        <div className="mt-2">
          {!pickerOpen ? (
            <>
              <p className="text-xs text-slate-500">No shipper on this move yet.</p>
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 py-2 text-[11px] font-medium text-slate-600 hover:border-brand-300 hover:text-brand-800"
              >
                <User className="h-3.5 w-3.5" />
                Add shipper
              </button>
            </>
          ) : (
            <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50/80 p-2.5">
              <ShipperPersonPicker value={shipperDraft} onChange={setShipperDraft} />
              <button
                type="button"
                onClick={applyShipper}
                disabled={!shipperDraft}
                className="w-full rounded-lg bg-brand-600 px-2 py-1.5 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-50"
              >
                Set as shipper
              </button>
              <button
                type="button"
                onClick={() => {
                  setPickerOpen(false);
                  setShipperDraft(null);
                }}
                className="w-full text-center text-[11px] text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmRemove}
        onClose={() => setConfirmRemove(false)}
        onConfirm={() => clearShipper(move.id)}
        title="Remove shipper?"
        description={`Are you sure you want to remove ${shipperName} from this move? You'll need to add a new shipper.`}
        confirmLabel="Remove shipper"
        variant="danger"
      />
    </div>
  );
}
