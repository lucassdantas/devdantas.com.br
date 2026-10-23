import { REGIONS, type RegionId } from "@/config/pricing";
import { site } from "@/config/site";
import type { Dictionary } from "@/i18n";
import type { Quote } from "./calc";
import { formatMoney } from "./format";

/** Link do WhatsApp com a mensagem já escrita. */
export function waLink(text: string): string {
  return "https://wa.me/" + site.whatsapp + "?text=" + encodeURIComponent(text);
}

export type MessageStrings = {
  wa: Dictionary["wa"];
  calc: Pick<Dictionary["calc"], "perMonth" | "days">;
  services: { items: Dictionary["services"]["items"] };
};

/** Resumo do orçamento no idioma atual (vai para o WhatsApp e para o e-mail). */
export function buildQuoteMessage(quote: Quote, region: RegionId, t: MessageStrings): string {
  const tx = t.services.items[quote.service];
  const fmt = (v: number) => formatMoney(v, region);
  // A primeira linha é a base (ou as horas, na consultoria); o resto vira "Extras".
  const extrasTxt = quote.lines.slice(1).map((l) => l.label).join(", ");
  const totalTxt = quote.isMonthly ? fmt(quote.total) + t.calc.perMonth : fmt(quote.total);
  return [
    t.wa.hi, "",
    "• " + t.wa.service + ": " + tx.name,
    "• " + t.wa.size + ": " + quote.units + " " + tx.unit,
    extrasTxt ? "• " + t.wa.extras + ": " + extrasTxt : null,
    "• " + t.wa.total + ": " + totalTxt + " (" + REGIONS[region].currency + ")",
    quote.monthly ? "• " + t.wa.monthly + ": " + fmt(quote.monthly) + t.calc.perMonth : null,
    quote.isMonthly ? null : "• " + t.wa.delivery + ": ~" + quote.days + " " + t.calc.days,
    "", t.wa.bye,
  ].filter((x) => x !== null).join("\n");
}
