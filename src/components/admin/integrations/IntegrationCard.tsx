"use client";

import type { IntegrationCatalogEntry } from "@/lib/integrations/catalog";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

type IntegrationCardProps = {
  entry: IntegrationCatalogEntry;
};

export function IntegrationCard({ entry }: IntegrationCardProps) {
  return (
    <div className="flex h-full items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 hover:border-slate-300">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <p className="text-sm font-semibold text-slate-900">{entry.name}</p>
          <span className="text-xs text-slate-500">· {entry.role}</span>
        </div>
        <p className="mt-0.5 truncate text-xs text-slate-600">{entry.detail}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {entry.relatedRoute ? (
          <Link
            href={entry.relatedRoute}
            className="inline-flex items-center gap-0.5 text-[11px] font-medium text-brand-600 hover:text-brand-800"
            title="Open in MoveHQ"
          >
            Open
            <ExternalLink className="h-3 w-3" />
          </Link>
        ) : null}
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap text-slate-600">
          Not connected
        </span>
      </div>
    </div>
  );
}
