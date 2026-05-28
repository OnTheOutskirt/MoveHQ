import { resolveRedirectTab, staffTabRedirect } from "@/lib/navigation/admin-redirects";
import { redirect } from "next/navigation";

type Props = { searchParams: Promise<{ tab?: string }> };

export default async function TeamMembersRedirect({ searchParams }: Props) {
  const { tab } = await searchParams;
  redirect(`/admin/staff?tab=${resolveRedirectTab(staffTabRedirect, tab, "people")}`);
}
