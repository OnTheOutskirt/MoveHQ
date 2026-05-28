import { ModulePage } from "@/components/shared/ModulePage";
import { pageMeta } from "@/lib/navigation/page-meta";

const meta = pageMeta["/admin/templates"];

export default function TemplatesPage() {
  return <ModulePage title={meta.title} description={meta.description} />;
}
