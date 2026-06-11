"use client";

import { CrewPhoneFrameDemoControls } from "@/components/crew-app/CrewPhoneFrameDemoControls";
import { useSettings } from "@/components/providers/SettingsProvider";
import { defaultSettings } from "@/lib/settings/defaults";
import { useClientReady } from "@/lib/hooks/use-client-ready";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type CrewPhoneFrameProps = {
  children: ReactNode;
  className?: string;
  /** Hide demo role switcher (e.g. admin iframe embed). */
  hideDemoControls?: boolean;
  /** Fill viewport height in full-screen preview instead of fixed aspect ratio. */
  fillHeight?: boolean;
};

/** Phone bezel for admin preview iframe and full-screen demo mode. */
export function CrewPhoneFrame({
  children,
  className,
  hideDemoControls,
  fillHeight = false,
}: CrewPhoneFrameProps) {
  const { settings, isReady: settingsReady } = useSettings();
  const clientReady = useClientReady();
  const showBranding = clientReady && settingsReady;
  const branding = showBranding ? settings.branding : defaultSettings.branding;

  const phone = (
    <div
      className={cn(
        "mx-auto w-full max-w-[420px]",
        fillHeight && "h-[min(calc(100dvh-2rem),900px)]",
      )}
    >
      <div
        className={cn(
          "rounded-[2.75rem] p-3 shadow-2xl",
          fillHeight && "flex h-full min-h-0 flex-col",
          !showBranding && "bg-slate-900",
        )}
        style={
          showBranding
            ? {
                background: `linear-gradient(160deg, ${branding.sidebarColor} 0%, color-mix(in srgb, ${branding.sidebarColor} 70%, ${branding.accentColor}) 100%)`,
              }
            : undefined
        }
      >
        <div className="px-2">
          <div className="flex items-center justify-center gap-2">
            {showBranding && branding.logoDataUrl ? (
              <div className="relative h-6 w-6 overflow-hidden rounded-md bg-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={branding.logoDataUrl}
                  alt=""
                  className="h-full w-full object-contain p-0.5"
                />
              </div>
            ) : null}
            <p className="text-[11px] font-semibold tracking-wide text-white/90">
              {branding.companyName} Crew
            </p>
          </div>
        </div>
        <div
          className={cn(
            "mt-2 overflow-hidden rounded-[2rem] bg-slate-900 shadow-inner ring-1 ring-white/10",
            fillHeight && "flex min-h-0 flex-1 flex-col",
          )}
        >
          <div className="relative mx-auto h-6 w-32 shrink-0 rounded-b-2xl bg-slate-900" aria-hidden />
          <div
            className={cn(
              "relative mx-auto w-full overflow-hidden",
              fillHeight
                ? "min-h-0 flex-1"
                : "max-h-[min(88vh,860px)] aspect-[9/19.5]",
            )}
          >
            <div className="absolute inset-0 overflow-hidden bg-slate-100">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );

  if (hideDemoControls) {
    return (
      <div
        className={cn(
          "flex min-h-dvh items-center justify-center bg-slate-900 p-4 sm:p-8",
          className,
        )}
      >
        {phone}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex min-h-dvh items-center justify-center bg-slate-900 p-4 sm:p-6",
        className,
      )}
    >
      <div className="flex w-full max-w-5xl items-center justify-center gap-5 sm:gap-8 lg:gap-10">
        <aside className="w-40 shrink-0 sm:w-48">
          <CrewPhoneFrameDemoControls />
        </aside>
        {phone}
      </div>
    </div>
  );
}
