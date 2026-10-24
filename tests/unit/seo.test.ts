import vm from "node:vm";
import { describe, expect, it } from "vitest";
import { LOCALES, site } from "@/config/site";
import { getDictionary } from "@/i18n";
import { buildJsonLd } from "@/lib/jsonld";
import { THEME_SCRIPT, languageAlternates, redirectScript } from "@/lib/seo";

/** Roda o script inline num "navegador" de mentira e devolve para onde ele redirecionou. */
function runRedirect({ languages, stored, hash = "" }: { languages: string[]; stored?: string; hash?: string }) {
  let target = "";
  const ctx = {
    navigator: { languages, language: languages[0] },
    localStorage: { getItem: () => stored ?? null },
    location: { search: "", hash, replace: (u: string) => { target = u; } },
    String,
  };
  vm.runInNewContext(redirectScript(), ctx);
  return target;
}

describe("redirecionamento da raiz", () => {
  it("escolhe o idioma do navegador", () => {
    expect(runRedirect({ languages: ["en-US", "pt-BR"] })).toBe("/en");
    expect(runRedirect({ languages: ["fr-CA"] })).toBe("/fr");
    expect(runRedirect({ languages: ["de"] })).toBe("/de");
  });

  it("idioma não suportado cai no padrão", () => {
    expect(runRedirect({ languages: ["ja-JP", "zh"] })).toBe("/" + site.defaultLocale);
    expect(runRedirect({ languages: [] })).toBe("/" + site.defaultLocale);
  });

  it("a escolha salva tem prioridade e a âncora é mantida", () => {
    expect(runRedirect({ languages: ["en-US"], stored: "es", hash: "#orcamento" })).toBe("/es#orcamento");
    expect(runRedirect({ languages: ["en-US"], stored: "xx" })).toBe("/en");
  });
});

describe("script de tema", () => {
  const run = (stored: string | null, prefersDark: boolean) => {
    const classes = new Set<string>();
    vm.runInNewContext(THEME_SCRIPT, {
      localStorage: { getItem: () => stored },
      matchMedia: () => ({ matches: prefersDark }),
      document: { documentElement: { classList: { add: (c: string) => classes.add(c) } } },
    });
    return classes.has("dark");
  };

  it("respeita a escolha salva e, sem ela, o sistema", () => {
    expect(run("dark", false)).toBe(true);
    expect(run("light", true)).toBe(false);
    expect(run(null, true)).toBe(true);
    expect(run(null, false)).toBe(false);
  });

  it("não quebra se o localStorage estiver bloqueado", () => {
    expect(() =>
      vm.runInNewContext(THEME_SCRIPT, { localStorage: { getItem: () => { throw new Error("blocked"); } }, matchMedia: () => ({ matches: false }), document: {} }),
    ).not.toThrow();
  });
});

describe("hreflang", () => {
  it("lista todos os idiomas + x-default", () => {
    const alt = languageAlternates(true);
    for (const l of LOCALES) expect(alt[site.htmlLang[l]]).toBe(site.domain + "/" + l);
    expect(alt["x-default"]).toBe(site.domain + "/" + site.defaultLocale);
  });
});

describe("JSON-LD", () => {
  for (const lang of LOCALES) {
    it(`${lang}: grafo completo, sem preço e sem avaliações`, () => {
      const t = getDictionary(lang);
      const ld = buildJsonLd(lang, t);
      const types = ld["@graph"].map((n) => n["@type"]);
      expect(types).toEqual(["WebSite", "WebPage", "ProfessionalService", "Person", "FAQPage"]);
      const faq = ld["@graph"].find((n) => n["@type"] === "FAQPage") as { mainEntity: { name: string }[] };
      expect(faq.mainEntity.map((q) => q.name)).toEqual(t.faq.items.map((q) => q.q));
      const text = JSON.stringify(ld);
      expect(text).not.toMatch(/"price"|aggregateRating|"review"/);
      expect(text).toContain(site.domain + "/" + lang);
    });
  }
});
