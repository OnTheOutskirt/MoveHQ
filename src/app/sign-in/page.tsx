"use client";

import { Button } from "@/components/ui/Button";
import { REAL_ADMIN_PERSONA } from "@/lib/session/personas";
import { signInOfficeSession, isOfficeSignedIn } from "@/lib/session/office-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignInPage() {
  const router = useRouter();

  useEffect(() => {
    if (isOfficeSignedIn()) {
      router.replace("/dashboard");
    }
  }, [router]);

  function handleSignIn() {
    signInOfficeSession();
    router.replace("/dashboard");
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-lg font-bold text-white">
            JM
          </div>
          <h1 className="mt-5 text-xl font-semibold text-slate-900">Jonah&apos;s Movers</h1>
          <p className="mt-2 text-sm text-slate-600">Sign in to the office app</p>
        </div>

        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
          <p className="text-sm font-medium text-slate-900">{REAL_ADMIN_PERSONA.name}</p>
          <p className="text-xs text-slate-500">{REAL_ADMIN_PERSONA.email}</p>
          <p className="mt-1 text-xs text-slate-500">{REAL_ADMIN_PERSONA.title}</p>
        </div>

        <Button type="button" className="mt-6 w-full" onClick={handleSignIn}>
          Continue
        </Button>

        <p className="mt-4 text-center text-[11px] leading-relaxed text-slate-400">
          Demo sign-in — production will use your company identity provider. Admins can preview
          other roles from the account menu after signing in.
        </p>
      </div>
    </div>
  );
}
