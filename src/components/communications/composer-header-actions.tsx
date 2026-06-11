import { cn } from "@/lib/utils";

const headerLinkClass =
  "inline-flex h-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 shadow-sm hover:bg-slate-50";

export function CallDialHeaderAction({ phone }: { phone: string }) {
  return (
    <a href={`tel:${phone}`} className={headerLinkClass}>
      Dial
    </a>
  );
}

export function EmailOpenMailHeaderAction({ href }: { href: string | null }) {
  if (!href) return null;
  return (
    <a href={href} className={headerLinkClass}>
      Open mail
    </a>
  );
}

export function composerHeaderActionsClass(className?: string) {
  return cn("flex shrink-0 items-center gap-2", className);
}
