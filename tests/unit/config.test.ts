import { describe, expect, it } from "vitest";
import { DEFAULT_SERVICE, EXTRAS_BRL, FOREIGN_MARKUP, FX_BRL, PRICES_BRL, REGIONS, REGION_IDS, SERVICES, SERVICE_IDS, STACK, fromBRL, roundPrice, type ExtraId } from "@/config/pricing";
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

describe("preços coerentes entre moedas", () => {
  const FOREIGN = [["US", "USD"], ["EU", "EUR"], ["UK", "GBP"]] as const;

  it("cada moeda estrangeira vale o mesmo que o real + a margem (com tolerância do arredondamento)", () => {
    for (const [region, cur] of FOREIGN) {
      for (const id of SERVICE_IDS) {
        PRICES_BRL[id].forEach((brl, i) => {
          if (brl === 0) return expect(REGIONS[region].prices[id][i]).toBe(0);
          const backToBrl = REGIONS[region].prices[id][i] * FX_BRL[cur];
          const expected = brl * (1 + FOREIGN_MARKUP);
          // arredondar para 5/10 muda até ~2,5 unidades da moeda; abaixo de 100, até 5 unidades
          const tol = (REGIONS[region].prices[id][i] < 100 ? 2.5 : 5) * FX_BRL[cur];
          expect(Math.abs(backToBrl - expected), `${region}.${id}[${i}]`).toBeLessThanOrEqual(tol);
        });
      }
    }
  });

  it("pagar em real nunca sai mais barato que pagar em moeda estrangeira (convertida)", () => {
    for (const [region, cur] of FOREIGN) {
      for (const id of SERVICE_IDS) {
        const [brl] = PRICES_BRL[id];
        if (brl === 0) continue;
        // o estrangeiro paga no mínimo o equivalente ao preço em real (a margem cobre o arredondamento)
        expect(REGIONS[region].prices[id][0] * FX_BRL[cur], `${region}.${id}`).toBeGreaterThanOrEqual(brl);
      }
    }
  });

  it("uma moeda, um preço: não existem duas regiões com a mesma moeda", () => {
    const currencies = REGION_IDS.map((r) => REGIONS[r].currency);
    expect(new Set(currencies).size).toBe(currencies.length);
  });

  it("o Brasil usa exatamente a tabela base", () => {
    expect(REGIONS.BR.prices).toBe(PRICES_BRL);
    expect(REGIONS.BR.extras).toBe(EXTRAS_BRL);
  });

  it("arredondamento de vitrine", () => {
    expect(roundPrice(376.4)).toBe(380);
    expect(roundPrice(53.5)).toBe(55);
    expect(roundPrice(1.2)).toBe(5);
    expect(fromBRL(0, "USD")).toBe(0);
  });
});
