import { SERVICE_IDS } from "@/config/pricing";
import { site, type Locale } from "@/config/site";
import type { Dictionary } from "@/i18n";

/**
 * Dados estruturados (schema.org) da página de cada idioma.
 * Só usa o que aparece na página: sem preços (os valores são ilustrativos) e sem avaliações.
 */
export function buildJsonLd(lang: Locale, t: Dictionary) {
  const url = site.domain + "/" + lang;
  const inLanguage = site.htmlLang[lang];
  const ids = {
    website: site.domain + "/#website",
    business: site.domain + "/#business",
    person: site.domain + "/#lucas",
    page: url + "#webpage",
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": ids.website,
        url: site.domain,
        name: site.brand,
        publisher: { "@id": ids.business },
        inLanguage: Object.values(site.htmlLang),
      },
      {
        "@type": "WebPage",
        "@id": ids.page,
        url,
        name: t.meta.title,
        description: t.meta.description,
        inLanguage,
        isPartOf: { "@id": ids.website },
        about: { "@id": ids.business },
        primaryImageOfPage: { "@type": "ImageObject", url: site.domain + "/og/og-" + lang + ".png", width: 1200, height: 630 },
      },
      {
        "@type": "ProfessionalService",
        "@id": ids.business,
        name: site.brand,
        url,
        description: t.meta.description,
        image: site.domain + "/og/og-" + lang + ".png",
        logo: { "@type": "ImageObject", url: site.domain + "/icon-512.png", width: 512, height: 512 },
        email: site.email,
        telephone: "+" + site.whatsapp,
        address: { "@type": "PostalAddress", addressLocality: site.city, addressRegion: "RJ", addressCountry: "BR" },
        areaServed: [{ "@type": "Country", name: "Brasil" }, { "@type": "Place", name: "Worldwide" }],
        knowsLanguage: site.workLanguageTags,
        founder: { "@id": ids.person },
        sameAs: [site.linkedin, site.github],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: t.services.kicker,
          itemListElement: SERVICE_IDS.map((id) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: t.services.items[id].name, description: t.services.items[id].desc, provider: { "@id": ids.business } },
          })),
        },
      },
      {
        "@type": "Person",
        "@id": ids.person,
        name: site.owner,
        jobTitle: t.about.role,
        worksFor: { "@id": ids.business },
        knowsAbout: site.facts,
        sameAs: [site.linkedin, site.github],
      },
      {
        "@type": "FAQPage",
        "@id": url + "#faq",
        inLanguage,
        isPartOf: { "@id": ids.page },
        mainEntity: t.faq.items.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };
}
