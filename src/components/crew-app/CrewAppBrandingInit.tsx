"use client";

import { useSettings } from "@/components/providers/SettingsProvider";
import { applyBrandingMeta, applyBrandingToDocument } from "@/lib/settings/apply-branding";
import { useEffect } from "react";

/** Applies MoveHQ branding CSS variables inside the crew app shell. */
export function CrewAppBrandingInit() {
  const { settings, isReady } = useSettings();

  useEffect(() => {
    if (!isReady) return;
    applyBrandingToDocument(settings.branding);
    applyBrandingMeta(settings.branding);
    document.title = `${settings.branding.companyName} Crew`;

    const theme = document.querySelector('meta[name="theme-color"]');
    if (theme) {
      theme.setAttribute("content", settings.branding.sidebarColor);
    }
  }, [settings.branding, isReady]);

  return null;
}
