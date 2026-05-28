import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/navigation/routes";

type Props = { searchParams: Promise<{ person?: string; org?: string }> };

export default async function PeopleRedirectPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = new URLSearchParams();
  if (sp.person) q.set("person", sp.person);
  if (sp.org) q.set("org", sp.org);
  const suffix = q.toString() ? `?${q.toString()}` : "";
  redirect(`${ROUTES.salesDirectory}${suffix}`);
}
