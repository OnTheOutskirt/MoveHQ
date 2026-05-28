import { ModulePage } from "@/components/shared/ModulePage";
import { pageMeta } from "@/lib/navigation/page-meta";

const meta = pageMeta["/documents"];

export default function DocumentsPage() {
  return <ModulePage title={meta.title} description={meta.description} />;
}
