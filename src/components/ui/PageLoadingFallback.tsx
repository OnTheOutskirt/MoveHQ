export function PageLoadingFallback({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}
