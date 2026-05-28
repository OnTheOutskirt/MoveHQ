type PeriodPlaceholderProps = {
  title: string;
  description: string;
};

export function PeriodPlaceholder({ title, description }: PeriodPlaceholderProps) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{description}</p>
    </div>
  );
}
