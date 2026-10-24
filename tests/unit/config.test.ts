import { describe, expect, it } from "vitest";
import { REGIONS, REGION_IDS, SERVICES, SERVICE_IDS, STACK, DEFAULT_SERVICE, type ExtraId } from "@/config/pricing";
import { LOCALES, site } from "@/config/site";

/* Pega erros de digitação em config/ antes de irem para o ar. */

const KNOWN_EXTRAS: ExtraId[] = ["lang", "seo", "copy", "cms", "integrations", "urgency", "care"];

describe("pricing.ts", () => {
  it("todo serviço tem regra, stack e preço em todas as regiões", () => {
    expect(Object.keys(SERVICES).sort()).toEqual([...SERVICE_IDS].sort());
    expect(Object.keys(STACK).sort()).toEqual([...SERVICE_IDS].sort());
    for (const r of REGION_IDS) {
      expect(Object.keys(REGIONS[r].prices).sort()).toEqual([...SERVICE_IDS].sort());
      for (const id of SERVICE_IDS) {
        const [base, per] = REGIONS[r].prices[id];
        expect(base, `${r}.${id} base`).toBeGreaterThanOrEqual(0);
        expect(per, `${r}.${id} por unidade`).toBeGreaterThan(0);
      }
      for (const v of Object.values(REGIONS[r].extras)) expect(v).toBeGreaterThan(0);
    }
  });

  it("moeda e locale de cada região são válidos no Intl", () => {
    for (const r of REGION_IDS) {
      const { locale, currency } = REGIONS[r];
      expect(() => new Intl.NumberFormat(locale, { style: "currency", currency })).not.toThrow();
    }
  });

  it("limites do slider são coerentes com o passo", () => {
    for (const id of SERVICE_IDS) {
      const s = SERVICES[id];
      expect(s.min, id).toBeLessThanOrEqual(s.def);
      expect(s.def, id).toBeLessThanOrEqual(s.max);
      expect((s.def - s.min) % s.step, `${id}: valor inicial fora do passo`).toBe(0);
      expect((s.max - s.min) % s.step, `${id}: máximo fora do passo`).toBe(0);
      expect(s.incl % s.step, `${id}: unidades inclusas fora do passo`).toBe(0);
      for (const x of s.extras) expect(KNOWN_EXTRAS, `${id}: extra desconhecido`).toContain(x);
    }
  });

  it("só serviços com preço base zero são cobrados por hora", () => {
    for (const r of REGION_IDS) {
      for (const id of SERVICE_IDS) {
        if (REGIONS[r].prices[id][0] === 0) expect(SERVICES[id].incl, `${r}.${id}`).toBe(0);
      }
    }
  });

  it("serviço padrão existe", () => {
    expect(SERVICE_IDS).toContain(DEFAULT_SERVICE);
  });
});

describe("site.ts", () => {
  it("cada idioma tem região, tag, nome e locale de Open Graph", () => {
    for (const l of LOCALES) {
      expect(REGION_IDS).toContain(site.langToRegion[l]);
      expect(site.htmlLang[l]).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/);
      expect(site.ogLocale[l]).toMatch(/^[a-z]{2}_[A-Z0-9]{2,3}$/);
      expect(site.langName[l]).toBeTruthy();
      expect(site.langShort[l]).toHaveLength(2);
    }
    expect(LOCALES).toContain(site.defaultLocale);
  });

  it("contatos têm formato válido", () => {
    expect(site.whatsapp).toMatch(/^\d{10,15}$/);
    expect(site.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    expect(site.domain).toMatch(/^https:\/\/[^/]+$/);
    expect(site.linkedin).toMatch(/^https:\/\//);
    expect(site.quoteEndpoint).toBe("/api/orcamento");
  });

  it("o ID do Formspree não está no código do navegador", () => {
    expect(JSON.stringify(site)).not.toMatch(/formspree/i);
  });
});
