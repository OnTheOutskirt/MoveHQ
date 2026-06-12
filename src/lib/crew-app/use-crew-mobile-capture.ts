"use client";

import { useClientReady } from "@/lib/hooks/use-client-ready";
import { useSearchParams } from "next/navigation";
import { useSyncExternalStore } from "react";

function subscribeDesktopLike(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
  const onChange = () => onStoreChange();
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function desktopLikeSnapshot(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function desktopLikeServerSnapshot(): boolean {
  return true;
}

/** True when crew field capture (camera) should be shown — phones/tablets, not desktop browsers. */
export function useCrewMobileCaptureEnabled(): boolean {
  const clientReady = useClientReady();
  const searchParams = useSearchParams();
  const phoneFrame = searchParams.get("phoneFrame") === "1";
  const desktopLike = useSyncExternalStore(
    subscribeDesktopLike,
    desktopLikeSnapshot,
    desktopLikeServerSnapshot,
  );

  if (!clientReady) return false;
  if (phoneFrame) return false;
  return !desktopLike;
}
