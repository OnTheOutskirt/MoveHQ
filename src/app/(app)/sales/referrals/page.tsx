import { ROUTES } from "@/lib/navigation/routes";
import { redirect } from "next/navigation";

/** Legacy route — referral partners live under Directory. */
export default function ReferralPartnersRedirectPage() {
  redirect(ROUTES.salesReferralPartners);
}
