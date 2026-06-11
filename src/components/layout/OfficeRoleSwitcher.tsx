"use client";

import { useSession } from "@/components/providers/SessionProvider";
import { OFFICE_PERSONAS, type OfficePersonaId } from "@/lib/session/personas";
import { cn } from "@/lib/utils";
import { Eye, RotateCcw } from "lucide-react";

const ROLE_OPTIONS = OFFICE_PERSONAS.filter((p) => !p.isRealAdmin);

type OfficeRoleSwitcherProps = {
  onSelect?: () => void;
};

export function OfficeRoleSwitcher({ onSelect }: OfficeRoleSwitcherProps) {
  const { user, realAdmin, isViewingAsOtherRole, switchPersona, resetPersona } = useSession();

  if (!realAdmin.isRealAdmin) return null;

  function select(id: OfficePersonaId) {
    switchPersona(id);
    onSelect?.();
  }

  function backToAdmin() {
    resetPersona();
    onSelect?.();
  }

  return (
    <div className="border-t border-slate-100 px-3 py-3">
      <div className="flex items-center gap-2">
        <Eye className="h-3.5 w-3.5 text-slate-400" aria-hidden />
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          View as role
        </p>
      </div>
      <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
        Preview nav, reports, and payroll gates as different staff roles.
      </p>

      {isViewingAsOtherRole ? (
        <button
          type="button"
          onClick={backToAdmin}
          className="mt-2 flex w-full items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-2 text-left text-xs font-medium text-brand-800 hover:bg-brand-100"
        >
          <RotateCcw className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Back to {realAdmin.name} (admin)
        </button>
      ) : null}

      <div className="mt-2 flex flex-wrap gap-1.5">
        {ROLE_OPTIONS.map((persona) => (
          <button
            key={persona.id}
            type="button"
            onClick={() => select(persona.id)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors",
              user.id === persona.id
                ? "border-brand-600 bg-brand-50 text-brand-900"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
            )}
          >
            {persona.title}
          </button>
        ))}
      </div>
    </div>
  );
}
