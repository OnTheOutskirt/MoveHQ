"use client";

import {
  DetailField,
  DetailFieldGrid,
  DetailSection,
} from "@/components/moves/detail/DetailSection";
import { useSettings } from "@/components/providers/SettingsProvider";
import { Badge } from "@/components/ui/Badge";
import {
  analyzeMoveInventory,
  COMPLEXITY_BADGE,
  COMPLEXITY_LABELS,
  type InventoryRiskFlag,
} from "@/lib/moves/inventory-analysis";
import {
  formatInventoryBasisLabel,
  formatInventoryVolumeDetail,
} from "@/lib/moves/inventory-basis";
import type { MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import { AlertTriangle, Boxes, Info, Sparkles } from "lucide-react";
import Link from "next/link";

type MoveDetailInventoryTabProps = {
  move: MoveRecord;
};

const FLOOR_LABELS: Record<number, string> = {
  1: "First floor",
  2: "Second floor",
  3: "Third floor",
};

const SEVERITY_STYLES: Record<InventoryRiskFlag["severity"], string> = {
  info: "border-slate-200 bg-slate-50 text-slate-700",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  critical: "border-red-200 bg-red-50 text-red-900",
};

export function MoveDetailInventoryTab({ move }: MoveDetailInventoryTabProps) {
  const { settings } = useSettings();
  const { intake } = move;
  const analysis = analyzeMoveInventory(move, settings.defaults);
  const floors = [1, 2, 3] as const;
  const roomsByFloor = floors.map((f) => ({
    floor: f,
    rooms: intake.rooms.filter((r) => r.floor === f),
  }));

  const wardrobeTotal =
    intake.wardrobe.jonahCount > 0
      ? `${intake.wardrobe.jonahCount} from Jonah's (${
          intake.wardrobe.jonahType === "keep" ? "$20" : "$10"
        } each)`
      : null;

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-brand-200 bg-gradient-to-br from-brand-50/80 to-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-600" />
              <h2 className="text-sm font-semibold text-slate-900">Inventory analysis</h2>
              <Badge className={COMPLEXITY_BADGE[analysis.complexity]}>
                {COMPLEXITY_LABELS[analysis.complexity]} load
              </Badge>
            </div>
            <p className="mt-1 text-xs text-slate-600">
              Scope signals for crew sizing, flat-rate quotes, and packing material planning.
            </p>
          </div>
          <Link
            href="/operations/inventory"
            className="text-xs font-semibold text-brand-700 hover:underline"
          >
            Ops inventory →
          </Link>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatChip label="Rooms" value={String(analysis.roomCount)} />
          <StatChip label="Item lines" value={String(analysis.itemLineCount)} />
          <StatChip
            label="Est. volume"
            value={formatInventoryVolumeDetail(analysis.volume)}
          />
          <StatChip
            label="Boxes (est.)"
            value={analysis.estimatedBoxes != null ? `~${analysis.estimatedBoxes}` : "—"}
          />
        </div>

        {analysis.insights.length > 0 ? (
          <ul className="mt-4 space-y-1.5">
            {analysis.insights.map((insight) => (
              <li key={insight} className="flex gap-2 text-sm text-slate-700">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
                {insight}
              </li>
            ))}
          </ul>
        ) : null}

        {analysis.flags.length > 0 ? (
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {analysis.flags.map((flag) => (
              <li
                key={flag.id}
                className={cn("rounded-lg border px-3 py-2 text-xs", SEVERITY_STYLES[flag.severity])}
              >
                <p className="flex items-center gap-1 font-semibold">
                  {flag.severity !== "info" ? (
                    <AlertTriangle className="h-3 w-3 shrink-0" />
                  ) : null}
                  {flag.label}
                </p>
                <p className="mt-0.5 opacity-90">{flag.detail}</p>
              </li>
            ))}
          </ul>
        ) : null}

        {analysis.supplyHints.length > 0 ? (
          <div className="mt-4 rounded-lg border border-slate-200 bg-white/80 p-3">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              <Boxes className="h-3 w-3" />
              Suggested packing materials
            </p>
            <ul className="mt-2 grid gap-1 sm:grid-cols-2">
              {analysis.supplyHints.map((hint) => (
                <li key={hint.label} className="flex justify-between gap-2 text-sm">
                  <span className="text-slate-700">{hint.label}</span>
                  <span className="font-medium tabular-nums text-slate-900">{hint.estimate}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <DetailSection
        title="Inventory basis"
        description="Used for AI flat-rate quotes and customer documents"
      >
        <DetailFieldGrid>
          <DetailField
            label="Pricing basis"
            value={formatInventoryBasisLabel(analysis.volume.basis)}
          />
          <DetailField
            label="Estimated volume"
            value={formatInventoryVolumeDetail(analysis.volume)}
          />
          <DetailField label="Packing service" value={intake.packingService} />
          <DetailField
            label="Complexity score"
            value={`${analysis.complexityScore} / 100`}
          />
        </DetailFieldGrid>
      </DetailSection>

      <DetailSection
        title="Boxes & packing summary"
        description="From Stage 1 selections — change intake to update"
      >
        <DetailFieldGrid>
          <DetailField
            label="Boxes / totes to move"
            value={
              intake.estimatedBoxCount != null
                ? `~${intake.estimatedBoxCount} estimated`
                : "—"
            }
          />
          <DetailField label="Home size" value={intake.homeSizeLabel || "—"} />
          <DetailField label="Packing density" value={intake.packingDensity || "—"} />
        </DetailFieldGrid>
      </DetailSection>

      <DetailSection title="Room-by-room inventory">
        {intake.rooms.length === 0 ? (
          <p className="text-sm text-slate-500">
            No rooms listed — add inventory on the Move Scope tab for better quotes.
          </p>
        ) : (
          <div className="space-y-4">
            {roomsByFloor.map(
              ({ floor, rooms }) =>
                rooms.length > 0 && (
                  <div key={floor}>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {FLOOR_LABELS[floor]} ({rooms.length} room{rooms.length === 1 ? "" : "s"})
                    </p>
                    <div className="space-y-2">
                      {rooms.map((room) => (
                        <div
                          key={room.id}
                          className={cn(
                            "rounded-md border p-3",
                            room.items.trim()
                              ? "border-slate-200 bg-slate-50/80"
                              : "border-amber-200 bg-amber-50/40",
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-slate-900">{room.name}</p>
                            {!room.items.trim() ? (
                              <Badge variant="warning">Needs items</Badge>
                            ) : null}
                          </div>
                          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
                            {room.items || "(no items listed)"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ),
            )}
          </div>
        )}
      </DetailSection>

      <DetailSection title="Appliances">
        {intake.appliances.length === 0 ? (
          <p className="text-sm text-slate-500">None selected</p>
        ) : (
          <ul className="space-y-1 text-sm text-slate-900">
            {intake.appliances.map((a) => (
              <li key={a.id}>
                {a.label}
                {a.quantity > 1 ? ` ×${a.quantity}` : ""}
              </li>
            ))}
          </ul>
        )}
        <DetailFieldGrid>
          <DetailField
            label="Disconnect / reconnect"
            value={
              intake.applianceDisconnectHandling === "client"
                ? "Client will handle"
                : intake.applianceDisconnectHandling === "referral"
                  ? "Needs third-party referral"
                  : "—"
            }
            fullWidth
          />
        </DetailFieldGrid>
      </DetailSection>

      <DetailSection title="Wardrobe boxes">
        <DetailFieldGrid>
          <DetailField label="Jonah's wardrobe boxes" value={wardrobeTotal ?? "None"} />
          <DetailField
            label="Client-owned wardrobes"
            value={
              intake.wardrobe.clientOwnedCount > 0
                ? `${intake.wardrobe.clientOwnedCount} (16 cu ft each, no charge)`
                : "None"
            }
          />
        </DetailFieldGrid>
      </DetailSection>

      <DetailSection title="Items to haul off">
        {intake.hasJunk ? (
          <DetailFieldGrid>
            <DetailField label="Volume" value={intake.junkVolume ?? "—"} />
            <DetailField
              label="Items"
              value={
                <span className="whitespace-pre-wrap font-normal">{intake.junkItems ?? "—"}</span>
              }
              fullWidth
            />
          </DetailFieldGrid>
        ) : (
          <p className="text-sm text-slate-500">No haul-off items</p>
        )}
      </DetailSection>

      {intake.hasSpecialtyItems || intake.specialtyNotes ? (
        <DetailSection title="Specialty & timing">
          <DetailFieldGrid>
            <DetailField
              label="Specialty items"
              value={intake.hasSpecialtyItems ? "Yes" : "No"}
            />
            <DetailField
              label="High-value items"
              value={intake.hasHighValueItems ? "Yes" : "No"}
            />
            <DetailField
              label="Timing complexity"
              value={intake.hasTimingComplexity ? "Yes" : "No"}
              fullWidth
            />
            {intake.specialtyNotes ? (
              <DetailField label="Specialty notes" value={intake.specialtyNotes} fullWidth />
            ) : null}
            {intake.timingNotes ? (
              <DetailField label="Timing notes" value={intake.timingNotes} fullWidth />
            ) : null}
          </DetailFieldGrid>
        </DetailSection>
      ) : null}
    </div>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200/80 bg-white px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
