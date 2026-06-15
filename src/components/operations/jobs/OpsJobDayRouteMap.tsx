"use client";

import {
  googleMapsDirectionsUrl,
  googleMapsRouteEmbedUrl,
  resolveJobDayLocations,
} from "@/lib/moves/job-day-locations";
import type { MoveJobDay } from "@/lib/moves/types";
import { ExternalLink } from "lucide-react";
import { useMemo } from "react";

type OpsJobDayRouteMapProps = {
  jobDay: MoveJobDay;
};

export function OpsJobDayRouteMap({ jobDay }: OpsJobDayRouteMapProps) {
  const locations = useMemo(() => resolveJobDayLocations(jobDay), [jobDay]);
  const embedUrl = useMemo(() => googleMapsRouteEmbedUrl(locations), [locations]);
  const directionsUrl = useMemo(() => googleMapsDirectionsUrl(locations), [locations]);

  if (!embedUrl) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-center text-xs text-slate-500">
        Add origin and destination addresses to preview the route
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
      <iframe
        title="Route map"
        src={embedUrl}
        className="aspect-[16/10] h-auto w-full min-h-[10rem] border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      {directionsUrl ? (
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1 border-t border-slate-200 bg-white py-2 text-xs font-medium text-brand-600 hover:bg-slate-50"
        >
          Open full route in Google Maps
          <ExternalLink className="h-3 w-3 opacity-60" />
        </a>
      ) : null}
    </div>
  );
}
