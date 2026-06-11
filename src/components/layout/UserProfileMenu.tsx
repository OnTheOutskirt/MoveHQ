"use client";

import { UserAvatar } from "@/components/account/UserAvatar";
import { OfficeRoleSwitcher } from "@/components/layout/OfficeRoleSwitcher";
import { ROUTES } from "@/lib/navigation/routes";
import { useSession } from "@/components/providers/SessionProvider";
import { useUserPreferences } from "@/components/providers/UserPreferencesProvider";
import { signOutOfficeSession } from "@/lib/session/office-auth";
import { cn } from "@/lib/utils";
import { ChevronDown, LogOut, User, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function UserProfileMenu() {
  const router = useRouter();
  const { user, realAdmin, isViewingAsOtherRole } = useSession();
  const { preferences } = useUserPreferences();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function handleSignOut() {
    setOpen(false);
    signOutOfficeSession();
    router.push(ROUTES.signIn);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 hover:bg-slate-50"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
      >
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-slate-900">{user.name}</p>
          <p className="text-xs text-slate-500">
            {isViewingAsOtherRole ? `Viewing as ${user.title}` : user.title}
          </p>
        </div>
        <UserAvatar
          initials={user.initials}
          imageDataUrl={preferences.profileImageDataUrl}
          size="sm"
        />
        <ChevronDown
          className={cn("hidden h-4 w-4 text-slate-400 transition sm:block", open && "rotate-180")}
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          <div className="flex items-center gap-3 border-b border-slate-100 px-3 py-3">
            <UserAvatar
              initials={user.initials}
              imageDataUrl={preferences.profileImageDataUrl}
              size="md"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
              {preferences.phone.trim() ? (
                <p className="truncate text-xs text-slate-500">{preferences.phone}</p>
              ) : null}
              <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                {user.title}
              </p>
              {isViewingAsOtherRole ? (
                <p className="mt-1 text-[10px] text-brand-600">
                  Previewing as {user.title} · signed in as {realAdmin.name}
                </p>
              ) : null}
            </div>
          </div>

          <div className="py-1">
            <MenuLink
              href={ROUTES.account}
              icon={User}
              label="Account & preferences"
              description="Profile, notifications, email, security"
              onNavigate={() => setOpen(false)}
            />
          </div>

          {realAdmin.isRealAdmin ? (
            <OfficeRoleSwitcher onSelect={() => setOpen(false)} />
          ) : null}

          <div className="border-t border-slate-100 py-1">
            <button
              type="button"
              role="menuitem"
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm font-medium text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 shrink-0" aria-hidden />
              Sign out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MenuLink({
  href,
  icon: Icon,
  label,
  description,
  onNavigate,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  description?: string;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onNavigate}
      className="flex items-start gap-3 px-3 py-2.5 hover:bg-slate-50"
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
      <span>
        <span className="block text-sm font-medium text-slate-900">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-xs text-slate-500">{description}</span>
        ) : null}
      </span>
    </Link>
  );
}
