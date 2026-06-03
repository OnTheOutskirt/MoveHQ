"use client";

import { renderDocumentTemplate, renderEmailRichHtml } from "@/lib/moves/document-template-render";
import { Mail } from "lucide-react";

type DocumentEmailPreviewProps = {
  subject: string;
  body: string;
  vars: Record<string, string>;
  toEmail?: string;
};

export function DocumentEmailPreview({ subject, body, vars, toEmail }: DocumentEmailPreviewProps) {
  const renderedSubject = renderDocumentTemplate(subject, vars);
  const renderedBodyHtml = renderEmailRichHtml(body, vars);

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
        <Mail className="h-4 w-4 text-slate-400" />
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email preview</p>
      </div>
      <div className="space-y-3 px-4 py-4 text-sm">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">To</p>
          <p className="text-slate-800">{toEmail ?? vars.customer_name}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Subject</p>
          <p className="font-medium text-slate-900">{renderedSubject}</p>
        </div>
        <div className="rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-3">
          <div
            className="prose prose-sm max-w-none text-sm leading-relaxed text-slate-700 [&_li]:my-0.5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1.5 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5"
            dangerouslySetInnerHTML={{ __html: renderedBodyHtml }}
          />
        </div>
      </div>
    </article>
  );
}
