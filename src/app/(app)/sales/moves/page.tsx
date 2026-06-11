import { lazyNamedWorkspace } from "@/lib/navigation/lazy-route";

const MovesWorkspace = lazyNamedWorkspace(
  () => import("@/components/moves/MovesWorkspace"),
  (module) => module.MovesWorkspace,
  "Loading moves…",
);

export default function SalesMovesPage() {
  return <MovesWorkspace />;
}
