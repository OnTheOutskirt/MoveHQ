import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { cn } from "@/lib/utils";
import type {
  ReportBarsWidget,
  ReportListWidget,
  ReportStatWidget,
  ReportTableWidget,
  ReportTrendWidget,
  ReportWidget,
} from "@/lib/reports/report-widgets";

function BarsCard({ widget }: { widget: ReportBarsWidget }) {
  const max = Math.max(...widget.items.map((i) => i.value), 1);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{widget.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {widget.items.map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex items-center justify-between gap-2 text-xs">
              <span className="truncate text-slate-700">{item.label}</span>
              <span className="shrink-0 font-semibold tabular-nums text-slate-900">
                {item.display ?? item.value}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-brand-600"
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function TrendCard({ widget }: { widget: ReportTrendWidget }) {
  const max = Math.max(...widget.points.map((p) => p.value), 1);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{widget.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2 sm:gap-3">
          {widget.points.map((p) => (
            <div key={p.label} className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <div className="flex h-28 w-full items-end justify-center rounded-lg bg-slate-50 px-1 pb-1 pt-2">
                <div
                  className="w-full max-w-[2rem] rounded-md bg-brand-600"
                  style={{ height: `${Math.max((p.value / max) * 100, 4)}%` }}
                  title={p.display ?? String(p.value)}
                />
              </div>
              <span className="text-[10px] font-medium text-slate-500">{p.label}</span>
              <span className="text-[10px] tabular-nums text-slate-400">
                {p.display ?? p.value}
              </span>
            </div>
          ))}
        </div>
        {widget.caption ? <p className="mt-3 text-xs text-slate-400">{widget.caption}</p> : null}
      </CardContent>
    </Card>
  );
}

function TableCard({ widget }: { widget: ReportTableWidget }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{widget.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0 pb-1">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs text-slate-500">
              {widget.columns.map((c, i) => (
                <th
                  key={c}
                  className={cn("px-5 py-2 font-medium", i === 0 ? "text-left" : "text-right")}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {widget.rows.map((row, ri) => (
              <tr key={ri} className="border-b border-slate-50 last:border-0">
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className={cn(
                      "px-5 py-2",
                      ci === 0
                        ? "font-medium text-slate-900"
                        : "text-right tabular-nums text-slate-700",
                    )}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function ListCard({ widget }: { widget: ReportListWidget }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{widget.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-50">
          {widget.items.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-3 px-5 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm text-slate-700">{item.label}</p>
                {item.hint ? <p className="truncate text-xs text-slate-400">{item.hint}</p> : null}
              </div>
              <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-900">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function NonStatWidget({ widget }: { widget: Exclude<ReportWidget, ReportStatWidget> }) {
  switch (widget.kind) {
    case "bars":
      return <BarsCard widget={widget} />;
    case "trend":
      return <TrendCard widget={widget} />;
    case "table":
      return <TableCard widget={widget} />;
    case "list":
      return <ListCard widget={widget} />;
  }
}

export function ReportWidgetGrid({ widgets }: { widgets: ReportWidget[] }) {
  const stats = widgets.filter((w): w is ReportStatWidget => w.kind === "stat");
  const rest = widgets.filter(
    (w): w is Exclude<ReportWidget, ReportStatWidget> => w.kind !== "stat",
  );

  return (
    <div className="space-y-4">
      {stats.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <StatCard key={s.title} label={s.title} value={s.value} change={s.change} trend={s.trend} />
          ))}
        </div>
      ) : null}

      {rest.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {rest.map((w) => (
            <div key={w.title} className={w.kind === "table" ? "lg:col-span-2" : undefined}>
              <NonStatWidget widget={w} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
