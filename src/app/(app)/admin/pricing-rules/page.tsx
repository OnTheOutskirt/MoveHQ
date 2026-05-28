import { redirect } from "next/navigation";

export default function PricingRulesRedirect() {
  redirect("/admin/setup?tab=pricing");
}
