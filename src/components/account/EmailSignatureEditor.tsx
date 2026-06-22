"use client";

import { Button } from "@/components/ui/Button";
import { useSession } from "@/components/providers/SessionProvider";
import { defaultEmailSignature } from "@/lib/session/user-preferences";
import { readSignatureImageFile } from "@/lib/session/signature-image";
import { cn } from "@/lib/utils";
import { ImagePlus, Trash2 } from "lucide-react";

type EmailSignatureEditorProps = {
  signatureText: string;
  signatureImageDataUrl: string | null;
  onSignatureTextChange: (text: string) => void;
  onSignatureImageChange: (dataUrl: string | null) => void;
  onSave: () => void;
  saveDisabled?: boolean;
  className?: string;
};

export function EmailSignatureEditor({
  signatureText,
  signatureImageDataUrl,
  onSignatureTextChange,
  onSignatureImageChange,
  onSave,
  saveDisabled = false,
  className,
}: EmailSignatureEditorProps) {
  const { user } = useSession();

  function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    readSignatureImageFile(
      file,
      (dataUrl) => onSignatureImageChange(dataUrl),
      (message) => window.alert(message),
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Photo (optional)
        </span>
        <p className="mt-0.5 text-xs text-slate-500">
          Shown above your signature in HTML emails — headshot, banner, or company logo. Any shape
          works; it keeps its natural proportions.
        </p>
        <div className="mt-3 flex flex-wrap items-start gap-4">
          {signatureImageDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={signatureImageDataUrl}
              alt="Signature photo"
              className="h-auto max-h-24 w-auto max-w-[16rem] shrink-0 rounded-xl border border-slate-200 bg-white object-contain"
            />
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50">
              <ImagePlus className="h-6 w-6 text-slate-300" aria-hidden />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <label className="inline-flex cursor-pointer">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="sr-only"
                onChange={handleImagePick}
              />
              <span className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                {signatureImageDataUrl ? "Replace photo" : "Upload photo"}
              </span>
            </label>
            {signatureImageDataUrl ? (
              <button
                type="button"
                onClick={() => onSignatureImageChange(null)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove photo
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <label className="block">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Signature text
        </span>
        <textarea
          rows={6}
          value={signatureText}
          onChange={(e) => onSignatureTextChange(e.target.value)}
          className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm leading-relaxed focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </label>

      <SignaturePreview
        signatureText={signatureText}
        signatureImageDataUrl={signatureImageDataUrl}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" size="sm" disabled={saveDisabled} onClick={onSave}>
          Save signature
        </Button>
        <button
          type="button"
          onClick={() => {
            onSignatureTextChange(defaultEmailSignature(user.name));
            onSignatureImageChange(null);
          }}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          Reset to default
        </button>
      </div>
    </div>
  );
}

export function SignaturePreview({
  signatureText,
  signatureImageDataUrl,
  compact,
}: {
  signatureText: string;
  signatureImageDataUrl: string | null;
  compact?: boolean;
}) {
  const hasText = signatureText.trim().length > 0;
  if (!hasText && !signatureImageDataUrl) return null;

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-slate-50/80",
        compact ? "px-3 py-2.5" : "px-4 py-3",
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        Preview
      </p>
      <div className={cn("mt-2", compact ? "text-xs" : "text-sm")}>
        {signatureImageDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={signatureImageDataUrl}
            alt=""
            className={cn(
              "mb-2 h-auto w-auto rounded-lg border border-slate-200 bg-white object-contain",
              compact ? "max-h-12 max-w-[10rem]" : "max-h-20 max-w-[16rem]",
            )}
          />
        ) : null}
        {hasText ? (
          <p className="whitespace-pre-wrap leading-relaxed text-slate-700">{signatureText}</p>
        ) : null}
      </div>
    </div>
  );
}
