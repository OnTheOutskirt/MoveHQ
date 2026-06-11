"use client";

import { EmailOpenMailHeaderAction } from "@/components/communications/composer-header-actions";
import { useEmailDraftOptional } from "@/components/communications/EmailDraftProvider";

export function EmailOpenMailHeaderButton() {
  const draft = useEmailDraftOptional();
  if (!draft) return null;
  return <EmailOpenMailHeaderAction href={draft.mailtoHref} />;
}
