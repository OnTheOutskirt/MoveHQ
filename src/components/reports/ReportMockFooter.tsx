type ReportMockFooterProps = {
  note?: string;
};

export function ReportMockFooter({ note }: ReportMockFooterProps) {
  return (
    <p className="text-xs text-slate-500">
      {note ??
        "Mock report — demo data for layout and planning. Live metrics will aggregate moves, quotes, dispatch overrides, and crew app time entries."}
    </p>
  );
}
