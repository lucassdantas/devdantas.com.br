import { describe, expect, it } from "vitest";
import { REGION_IDS } from "@/config/pricing";
import { site } from "@/config/site";
import en from "@/i18n/en";
import pt from "@/i18n/pt";
import { calculateQuote } from "@/lib/calc";
import { formatMoney } from "@/lib/format";
import { buildQuoteMessage, waLink } from "@/lib/whatsapp";

const norm = (s: string) => s.replace(/\s/g, " ");

describe("formatMoney", () => {
  it("formata sem centavos na moeda de cada região", () => {
    expect(norm(formatMoney(1800, "BR"))).toBe("R$ 1.800");
    expect(formatMoney(790, "US")).toBe("$790");
    expect(norm(formatMoney(1190, "EU"))).toBe("1.190 €");
    expect(formatMoney(650, "UK")).toBe("£650");
    expect(formatMoney(1234.6, "US")).toBe("$1,235");
  });

  it("funciona em todas as regiões", () => {
    for (const r of REGION_IDS) expect(formatMoney(100, r)).toMatch(/100/);
  });
});

describe("WhatsApp", () => {
  it("monta o link wa.me com o número da config e o texto codificado", () => {
    const href = waLink("Olá & tchau?");
    expect(href).toBe("https://wa.me/" + site.whatsapp + "?text=Ol%C3%A1%20%26%20tchau%3F");
  });

  it("mensagem completa: serviço, tamanho, extras, total, prazo", () => {
    const q = calculateQuote("landing", 7, { seo: true, care: true }, 1, "BR", pt);
    const msg = norm(buildQuoteMessage(q, "BR", pt));
    expect(msg).toBe(norm([
      "Olá, Lucas! Fiz uma simulação no seu site:",
      "",
      "• Serviço: Landing page",
      "• Tamanho: 7 seções",
      "• Extras: +2 seções adicionais, Idiomas extras ×1, SEO avançado",
      "• Estimativa: R$ 3.360 (BRL)",
      "• Mensal: R$ 290/mês",
      "• Prazo: ~11 dias úteis",
      "",
      "Podemos conversar?",
    ].join("\n")));
  });

  it("sem extras não mostra a linha de extras", () => {
    const q = calculateQuote("landing", 5, {}, 0, "BR", pt);
    expect(buildQuoteMessage(q, "BR", pt)).not.toContain("Extras");
  });

  it("serviço mensal: total com /mês e sem prazo", () => {
    const q = calculateQuote("care", 2, {}, 0, "US", en);
    const msg = buildQuoteMessage(q, "US", en);
    // 60 + 20 (1 site a mais) = 80
    expect(msg).toContain("• Estimate: $80/mo (USD)");
    expect(msg).not.toContain("Timeline");
  });

  it("consultoria: as horas não aparecem como extra", () => {
    const q = calculateQuote("consulting", 3, {}, 0, "BR", pt);
    expect(buildQuoteMessage(q, "BR", pt)).not.toContain("Extras");
  });
});
