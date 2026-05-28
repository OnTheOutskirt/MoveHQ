import { Card, CardContent } from "@/components/ui/Card";

type PlaceholderReportProps = {
  title: string;
  description: string;
};

export function PlaceholderReport({ title, description }: PlaceholderReportProps) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <p className="text-lg font-semibold text-slate-900">{title}</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{description}</p>
        <p className="mt-4 text-xs text-slate-400">Coming soon — mock shell for planning.</p>
      </CardContent>
    </Card>
  );
}
