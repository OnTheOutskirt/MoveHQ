import type { DashboardViewMeta } from "@/lib/dashboard/views";
import { ExecutiveDashboardPanel } from "@/components/dashboard/ExecutiveDashboardPanel";
import { OpsDashboardPanel } from "@/components/dashboard/OpsDashboardPanel";
import { SalesDashboardPanel } from "@/components/dashboard/SalesDashboardPanel";

type DashboardViewPanelProps = {
  view: DashboardViewMeta;
};

export function DashboardViewPanel({ view }: DashboardViewPanelProps) {
  if (view.id === "executive") {
    return <ExecutiveDashboardPanel />;
  }

  if (view.id === "ops") {
    return <OpsDashboardPanel />;
  }

  if (view.id === "sales") {
    return <SalesDashboardPanel />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{view.headline}</h2>
        <p className="mt-1 text-sm text-slate-600">{view.audience}</p>
        {view.notes && (
          <p className="mt-2 text-xs text-slate-500">
            <span className="font-medium text-slate-600">Design note: </span>
            {view.notes}
          </p>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {view.plannedWidgets.map((widget) => (
          <div
            key={widget}
            className="flex min-h-[5.5rem] flex-col justify-between rounded-xl border border-dashed border-slate-300 bg-white p-4"
          >
            <p className="text-sm font-medium text-slate-800">{widget}</p>
            <p className="mt-2 text-xs text-slate-400">Widget placeholder</p>
          </div>
        ))}
      </div>
    </div>
  );
}
