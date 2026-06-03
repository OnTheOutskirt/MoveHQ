"use client";

import type { JobFieldState } from "@/lib/crew-app/job-field-storage";
import { cn } from "@/lib/utils";
import { CheckCircle2, PenLine } from "lucide-react";
import { useState } from "react";

type CrewSignaturePanelProps = {
  customerName: string;
  state: JobFieldState;
  onChange: (next: JobFieldState) => void;
};

export function CrewSignaturePanel({ customerName, state, onChange }: CrewSignaturePanelProps) {
  const [startName, setStartName] = useState(customerName);
  const [endName, setEndName] = useState(customerName);

  return (
    <div className="space-y-4">
      <SignatureBlock
        title="Start job"
        description="Customer confirms crew has begun work on site."
        signed={state.startSignature}
        name={startName}
        onNameChange={setStartName}
        disabled={false}
        onSign={() =>
          onChange({
            ...state,
            startSignature: {
              signedAt: new Date().toISOString(),
              signedBy: startName.trim() || customerName,
            },
          })
        }
      />

      <SignatureBlock
        title="End job"
        description="Customer confirms the job is complete for today."
        signed={state.endSignature}
        name={endName}
        onNameChange={setEndName}
        disabled={!state.startSignature}
        onSign={() =>
          onChange({
            ...state,
            endSignature: {
              signedAt: new Date().toISOString(),
              signedBy: endName.trim() || customerName,
            },
          })
        }
      />
    </div>
  );
}

function SignatureBlock({
  title,
  description,
  signed,
  name,
  onNameChange,
  disabled,
  onSign,
}: {
  title: string;
  description: string;
  signed: { signedAt: string; signedBy: string } | null;
  name: string;
  onNameChange: (v: string) => void;
  disabled: boolean;
  onSign: () => void;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border bg-white shadow-sm",
        signed ? "border-emerald-200" : "border-slate-200/80",
      )}
    >
      <div
        className={cn(
          "border-b px-4 py-3",
          signed ? "border-emerald-100 bg-emerald-50/80" : "border-slate-100 bg-slate-50/80",
        )}
      >
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          {signed ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          ) : (
            <PenLine className="h-4 w-4 text-brand-600" />
          )}
          {title}
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
      </div>

      <div className="p-4">
        {signed ? (
          <div className="space-y-2">
            <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-emerald-200 bg-emerald-50/50">
              <p className="font-serif text-2xl italic text-slate-700">{signed.signedBy}</p>
            </div>
            <p className="text-center text-xs text-slate-500">
              Signed {new Date(signed.signedAt).toLocaleString()}
            </p>
          </div>
        ) : (
          <>
            <label className="block text-xs font-medium text-slate-600">Customer name</label>
            <input
              value={name}
              disabled={disabled}
              onChange={(e) => onNameChange(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-50"
            />
            <div
              className={cn(
                "mt-3 flex h-28 items-center justify-center rounded-xl border-2 border-dashed",
                disabled ? "border-slate-200 bg-slate-50" : "border-brand-200 bg-brand-50/30",
              )}
            >
              <p className="text-sm text-slate-400">Sign here</p>
            </div>
            <button
              type="button"
              disabled={disabled}
              onClick={onSign}
              className={cn(
                "mt-3 w-full rounded-xl py-2.5 text-sm font-semibold transition-colors",
                disabled
                  ? "bg-slate-100 text-slate-400"
                  : "bg-brand-600 text-white hover:bg-brand-700",
              )}
            >
              Capture signature
            </button>
          </>
        )}
      </div>
    </section>
  );
}
