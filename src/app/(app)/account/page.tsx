import { AccountPreferencesPage } from "@/components/account/AccountPreferencesPage";
import { Suspense } from "react";

export default function AccountPage() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-500">Loading account settings…</p>}>
      <AccountPreferencesPage />
    </Suspense>
  );
}
