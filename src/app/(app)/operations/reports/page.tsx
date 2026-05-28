import { ReportsWorkspace } from "@/components/reports/ReportsWorkspace";
import { Suspense } from "react";

export default function ReportsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-500">Loading reports…</p>}>
      <ReportsWorkspace />
    </Suspense>
  );
}
