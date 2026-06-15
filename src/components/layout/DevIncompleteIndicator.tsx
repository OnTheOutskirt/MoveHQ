import { Construction } from "lucide-react";

/** Sidebar marker for modules still in active development. */
export function DevIncompleteIndicator() {
  return (
    <span title="In development">
      <Construction
        className="h-3.5 w-3.5 shrink-0 text-amber-400"
        aria-label="In development"
      />
    </span>
  );
}
