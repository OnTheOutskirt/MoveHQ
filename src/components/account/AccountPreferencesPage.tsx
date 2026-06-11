"use client";

import { ChangePasswordDialog } from "@/components/account/ChangePasswordDialog";
import { EmailSignatureEditor } from "@/components/account/EmailSignatureEditor";
import { NotificationPrefsEditor } from "@/components/account/NotificationPrefsEditor";
import { ProfilePhotoPicker } from "@/components/account/ProfilePhotoPicker";
import { TabBar } from "@/components/shared/TabBar";
import { useUserPreferences } from "@/components/providers/UserPreferencesProvider";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { useSession } from "@/components/providers/SessionProvider";
import { getOfficePersona } from "@/lib/session/personas";
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_ROLE_DEFAULTS,
} from "@/lib/notifications/notification-types";
import { pageMeta } from "@/lib/navigation/page-meta";
import type { UserOutlookSettings } from "@/lib/integrations/outlook-user-settings";
import { cn } from "@/lib/utils";
import { Bell, Calendar, KeyRound, Link2, Mail, Phone, User } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const meta = pageMeta["/account"];

const TABS = [
  { id: "profile", label: "Profile" },
  { id: "notifications", label: "Notifications" },
  { id: "email", label: "Email" },
  { id: "outlook", label: "Outlook" },
  { id: "security", label: "Security" },
] as const;

type AccountTab = (typeof TABS)[number]["id"];

const HASH_TO_TAB: Record<string, AccountTab> = {
  "#email": "email",
  "#email-settings": "email",
  "#outlook-settings": "outlook",
};

