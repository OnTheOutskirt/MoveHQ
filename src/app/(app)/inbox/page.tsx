import { ModulePage } from "@/components/shared/ModulePage";
import { pageMeta } from "@/lib/navigation/page-meta";

const meta = pageMeta["/inbox"];

export default function InboxAllPage() {
  return <ModulePage title={meta.title} description={meta.description} />;
}
