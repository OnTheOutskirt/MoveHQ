"use client";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type AdminSaveBarProps = {
  dirty: boolean;
  onSave: () => void;
  onDiscard: () => void;
  saving?: boolean;
  message?: string;
  className?: string;
};

export function AdminSaveBar({
  dirty,
  onSave,
  onDiscard,
  saving = false,
  message = "Unsaved changes",
  className,
}: AdminSaveBarProps) {
  if (!dirty) return null;

  return (
    <div
      className={cn(
        "sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 shadow-lg",
        className,
      )}
      role="status"
    >
      <p className="text-sm font-medium text-brand-900">{message}</p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={onDiscard} disabled={saving}>
          Discard
        </Button>
        <Button type="button" size="sm" onClick={onSave} disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
