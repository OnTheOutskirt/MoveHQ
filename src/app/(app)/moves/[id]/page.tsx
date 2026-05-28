import { redirect } from "next/navigation";
import { salesMovePath } from "@/lib/navigation/routes";

type Props = { params: Promise<{ id: string }> };

export default async function MoveDetailRedirectPage({ params }: Props) {
  const { id } = await params;
  redirect(salesMovePath(id));
}
