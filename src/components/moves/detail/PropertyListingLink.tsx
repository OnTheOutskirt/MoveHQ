"use client";

import {
  buildPropertyListingSearchUrl,
  propertyListingProviderLabel,
  type PropertyListingProviderId,
} from "@/lib/property-listings";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

type PropertyListingLinkProps = {
  provider: PropertyListingProviderId;
  address: string | null | undefined;
  className?: string;
};

export function PropertyListingLink({ provider, address, className }: PropertyListingLinkProps) {
  const url = buildPropertyListingSearchUrl(provider, address);
  if (!url) return null;

  const label = propertyListingProviderLabel(provider);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-800 hover:underline",
        className,
      )}
    >
      View on {label}
      <ExternalLink className="h-3 w-3 shrink-0 opacity-60" aria-hidden />
    </a>
  );
}
