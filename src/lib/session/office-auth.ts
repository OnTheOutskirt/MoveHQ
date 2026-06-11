const SESSION_KEY = "jm-office-auth-v1";

/** Mock office session — `signed-out` means user chose sign out; absent means signed in. */
export function isOfficeSignedIn(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(SESSION_KEY) !== "signed-out";
}

export function signOutOfficeSession(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, "signed-out");
}

export function signInOfficeSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}
