import { Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

type FutureNotesProps = {
  title?: string;
  items: string[];
};

export function FutureNotes({ title = "Planned functionality", items }: FutureNotesProps) {
  return (
    <Card className="border-brand-100 bg-brand-50/30">
      <CardContent className="flex gap-3 py-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
        <div>
          <p className="text-sm font-medium text-brand-900">{title}</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-brand-800/80">
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
