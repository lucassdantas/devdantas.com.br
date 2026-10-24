import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import { LOCALES, isLocale, site } from "@/config/site";
import { getDictionary } from "@/i18n";
import { THEME_SCRIPT, icons, languageAlternates } from "@/lib/seo";
import { mono, sans } from "../fonts";
import "@/styles/globals.css";

type Props = { children: ReactNode; params: Promise<{ lang: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#0B1524" },
  ],
};

export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  const og = { url: "/og/og-" + lang + ".png", width: 1200, height: 630, type: "image/png", alt: t.meta.ogTitle };
  return {
    metadataBase: new URL(site.domain),
    title: t.meta.title,
    description: t.meta.description,
    applicationName: site.brand,
    authors: [{ name: site.owner, url: site.linkedin }],
    creator: site.owner,
    alternates: { canonical: "/" + lang, languages: languageAlternates() },
    openGraph: {
      type: "website",
      url: "/" + lang,
      siteName: site.brand,
      title: t.meta.ogTitle,
      description: t.meta.description,
      locale: site.ogLocale[lang],
      alternateLocale: LOCALES.filter((l) => l !== lang).map((l) => site.ogLocale[l]),
      images: [og],
    },
    twitter: { card: "summary_large_image", title: t.meta.ogTitle, description: t.meta.description, images: [{ url: og.url, alt: og.alt }] },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
    icons,
    formatDetection: { telephone: false },
  };
}

export default async function LangLayout({ children, params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <html lang={site.htmlLang[lang]} className={sans.variable + " " + mono.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="ds" style={{ "--brand": site.accent } as CSSProperties}>{children}</body>
    </html>
  );
}
