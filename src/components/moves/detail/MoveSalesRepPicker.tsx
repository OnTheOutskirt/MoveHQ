"use client";

import { useMoves } from "@/components/moves/MovesProvider";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";

type MoveSalesRepPickerProps = {
  moveId: string;
  value: string;
  className?: string;
};

export function MoveSalesRepPicker({ moveId, value, className }: MoveSalesRepPickerProps) {
  const { moves, updateAssignedRep } = useMoves();
  const [open, setOpen] = useState(false);
  const [pendingRep, setPendingRep] = useState<string | null>(null);

  const reps = useMemo(() => {
    const names = new Set(moves.map((m) => m.assignedRep));
    names.add(value);
    return [...names].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [moves, value]);

  function requestRepChange(rep: string) {
    setOpen(false);
    if (rep === value) return;
    setPendingRep(rep);
  }

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 rounded-md border border-transparent px-0.5 py-0.5 text-sm font-medium text-slate-900 hover:border-slate-200 hover:bg-slate-50"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {value}
        <ChevronDown className={cn("h-3.5 w-3.5 text-slate-400 transition-transform", open && "rotate-180")} />
      </button>
      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-10 cursor-default"
            aria-label="Close"
            onClick={() => setOpen(false)}
          />
          <ul
            role="listbox"
            className="absolute left-0 top-full z-20 mt-1 max-h-48 min-w-[10rem] overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
          >
            {reps.map((rep) => (
              <li key={rep}>
                <button
                  type="button"
                  role="option"
                  aria-selected={rep === value}
                  onClick={() => requestRepChange(rep)}
                  className={cn(
                    "w-full px-3 py-1.5 text-left text-sm hover:bg-slate-50",
                    rep === value && "bg-brand-50 font-medium text-brand-800",
                  )}
                >
                  {rep}
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <ConfirmDialog
        open={pendingRep !== null}
        onClose={() => setPendingRep(null)}
        onConfirm={() => {
          if (pendingRep) updateAssignedRep(moveId, pendingRep);
        }}
        title="Change sales rep?"
        description={
          pendingRep
            ? `Reassign this move from ${value} to ${pendingRep}? Follow-ups and activity will stay on the move record.`
            : ""
        }
        confirmLabel="Yes, reassign"
        cancelLabel="Cancel"
      />
    </div>
  );
}
