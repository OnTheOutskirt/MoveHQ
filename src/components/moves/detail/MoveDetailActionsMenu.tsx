"use client";

import { useMoves } from "@/components/moves/MovesProvider";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ROUTES, salesMovePath } from "@/lib/navigation/routes";
import type { MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import { Copy, MoreVertical, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type MoveDetailActionsMenuProps = {
  move: MoveRecord;
};

type DialogKind = "duplicate" | "delete" | null;

export function MoveDetailActionsMenu({ move }: MoveDetailActionsMenuProps) {
  const router = useRouter();
  const { duplicateMove, deleteMove } = useMoves();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialog, setDialog] = useState<DialogKind>(null);
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

  return (
    <>
      <div ref={rootRef} className="relative shrink-0">
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
