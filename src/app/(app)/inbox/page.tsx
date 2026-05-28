import { InboxWorkspace } from "@/components/inbox/InboxWorkspace";

export default function InboxPage() {
  return (
    <div className="flex h-[calc(100dvh-6rem)] flex-col overflow-hidden lg:h-[calc(100dvh-7rem)]">
      <InboxWorkspace />
    </div>
  );
}
