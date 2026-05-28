"use client";

import { Building2, Info, User } from "lucide-react";

export function DirectoryModelNote() {
  return (
    <details className="group rounded-lg border border-slate-200 bg-white text-sm shadow-sm">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-slate-700 [&::-webkit-details-marker]:hidden">
        <Info className="h-4 w-4 shrink-0 text-slate-400" />
        <span className="font-medium">Directory — people vs organizations</span>
      </summary>
      <div className="grid gap-4 border-t border-slate-100 px-4 py-4 sm:grid-cols-2">
        <div className="flex gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50">
            <User className="h-4 w-4 text-brand-700" />
          </span>
          <div>
            <p className="font-semibold text-slate-900">People</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Every human contact: customers, leads, referral partners (realtor, storage, developer,
              restoration, senior living, and more), vendor reps, and care-of family.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
            <Building2 className="h-4 w-4 text-slate-600" />
          </span>
          <div>
            <p className="font-semibold text-slate-900">Organizations</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Brokerages, senior living communities, commercial accounts, and vendor companies. Link
              people to an org when they represent a business — not instead of a person record.
            </p>
          </div>
        </div>
      </div>
    </details>
  );
}
