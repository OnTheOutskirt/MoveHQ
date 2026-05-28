import { companyTabRedirect, resolveRedirectTab } from "@/lib/navigation/admin-redirects";
import { redirect } from "next/navigation";

type Props = { searchParams: Promise<{ tab?: string }> };

export default async function SettingsRedirect({ searchParams }: Props) {
  const { tab } = await searchParams;
  redirect(`/admin/company?tab=${resolveRedirectTab(companyTabRedirect, tab, "branding")}`);
}
