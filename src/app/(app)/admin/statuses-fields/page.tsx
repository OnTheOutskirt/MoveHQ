import { redirect } from "next/navigation";

export default function StatusesFieldsRedirect() {
  redirect("/admin/setup?tab=pipeline");
}
