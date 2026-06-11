"use client";

import type { DocumentSendKind } from "@/lib/moves/document-template-render";
import { pricingKindFromVars } from "@/lib/settings/document-accent";
import {
  contentsSummaryLine,
  parseMoveContentsFromVars,
  truncateItems,
  type DocumentMoveContents,
} from "@/lib/settings/document-move-contents";
import { cn } from "@/lib/utils";
import { CheckCircle2, ChevronDown, ClipboardList, Home } from "lucide-react";
import { useMemo, useState } from "react";

const ROOM_PREVIEW = 5;

type DocumentContentsSectionProps = {
  vars: Record<string, string>;
  kind: DocumentSendKind;
  accentColor: string;
  interactive?: boolean;
};

export function DocumentContentsSection({
  vars,
  kind,
  accentColor,
  interactive = true,
}: DocumentContentsSectionProps) {
  const contents = useMemo(() => parseMoveContentsFromVars(vars), [vars]);
  const pricingKind = pricingKindFromVars(vars);
  const isFlat = pricingKind === "flat";

  const [expanded, setExpanded] = useState(false);
  const [showAllRooms, setShowAllRooms] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  if (!contents || (contents.rooms.length === 0 && !contents.homeSizeLabel)) {
    return null;
  }

  const visibleRooms = showAllRooms ? contents.rooms : contents.rooms.slice(0, ROOM_PREVIEW);
  const hiddenRoomCount = Math.max(0, contents.rooms.length - ROOM_PREVIEW);

  const confirmLabel =
    kind === "contract"
      ? "I confirm the move contents above are accurate and included in this agreement."
      : isFlat
        ? "I confirm this inventory matches what we discussed — my flat rate is based on these contents."
        : "I confirm this inventory matches what we discussed for my move.";

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-start justify-between gap-3 px-4 py-4 text-left"
      >
        <div className="flex min-w-0 gap-3">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
            style={{
              backgroundColor: `color-mix(in srgb, ${accentColor} 12%, white)`,
              color: accentColor,
            }}
          >
            <ClipboardList className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">What you&apos;re moving</p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
              {contentsSummaryLine(contents)}
            </p>
            {isFlat && kind === "quote" ? (
              <p
                className="mt-1.5 text-[11px] font-medium leading-snug"
                style={{ color: `color-mix(in srgb, ${accentColor} 78%, #0f172a)` }}
              >
                Your flat rate is based on the contents below — review before you book.
              </p>
            ) : isFlat && kind === "contract" ? (
              <p className="mt-1.5 text-[11px] font-medium leading-snug text-slate-600">
                Flat rate scope — confirm inventory matches your agreement.
              </p>
            ) : null}
          </div>
        </div>
        <ChevronDown
          className={cn(
            "mt-1 h-4 w-4 shrink-0 text-slate-400 transition",
            expanded && "rotate-180",
          )}
        />
      </button>

      {expanded ? (
        <div className="space-y-4 border-t border-slate-100 px-4 pb-4 pt-3">
          <ContentsMeta contents={contents} accentColor={accentColor} />

          {contents.rooms.length > 0 ? (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                By room
              </p>
              <ul className="mt-2 space-y-2">
                {visibleRooms.map((room) => (
                  <li
                    key={`${room.floor}-${room.name}`}
                    className="rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2"
                  >
                    <p className="text-xs font-semibold text-slate-800">
                      {room.name}
                      <span className="ml-1.5 font-normal text-slate-400">Floor {room.floor}</span>
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                      {truncateItems(room.items)}
                    </p>
                  </li>
                ))}
              </ul>
              {!showAllRooms && hiddenRoomCount > 0 ? (
                <button
                  type="button"
                  onClick={() => setShowAllRooms(true)}
                  className="mt-2 text-xs font-semibold text-brand-700 hover:underline"
                >
                  Show all {contents.rooms.length} rooms
                </button>
              ) : null}
            </div>
          ) : null}

          {contents.appliances.length > 0 ? (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Appliances
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {contents.appliances.map((a) => (
                  <span
                    key={a.label}
                    className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700"
                  >
                    {a.label}
                    {a.quantity > 1 ? ` ×${a.quantity}` : ""}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {contents.notes.length > 0 ? (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Also noted
              </p>
              <ul className="mt-2 space-y-1 text-xs text-slate-600">
                {contents.notes.map((note) => (
                  <li key={note} className="flex gap-1.5">
                    <span className="text-slate-300">·</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {confirmed ? (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-2.5">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <p className="text-xs font-medium text-emerald-900">Contents confirmed</p>
            </div>
          ) : (
            <label
              className={cn(
                "flex cursor-pointer items-start gap-2.5 rounded-xl border px-3 py-3 transition",
                interactive ? "border-slate-200 hover:bg-slate-50/80" : "border-slate-200 opacity-80",
              )}
            >
              <input
                type="checkbox"
                checked={confirmed}
                disabled={!interactive}
                onChange={(e) => interactive && setConfirmed(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-brand-600"
              />
              <span className="text-xs leading-relaxed text-slate-700">{confirmLabel}</span>
            </label>
          )}
        </div>
      ) : (
        <p className="border-t border-slate-100 px-4 py-2.5 text-[11px] text-slate-500">
          Tap to review rooms and confirm what&apos;s included
          {kind === "contract" ? " in your agreement" : ""}.
        </p>
      )}
    </section>
  );
}

function ContentsMeta({
  contents,
  accentColor,
}: {
  contents: DocumentMoveContents;
  accentColor: string;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <MetaChip icon={Home} label="Home size" value={contents.homeSizeLabel} accentColor={accentColor} />
      {contents.packingDensity ? (
        <MetaChip label="Packing density" value={contents.packingDensity} accentColor={accentColor} />
      ) : null}
      {contents.packingService && contents.packingService !== "None" ? (
        <MetaChip label="Packing" value={contents.packingService} accentColor={accentColor} />
      ) : null}
      {contents.estimatedBoxCount != null ? (
        <MetaChip
          label="Est. boxes"
          value={`~${contents.estimatedBoxCount}`}
          accentColor={accentColor}
        />
      ) : null}
    </div>
  );
}

function MetaChip({
  icon: Icon,
  label,
  value,
  accentColor,
}: {
  icon?: typeof Home;
  label: string;
  value: string;
  accentColor: string;
}) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2">
      <p
        className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide"
        style={{ color: accentColor }}
      >
        {Icon ? <Icon className="h-3 w-3 opacity-80" /> : null}
        {label}
      </p>
      <p className="mt-0.5 text-xs font-medium text-slate-800">{value}</p>
    </div>
  );
}
