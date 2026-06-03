import { redirect } from "next/navigation";

export default function TemplatesRedirectPage() {
  redirect("/admin/setup?tab=documents");
}
