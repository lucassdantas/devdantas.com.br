import { describe, expect, it } from "vitest";
import pt from "@/i18n/pt";
import type { RegionId, ServiceId } from "@/config/pricing";
import { calculateQuote, roundTo, type ExtrasState } from "@/lib/calc";

const q = (service: ServiceId, units: number | null, extras: ExtrasState, langs: number, region: RegionId) =>
  calculateQuote(service, units, extras, langs, region, pt);

describe("calculateQuote (BR)", () => {
  it("cobra só o preço base quando as unidades estão inclusas", () => {
    const r = q("landing", 5, {}, 0, "BR");
    expect(r.total).toBe(1800);
    expect(r.lines).toEqual([{ label: "Base · Landing page (5 seções)", value: 1800 }]);
    expect(r.days).toBe(7);
    expect(r.monthly).toBe(0);
  });

  it("cobra cada unidade além das inclusas e soma prazo", () => {
    const r = q("landing", 8, {}, 0, "BR");
    expect(r.total).toBe(1800 + 3 * 250);
    expect(r.lines[1]).toEqual({ label: "+3 seções adicionais", value: 750 });
    expect(r.days).toBe(10);
  });

  it("limita as unidades ao mínimo/máximo do serviço", () => {
    expect(q("landing", 99, {}, 0, "BR").units).toBe(15);
    expect(q("landing", 0, {}, 0, "BR").units).toBe(1);
    expect(q("landing", null, {}, 0, "BR").units).toBe(5);
  });

  it("e-commerce cobra em pacotes de 10 produtos", () => {
    expect(q("ecommerce", 30, {}, 0, "BR").total).toBe(5900);
    const r = q("ecommerce", 50, {}, 0, "BR");
    expect(r.total).toBe(5900 + 2 * 300);
    expect(r.lines[1]).toEqual({ label: "+20 produtos adicionais", value: 600 });
    expect(r.days).toBe(26);
  });

  it("consultoria cobra por hora, sem linha de base", () => {
    const r = q("consulting", 3, {}, 0, "BR");
    expect(r.total).toBe(750);
    expect(r.lines).toEqual([{ label: "3 horas", value: 750 }]);
    expect(r.days).toBe(2);
  });

  it("idiomas extras: +20% cada sobre base + unidades", () => {
    const r = q("landing", 7, {}, 2, "BR");
    // (1800 + 500) × 0,2 × 2 = 920
    expect(r.total).toBe(2300 + 920);
    expect(r.lines.at(-1)).toEqual({ label: "Idiomas extras ×2", value: 920 });
    expect(r.days).toBe(Math.ceil(7 + 2 + 2 * 2));
  });

  it("idiomas extras não incidem sobre os outros extras", () => {
    const r = q("landing", 5, { seo: true }, 1, "BR");
    expect(r.total).toBe(1800 + 360 + 600);
  });

  it("ignora idiomas em serviços que não permitem e respeita o máximo", () => {
    const d = q("design", 5, {}, 3, "BR");
    expect(d.langs).toBe(0);
    expect(d.total).toBe(2400);
    expect(d.days).toBe(7);
    expect(q("landing", 5, {}, 10, "BR").langs).toBe(4);
  });

  it("soma extras fixos permitidos e ignora os não permitidos", () => {
    expect(q("landing", 5, { seo: true, copy: true }, 0, "BR").total).toBe(1800 + 600 + 800);
    // painel de edição (cms) não existe no e-commerce
    expect(q("ecommerce", 30, { cms: true }, 0, "BR").total).toBe(5900);
  });

  it("urgência: +30% sobre o subtotal e prazo × 0,6", () => {
    const r = q("landing", 5, { seo: true, urgency: true }, 0, "BR");
    expect(r.total).toBe((1800 + 600) * 1.3);
    expect(r.lines.at(-1)).toEqual({ label: "Entrega expressa +30%", value: 720 });
    expect(r.days).toBe(Math.ceil(7 * 0.6));
    expect(r.urgent).toBe(true);
  });

  it("urgência incide também sobre idiomas extras", () => {
    const r = q("landing", 5, { urgency: true }, 1, "BR");
    // (1800 + 360) × 1,3 = 2808 → arredonda para 2810
    expect(r.total).toBe(2810);
  });

  it("plano mensal como extra não altera o total", () => {
    const r = q("landing", 5, { care: true }, 0, "BR");
    expect(r.total).toBe(1800);
    expect(r.monthly).toBe(290);
  });

  it("serviço de suporte é mensal e cobra por site adicional", () => {
    const r = q("care", 3, {}, 0, "BR");
    expect(r.isMonthly).toBe(true);
    expect(r.total).toBe(290 + 2 * 90);
  });

  it("segurança: unidades adicionais com prazo fracionado", () => {
    const r = q("security", 3, {}, 0, "BR");
    expect(r.total).toBe(690 + 2 * 450);
    expect(r.days).toBe(2);
  });
});

describe("arredondamento", () => {
  it("arredonda o total de 10 em 10", () => {
    // US: 790 × 0,2 = 158 → 948 → 950
    expect(q("landing", 5, {}, 1, "US").total).toBe(950);
    expect(roundTo(944)).toBe(940);
    expect(roundTo(945)).toBe(950);
  });

  it("usa a tabela da região escolhida", () => {
    expect(q("site", 5, {}, 0, "EU").total).toBe(1190);
    expect(q("consulting", 2, {}, 0, "UK").total).toBe(100);
  });
});
