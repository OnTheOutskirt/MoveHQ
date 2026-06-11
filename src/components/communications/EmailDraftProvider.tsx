"use client";

import { composeEmailBody } from "@/components/communications/EmailComposeBody";
import { useUserPreferences } from "@/components/providers/UserPreferencesProvider";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type EmailDraftContextValue = {
  subject: string;
  setSubject: (value: string) => void;
  body: string;
  setBody: (value: string) => void;
  mailtoHref: string | null;
};

const EmailDraftContext = createContext<EmailDraftContextValue | null>(null);

type EmailDraftProviderProps = {
  email?: string | null;
  defaultSubject: string;
  children: ReactNode;
};

export function EmailDraftProvider({ email, defaultSubject, children }: EmailDraftProviderProps) {
  const { preferences } = useUserPreferences();
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState("");

  const mailtoHref = useMemo(() => {
    if (!email?.trim()) return null;
    return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      composeEmailBody(body, preferences),
    )}`;
  }, [email, subject, body, preferences]);

  const value = useMemo(
    () => ({ subject, setSubject, body, setBody, mailtoHref }),
    [subject, body, mailtoHref],
  );

  return <EmailDraftContext.Provider value={value}>{children}</EmailDraftContext.Provider>;
}

export function useEmailDraft(): EmailDraftContextValue {
  const ctx = useContext(EmailDraftContext);
  if (!ctx) {
    throw new Error("useEmailDraft must be used within EmailDraftProvider");
  }
  return ctx;
}

export function useEmailDraftOptional(): EmailDraftContextValue | null {
  return useContext(EmailDraftContext);
}
