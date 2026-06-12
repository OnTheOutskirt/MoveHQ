"use client";

import { Eye } from "lucide-react";

export function ClientPortalStaffBanner() {
  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-xs text-amber-950 sm:px-5">
      <p className="inline-flex flex-wrap items-center justify-center gap-1.5 font-medium">
        <Eye className="h-3.5 w-3.5 shrink-0" aria-hidden />
        Staff preview — you are viewing the client portal as the customer would see it.
      </p>
    </div>
  );
}
