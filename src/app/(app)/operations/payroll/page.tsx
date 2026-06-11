import { lazyNamedWorkspace } from "@/lib/navigation/lazy-route";

const PayrollTimeWorkspace = lazyNamedWorkspace(
  () => import("@/components/payroll/PayrollTimeWorkspace"),
  (module) => module.PayrollTimeWorkspace,
  "Loading payroll…",
);

export default function PayrollPage() {
  return <PayrollTimeWorkspace />;
}
