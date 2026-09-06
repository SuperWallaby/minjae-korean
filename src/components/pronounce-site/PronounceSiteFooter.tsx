import { PRONOUNCE_SITE_NAME } from "@/lib/pronounceSite/brand";
import { pronounceChromeCopyForLang } from "@/lib/pronounceSite/chromeCopy";

export function PronounceSiteFooter({ lang }: { lang: string }) {
  const copy = pronounceChromeCopyForLang(lang);

  return (
    <footer className="global-footer">
      <div className="global-shell">
        <p>
          {PRONOUNCE_SITE_NAME} — {copy.blurb}
        </p>
        <p className="global-footer-meta">{copy.tagline}</p>
      </div>
    </footer>
  );
}
