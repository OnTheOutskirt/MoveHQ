"use client";



import type { CrewAppNavId } from "@/lib/crew-app/types";

import { useSettings } from "@/components/providers/SettingsProvider";
import { defaultSettings } from "@/lib/settings/defaults";
import { useClientReady } from "@/lib/hooks/use-client-ready";
import { cn } from "@/lib/utils";
import { Bell, CalendarDays, ClipboardList, FolderOpen, Home, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

import { CrewAccountMenu } from "./CrewAccountMenu";
import { useCrewApp } from "./CrewAppProvider";



const NAV: { id: CrewAppNavId; href: string; label: string; icon: typeof Home }[] = [

  { id: "today", href: "/crew/today", label: "Today", icon: Home },

  { id: "schedule", href: "/crew/schedule", label: "Schedule", icon: CalendarDays },

  { id: "stats", href: "/crew/stats", label: "Stats", icon: ClipboardList },

  { id: "inbox", href: "/crew/inbox", label: "Inbox", icon: Bell },
  { id: "resources", href: "/crew/resources", label: "Resources", icon: FolderOpen },

];



function activeNav(pathname: string): CrewAppNavId {

  if (pathname.startsWith("/crew/schedule")) return "schedule";

  if (pathname.startsWith("/crew/stats")) return "stats";

  if (pathname.startsWith("/crew/inbox")) return "inbox";

  if (pathname.startsWith("/crew/resources")) return "resources";

  return "today";

}



type CrewAppShellProps = {

  children: ReactNode;

  title?: string;

  subtitle?: string;

  hideNav?: boolean;

};



export function CrewAppShell({ children, title, subtitle, hideNav }: CrewAppShellProps) {

  const pathname = usePathname();

  const { session, inbox, crewPath, isClientReady } = useCrewApp();
  const { settings, isReady: settingsReady } = useSettings();
  const clientReady = useClientReady();
  const showBranding = clientReady && settingsReady;
  const branding = showBranding ? settings.branding : defaultSettings.branding;

  const current = activeNav(pathname);
  const [accountOpen, setAccountOpen] = useState(false);

  const headerStyle = showBranding
    ? {
        background: `linear-gradient(145deg, ${branding.sidebarColor} 0%, color-mix(in srgb, ${branding.sidebarColor} 88%, ${branding.accentColor}) 100%)`,
      }
    : undefined;

  return (

    <div className="crew-app-shell flex h-dvh max-h-dvh flex-col overflow-hidden bg-slate-100">

      <header

        className={cn(
          "shrink-0 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] text-white shadow-md",
          !showBranding && "bg-slate-900",
        )}
        style={headerStyle}
      >

        <div className="flex items-center justify-between gap-3">

          <div className="min-w-0 flex items-center gap-3">

            {showBranding && branding.logoDataUrl ? (

              <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-white/10 ring-1 ring-white/20">

                {/* eslint-disable-next-line @next/next/no-img-element -- data URL; avoids next/image hydration mismatch */}
                <img
                  src={branding.logoDataUrl}
                  alt=""
                  className="h-full w-full object-contain p-0.5"
                />

              </div>

            ) : null}

            <div className="min-w-0">

              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/70">

                {branding.companyName}

              </p>

              <h1 className="truncate text-lg font-semibold tracking-tight">

                {title ?? "Crew"}

              </h1>

              {subtitle ? (

                <p className="mt-0.5 truncate text-xs text-white/80">{subtitle}</p>

              ) : null}

            </div>

          </div>

          <button
            type="button"
            onClick={() => setAccountOpen(true)}
            className="flex shrink-0 items-center gap-2 rounded-full bg-white/10 px-2.5 py-1.5 ring-1 ring-white/10 transition-colors hover:bg-white/15"
            aria-label="Open account menu"
            aria-expanded={accountOpen}
          >
            <User className="h-4 w-4 text-white/80" aria-hidden />
            <span className="max-w-[5.5rem] truncate text-xs font-medium">{session.name}</span>
          </button>

        </div>

      </header>



      <main className="crew-app-scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-4 pb-24">

        {children}

      </main>



      {!hideNav ? (

        <nav

          className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_24px_rgba(15,23,42,0.06)] backdrop-blur-md"

          aria-label="Crew app"

        >

          <ul className="mx-auto flex max-w-lg">

            {NAV.map(({ id, href, label, icon: Icon }) => {

              const active = current === id;

              const showBadge = id === "inbox" && inbox.unreadCount > 0;

              const navHref = isClientReady ? crewPath(href) : href;

              return (

                <li key={id} className="flex-1">

                  <Link

                    href={navHref}

                    className={cn(

                      "relative flex flex-col items-center gap-0.5 px-2 py-2.5 text-[10px] font-medium transition-colors",

                      active ? "text-brand-700" : "text-slate-500 hover:text-slate-800",

                    )}

                  >

                    <span

                      className={cn(

                        "relative flex h-8 w-8 items-center justify-center rounded-xl transition-colors",

                        active && "bg-brand-50 text-brand-700",

                      )}

                    >

                      <Icon className="h-5 w-5" />

                      {showBadge ? (

                        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />

                      ) : null}

                    </span>

                    {label}

                  </Link>

                </li>

              );

            })}

          </ul>

        </nav>

      ) : null}

      <CrewAccountMenu open={accountOpen} onClose={() => setAccountOpen(false)} />

    </div>

  );

}


