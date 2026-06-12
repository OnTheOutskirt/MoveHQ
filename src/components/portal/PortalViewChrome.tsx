"use client";

import { ClientPortalStaffBanner } from "@/components/portal/ClientPortalStaffBanner";
import { buildCustomerPortalHomePath } from "@/lib/moves/customer-portal-home";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

type PortalViewChromeProps = {
  moveId: string;
  staffPreview?: boolean;
  children: ReactNode;
};

export function PortalViewChrome({ moveId, staffPreview = false, children }: PortalViewChromeProps) {
  const homeHref = buildCustomerPortalHomePath(moveId, { staffPreview });

  return (
    <div className="mx-auto min-h-dvh w-full max-w-5xl bg-white shadow-sm">
      {staffPreview ? <ClientPortalStaffBanner /> : null}
      <div className="border-b border-slate-100 px-4 py-3 sm:px-6">
        <Link
          href={homeHref}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to your portal
        </Link>
      </div>
      {children}
    </div>
  );
}
