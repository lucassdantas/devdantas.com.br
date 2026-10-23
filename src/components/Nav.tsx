"use client";

import { useState, type ChangeEvent } from "react";
import { REGION_IDS, REGIONS, type RegionId } from "@/config/pricing";
import { LOCALES, isLocale, site } from "@/config/site";
import type { Dictionary } from "@/i18n";
import Logo from "./Logo";
import { REGION_KEY, useQuote } from "./QuoteProvider";

export const THEME_KEY = "ds-theme";
export const LANG_KEY = "ds-lang";

type Props = { t: { nav: Dictionary["nav"]; ui: Dictionary["ui"] } };

const NAV_IDS = ["servicos", "resultados", "seguranca", "orcamento", "faq"] as const;

export default function Nav({ t }: Props) {
  const { lang, region, setRegion } = useQuote();
  const [menu, setMenu] = useState(false);
  const labels = [t.nav.services, t.nav.work, t.nav.security, t.nav.pricing, t.nav.faq];

  // Troca de idioma: vai para a rota do idioma mantendo a âncora; a moeda volta ao padrão do idioma (como no design).
  const onLang = (e: ChangeEvent<HTMLSelectElement>) => {
    const l = e.target.value;
    if (!isLocale(l) || l === lang) return;
    try {
      localStorage.setItem(LANG_KEY, l);
      localStorage.removeItem(REGION_KEY);
    } catch {}
    window.location.assign("/" + l + window.location.hash);
  };
  const onRegion = (e: ChangeEvent<HTMLSelectElement>) => setRegion(e.target.value as RegionId);

  const toggleTheme = () => {
    const dark = document.documentElement.classList.toggle("dark");
    try { localStorage.setItem(THEME_KEY, dark ? "dark" : "light"); } catch {}
  };
  const close = () => setMenu(false);

  return (
    <header className="nav">
      <div className="wrap">
        <div className="navin">
          <Logo />
          <nav className="links" aria-label={t.ui.nav}>
            {NAV_IDS.map((id, i) => <a key={id} href={"#" + id}>{labels[i]}</a>)}
          </nav>
          <div className="tools">
            <div className="prefs">
              <label className="sr-only" htmlFor="lang">{t.ui.lang}</label>
              <select id="lang" className="sel" value={lang} onChange={onLang}>
                {LOCALES.map((l) => <option key={l} value={l}>{site.langShort[l]}</option>)}
              </select>
              <span className="sep" aria-hidden="true"></span>
              <label className="sr-only" htmlFor="region">{t.ui.currency}</label>
              <select id="region" className="sel" value={region} onChange={onRegion}>
                {REGION_IDS.map((r) => <option key={r} value={r}>{REGIONS[r].short}</option>)}
              </select>
              <span className="sep" aria-hidden="true"></span>
              <button className="icon-btn" type="button" aria-label={t.ui.theme} onClick={toggleTheme}>
                <svg className="th-sun" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.5"></circle><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"></path></svg>
                <svg className="th-moon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z"></path></svg>
              </button>
            </div>
            <a className="btn btn-p navcta" href="#orcamento" style={{ minHeight: 44, padding: "0 18px", fontSize: 14.5 }}>{t.nav.cta}</a>
            <button className="icon-btn burger" type="button" aria-label={t.ui.menu} aria-expanded={menu} aria-controls="mmenu" onClick={() => setMenu(!menu)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"></path></svg>
            </button>
          </div>
        </div>
        {menu && (
          <div className="mmenu" id="mmenu">
            {NAV_IDS.map((id, i) => <a key={id} href={"#" + id} onClick={close}>{labels[i]}</a>)}
            <div className="row">
              <select className="sel" aria-label={t.ui.lang} value={lang} onChange={onLang}>
                {LOCALES.map((l) => <option key={l} value={l}>{site.langName[l]}</option>)}
              </select>
              <select className="sel" aria-label={t.ui.currency} value={region} onChange={onRegion}>
                {REGION_IDS.map((r) => <option key={r} value={r}>{REGIONS[r].long}</option>)}
              </select>
            </div>
            <a className="btn btn-p" href="#orcamento" onClick={close} style={{ marginTop: 8 }}>{t.nav.cta}</a>
          </div>
        )}
      </div>
    </header>
  );
}
