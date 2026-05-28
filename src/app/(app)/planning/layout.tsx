import { Suspense } from "react";

export default function PlanningLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="text-sm text-slate-500">Loading…</div>}>{children}</Suspense>;
}
