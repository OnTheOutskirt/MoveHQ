import { ModulePage } from "@/components/shared/ModulePage";
import { pageMeta } from "@/lib/navigation/page-meta";

const meta = pageMeta["/operations/forms"];

export default function FormsPage() {
  return <ModulePage title={meta.title} description={meta.description} />;
}
