"use client";

import { useMoves } from "@/components/moves/MovesProvider";
import { MoveLocationDialog } from "@/components/moves/detail/MoveLocationDialog";
import { ReferMoverSidebar } from "@/components/moves/detail/ReferMoverSidebar";
import { useWorkspace } from "@/components/providers/WorkspaceProvider";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ROUTES, salesMovePath } from "@/lib/navigation/routes";
import type { MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import { Copy, MapPin, MoreVertical, Share2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type MoveDetailActionsMenuProps = {
  move: MoveRecord;
};

type DialogKind = "duplicate" | "delete" | null;

export function MoveDetailActionsMenu({ move }: MoveDetailActionsMenuProps) {
  const router = useRouter();
  const { duplicateMove, deleteMove, updateMoveLocation } = useMoves();
  const { hasMultipleLocations, allowedLocations } = useWorkspace();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [locationOpen, setLocationOpen] = useState(false);
  const [referOpen, setReferOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  function openDialog(kind: DialogKind) {
    setMenuOpen(false);
    setDialog(kind);
  }

  function handleDuplicate() {
    const newId = duplicateMove(move.id);
    setDialog(null);
    if (newId) router.push(salesMovePath(newId));
  }

  function handleDelete() {
    deleteMove(move.id);
    setDialog(null);
    router.push(ROUTES.salesMoves);
  }

  const currentLocation = allowedLocations.find((loc) => loc.id === move.locationId);
  const currentLocationLabel = currentLocation?.shortName || currentLocation?.name || "";

  return (
    <>
      <div className="flex shrink-0 items-center gap-1.5">
        {hasMultipleLocations && currentLocationLabel ? (
          <button
            type="button"
            onClick={() => setLocationOpen(true)}
            className="inline-flex max-w-[12rem] items-center gap-1 rounded-lg px-1.5 py-1 text-xs text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
            title="Change location"
          >
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{currentLocationLabel}</span>
          </button>
        ) : null}

        <div ref={rootRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 hover:text-slate-900"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-label="Move actions"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {menuOpen ? (
            <div
              role="menu"
              className="absolute right-0 top-full z-50 mt-1 min-w-[12rem] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
            >
              <MenuItem
                icon={Share2}
                label="Refer to mover"
                hint="Hand off to a partner company"
                onClick={() => {
                  setMenuOpen(false);
                  setReferOpen(true);
                }}
              />
              <div className="my-1 border-t border-slate-100" />
              <MenuItem
                icon={Copy}
                label="Duplicate move"
                hint="New lead with same scope"
                onClick={() => openDialog("duplicate")}
              />
              <div className="my-1 border-t border-slate-100" />
              <MenuItem
                icon={Trash2}
                label="Delete move"
                hint="Cannot be undone"
                destructive
                onClick={() => openDialog("delete")}
              />
            </div>
          ) : null}
        </div>
      </div>

      <ConfirmDialog
        open={dialog === "duplicate"}
        onClose={() => setDialog(null)}
        onConfirm={handleDuplicate}
        title="Duplicate this move?"
        description={`Creates a new lead (${move.customerName}) with the same intake, addresses, quote type, and job-day plan. Pipeline resets to New lead — sent quotes, contracts, and follow-ups are not copied.`}
        confirmLabel="Duplicate"
        cancelLabel="Cancel"
      />

      <ConfirmDialog
        open={dialog === "delete"}
        onClose={() => setDialog(null)}
        onConfirm={handleDelete}
        title="Delete this move?"
        description={`Permanently remove ${move.reference} (${move.customerName}) from the pipeline. This cannot be undone.`}
        confirmLabel="Delete move"
        cancelLabel="Keep move"
        variant="danger"
      />

      <MoveLocationDialog
        open={locationOpen}
        onClose={() => setLocationOpen(false)}
        currentLocationId={move.locationId}
        locations={allowedLocations}
        onSelect={(locationId, locationLabel) =>
          updateMoveLocation(move.id, locationId, locationLabel)
        }
      />

      <ReferMoverSidebar open={referOpen} onClose={() => setReferOpen(false)} move={move} />
    </>
  );
}

function MenuItem({
  icon: Icon,
  label,
  hint,
  destructive,
  onClick,
}: {
  icon: typeof Copy;
  label: string;
  hint?: string;
  destructive?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-2.5 px-3 py-2 text-left text-sm hover:bg-slate-50",
        destructive && "text-red-700 hover:bg-red-50",
      )}
    >
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", destructive ? "text-red-600" : "text-slate-500")} />
      <span className="min-w-0">
        <span className="block font-medium">{label}</span>
        {hint ? <span className="block text-xs text-slate-500">{hint}</span> : null}
      </span>
    </button>
  );
}

