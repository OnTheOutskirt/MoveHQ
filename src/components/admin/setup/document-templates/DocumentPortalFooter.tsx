import { PORTAL_REGULATORY_FOOTER } from "@/lib/settings/document-terms-defaults";

type DocumentPortalFooterProps = {
  accentColor: string;
};

export function DocumentPortalFooter({ accentColor }: DocumentPortalFooterProps) {
  return (
    <footer
      className="border-t border-slate-200/80 px-5 py-5 text-center sm:px-6"
      style={{
        background: `linear-gradient(180deg, white 0%, color-mix(in srgb, ${accentColor} 4%, white) 100%)`,
      }}
    >
      <div className="space-y-1 text-[11px] font-medium tracking-wide text-slate-500">
        <p>{PORTAL_REGULATORY_FOOTER.txDmv}</p>
        <p>{PORTAL_REGULATORY_FOOTER.usDot}</p>
        <p className="pt-1 text-slate-400">{PORTAL_REGULATORY_FOOTER.copyright}</p>
      </div>
    </footer>
  );
}
