"use client";

import { ClientPortalStaffBanner } from "@/components/portal/ClientPortalStaffBanner";
import { useClientMounted } from "@/hooks/use-client-mounted";
import type { ReactNode } from "react";

type ClientPortalShellProps = {
  companyName: string;
  logoDataUrl?: string | null;
  accentColor: string;
  subtitle?: string;
  staffPreview?: boolean;
  maxWidthClass?: string;
  children: ReactNode;
};

export function ClientPortalShell({
  companyName,
  logoDataUrl,
  accentColor,
  subtitle = "Your move portal",
  staffPreview = false,
  maxWidthClass = "max-w-2xl",
  children,
}: ClientPortalShellProps) {
  const mounted = useClientMounted();
  const showLogo = mounted && logoDataUrl;

  return (
    <div className={`mx-auto min-h-dvh w-full ${maxWidthClass} bg-white shadow-sm`}>
      {staffPreview ? <ClientPortalStaffBanner /> : null}

      <header className="border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-3">
          {showLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoDataUrl!} alt="" className="h-9 w-9 rounded-lg object-contain" />
          ) : (
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white"
              style={{ backgroundColor: accentColor }}
            >
              {companyName.charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{companyName}</p>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
