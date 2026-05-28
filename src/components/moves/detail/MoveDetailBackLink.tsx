"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export function MoveDetailBackLink() {
  return (
    <div className="shrink-0 border-b border-slate-100 bg-white px-4 py-2 lg:px-5">
      <Link
        href="/moves"
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-brand-600"
      >
        <ChevronLeft className="h-4 w-4" />
        Moves
      </Link>
    </div>
  );
}
