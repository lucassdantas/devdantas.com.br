import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { LOCALES, site } from "@/config/site";
import { THEME_SCRIPT, icons } from "@/lib/seo";
import { mono, sans } from "./fonts";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "404 · " + site.brand,
  robots: { index: false },
  icons,
};

export default function GlobalNotFound() {
  return (
    <html lang={site.htmlLang[site.defaultLocale]} className={sans.variable + " " + mono.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="ds" style={{ "--brand": site.accent } as CSSProperties}>
        <main className="wrap" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 8 }}>
          <span className="kicker mono">404</span>
          <h1 className="h2">{site.notFoundText}</h1>
          <nav style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginTop: 28 }}>
            {LOCALES.map((l) => (
              <a key={l} className="btn btn-s" href={"/" + l} hrefLang={site.htmlLang[l]} lang={site.htmlLang[l]}>{site.langName[l]}</a>
            ))}
          </nav>
        </main>
      </body>
    </html>
  );
}
