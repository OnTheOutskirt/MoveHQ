"use client";

import { SignaturePreview } from "@/components/account/EmailSignatureEditor";
import { useUserPreferences } from "@/components/providers/UserPreferencesProvider";
import {
  appendEmailSignature,
  type UserPreferences,
} from "@/lib/session/user-preferences";
import { ROUTES } from "@/lib/navigation/routes";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useMemo } from "react";

type EmailComposeBodyProps = {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  className?: string;
  /** Hide the signature preview card (sidebar, inbox, directory panels). */
  showSignaturePreview?: boolean;
};

function signatureSuffix(signature: string): string {
  const trimmed = signature.trim();
  return trimmed ? `\n\n--\n${trimmed}` : "";
}

function stripSignatureFromDisplay(display: string, signature: string): string {
  const suffix = signatureSuffix(signature);
  if (!suffix || !display.endsWith(suffix)) return display;
  return display.slice(0, -suffix.length);
}

export function EmailComposeBody({
  value,
  onChange,
  rows = 4,
  placeholder = "Write your email…",
  className,
  showSignaturePreview = true,
}: EmailComposeBodyProps) {
  const { preferences, updatePreferences } = useUserPreferences();
  const { emailSignature, signatureImageDataUrl, includeEmailSignature } = preferences;

  const hasSignatureImage = Boolean(signatureImageDataUrl);
  const appendTextInTextarea = includeEmailSignature && !hasSignatureImage;

  const displayValue = useMemo(() => {
    if (!appendTextInTextarea || !emailSignature.trim()) return value;
    return appendEmailSignature(value, emailSignature);
  }, [value, emailSignature, appendTextInTextarea]);

  function handleChange(nextDisplay: string) {
    if (!appendTextInTextarea || !emailSignature.trim()) {
      onChange(nextDisplay);
      return;
    }
    onChange(stripSignatureFromDisplay(nextDisplay, emailSignature));
  }

  const showPreview =
    showSignaturePreview &&
    includeEmailSignature &&
    (emailSignature.trim() || signatureImageDataUrl);

  return (
    <div className={cn("space-y-2", className)}>
      <label className="block text-sm">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Message
        </span>
        <textarea
          rows={rows}
          value={displayValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm leading-relaxed focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </label>

      {showPreview ? (
        <div className="space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Your signature
          </p>
          <SignaturePreview
            signatureText={emailSignature}
            signatureImageDataUrl={signatureImageDataUrl}
            compact
          />
          {hasSignatureImage ? (
            <p className="text-[11px] text-slate-500">
              Photo is included in HTML emails; text signature is appended for plain-text sends.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-600">
          <input
            type="checkbox"
            checked={includeEmailSignature}
            onChange={(e) => updatePreferences({ includeEmailSignature: e.target.checked })}
            className="rounded border-slate-300 text-brand-600"
          />
          Include my email signature
        </label>
        <Link
          href={`${ROUTES.account}#email`}
          className="text-xs font-semibold text-brand-700 hover:underline"
        >
          Edit in account settings
        </Link>
      </div>
    </div>
  );
}

/** Full email body as it would be sent (message + optional text signature). */
export function composeEmailBody(
  message: string,
  prefs: Pick<UserPreferences, "emailSignature" | "includeEmailSignature">,
): string {
  if (!prefs.includeEmailSignature) return message.trim();
  return appendEmailSignature(message, prefs.emailSignature);
}
