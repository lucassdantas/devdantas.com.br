import { site } from "@/config/site";
import type { Dictionary } from "@/i18n";
import { waLink } from "@/lib/whatsapp";
import Logo from "./Logo";

export default function Footer({ t }: { t: Dictionary }) {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="footg">
          <div>
            <Logo />
            <p>{t.footer.tag}</p>
          </div>
          <div className="flinks">
            <div><b className="mono">{t.nav.services}</b><a href="#servicos">{t.services.short1}</a><a href="#servicos">{t.services.short2}</a><a href="#seguranca">{t.nav.security}</a></div>
            <div>
              <b className="mono">{t.footer.contact}</b>
              <a href={waLink(t.wa.direct)} target="_blank" rel="noopener noreferrer">WhatsApp</a>
              <a href={"mailto:" + site.email}>{site.email}</a>
              <a href={site.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
            </div>
          </div>
        </div>
        <div className="copy"><span>© {new Date().getFullYear()} {site.brand} · {t.footer.rights}</span><span>{t.footer.made}</span></div>
      </div>
    </footer>
  );
}
