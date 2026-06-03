"use client";

import { DocumentPortalPreview } from "@/components/admin/setup/document-templates/DocumentPortalPreview";
import { useSettings } from "@/components/providers/SettingsProvider";
import { Button } from "@/components/ui/Button";
import {
  buildDocumentTemplateVars,
  getTemplateForKind,
  renderDocumentTemplate,
  type DocumentSendKind,
} from "@/lib/moves/document-template-render";
import { computeMoveDeposit } from "@/lib/moves/move-deposit";
import { formatQuote } from "@/lib/moves/format";
import { loadDocumentTemplates } from "@/lib/settings/storage";
import type { MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import {
  DollarSign,
  Eye,
  FileSignature,
  FileText,
  Mail,
  Send,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type SendDocumentDialogProps = {
  move: MoveRecord;
  kind: DocumentSendKind | null;
  open: boolean;
  onClose: () => void;
};

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function SendDocumentDialog({ move, kind, open, onClose }: SendDocumentDialogProps) {
  const { settings } = useSettings();
  const [ccList, setCcList] = useState<string[]>([]);
  const [ccInput, setCcInput] = useState("");
  const [message, setMessage] = useState("");
  const [includeDepositLink, setIncludeDepositLink] = useState(true);
  const [includeValuation, setIncludeValuation] = useState(true);
  const [sent, setSent] = useState(false);

  const deposit = useMemo(
    () => computeMoveDeposit(move, settings.defaults),
    [move, settings.defaults],
  );

  const template = useMemo(() => {
    if (!kind) return null;
    const templates = loadDocumentTemplates();
    return getTemplateForKind(templates, kind);
  }, [kind, open]);

  const templateVars = useMemo(() => {
    if (!kind) return null;
    return buildDocumentTemplateVars(move, settings, deposit);
  }, [kind, move, settings, deposit]);

  const subject = useMemo(() => {
    if (!template || !templateVars) return "";
    return renderDocumentTemplate(template.email.subject, templateVars);
  }, [template, templateVars]);

  const toEmail = move.customerEmail?.trim() || "";

  useEffect(() => {
    if (!open) return;
    setSent(false);
    setCcList([]);
    setCcInput("");
    setMessage(() => {
      if (!template || !templateVars) return "";
      return renderDocumentTemplate(template.email.body, templateVars);
    });
    setIncludeDepositLink(kind === "contract");
    setIncludeValuation(true);
  }, [open, kind, move.customerName, template, templateVars]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  function addCc(raw: string) {
    const email = raw.trim().replace(/,$/, "");
    if (!email || !isValidEmail(email)) return;
    if (ccList.includes(email)) return;
    setCcList((prev) => [...prev, email]);
    setCcInput("");
  }

  function handleSend() {
    setSent(true);
  }

  if (!open || !kind || !template || !templateVars) return null;

  const title = kind === "quote" ? "Send quote" : "Send contract";
  const Icon = kind === "quote" ? FileText : FileSignature;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="send-document-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/55 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close"
      />

      <div className="relative flex max-h-[min(92vh,52rem)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <h2 id="send-document-title" className="text-lg font-semibold text-slate-900">
                  {title}
                </h2>
                <p className="text-sm text-slate-500">
                  {move.customerName} · {move.reference}
                </p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {sent ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Send className="h-6 w-6" />
            </div>
            <p className="text-lg font-semibold text-slate-900">
              {kind === "quote" ? "Quote sent" : "Contract sent"}
            </p>
            <p className="max-w-sm text-sm text-slate-500">
              Email queued to {toEmail || "customer"}
              {ccList.length > 0 ? ` and ${ccList.length} CC` : ""}. E-sign and payment links will
              connect when integrations go live.
            </p>
            <Button type="button" variant="secondary" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : (
          <>
            <div className="grid min-h-0 flex-1 lg:grid-cols-5">
              <div className="flex min-h-0 flex-col gap-4 overflow-y-auto border-b border-slate-100 p-5 lg:col-span-2 lg:border-b-0 lg:border-r">
                <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3 sm:grid-cols-3">
                  <DepositStat
                    label="Quote total"
                    value={formatQuote(move.quoteAmount, move.quoteType)}
                  />
                  <DepositStat
                    label="Deposit due"
                    value={new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0,
                    }).format(deposit.depositDue)}
                    sub={deposit.depositLabel}
                  />
                  <DepositStat
                    label="Received"
                    value={new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0,
                    }).format(deposit.depositReceived)}
                    highlight={deposit.depositReceived > 0}
                  />
                </div>

                <label className="block text-sm">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    To
                  </span>
                  <div className="relative mt-1">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      readOnly
                      value={toEmail}
                      placeholder="No email on file — add in contact"
                      className={cn(
                        "w-full rounded-xl border py-2.5 pl-9 pr-3 text-sm",
                        toEmail
                          ? "border-slate-200 bg-white text-slate-900"
                          : "border-amber-200 bg-amber-50 text-amber-900",
                      )}
                    />
                  </div>
                </label>

                <div className="block text-sm">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    CC
                  </span>
                  <div className="mt-1 flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-white p-2">
                    {ccList.map((email) => (
                      <span
                        key={email}
                        className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-800"
                      >
                        {email}
                        <button
                          type="button"
                          onClick={() => setCcList((list) => list.filter((e) => e !== email))}
                          className="rounded-full p-0.5 hover:bg-brand-100"
                          aria-label={`Remove ${email}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      type="email"
                      value={ccInput}
                      onChange={(e) => setCcInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault();
                          addCc(ccInput);
                        }
                      }}
                      onBlur={() => addCc(ccInput)}
                      placeholder="Add email, press Enter"
                      className="min-w-[8rem] flex-1 border-0 bg-transparent px-1 py-1 text-sm outline-none"
                    />
                  </div>
                </div>

                <label className="block text-sm">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Subject
                  </span>
                  <input
                    type="text"
                    value={subject}
                    readOnly
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700"
                  />
                </label>

                <label className="block text-sm">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Message
                  </span>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm leading-relaxed"
                  />
                </label>

                <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Include with send
                  </p>
                  {kind === "contract" ? (
                    <>
                      <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={includeDepositLink}
                          onChange={(e) => setIncludeDepositLink(e.target.checked)}
                          className="rounded border-slate-300"
                        />
                        Payment link for deposit ({deposit.depositLabel})
                      </label>
                      <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={includeValuation}
                          onChange={(e) => setIncludeValuation(e.target.checked)}
                          className="rounded border-slate-300"
                        />
                        Valuation &amp; liability summary
                      </label>
                    </>
                  ) : (
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-slate-300"
                      />
                      Show deposit required on quote ({deposit.depositLabel})
                    </label>
                  )}
                </div>
              </div>

              <div className="flex min-h-0 flex-col bg-slate-100/80 lg:col-span-3">
                <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-200/80 px-4 py-2.5">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <Eye className="h-3.5 w-3.5" />
                    Document preview
                  </p>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600 shadow-sm">
                    {template.name}
                  </span>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto p-4">
                  <DocumentPortalPreview
                    portal={template.portal}
                    vars={templateVars}
                    kind={kind}
                    logoDataUrl={settings.branding.logoDataUrl}
                    accentColor={settings.branding.accentColor}
                    companyName={settings.branding.companyName}
                  />
                </div>
              </div>
            </div>

            <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/90 px-5 py-4">
              <p className="text-xs text-slate-500">
                Template from Admin → Setup · edits apply to future sends
              </p>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSend}
                  disabled={!toEmail}
                  title={!toEmail ? "Add customer email in contact" : undefined}
                  className="gap-1.5"
                >
                  <Send className="h-4 w-4" />
                  {kind === "quote" ? "Send quote" : "Send for signature"}
                </Button>
              </div>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}

function DepositStat({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border px-2.5 py-2",
        highlight ? "border-emerald-200 bg-emerald-50/80" : "border-slate-200/80 bg-white",
      )}
    >
      <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label === "Deposit due" ? <DollarSign className="h-3 w-3" /> : null}
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums text-slate-900">{value}</p>
      {sub ? <p className="text-[10px] text-slate-500">{sub}</p> : null}
    </div>
  );
}
