import { Suspense } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<p className="text-sm text-slate-500">Loading dashboard…</p>}>{children}</Suspense>;
}
