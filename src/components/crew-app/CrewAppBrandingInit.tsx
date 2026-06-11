"use client";

import { useSettings } from "@/components/providers/SettingsProvider";
import { applyBrandingMeta, applyBrandingToDocument } from "@/lib/settings/apply-branding";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

/** Applies MoveHQ branding CSS variables inside the crew app shell. */
export function CrewAppBrandingInit() {
  const { settings, isReady } = useSettings();
  const searchParams = useSearchParams();
  const embed = searchParams.get("embed") === "1";
  const phoneFrame = searchParams.get("phoneFrame") === "1";

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

  useEffect(() => {
    document.documentElement.classList.toggle("crew-embed", embed);
    return () => document.documentElement.classList.remove("crew-embed");
  }, [embed]);

  useEffect(() => {
    document.documentElement.classList.toggle("crew-phone-frame", phoneFrame);
    return () => document.documentElement.classList.remove("crew-phone-frame");
  }, [phoneFrame]);

  return null;
}
