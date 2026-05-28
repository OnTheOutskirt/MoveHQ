import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./Card";

type ModuleCardProps = {
  title: string;
  description: string;
  icon?: LucideIcon;
  items?: string[];
};

export function ModuleCard({ title, description, icon: Icon, items }: ModuleCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          {Icon && (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50">
              <Icon className="h-4 w-4 text-brand-600" />
            </div>
          )}
          <div>
            <CardTitle>{title}</CardTitle>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </div>
        </div>
      </CardHeader>
      {items && items.length > 0 && (
        <CardContent>
          <ul className="list-inside list-disc space-y-1 text-sm text-slate-600">
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </CardContent>
      )}
    </Card>
  );
}
