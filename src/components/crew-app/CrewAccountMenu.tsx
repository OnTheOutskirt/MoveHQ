"use client";

import { useCrewApp } from "@/components/crew-app/CrewAppProvider";
import { DEFAULT_CREW_SESSION, writeCrewAppSession } from "@/lib/crew-app/session";
import { useTerminology } from "@/lib/terminology/use-terminology";
import { cn } from "@/lib/utils";
import { LogOut, Settings, User, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

type CrewAccountMenuProps = {
  open: boolean;
  onClose: () => void;
};

export function CrewAccountMenu({ open, onClose }: CrewAccountMenuProps) {
  const { session, setSession, crewPath } = useCrewApp();
  const { label: roleLabel } = useTerminology();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  function handleSignOut() {
    writeCrewAppSession(DEFAULT_CREW_SESSION);
    setSession(DEFAULT_CREW_SESSION);
    onClose();
    if (searchParams.get("demoCrewId")) {
      router.push("/crew/today");
      return;
    }
    router.push(crewPath("/crew/today"));
  }

  const rolesLabel = session.appRoles.map((r) => roleLabel(r)).join(" · ");

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Account menu">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40"
        onClick={onClose}
        aria-label="Close account menu"
      />
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-slate-200 bg-white shadow-2xl",
          "pb-[max(1rem,env(safe-area-inset-bottom))]",
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-900">Account</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-3 px-4 py-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
            <User className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{session.name}</p>
            {rolesLabel ? (
              <p className="truncate text-xs text-slate-500">{rolesLabel}</p>
            ) : null}
          </div>
        </div>

        <ul className="border-t border-slate-100 px-2 py-2">
          <li>
            <Link
              href={crewPath("/crew/settings")}
              onClick={onClose}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              <Settings className="h-4 w-4 text-slate-500" aria-hidden />
              Settings
            </Link>
          </li>
          <li>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Sign out
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
