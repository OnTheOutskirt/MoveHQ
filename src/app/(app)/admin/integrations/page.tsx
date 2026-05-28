import { redirect } from "next/navigation";

export default function IntegrationsRedirect() {
  redirect("/admin/setup?tab=integrations");
}
