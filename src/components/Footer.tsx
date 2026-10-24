import { site, type Locale } from "@/config/site";
import type { Dictionary } from "@/i18n";
import { waLink } from "@/lib/whatsapp";
import Logo from "./Logo";

/** `home`: na página principal as âncoras são locais; nas outras páginas apontam para /<idioma>#… */
export default function Footer({ t, lang, home = true }: { t: Dictionary; lang: Locale; home?: boolean }) {
  const base = home ? "" : "/" + lang;
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="footg">
          <div>
            <Logo href={base + "#top"} />
            <p>{t.footer.tag}</p>
          </div>
          <div className="flinks">
            <div><b className="mono">{t.nav.services}</b><a href={base + "#servicos"}>{t.services.short1}</a><a href={base + "#servicos"}>{t.services.short2}</a><a href={base + "#seguranca"}>{t.nav.security}</a></div>
            <div>
              <b className="mono">{t.footer.contact}</b>
              <a href={waLink(t.wa.direct)} target="_blank" rel="noopener noreferrer">WhatsApp</a>
              <a href={"mailto:" + site.email}>{site.email}</a>
              <a href={site.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
              <a href={site.github} target="_blank" rel="noopener noreferrer">GitHub</a>
            </div>
          </div>
        </div>
        <div className="copy">
          <span>© {new Date().getFullYear()} {site.brand} · {t.footer.rights} · <a href={"/" + lang + "/privacy"}>{t.footer.privacy}</a></span>
          <span>{t.footer.made}</span>
        </div>
      </div>
    </footer>
  );
}
