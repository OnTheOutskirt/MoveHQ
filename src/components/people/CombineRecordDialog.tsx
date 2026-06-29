"use client";

import { useMoves } from "@/components/moves/MovesProvider";
import { Button } from "@/components/ui/Button";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { mergeContacts, mergeOrganizations } from "@/lib/people/people-merge";
import { listAllOrganizations } from "@/lib/people/organizations-storage";
import { listAllPeople } from "@/lib/people/people-storage";
import type { OrganizationRecord, PersonRecord } from "@/lib/people/types";
import { cn } from "@/lib/utils";
import { ArrowRight, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type CombineRecordDialogProps =
  | {
      kind: "person";
      open: boolean;
      current: PersonRecord;
      onClose: () => void;
      onComplete: (survivor: PersonRecord) => void;
    }
  | {
      kind: "organization";
      open: boolean;
      current: OrganizationRecord;
      onClose: () => void;
      onComplete: (survivor: OrganizationRecord) => void;
    };

type AnyRecord = PersonRecord | OrganizationRecord;

function contactLine(record: AnyRecord): string {
  return [record.phone, record.email].filter(Boolean).join(" · ") || "No contact info";
}

export function CombineRecordDialog(props: CombineRecordDialogProps) {
  const { kind, open, current, onClose } = props;
  const { reassignMoveContact } = useMoves();
  const [query, setQuery] = useState("");
  const [otherId, setOtherId] = useState<string | null>(null);
  const [survivorIsCurrent, setSurvivorIsCurrent] = useState(true);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setOtherId(null);
    setSurvivorIsCurrent(true);
  }, [open, current]);

  const candidates = useMemo<AnyRecord[]>(() => {
    const q = query.trim().toLowerCase();
    const all: AnyRecord[] =
      kind === "person"
        ? listAllPeople()
        : listAllOrganizations();
    return all
      .filter((r) => r.id !== current.id)
      .filter((r) => {
        if (!q) return true;
        const haystack = [r.name, r.phone ?? "", r.email ?? ""].join(" ").toLowerCase();
        return haystack.includes(q);
      })
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }))
      .slice(0, 30);
  }, [query, kind, current.id]);

  const other = useMemo(
    () => candidates.find((r) => r.id === otherId) ?? null,
    [candidates, otherId],
  );

  const survivor = !other ? current : survivorIsCurrent ? current : other;
  const loser = !other ? null : survivorIsCurrent ? other : current;

  function handleCombine() {
    if (!other) return;
    const survivorId = survivorIsCurrent ? current.id : other.id;
    const loserId = survivorIsCurrent ? other.id : current.id;

    if (kind === "person") {
      const merged = mergeContacts(survivorId, loserId, reassignMoveContact);
      if (merged) props.onComplete(merged);
    } else {
      const merged = mergeOrganizations(survivorId, loserId);
      if (merged) props.onComplete(merged);
    }
    onClose();
  }

  const noun = kind === "person" ? "contact" : "organization";

  return (
    <DetailSidebar
      open={open}
      onClose={onClose}
      title={`Combine ${noun}`}
      description={`Merge a duplicate ${noun} into one. The kept record keeps its primary info; the other's phone, email, and history move over.`}
      widthClassName="max-w-lg"
      zIndexClassName="z-[60]"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" size="sm" onClick={handleCombine} disabled={!other}>
            Combine records
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            This {noun}
          </p>
          <div className="mt-1 rounded-lg border border-slate-200 bg-slate-50/80 p-3">
            <p className="font-medium text-slate-900">{current.name}</p>
            <p className="text-xs text-slate-500">{contactLine(current)}</p>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Find the duplicate to merge in
          </label>
          <div className="relative mt-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${noun}s…`}
              className="h-9 w-full rounded-lg border border-slate-200 pl-8 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <ul className="mt-2 max-h-52 space-y-1 overflow-y-auto">
            {candidates.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => setOtherId(r.id)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                    otherId === r.id
                      ? "border-brand-400 bg-brand-50"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
                  )}
                >
                  <span className="min-w-0">
                    <span className="block font-medium text-slate-900">{r.name}</span>
                    <span className="block truncate text-xs text-slate-500">{contactLine(r)}</span>
                  </span>
                </button>
              </li>
            ))}
            {candidates.length === 0 ? (
              <li className="rounded-lg border border-dashed border-slate-200 px-3 py-4 text-center text-xs text-slate-400">
                No other {noun}s found.
              </li>
            ) : null}
          </ul>
        </div>

        {other ? (
          <div className="space-y-3 rounded-lg border border-slate-200 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Which record do you keep?
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSurvivorIsCurrent(true)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                  survivorIsCurrent
                    ? "border-brand-400 bg-brand-50"
                    : "border-slate-200 hover:border-slate-300",
                )}
              >
                <span className="block text-[10px] font-semibold uppercase text-slate-500">Keep</span>
                <span className="block font-medium text-slate-900">{current.name}</span>
              </button>
              <button
                type="button"
                onClick={() => setSurvivorIsCurrent(false)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                  !survivorIsCurrent
                    ? "border-brand-400 bg-brand-50"
                    : "border-slate-200 hover:border-slate-300",
                )}
              >
                <span className="block text-[10px] font-semibold uppercase text-slate-500">Keep</span>
                <span className="block font-medium text-slate-900">{other.name}</span>
              </button>
            </div>

            {survivor && loser ? (
              <div className="rounded-md bg-slate-50 p-2.5 text-xs text-slate-600">
                <p className="flex items-center gap-1.5">
                  <span className="font-medium text-slate-800">{loser.name}</span>
                  <ArrowRight className="h-3 w-3 text-slate-400" />
                  <span className="font-medium text-slate-800">{survivor.name}</span>
                </p>
                <p className="mt-1">
                  {loser.name}&apos;s phone, email, moves, and history move onto {survivor.name}.
                  Differing contact details are kept as secondary. {loser.name} is then removed.
                </p>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </DetailSidebar>
  );
}