export function AccountPreferencesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useSession();
  const persona = getOfficePersona(user.id);
  const { preferences, updatePreferences } = useUserPreferences();
  const roleCategories = NOTIFICATION_CATEGORIES.filter(
    (c) => NOTIFICATION_ROLE_DEFAULTS[persona.workspaceRole][c],
  );
  const [signatureDraft, setSignatureDraft] = useState(preferences.emailSignature);
  const [imageDraft, setImageDraft] = useState<string | null>(preferences.signatureImageDataUrl);
  const [signatureDirty, setSignatureDirty] = useState(false);
  const [phoneDraft, setPhoneDraft] = useState(preferences.phone);
  const [phoneDirty, setPhoneDirty] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  const rawTab = searchParams.get("tab");
  const activeTab: AccountTab = TABS.some((t) => t.id === rawTab)
    ? (rawTab as AccountTab)
    : "profile";

  useEffect(() => {
    setSignatureDraft(preferences.emailSignature);
    setImageDraft(preferences.signatureImageDataUrl);
    setSignatureDirty(false);
  }, [preferences.emailSignature, preferences.signatureImageDataUrl]);

  useEffect(() => {
    setPhoneDraft(preferences.phone);
    setPhoneDirty(false);
  }, [preferences.phone]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hashTab = HASH_TO_TAB[window.location.hash];
    if (hashTab) {
      router.replace(`/account?tab=${hashTab}`, { scroll: false });
    }
  }, [router]);

  const outlook = preferences.outlook;

  function setTab(tab: AccountTab) {
    router.push(`/account?tab=${tab}`, { scroll: false });
  }

  function patchOutlook(patch: Partial<UserOutlookSettings>) {
    updatePreferences({ outlook: { ...outlook, ...patch } });
  }

  function saveSignature() {
    updatePreferences({
      emailSignature: signatureDraft.trim(),
      signatureImageDataUrl: imageDraft,
      includeEmailSignature: true,
    });
    setSignatureDirty(false);
  }

  function savePhone() {
    updatePreferences({ phone: phoneDraft.trim() });
    setPhoneDirty(false);
  }

  const signatureChanged =
    signatureDirty ||
    signatureDraft !== preferences.emailSignature ||
    imageDraft !== preferences.signatureImageDataUrl;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title={meta.title} description={meta.description} />

      <TabBar tabs={TABS} activeTab={activeTab} onChange={setTab} />

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {activeTab === "profile" ? (
          <TabPanel
            icon={User}
            title="Profile"
            description="Your office identity — some fields are managed by admin."
          >
            <ProfilePhotoPicker
              initials={user.initials}
              imageDataUrl={preferences.profileImageDataUrl}
              onImageChange={(url) => updatePreferences({ profileImageDataUrl: url })}
            />

            <dl className="mt-6 grid gap-3 border-t border-slate-100 pt-6 sm:grid-cols-2">
              <ProfileField label="Name" value={user.name} />
              <ProfileField label="Role" value={user.title} />
              <ProfileField label="Email" value={user.email} className="sm:col-span-2" />
            </dl>

            <label className="mt-4 block">
              <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                <Phone className="h-3 w-3" />
                Mobile phone
              </span>
              <p className="mt-0.5 text-xs text-slate-500">
                Used for two-factor sign-in when authentication is enabled.
              </p>
              <input
                type="tel"
                value={phoneDraft}
                onChange={(e) => {
                  setPhoneDraft(e.target.value);
                  setPhoneDirty(true);
                }}
                placeholder="(555) 555-0100"
                autoComplete="tel"
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </label>
            <div className="mt-3">
              <Button type="button" size="sm" disabled={!phoneDirty} onClick={savePhone}>
                Save phone number
              </Button>
            </div>
          </TabPanel>
        ) : null}

        {activeTab === "notifications" ? (
          <TabPanel
            icon={Bell}
            title="Notifications"
            description={`Delivery preferences for ${persona.title} — in-app, email, SMS, and push.`}
          >
            <NotificationPrefsEditor
              prefs={preferences.notificationPrefs}
              visibleCategories={roleCategories}
              onChange={(notificationPrefs) => updatePreferences({ notificationPrefs })}
            />
          </TabPanel>
        ) : null}

        {activeTab === "email" ? (
          <TabPanel
            icon={Mail}
            title="Email"
            description="Used when you send from inbox, move quick actions, and CRM panels."
          >
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-3">
              <input
                type="checkbox"
                checked={preferences.includeEmailSignature}
                onChange={(e) => updatePreferences({ includeEmailSignature: e.target.checked })}
                className="mt-0.5 rounded border-slate-300 text-brand-600"
              />
              <span>
                <span className="block text-sm font-medium text-slate-900">
                  Include signature on outgoing emails
                </span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  Text signature in plain emails; photo appears when HTML is supported.
                </span>
              </span>
            </label>

            <EmailSignatureEditor
              className="mt-4"
              signatureText={signatureDraft}
              signatureImageDataUrl={imageDraft}
              onSignatureTextChange={(text) => {
                setSignatureDraft(text);
                setSignatureDirty(true);
              }}
              onSignatureImageChange={(url) => {
                setImageDraft(url);
                setSignatureDirty(true);
              }}
              onSave={saveSignature}
              saveDisabled={!signatureChanged}
            />
          </TabPanel>
        ) : null}

        {activeTab === "outlook" ? (
          <TabPanel
            icon={Link2}
            title="Microsoft Outlook"
            description="Mail and calendar sync for inbox and walkthrough scheduling — connects at go-live."
          >
            <div className="rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-3">
              <p className="text-sm font-medium text-slate-900">
                {outlook.connected ? `Connected as ${outlook.accountEmail}` : "Not connected"}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Walkthrough slots will respect Outlook busy times when calendar sync is enabled. You
                can also set weekly availability on{" "}
                <a href="/sales/walkthroughs" className="font-medium text-brand-600 hover:underline">
                  Sales → Walkthroughs
                </a>
                .
              </p>
              <Button type="button" size="sm" className="mt-3" disabled>
                Connect Microsoft account
              </Button>
            </div>
            <div className="mt-3 space-y-2">
              <ToggleRow
                label="Calendar sync"
                description="Block walkthrough times when your Outlook calendar is busy."
                checked={outlook.calendarSyncEnabled}
                onChange={(checked) => patchOutlook({ calendarSyncEnabled: checked })}
              />
              <ToggleRow
                label="Mail sync"
                description="Send and receive sales email through your Outlook mailbox."
                checked={outlook.mailSyncEnabled}
                onChange={(checked) => patchOutlook({ mailSyncEnabled: checked })}
              />
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
              <Calendar className="h-3 w-3" />
              Microsoft Graph · demo toggles saved per user
            </p>
          </TabPanel>
        ) : null}

        {activeTab === "security" ? (
          <TabPanel
            icon={KeyRound}
            title="Security"
            description="Sign-in, password, and two-factor authentication."
          >
            <div className="space-y-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-3">
                <p className="text-sm font-medium text-slate-900">Two-factor authentication</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  {preferences.phone.trim()
                    ? `SMS codes will be sent to ${preferences.phone} when 2FA is turned on for your account.`
                    : "Add a mobile phone number on the Profile tab to enable SMS two-factor when auth goes live."}
                </p>
                <p className="mt-2 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  Coming with production sign-in
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">Password</p>
                  <p className="text-xs text-slate-500">Last changed — not tracked in demo</p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setPasswordOpen(true)}
                >
                  Change password
                </Button>
              </div>
            </div>
          </TabPanel>
        ) : null}
      </div>

      <ChangePasswordDialog open={passwordOpen} onClose={() => setPasswordOpen(false)} />
    </div>
  );
}

function TabPanel({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof User;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Icon className="h-4 w-4 text-brand-600" />
          {title}
        </h2>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>
      <div className="space-y-4 px-5 py-4">{children}</div>
    </section>
  );
}

function ProfileField({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-slate-900">{value}</dd>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border border-slate-200 px-3 py-3 hover:bg-slate-50/80">
      <span>
        <span className="block text-sm font-medium text-slate-900">{label}</span>
        <span className="mt-0.5 block text-xs text-slate-500">{description}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className={cn("mt-1 shrink-0 rounded border-slate-300 text-brand-600")}
      />
    </label>
  );
}
