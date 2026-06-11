import { lazyNamedWorkspace } from "@/lib/navigation/lazy-route";

const InboxWorkspace = lazyNamedWorkspace(
  () => import("@/components/inbox/InboxWorkspace"),
  (module) => module.InboxWorkspace,
  "Loading inbox…",
);

export default function InboxPage() {
  return (
    <div className="flex h-[calc(100dvh-6rem)] flex-col overflow-hidden lg:h-[calc(100dvh-7rem)]">
      <InboxWorkspace />
    </div>
  );
}
