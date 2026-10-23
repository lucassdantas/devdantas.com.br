import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import { site } from "@/config/site";
import { icons, languageAlternates, redirectScript } from "@/lib/seo";
import { mono, sans } from "../fonts";
import "@/styles/globals.css";

// "/" só escolhe o idioma e redireciona; quem é indexado são /pt, /en…
export const metadata: Metadata = {
  metadataBase: new URL(site.domain),
  title: site.brand,
  robots: { index: false, follow: true },
  alternates: { languages: languageAlternates() },
  icons,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={site.htmlLang[site.defaultLocale]} className={sans.variable + " " + mono.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: redirectScript() }} />
        <noscript><meta httpEquiv="refresh" content={"0; url=/" + site.defaultLocale} /></noscript>
      </head>
      <body className="ds" style={{ "--brand": site.accent } as CSSProperties}>{children}</body>
    </html>
  );
}
