import type { Metadata } from "next";
import { LOCALES, site } from "@/config/site";

/** hreflang → URL de cada idioma (x-default aponta para o idioma padrão). */
export function languageAlternates(absolute = false): Record<string, string> {
  const base = absolute ? site.domain : "";
  const map: Record<string, string> = {};
  for (const l of LOCALES) map[site.htmlLang[l]] = base + "/" + l;
  map["x-default"] = base + "/" + site.defaultLocale;
  return map;
}

export const icons: Metadata["icons"] = {
  icon: [
    { url: "/favicon.ico", sizes: "48x48" },
    { url: "/favicon.svg", type: "image/svg+xml" },
    { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
    { url: "/icon-16.png", sizes: "16x16", type: "image/png" },
  ],
  apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
};

/** Script do <head> que aplica o tema antes da primeira pintura (sem "piscar"). */
export const THEME_SCRIPT =
  `try{var t=localStorage.getItem("ds-theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`;

/** Script da raiz "/": escolhe o idioma (salvo → navegador → padrão) e redireciona. */
export function redirectScript(): string {
  return `(function(){var L=${JSON.stringify(LOCALES)},l=null;` +
    `try{l=localStorage.getItem("ds-lang")}catch(e){}` +
    `if(L.indexOf(l)<0){l=null;var n=navigator.languages||[navigator.language||""];` +
    `for(var i=0;i<n.length&&!l;i++){var c=String(n[i]).slice(0,2).toLowerCase();if(L.indexOf(c)>-1)l=c}}` +
    `location.replace("/"+(l||${JSON.stringify(site.defaultLocale)})+location.search+location.hash)})()`;
}
