import { redirect } from "next/navigation";

/** Field forms live on completed jobs — Past tab on Operations → Jobs. */
export default function FormsRedirectPage() {
  redirect("/operations/jobs");
}
