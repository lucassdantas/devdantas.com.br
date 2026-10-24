import type { MetadataRoute } from "next";
import { LOCALES, site } from "@/config/site";
import { languageAlternates } from "@/lib/seo";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const home: MetadataRoute.Sitemap = LOCALES.map((l) => ({
    url: site.domain + "/" + l,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: l === site.defaultLocale ? 1 : 0.8,
    alternates: { languages: languageAlternates(true) },
  }));
  const privacy: MetadataRoute.Sitemap = LOCALES.map((l) => ({
    url: site.domain + "/" + l + "/privacy",
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.3,
  }));
  return [...home, ...privacy];
}
