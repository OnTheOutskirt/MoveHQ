"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  DATABASE_DESIGN,
  DESIGN_CONVENTIONS,
  RESOLVED_DECISIONS,
  RLS_STRATEGY,
  type DbColumn,
  type DbTable,
} from "@/lib/planning/database-design";
import { cn } from "@/lib/utils";
import { useState } from "react";

function ColumnConstraints({ column }: { column: DbColumn }) {
  const tags: { label: string; className: string }[] = [];
  if (column.pk) tags.push({ label: "PK", className: "bg-violet-100 text-violet-800" });
  if (column.fk) tags.push({ label: "FK", className: "bg-sky-100 text-sky-800" });
  tags.push(
    column.required
      ? { label: "required", className: "bg-amber-50 text-amber-700 border border-amber-200" }
      : { label: "optional", className: "bg-slate-50 text-slate-500 border border-slate-200" },
  );
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((t) => (
        <span key={t.label} className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", t.className)}>
          {t.label}
        </span>
      ))}
    </div>
  );
}

function TableCard({ table }: { table: DbTable }) {
  const [open, setOpen] = useState(false);
  return (
    <Card>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start justify-between gap-3 px-5 py-3 text-left"
      >
        <div className="min-w-0">
          <code className="rounded bg-slate-900 px-2 py-0.5 text-xs font-semibold text-white">
            {table.name}
          </code>
          <p className="mt-1.5 text-sm text-slate-600">{table.purpose}</p>
        </div>
        <span className="shrink-0 pt-1 text-xs text-slate-400">{open ? "Hide" : "Columns"}</span>
      </button>

      {open ? (
        <CardContent className="space-y-4 border-t border-slate-100 pt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                  <th className="py-2 pr-3 font-medium">Column</th>
                  <th className="py-2 pr-3 font-medium">Type</th>
                  <th className="py-2 pr-3 font-medium">Constraints</th>
                  <th className="py-2 font-medium">Notes / references</th>
                </tr>
              </thead>
              <tbody>
                {table.columns.map((col) => (
                  <tr key={col.name} className="border-b border-slate-50 align-top last:border-0">
                    <td className="py-2 pr-3">
                      <code className="text-xs font-semibold text-slate-900">{col.name}</code>
                    </td>
                    <td className="py-2 pr-3">
                      <code className="text-xs text-slate-600">{col.type}</code>
                    </td>
                    <td className="py-2 pr-3">
                      <ColumnConstraints column={col} />
                    </td>
                    <td className="py-2 text-xs text-slate-500">
                      {col.fk ? (
                        <span className="text-sky-700">→ {col.fk}</span>
                      ) : null}
                      {col.fk && col.notes ? " · " : null}
                      {col.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {table.enums && table.enums.length > 0 ? (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Enum / status values
              </p>
              {table.enums.map((e) => (
                <div key={e.name} className="text-xs">
                  <code className="font-semibold text-slate-700">{e.name}</code>
                  <span className="text-slate-500">
                    {" "}
                    = {e.values.map((v) => `'${v}'`).join(" · ")}
                  </span>
                </div>
              ))}
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            {table.indexes && table.indexes.length > 0 ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Indexes</p>
                <ul className="mt-1 space-y-0.5">
                  {table.indexes.map((ix) => (
                    <li key={ix}>
                      <code className="text-xs text-slate-600">{ix}</code>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">UI areas</p>
              <p className="mt-1 text-xs text-slate-600">{table.uiAreas.join(" · ")}</p>
            </div>
          </div>

          {table.rls ? (
            <div className="rounded-md border border-slate-200 bg-slate-50/70 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Row Level Security
              </p>
              <p className="mt-1 text-xs text-slate-600">{table.rls}</p>
            </div>
          ) : null}
        </CardContent>
      ) : null}
    </Card>
  );
}

export function DatabaseDesignView() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Conventions (applied to every table)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {DESIGN_CONVENTIONS.map((c) => (
            <div key={c.title} className="rounded-md border border-slate-100 bg-slate-50/60 p-3">
              <p className="text-sm font-semibold text-slate-800">{c.title}</p>
              <p className="mt-1 text-xs text-slate-600">{c.detail}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Row Level Security strategy</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1.5">
            {RLS_STRATEGY.map((r, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-600">
                <span className="text-slate-300">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {DATABASE_DESIGN.map((domain) => (
        <section key={domain.id} className="space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{domain.title}</h3>
            <p className="mt-0.5 max-w-3xl text-sm text-slate-500">{domain.summary}</p>
          </div>
          <div className="space-y-2">
            {domain.tables.map((t) => (
              <TableCard key={t.name} table={t} />
            ))}
          </div>
        </section>
      ))}

      <section className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Resolved design decisions</h3>
          <p className="mt-0.5 max-w-3xl text-sm text-slate-500">
            Key modeling decisions baked into the schema above.
          </p>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {RESOLVED_DECISIONS.map((item) => (
                <div
                  key={item.area}
                  className="grid gap-1 px-5 py-3 sm:grid-cols-[180px_1fr] sm:gap-4"
                >
                  <p className="text-sm font-semibold text-slate-800">{item.area}</p>
                  <p className="text-xs text-slate-600">{item.decision}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
