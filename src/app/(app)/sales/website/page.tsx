import { ROUTES } from "@/lib/navigation/routes";
import { redirect } from "next/navigation";

export default function LegacyWebsitePage() {
  redirect(ROUTES.salesWebQuotes);
}
