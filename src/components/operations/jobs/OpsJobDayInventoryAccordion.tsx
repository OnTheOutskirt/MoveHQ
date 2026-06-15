"use client";

import { Badge } from "@/components/ui/Badge";
import { useSettings } from "@/components/providers/SettingsProvider";
import {
  analyzeMoveInventory,
  COMPLEXITY_BADGE,
  COMPLEXITY_LABELS,
} from "@/lib/moves/inventory-analysis";
import type { MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import { ChevronDown, Package } from "lucide-react";
import { useId, useMemo, useState } from "react";

type OpsJobDayInventoryAccordionProps = {
  move: MoveRecord;
};

export function OpsJobDayInventoryAccordion({ move }: OpsJobDayInventoryAccordionProps) {
  const { settings } = useSettings();
  const [open, setOpen] = useState(false);
  const panelId = useId();

  const analysis = useMemo(
    () => analyzeMoveInventory(move, settings.defaults),
    [move, settings.defaults],
  );

  const { intake } = move;
  const roomPreview = intake.rooms
    .filter((room) => room.items.trim())
    .slice(0, 4)
    .map((room) => `${room.name}: ${room.items.split("\n").filter(Boolean).slice(0, 2).join(", ")}`);

  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
      >
        <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
          <Package className="h-3.5 w-3.5" />
          Inventory
        </span>
        <span className="flex items-center gap-2">
          <Badge className={COMPLEXITY_BADGE[analysis.complexity]}>
            {COMPLEXITY_LABELS[analysis.complexity]}
          </Badge>
          <span className="text-xs tabular-nums text-slate-500">
            {analysis.volume.cubicFeet.toLocaleString()} cf
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-slate-400 transition-transform",
              open && "rotate-180",
            )}
          />
        </span>
      </button>

      {open ? (
        <div id={panelId} className="space-y-3 border-t border-slate-100 px-3 py-3">
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <dt className="text-[10px] font-medium uppercase text-slate-500">Rooms</dt>
              <dd className="font-medium text-slate-900">{analysis.roomCount}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-medium uppercase text-slate-500">Item lines</dt>
              <dd className="font-medium text-slate-900">{analysis.itemLineCount}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-medium uppercase text-slate-500">Weight est.</dt>
              <dd className="font-medium text-slate-900">
                {analysis.volume.weightLbs.toLocaleString()} lbs
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-medium uppercase text-slate-500">Packing</dt>
              <dd className="font-medium capitalize text-slate-900">
                {analysis.packingService.replace(/_/g, " ")}
              </dd>
            </div>
          </dl>

          {analysis.insights.length > 0 ? (
            <ul className="space-y-1 text-xs text-slate-600">
              {analysis.insights.slice(0, 3).map((line) => (
                <li key={line}>• {line}</li>
              ))}
            </ul>
          ) : null}

          {roomPreview.length > 0 ? (
            <ul className="space-y-1.5 rounded-md border border-slate-100 bg-slate-50/80 px-2.5 py-2 text-xs text-slate-700">
              {roomPreview.map((line) => (
                <li key={line}>{line}</li>
              ))}
              {intake.rooms.length > roomPreview.length ? (
                <li className="text-slate-500">
                  + {intake.rooms.length - roomPreview.length} more room
                  {intake.rooms.length - roomPreview.length === 1 ? "" : "s"}
                </li>
              ) : null}
            </ul>
          ) : (
            <p className="text-xs text-slate-500">No room-by-room inventory on this move yet.</p>
          )}
        </div>
      ) : null}
    </section>
  );
}
