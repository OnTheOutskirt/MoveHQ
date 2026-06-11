import Link from "next/link";

type AccessDeniedProps = {
  title?: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
};

export function AccessDenied({
  title = "You don't have access to this page",
  description = "Your role doesn't include permission for this area. Ask an admin if you need access.",
  backHref = "/dashboard",
  backLabel = "Back to dashboard",
}: AccessDeniedProps) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center py-16 text-center">
      <p className="text-lg font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
      <Link
        href={backHref}
        className="mt-6 text-sm font-medium text-brand-600 hover:text-brand-800"
      >
        {backLabel}
      </Link>
      <p className="mt-8 text-[11px] text-slate-400">
        Demo enforcement — production will verify roles from your company account (Supabase / SSO).
      </p>
    </div>
  );
}
