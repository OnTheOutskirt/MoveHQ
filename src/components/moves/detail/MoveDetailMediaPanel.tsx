"use client";

import { useState } from "react";
import { MoveDetailMediaSidebar } from "@/components/moves/detail/MoveDetailMediaSidebar";
import { getMoveMediaItems } from "@/lib/moves/move-media";
import { getMoveOperationsFieldMedia } from "@/lib/moves/move-operations-media";
import type { MoveRecord } from "@/lib/moves/types";
import { Camera, Film, ImageIcon } from "lucide-react";

type MoveDetailMediaPanelProps = {
  move: MoveRecord;
};

const PREVIEW_LIMIT = 3;

function PreviewTile({ type, label }: { type: "snapshot" | "video"; label: string }) {
  return (
    <div
      className="flex min-w-0 flex-1 flex-col items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-1 py-2"
      title={label}
    >
      {type === "video" ? (
        <Film className="h-4 w-4 text-sky-600" />
      ) : (
        <ImageIcon className="h-4 w-4 text-violet-600" />
      )}
      <span className="mt-1 line-clamp-2 text-center text-[9px] font-medium leading-tight text-slate-600">
        {label}
      </span>
    </div>
  );
}

export function MoveDetailMediaPanel({ move }: MoveDetailMediaPanelProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const salesItems = getMoveMediaItems(move);
  const operationsCount = getMoveOperationsFieldMedia(move).length;
  const preview = salesItems.slice(0, PREVIEW_LIMIT);
  const moreCount = Math.max(0, salesItems.length - PREVIEW_LIMIT);
  const totalCount = salesItems.length + operationsCount;

  return (
    <>
      <div className="min-w-0 shrink-0 border-b border-slate-200 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Media</p>
        <p className="mt-0.5 text-[10px] text-slate-500">
          Sales surveys &amp; ops field capture
          {totalCount > 0 ? (
            <span className="text-slate-400">
              {" "}
              · {salesItems.length} sales
              {operationsCount > 0 ? ` · ${operationsCount} ops` : ""}
            </span>
          ) : null}
        </p>

        {preview.length > 0 ? (
          <div className="mt-2 flex gap-1.5">
            {preview.map((item) => (
              <PreviewTile key={item.id} type={item.type} label={item.label} />
            ))}
          </div>
        ) : (
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-2.5 py-3">
            <Camera className="h-4 w-4 shrink-0 text-slate-400" />
            <p className="text-[11px] text-slate-500">
              {operationsCount > 0
                ? `${operationsCount} crew photo${operationsCount === 1 ? "" : "s"} on file`
                : "No media captured yet"}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white py-2 text-[11px] font-medium text-slate-700 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800"
        >
          <Camera className="h-3.5 w-3.5" />
          View media
          {totalCount > 0 ? (
            <span className="text-slate-500">
              ({totalCount}
              {moreCount > 0 && preview.length < salesItems.length ? ` · +${moreCount} more` : ""})
            </span>
          ) : null}
        </button>
      </div>

      <MoveDetailMediaSidebar
        open={sidebarOpen}
        move={move}
        onClose={() => setSidebarOpen(false)}
      />
    </>
  );
}
