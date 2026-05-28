"use client";

import { ClaimsDetailSidebar } from "@/components/operations/claims/ClaimsDetailSidebar";
import { useClaims } from "@/components/providers/ClaimsProvider";
import { useMoves } from "@/components/moves/MovesProvider";
import { TabBar } from "@/components/shared/TabBar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { usePersistedState } from "@/lib/hooks/use-persisted-state";
import {
  CLAIM_CATEGORY_LABELS,
  CLAIM_STATUS_BADGE,
  CLAIM_STATUS_LABELS,
  claimsForTab,
  countClaimsByTab,
  formatClaimMoney,
  summarizeClaims,
} from "@/lib/operations/claims";
import type { ClaimStatusTab } from "@/lib/operations/claims-types";
import type { MoveClaim } from "@/lib/operations/claims-types";
import { formatMoveDate } from "@/lib/moves/format";
import { pageMeta } from "@/lib/navigation/page-meta";
import { salesMovePath } from "@/lib/navigation/routes";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const meta = pageMeta["/operations/claims"];

const STATUS_TABS: { id: ClaimStatusTab; label: string }[] = [
  { id: "new", label: "New" },
  { id: "in_progress", label: "In progress" },
  { id: "pending", label: "Pending" },
  { id: "completed", label: "Completed" },
];

type PanelMode =
  | { type: "closed" }
  | { type: "view"; claimId: string }
  | { type: "add"; moveId?: string };

export function ClaimsWorkspace() {
  const { claims } = useClaims();
  const { moves } = useMoves();
  const searchParams = useSearchParams();
  const [storedTab, setStoredTab] = usePersistedState<ClaimStatusTab>(
    "jm-tab-/operations/claims",
    "new",
  );
  const [tab, setTab] = useState<ClaimStatusTab>(storedTab);
  const [panel, setPanel] = useState<PanelMode>({ type: "closed" });

  useEffect(() => {
    setTab(storedTab);
  }, [storedTab]);

  useEffect(() => {
    const addMoveId = searchParams.get("addMove");
    if (addMoveId && moves.some((m) => m.id === addMoveId)) {
      setPanel({ type: "add", moveId: addMoveId });
    }
  }, [searchParams, moves]);

  const counts = useMemo(() => countClaimsByTab(claims), [claims]);
  const tabsWithCounts = useMemo(
    () =>
      STATUS_TABS.map((t) => ({
        ...t,
        label: `${t.label} (${counts[t.id]})`,
      })),
    [counts],
  );

  const filtered = useMemo(() => claimsForTab(claims, tab), [claims, tab]);
  const summary = useMemo(() => summarizeClaims(claims), [claims]);

  const columns = useMemo<Column<MoveClaim>[]>(
    () => [
      {
        key: "ref",
        header: "Claim",
        cell: (row) => (
          <div>
            <p className="font-medium text-slate-900">{row.reference}</p>
            <p className="text-xs text-slate-500">{row.title}</p>
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
            {row.moveReference}
          </Link>
        ),
      },
      {
        key: "customer",
        header: "Customer",
        cell: (row) => <span className="text-slate-800">{row.customerName}</span>,
      },
      {
        key: "category",
        header: "Type",
        cell: (row) => CLAIM_CATEGORY_LABELS[row.category],
      },
      {
        key: "status",
        header: "Status",
        cell: (row) => (
          <Badge className={CLAIM_STATUS_BADGE[row.status]}>
            {CLAIM_STATUS_LABELS[row.status]}
          </Badge>
        ),
      },
      {
        key: "claimed",
        header: "Claimed",
        cell: (row) => (
          <span className="tabular-nums font-medium">{formatClaimMoney(row.amountClaimed)}</span>
        ),
      },
      {
        key: "reserved",
        header: "Reserved",
        cell: (row) => (
          <span className="tabular-nums text-slate-700">
            {row.amountReserved > 0 ? formatClaimMoney(row.amountReserved) : "—"}
          </span>
        ),
      },
      {
        key: "paid",
        header: "Paid",
        cell: (row) => (
          <span className="tabular-nums text-slate-700">
            {row.amountPaid > 0 ? formatClaimMoney(row.amountPaid) : "—"}
          </span>
        ),
      },
      {
        key: "assigned",
        header: "Owner",
        cell: (row) => row.assignedTo,
      },
      {
        key: "reported",
        header: "Reported",
        cell: (row) => formatMoveDate(row.reportedDate),
      },
    ],
    [],
  );

  function changeTab(next: ClaimStatusTab) {
    setTab(next);
    setStoredTab(next);
  }

  const emptyMessages: Record<ClaimStatusTab, string> = {
    new: "No new claims — intake from move detail or add one below.",
    in_progress: "No claims actively being worked.",
    pending: "Nothing waiting on customer, vendor, or internal sign-off.",
    completed: "No completed or denied claims yet.",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader title={meta.title} description={meta.description} />
        <Button type="button" size="sm" onClick={() => setPanel({ type: "add" })}>
          <Plus className="h-4 w-4" />
          New claim
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Open claims" value={String(summary.openCount)} />
        <SummaryCard label="Total claimed" value={formatClaimMoney(summary.totalClaimed)} />
        <SummaryCard label="Reserved" value={formatClaimMoney(summary.totalReserved)} />
        <SummaryCard
          label="Paid out"
          value={formatClaimMoney(summary.totalPaid)}
          hint={
            summary.outstandingReserve > 0
              ? `${formatClaimMoney(summary.outstandingReserve)} open reserve`
              : undefined
          }
        />
      </div>

      <TabBar tabs={tabsWithCounts} activeTab={tab} onChange={changeTab} />

      <DataTable
        columns={columns}
        data={filtered}
        emptyMessage={emptyMessages[tab]}
        onRowClick={(row) => setPanel({ type: "view", claimId: row.id })}
        getRowKey={(row) => row.id}
      />

      <ClaimsDetailSidebar mode={panel} moves={moves} onClose={() => setPanel({ type: "closed" })} />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-0.5 text-xl font-semibold tabular-nums text-slate-900">{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-amber-800">{hint}</p> : null}
    </div>
  );
}
