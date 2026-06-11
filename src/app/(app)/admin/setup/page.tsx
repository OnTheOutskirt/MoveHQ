import { lazyNamedWorkspace } from "@/lib/navigation/lazy-route";

const SetupWorkspace = lazyNamedWorkspace(
  () => import("@/components/admin/setup/SetupWorkspace"),
  (module) => module.SetupWorkspace,
  "Loading setup…",
);

export default function SetupPage() {
  return <SetupWorkspace />;
}
