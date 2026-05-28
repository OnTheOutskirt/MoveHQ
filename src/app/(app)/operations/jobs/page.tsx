import { ModulePage } from "@/components/shared/ModulePage";
import { pageMeta } from "@/lib/navigation/page-meta";

const meta = pageMeta["/operations/jobs"];

export default function JobsPage() {
  return <ModulePage title={meta.title} description={meta.description} />;
}
