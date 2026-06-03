import { redirect } from "next/navigation";

export default function DocumentTemplatesRedirectPage() {
  redirect("/admin/setup?tab=documents");
}
