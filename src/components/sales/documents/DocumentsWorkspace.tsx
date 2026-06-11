"use client";

import { useRepFilter } from "@/components/moves/hooks/use-rep-filter";
import { useMoves } from "@/components/moves/MovesProvider";
import { DocumentMilestoneTrack } from "@/components/moves/detail/MoveSentDocumentsPanel";
import { TabBar } from "@/components/shared/TabBar";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { usePersistedState } from "@/lib/hooks/use-persisted-state";
import { formatMoveDate } from "@/lib/moves/format";
import {
  countDocumentsByKind,
  countDocumentsNeedingAttention,
  filterMoveDocuments,
  formatDocumentSentAt,
  listMoveDocuments,
  type MoveDocumentKindFilter,
  type MoveDocumentListRow,
} from "@/lib/moves/move-document-events";
import { pageMeta } from "@/lib/navigation/page-meta";
import { salesMovePath } from "@/lib/navigation/routes";
import { ExternalLink, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const meta = pageMeta["/sales/documents"];

const KIND_TABS: { id: MoveDocumentKindFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "quote", label: "Quotes" },
  { id: "contract", label: "Contracts" },
];

export function DocumentsWorkspace() {
  const router = useRouter();
  const { moves } = useMoves();
  const { repFilter, setRepFilter, reps, repFilteredMoves } = useRepFilter(moves);
  const [storedKind, setStoredKind] = usePersistedState<MoveDocumentKindFilter>(
    "jm-tab-/sales/documents-kind",
    "all",
  );
  const [kindTab, setKindTab] = useState<MoveDocumentKindFilter>(storedKind);
  const [needsAttentionOnly, setNeedsAttentionOnly] = useState(false);
  const [search, setSearch] = useState("");

  const allRows = useMemo(
    () => listMoveDocuments(repFilteredMoves),
    [repFilteredMoves],
  );

  const kindCounts = useMemo(() => countDocumentsByKind(allRows), [allRows]);
  const attentionCount = useMemo(() => countDocumentsNeedingAttention(allRows), [allRows]);

  const filtered = useMemo(
    () =>
      filterMoveDocuments(allRows, {
        kind: kindTab,
        attention: needsAttentionOnly ? "needs_attention" : "all",
        rep: repFilter,
        search,
      }),
    [allRows, kindTab, needsAttentionOnly, repFilter, search],
  );

  const tabsWithCounts = useMemo(
    () =>
      KIND_TABS.map((tab) => ({
        ...tab,
        label: `${tab.label} (${kindCounts[tab.id]})`,
      })),
    [kindCounts],
  );

  const columns = useMemo<Column<MoveDocumentListRow>[]>(
    () => [
      {
        key: "document",
        header: "Document",
        cell: (row) => (
          <div>
            <p className="font-medium text-slate-900">
              {row.kindLabel}
              {!row.explicitlySent ? (
                <span className="ml-1.5 text-xs font-normal text-slate-400">(inferred)</span>
              ) : null}
            </p>
            <p className="text-xs text-slate-500">{row.moveReference}</p>
          </div>
        ),
      },
      {
        key: "customer",
        header: "Customer",
        cell: (row) => (
          <div>
            <p className="text-slate-900">{row.customerName}</p>
            <p className="text-xs text-slate-500">{formatMoveDate(row.preferredDate)}</p>
          </div>
        ),
      },
      {
        key: "move",
        header: "Move",
        cell: (row) => (
          <Link
            href={salesMovePath(row.moveId)}
            onClick={(e) => e.stopPropagation()}
            className="text-brand-600 hover:underline"
          >
            View move
          </Link>
        ),
      },
      {
        key: "rep",
        header: "Rep",
        cell: (row) => <span className="text-slate-700">{row.assignedRep}</span>,
      },
      {
        key: "status",
        header: "Progress",
        cell: (row) => (
          <DocumentMilestoneTrack
            milestones={row.engagement.milestones}
            needsAttention={row.engagement.needsAttention}
            compact
            className="min-w-[11rem]"
          />
        ),
      },
      {
        key: "sent",
        header: "Sent",
        sortable: true,
        cell: (row) => (
          <span className="text-xs text-slate-600">{formatDocumentSentAt(row.sentAt)}</span>
        ),
      },
      {
        key: "portal",
        header: "",
        cell: (row) => (
          <Link
            href={row.portalUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            Portal
            <ExternalLink className="h-3 w-3" />
          </Link>
        ),
      },
    ],
    [],
  );

  function handleKindChange(next: MoveDocumentKindFilter) {
    setKindTab(next);
    setStoredKind(next);
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={meta.title}
        description="Every quote and contract sent to customers — views, booking requests, signatures, and deposits from the activity log."
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer or move ref…"
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Rep</span>
          <select
            value={repFilter}
            onChange={(e) => setRepFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="all">All reps</option>
            {reps.map((rep) => (
              <option key={rep} value={rep}>
                {rep}
              </option>
            ))}
          </select>
        </label>

        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={needsAttentionOnly}
            onChange={(e) => setNeedsAttentionOnly(e.target.checked)}
            className="rounded border-slate-300"
          />
          Needs attention
          {attentionCount > 0 ? (
            <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-900">
              {attentionCount}
            </span>
          ) : null}
        </label>
      </div>

      <TabBar
        tabs={tabsWithCounts}
        activeTab={kindTab}
        onChange={(id) => handleKindChange(id)}
      />

      <DataTable
        columns={columns}
        data={filtered}
        emptyMessage={
          needsAttentionOnly
            ? "No documents waiting on customer action."
            : kindTab === "quote"
              ? "No quotes match these filters."
              : kindTab === "contract"
                ? "No contracts match these filters."
                : "No documents sent yet — send a quote or contract from a move."
        }
        getRowKey={(row) => row.id}
        onRowClick={(row) => router.push(salesMovePath(row.moveId))}
      />
    </div>
  );
}
