type SetupPlaceholderProps = {
  title: string;
  description: string;
};

export function SetupPlaceholder({ title, description }: SetupPlaceholderProps) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm text-slate-500">{description}</p>
    </div>
  );
}
