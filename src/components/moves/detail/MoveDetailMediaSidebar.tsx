"use client";

import { MediaList } from "@/components/crew-app/CrewFieldCapturePanel";
import { TabBar } from "@/components/shared/TabBar";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import {
  FIELD_CAPTURE_CATEGORIES,
  FIELD_CAPTURE_CATEGORY_LABELS,
  type FieldCaptureCategory,
} from "@/lib/crew-app/field-capture-types";
import { subscribeJobFieldStore } from "@/lib/crew-app/job-field-storage";
import {
  enrichMediaWithAnalyzeStatus,
  markMediaAnalyzed,
  partitionMediaByAnalyze,
  type MoveMediaWithAnalyze,
} from "@/lib/moves/move-media-analyze";
import {
  formatMediaCapturedAt,
  getMoveMediaItems,
  type MoveMediaItem,
} from "@/lib/moves/move-media";
import {
  countOperationsFieldMediaByCategory,
  getMoveOperationsFieldMedia,
} from "@/lib/moves/move-operations-media";
import type { MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import { Film, ImageIcon, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";

type MoveDetailMediaSidebarProps = {
  open: boolean;
  move: MoveRecord;
  onClose: () => void;
};

type MediaTabId = "sales" | "operations";

type SalesFilter = "all" | "pending" | "analyzed";

type OperationsFilter = "all" | FieldCaptureCategory;

const MEDIA_TABS = [
  { id: "sales" as const, label: "Sales" },
  { id: "operations" as const, label: "Operations" },
];

const SALES_FILTERS: { id: SalesFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Not yet analyzed" },
  { id: "analyzed", label: "AI analyzed" },
];

function MediaTypeIcon({ type }: { type: MoveMediaItem["type"] }) {
  if (type === "video") {
    return <Film className="h-5 w-5 text-sky-600" />;
  }
  return <ImageIcon className="h-5 w-5 text-violet-600" />;
}

export function MoveDetailMediaSidebar({ open, move, onClose }: MoveDetailMediaSidebarProps) {
  const [activeTab, setActiveTab] = useState<MediaTabId>("sales");
  const [salesFilter, setSalesFilter] = useState<SalesFilter>("all");
  const [operationsFilter, setOperationsFilter] = useState<OperationsFilter>("all");
  const [analyzeRevision, setAnalyzeRevision] = useState(0);
  const [opsRevision, setOpsRevision] = useState(0);

  useEffect(() => {
    if (!open) return;
    return subscribeJobFieldStore(() => setOpsRevision((n) => n + 1));
  }, [open]);

  useEffect(() => {
    if (!open) {
      setActiveTab("sales");
      setSalesFilter("all");
      setOperationsFilter("all");
    }
  }, [open, move.id]);

  const salesItems = useMemo(() => getMoveMediaItems(move), [move]);
  const enrichedSales = useMemo(
    () => enrichMediaWithAnalyzeStatus(salesItems),
    [salesItems, analyzeRevision],
  );
  const { pending, analyzed } = useMemo(
    () => partitionMediaByAnalyze(enrichedSales),
    [enrichedSales],
  );

  const operationsMedia = useMemo(
    () => getMoveOperationsFieldMedia(move),
    [move, opsRevision],
  );
  const operationsCounts = useMemo(
    () => countOperationsFieldMediaByCategory(operationsMedia),
    [operationsMedia],
  );

  const filteredSales = useMemo(() => {
    if (salesFilter === "pending") return pending;
    if (salesFilter === "analyzed") return analyzed;
    return enrichedSales;
  }, [salesFilter, enrichedSales, pending, analyzed]);

  const filteredOperations = useMemo(() => {
    if (operationsFilter === "all") return operationsMedia;
    return operationsMedia.filter((entry) => entry.category === operationsFilter);
  }, [operationsFilter, operationsMedia]);

  const salesCounts = {
    all: enrichedSales.length,
    pending: pending.length,
    analyzed: analyzed.length,
  };

  const tabs = MEDIA_TABS.map((tab) => ({
    ...tab,
    label:
      tab.id === "sales"
        ? `${tab.label} (${salesCounts.all})`
        : `${tab.label} (${operationsCounts.all})`,
  }));

  return (
    <DetailSidebar
      open={open}
      onClose={onClose}
      title="Move media"
      description={`${move.reference} · ${move.customerName}`}
      widthClassName="max-w-lg"
    >
      <TabBar tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-4 space-y-4">
        {activeTab === "sales" ? (
          <>
            <p className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm text-slate-600">
              LiveSwitch surveys, SMS uploads, and walk-through recordings. Pending items need AI
              review before they can trigger a requote.
            </p>

            <FilterChipRow>
              {SALES_FILTERS.map((filter) => (
                <FilterChip
                  key={filter.id}
                  active={salesFilter === filter.id}
                  onClick={() => setSalesFilter(filter.id)}
                >
                  {filter.label} ({salesCounts[filter.id]})
                </FilterChip>
              ))}
            </FilterChipRow>

            <SalesMediaList
              items={filteredSales}
              emptyLabel={
                salesFilter === "pending"
                  ? "No pending sales media"
                  : salesFilter === "analyzed"
                    ? "None analyzed yet"
                    : "No sales media captured yet"
              }
              showAnalyzeAction={salesFilter !== "analyzed"}
              onAnalyze={(id) => {
                markMediaAnalyzed(id);
                setAnalyzeRevision((n) => n + 1);
              }}
            />
          </>
        ) : (
          <>
            <p className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm text-slate-600">
              Photos from the crew app — claims, inventory, truck condition, and general field
              documentation synced to this move.
            </p>

            <FilterChipRow>
              <FilterChip
                active={operationsFilter === "all"}
                onClick={() => setOperationsFilter("all")}
              >
                All ({operationsCounts.all})
              </FilterChip>
              {FIELD_CAPTURE_CATEGORIES.map((category) => (
                <FilterChip
                  key={category}
                  active={operationsFilter === category}
                  onClick={() => setOperationsFilter(category)}
                >
                  {FIELD_CAPTURE_CATEGORY_LABELS[category]} ({operationsCounts[category]})
                </FilterChip>
              ))}
            </FilterChipRow>

            {filteredOperations.length === 0 ? (
              <p className="text-sm text-slate-500">
                {operationsMedia.length === 0
                  ? "No crew field captures on this move yet."
                  : "No media in this category."}
              </p>
            ) : (
              <MediaList media={filteredOperations} />
            )}
          </>
        )}
      </div>
    </DetailSidebar>
  );
}

function SalesMediaList({
  items,
  emptyLabel,
  showAnalyzeAction,
  onAnalyze,
}: {
  items: MoveMediaWithAnalyze[];
  emptyLabel: string;
  showAnalyzeAction: boolean;
  onAnalyze: (id: string) => void;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-500">{emptyLabel}</p>;
  }

  return (
    <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
      {items.map((item) => (
        <li key={item.id} className="flex gap-3 p-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
            <MediaTypeIcon type={item.type} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="text-sm font-medium text-slate-900">{item.label}</p>
              <span
                className={cn(
                  "rounded px-1.5 py-0.5 text-[10px] font-semibold",
                  item.analyzeStatus === "analyzed"
                    ? "bg-violet-100 text-violet-800"
                    : "bg-amber-100 text-amber-900",
                )}
              >
                {item.analyzeStatus === "analyzed" ? "AI analyzed" : "Not yet analyzed"}
              </span>
            </div>
            <p className="text-xs text-slate-500">{formatMediaCapturedAt(item.capturedAt)}</p>
            {item.aiSummary ? (
              <p className="mt-1 text-xs text-violet-800">{item.aiSummary}</p>
            ) : null}
            {showAnalyzeAction && item.analyzeStatus === "pending" ? (
              <button
                type="button"
                onClick={() => onAnalyze(item.id)}
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand-600"
              >
                <Sparkles className="h-3 w-3" />
                Run AI analyze
              </button>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

function FilterChipRow({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-1">{children}</div>;
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
        active
          ? "bg-brand-100 text-brand-800 ring-1 ring-brand-200"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200",
      )}
    >
      {children}
    </button>
  );
}
