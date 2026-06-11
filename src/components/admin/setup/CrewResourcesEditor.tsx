"use client";

import {
  DEFAULT_CREW_RESOURCES,
  readCrewResourcesConfig,
  writeCrewResourcesConfig,
  type CrewResourceLink,
} from "@/lib/crew-app/crew-resources-config";
import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";

export function CrewResourcesEditor() {
  const [links, setLinks] = useState<CrewResourceLink[]>(DEFAULT_CREW_RESOURCES.links);

  useEffect(() => {
    setLinks(readCrewResourcesConfig().links);
  }, []);

  function save() {
    writeCrewResourcesConfig({ links });
  }

  function updateLink(id: string, patch: Partial<CrewResourceLink>) {
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
      <p className="text-sm font-semibold text-slate-900">Crew app · Resources links</p>
      <p className="text-xs text-slate-600">
        Shown on the Resources tab in the crew app (payroll, benefits, etc.).
      </p>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.id} className="grid gap-2 rounded-lg border border-slate-200 bg-white p-3 sm:grid-cols-2">
            <input
              value={link.label}
              onChange={(e) => updateLink(link.id, { label: e.target.value })}
              className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
              placeholder="Label"
            />
            <input
              value={link.url}
              onChange={(e) => updateLink(link.id, { url: e.target.value })}
              className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
              placeholder="URL"
            />
            <input
              value={link.description ?? ""}
              onChange={(e) => updateLink(link.id, { description: e.target.value })}
              className="sm:col-span-2 rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
              placeholder="Description"
            />
          </li>
        ))}
      </ul>
      <Button type="button" size="sm" onClick={save}>
        Save resource links
      </Button>
    </div>
  );
}
