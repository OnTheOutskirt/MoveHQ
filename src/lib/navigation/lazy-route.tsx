import { PageLoadingFallback } from "@/components/ui/PageLoadingFallback";
import dynamic from "next/dynamic";
import type { ComponentType } from "react";

/** Code-split a heavy client workspace so route chunks load on demand. */
export function lazyWorkspace<P extends Record<string, never> = Record<string, never>>(
  loader: () => Promise<{ default: ComponentType<P> }>,
  label?: string,
) {
  return dynamic(loader, {
    loading: () => <PageLoadingFallback label={label} />,
  });
}

export function lazyNamedWorkspace<P extends object>(
  loader: () => Promise<Record<string, ComponentType<P>>>,
  pick: (module: Record<string, ComponentType<P>>) => ComponentType<P>,
  label?: string,
) {
  return dynamic(() => loader().then((module) => ({ default: pick(module) })), {
    loading: () => <PageLoadingFallback label={label} />,
  });
}
