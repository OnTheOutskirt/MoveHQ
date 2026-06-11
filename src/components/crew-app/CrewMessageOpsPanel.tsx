"use client";

import { useCrewApp } from "@/components/crew-app/CrewAppProvider";
import { submitCrewOpsMessage } from "@/lib/crew-app/crew-ops-messages-storage";
import { MessageSquareWarning } from "lucide-react";
import { useState } from "react";

export function CrewMessageOpsPanel() {
  const { session, refreshInbox } = useCrewApp();
  const [body, setBody] = useState("");
  const [flagOff, setFlagOff] = useState(false);
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    submitCrewOpsMessage({
      crewId: session.crewId,
      crewName: session.name,
      body,
      flagOff,
    });
    refreshInbox();
    setBody("");
    setFlagOff(false);
    setSent(true);
    window.setTimeout(() => setSent(false), 3000);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <MessageSquareWarning className="h-4 w-4 text-brand-600" />
        Message operations
      </p>
      <p className="mt-1 text-xs text-slate-500">
        Running late, need help, or reporting off — dispatch will see this in the office app.
      </p>
      <form onSubmit={handleSubmit} className="mt-3 space-y-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="What does ops need to know?"
          className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <label className="flex items-center gap-2 text-xs text-slate-700">
          <input
            type="checkbox"
            checked={flagOff}
            onChange={(e) => setFlagOff(e.target.checked)}
          />
          I need to report off / can&apos;t work today
        </label>
        <button
          type="submit"
          disabled={!body.trim()}
          className="w-full rounded-lg bg-brand-600 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          Send to operations
        </button>
        {sent ? (
          <p className="text-center text-xs font-medium text-emerald-700">Sent — thank you.</p>
        ) : null}
      </form>
    </section>
  );
}
