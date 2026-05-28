"use client";

import { TechStackPanel } from "@/components/planning/TechStackPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { PRODUCT_NAME, PRODUCT_TAGLINE, V1_LAUNCH_LABEL } from "@/lib/planning/roadmap-data";
import { Layout, Monitor, Rocket, Smartphone } from "lucide-react";

const BUILD_PHASES = [
  {
    step: "1",
    title: "June — Design office app & connect Supabase",
    icon: Layout,
    summary:
      "Design every office screen, create the Supabase database structure, and wire all modules to it using seed and demo data only — not live customer or move data yet.",
    items: [
      "Moves, calendar, CRM, inbox, dispatch, and admin — built and connected to Supabase",
      "Schema, staff login, and permissions on seed data for testing",
      "No live business data yet — production cutover in July",
      "Crew phone app waits until August",
    ],
  },
  {
    step: "2",
    title: "July — Office app finished",
    icon: Monitor,
    summary:
      "Everyone in the office can run the business in MoveHQ on a computer: real customers, real moves, real texts, real payments.",
    items: [
      "June platform on seed data → July switches to live data",
      "Customer and partner records (CRM), moves, calendar, dispatch",
      "Text customers and sync Outlook email from the Inbox",
      "Take deposits and payments with Stripe",
      "Proposals, contracts, e-sign, and customer portal",
      "Dashboard reports, automations, and follow-up sequences",
      "Admin: staff, branding, pricing, templates",
    ],
  },
  {
    step: "3",
    title: "August — Crew phones and launch prep",
    icon: Smartphone,
    summary:
      "Crew app on phones, import old moves from a spreadsheet, test everything together, then go live September 1.",
    items: [
      "Crew app: today's jobs, forms, signatures, clock in/out",
      "Upload historical moves so reports are complete",
      "Fix anything still rough on the office side",
      "Practice runs: text a customer, run a move, pay, dispatch crew",
      "Train the team — switch to MoveHQ on September 1",
    ],
  },
] as const;

const V2_HIGHLIGHTS = [
  "AI answers the phone after hours",
  "AI helps reply to texts and emails (staff can take over)",
  "Marketing dashboard (website traffic, email campaigns)",
  "Richer crew app for schedule, recognition, and weak signal",
  "Custom reports and sales walkthrough tablet app",
] as const;

export function OverallPlanView() {
  return (
    <div className="space-y-6">
      <Card className="border-brand-200 bg-brand-50/40">
        <CardContent className="py-5">
          <p className="text-sm font-semibold text-brand-900">{PRODUCT_NAME}</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{PRODUCT_TAGLINE}</p>
          <p className="mt-3 text-sm leading-relaxed text-brand-950/90">
            Target go-live is <strong>{V1_LAUNCH_LABEL}</strong>. Work breaks into three months:{" "}
            <strong>June</strong> designs the office app, builds the Supabase database, and wires
            every screen to seed data (not live business data yet); <strong>July</strong> switches to
            live data so the office can run customers, moves, texting, email, and payments on a
            computer; <strong>August</strong> adds the crew phone app, imports past moves, and gets
            the team ready to switch over.
          </p>
        </CardContent>
      </Card>

      <Card className="border-slate-300 bg-slate-50">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-5">
          <div>
            <p className="text-sm font-semibold text-slate-900">Go-live date</p>
            <p className="text-2xl font-semibold tracking-tight text-slate-900">{V1_LAUNCH_LABEL}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-center text-xs">
            {["Jun: Office app + Supabase (seed)", "Jul: Office app done (live)", "Aug: Crew + launch prep"].map(
              (label) => (
                <span
                  key={label}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-medium text-slate-700"
                >
                  {label}
                </span>
              ),
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How we are building it</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {BUILD_PHASES.map((phase) => {
            const Icon = phase.icon;
            return (
              <div
                key={phase.step}
                className="flex gap-4 border-b border-slate-100 pb-6 last:border-0 last:pb-0"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                  {phase.step}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-slate-500" />
                    <h3 className="font-semibold text-slate-900">{phase.title}</h3>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{phase.summary}</p>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600">
                    {phase.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <TechStackPanel />

      <Card className="border-violet-200 bg-violet-50/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-violet-800">
            Later (after launch) - Version 2
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1.5 text-sm text-slate-700">
            {V2_HIGHLIGHTS.map((h) => (
              <li key={h} className="flex gap-2">
                <span className="text-violet-500">→</span>
                {h}
              </li>
            ))}
          </ul>
          <p className="mt-4 flex items-center gap-2 rounded-md bg-violet-100/60 px-3 py-2 text-xs text-violet-900">
            <Rocket className="h-4 w-4 shrink-0" />
            Open the V1 Roadmap tab for the schedule chart, timeline table, and full checklist.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
