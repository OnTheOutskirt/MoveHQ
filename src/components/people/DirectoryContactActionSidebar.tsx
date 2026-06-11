"use client";

import {
  CallDialHeaderAction,
  composerHeaderActionsClass,
} from "@/components/communications/composer-header-actions";
import { EmailDraftProvider } from "@/components/communications/EmailDraftProvider";
import { EmailOpenMailHeaderButton } from "@/components/communications/EmailOpenMailHeaderButton";
import { DirectoryContactComposer } from "@/components/people/DirectoryContactComposer";
import { QuickActionHistoryFeed } from "@/components/moves/detail/quick-actions/QuickActionHistoryFeed";
import { useMoves } from "@/components/moves/MovesProvider";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import {
  getPersonCommunicationHistory,
  type DirectoryContactChannel,
} from "@/lib/people/contact-communication-history";
import { Mail, MessageSquare, Phone } from "lucide-react";
import { useMemo } from "react";

export type DirectoryContactTarget = {
  name: string;
  phone?: string | null;
  email?: string | null;
  moveIds?: string[];
};

type DirectoryContactActionSidebarProps = {
  target: DirectoryContactTarget | null;
  action: DirectoryContactChannel | null;
  onClose: () => void;
};

function panelSubtitle(target: DirectoryContactTarget, action: DirectoryContactChannel): string {
  if (action === "call" && target.phone) return target.phone;
  if (action === "sms" && target.phone) return target.phone;
  if (action === "email" && target.email) return target.email;
  return target.name;
}

export function DirectoryContactActionSidebar({
  target,
  action,
  onClose,
}: DirectoryContactActionSidebarProps) {
  const { moves } = useMoves();

  const history = useMemo(() => {
    if (!target || !action) return [];
    return getPersonCommunicationHistory(moves, target.moveIds ?? [], action);
  }, [moves, target, action]);

  if (!target || !action) return null;

  const title =
    action === "call" ? "Call" : action === "sms" ? "Text message" : "Email";

  const defaultSubject = target.moveIds?.length
    ? `Following up`
    : `Following up — ${target.name}`;

  const headerActions = (
    <div className={composerHeaderActionsClass()}>
      {action === "call" && target.phone ? (
        <CallDialHeaderAction phone={target.phone} />
      ) : null}
      {action === "email" ? <EmailOpenMailHeaderButton /> : null}
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
        {action === "call" ? (
          <Phone className="h-3 w-3" />
        ) : action === "email" ? (
          <Mail className="h-3 w-3" />
        ) : (
          <MessageSquare className="h-3 w-3" />
        )}
        {target.name}
      </span>
    </div>
  );

  const sidebar = (
    <DetailSidebar
      open
      title={title}
      description={panelSubtitle(target, action)}
      onClose={onClose}
      widthClassName="max-w-lg"
      bodyClassName="flex min-h-0 flex-1 flex-col overflow-hidden p-0"
      headerExtra={headerActions}
      footer={
        <div className="border-t border-slate-200 bg-slate-50/90 px-4 py-4 shadow-[0_-4px_12px_rgba(15,23,42,0.06)]">
          <DirectoryContactComposer
            action={action}
            name={target.name}
            phone={target.phone}
            email={target.email}
          />
        </div>
      }
    >
      <QuickActionHistoryFeed action={action} items={history} />
    </DetailSidebar>
  );

  if (action === "email") {
    return (
      <EmailDraftProvider email={target.email} defaultSubject={defaultSubject}>
        {sidebar}
      </EmailDraftProvider>
    );
  }

  return sidebar;
}

export function directoryActionAvailable(
  action: DirectoryContactChannel,
  target: Pick<DirectoryContactTarget, "phone" | "email">,
): boolean {
  if (action === "email") return Boolean(target.email?.trim());
  return Boolean(target.phone?.trim());
}
