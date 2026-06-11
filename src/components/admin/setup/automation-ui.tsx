"use client";

import { SettingsInput } from "@/components/settings/SettingsField";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Minus, Plus } from "lucide-react";
import type { ReactNode } from "react";

export type AutomationSectionId = "overview" | "lead" | "customer" | "operations" | "followups";

export function AutomationSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2",
        checked ? "bg-brand-600" : "bg-slate-200",
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform",
          checked ? "translate-x-5" : "translate-x-0",
        )}
      />
    </button>
  );
}

export function SectionNav({
  sections,
  active,
  onChange,
  counts,
}: {
  sections: { id: AutomationSectionId; label: string; icon: LucideIcon }[];
  active: AutomationSectionId;
  onChange: (id: AutomationSectionId) => void;
  counts?: Partial<Record<AutomationSectionId, { on: number; total: number }>>;
}) {
  return (
    <nav className="flex flex-col gap-0.5 p-1" aria-label="Automation sections">
      {sections.map((section) => {
        const Icon = section.icon;
        const count = counts?.[section.id];
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onChange(section.id)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
              active === section.id
                ? "bg-brand-50 text-brand-800"
                : "text-slate-700 hover:bg-slate-50",
            )}
          >
            <Icon className="h-4 w-4 shrink-0 opacity-70" />
            <span className="min-w-0 flex-1">{section.label}</span>
            {count && section.id !== "overview" ? (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                  active === section.id ? "bg-brand-100 text-brand-800" : "bg-slate-100 text-slate-600",
                )}
              >
                {count.on}/{count.total}
              </span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}

export function AutomationRuleCard({
  icon: Icon,
  title,
  trigger,
  action,
  enabled,
  onEnabledChange,
  badge,
  footer,
  muted,
}: {
  icon: LucideIcon;
  title: string;
  trigger: string;
  action: string;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  badge?: string;
  footer?: ReactNode;
  muted?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border transition-colors",
        enabled ? "border-slate-200 bg-white shadow-sm" : "border-slate-100 bg-slate-50/80",
        muted && !enabled && "opacity-90",
      )}
    >
      <div className="flex gap-3 p-4">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            enabled ? "bg-brand-50 text-brand-700" : "bg-slate-100 text-slate-500",
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
              {badge ? (
                <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900">
                  {badge}
                </span>
              ) : null}
            </div>
            <AutomationSwitch checked={enabled} onChange={onEnabledChange} label={title} />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
            <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
              When
            </span>
            <span>{trigger}</span>
            <ArrowRight className="h-3 w-3 shrink-0 text-slate-400" />
            <span className="rounded-md bg-brand-50 px-2 py-0.5 font-medium text-brand-800">
              Then
            </span>
            <span>{action}</span>
          </div>
        </div>
      </div>
      {footer && enabled ? (
        <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-3">{footer}</div>
      ) : null}
    </div>
  );
}

export function DaysStepper({
  value,
  onChange,
  min = 0,
  max = 30,
  unit = "days",
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  unit?: string;
}) {
  function clamp(n: number) {
    return Math.min(max, Math.max(min, n));
  }

  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-0.5">
      <button
        type="button"
        aria-label={`Decrease ${unit}`}
        disabled={value <= min}
        onClick={() => onChange(clamp(value - 1))}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 disabled:opacity-40"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <SettingsInput
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(clamp(Number(e.target.value) || min))}
        className="h-8 w-12 border-0 bg-transparent px-1 text-center text-sm font-semibold tabular-nums shadow-none focus:ring-0"
      />
      <button
        type="button"
        aria-label={`Increase ${unit}`}
        disabled={value >= max}
        onClick={() => onChange(clamp(value + 1))}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 disabled:opacity-40"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
      <span className="pr-2 text-xs text-slate-500">{unit}</span>
    </div>
  );
}

export function HoursStepper({
  value,
  onChange,
  min = 1,
  max = 72,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  return <DaysStepper value={value} onChange={onChange} min={min} max={max} unit="hours" />;
}

export function SectionIntro({
  title,
  description,
  activeCount,
  totalCount,
}: {
  title: string;
  description: string;
  activeCount?: number;
  totalCount?: number;
}) {
  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {activeCount != null && totalCount != null ? (
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
            {activeCount} of {totalCount} on
          </span>
        ) : null}
      </div>
      <p className="max-w-2xl text-sm text-slate-500">{description}</p>
    </div>
  );
}
