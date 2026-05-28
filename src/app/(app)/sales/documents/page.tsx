import { ModulePage } from "@/components/shared/ModulePage";
import { pageMeta } from "@/lib/navigation/page-meta";

const meta = pageMeta["/sales/documents"];

export default function SalesDocumentsPage() {
  return <ModulePage title={meta.title} description={meta.description} />;
}
