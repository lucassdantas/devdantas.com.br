/* =====================================================================
   PREÇOS — uma tabela só, em REAL; as outras moedas são calculadas.
   Trocar um preço? Mexa em PRICES_BRL / EXTRAS_BRL. A calculadora, os cards
   de serviço ("a partir de") e a mensagem do WhatsApp se atualizam sozinhos,
   em todas as moedas.

   Moeda estrangeira = preço em real ÷ câmbio × (1 + FOREIGN_MARKUP),
   arredondado. Assim o valor é o mesmo para você em qualquer moeda e ninguém
   ganha pagando em real (veja docs/decisoes/0019-precos-base-em-real.md).
   ===================================================================== */

export const SERVICE_IDS = ["landing", "site", "ecommerce", "system", "design", "consulting", "security", "care"] as const;
export type ServiceId = (typeof SERVICE_IDS)[number];

export const REGION_IDS = ["BR", "US", "EU", "UK"] as const;
export type RegionId = (typeof REGION_IDS)[number];

/** Extras com preço fixo (somados ao subtotal). */
export type FixedExtraId = "seo" | "copy" | "cms" | "integrations";
/** Todos os extras que um serviço pode oferecer. */
export type ExtraId = "lang" | FixedExtraId | "urgency" | "care";

export type Region = {
  /** Código ISO 4217 da moeda. */
  currency: string;
  /** Locale usado para formatar a moeda (ex.: "de-DE" → 1.190 €). */
  locale: string;
  /** Qual nota de pagamento mostrar (textos em i18n → calc.pay). */
  pay: "br" | "intl";
  /** Rótulo da opção no seletor da nav e no menu mobile. */
  short: string;
  long: string;
  /**
   * prices[serviço] = [preço base, preço por pacote adicional]
   * - consultoria: base 0 → o segundo número é o valor da hora;
   * - suporte (care): é mensal → base = mensalidade de 1 site.
   */
  prices: Record<ServiceId, [number, number]>;
  /** Preço fixo de cada extra. */
  extras: Record<FixedExtraId, number>;
};

/**
 * TABELA BASE, EM REAL. É a única que você mantém.
 * PRICES_BRL[serviço] = [preço base, preço por pacote adicional]
 */
export const PRICES_BRL: Record<ServiceId, [number, number]> = {
  landing: [1800, 250], site: [2900, 350], ecommerce: [5900, 300], system: [9900, 1800],
  design: [2400, 300], consulting: [0, 250], security: [690, 450], care: [290, 90],
};
export const EXTRAS_BRL: Record<FixedExtraId, number> = { seo: 600, copy: 800, cms: 900, integrations: 1200 };

/**
 * Câmbio comercial (quantos reais vale 1 unidade da moeda).
 * Atualize de vez em quando (ex.: uma vez por mês) — veja docs/operacao/manutencao.md.
 * Fonte: dólar/euro/libra comercial em 22/10/2026.
 */
export const FX_BRL = { USD: 5.05, EUR: 5.67, GBP: 6.77 } as const;
export const FX_DATE = "2026-10-22";

/**
 * Margem sobre o câmbio para quem paga em moeda estrangeira. Cobre o que você perde ao receber
 * de fora: taxa da plataforma e spread (Wise ~1%, PayPal/cartão 4–8%), IOF (0% se o câmbio for
 * classificado como exportação de serviço; 0,38% se não) e a oscilação do câmbio entre a entrada
 * de 50% e a entrega. Confirme com seu contador.
 */
export const FOREIGN_MARKUP = 0.08;

/** Arredondamento "de vitrine": de 10 em 10 a partir de 100; de 5 em 5 abaixo disso. */
export function roundPrice(value: number): number {
  return value >= 100 ? Math.round(value / 10) * 10 : Math.max(5, Math.round(value / 5) * 5);
}

/** Converte um valor da tabela em real para a moeda estrangeira (com a margem). */
export function fromBRL(brl: number, currency: keyof typeof FX_BRL): number {
  if (brl === 0) return 0;
  return roundPrice((brl / FX_BRL[currency]) * (1 + FOREIGN_MARKUP));
}

function convert(currency: keyof typeof FX_BRL): Pick<Region, "prices" | "extras"> {
  const map = <K extends string>(o: Record<K, number>) =>
    Object.fromEntries(Object.entries<number>(o).map(([k, v]) => [k, fromBRL(v, currency)])) as Record<K, number>;
  const prices = Object.fromEntries(
    SERVICE_IDS.map((id) => [id, [fromBRL(PRICES_BRL[id][0], currency), fromBRL(PRICES_BRL[id][1], currency)]]),
  ) as Record<ServiceId, [number, number]>;
  return { prices, extras: map(EXTRAS_BRL) };
}

// TODO(Lucas): revise os valores de PRICES_BRL / EXTRAS_BRL antes de publicar (vieram do design).
export const REGIONS: Record<RegionId, Region> = {
  BR: { currency: "BRL", locale: "pt-BR", pay: "br", short: "R$ BRL", long: "Brasil · R$", prices: PRICES_BRL, extras: EXTRAS_BRL },
  US: { currency: "USD", locale: "en-US", pay: "intl", short: "$ USD", long: "USD · US$", ...convert("USD") },
  EU: { currency: "EUR", locale: "de-DE", pay: "intl", short: "€ EUR", long: "Europe · €", ...convert("EUR") },
  UK: { currency: "GBP", locale: "en-GB", pay: "intl", short: "£ GBP", long: "UK · £", ...convert("GBP") },
};

export type ServiceRule = {
  /** Unidades já inclusas no preço base (0 = cobra tudo por unidade, ex.: horas). */
  incl: number;
  /** Limites do slider. */
  min: number;
  max: number;
  /** Tamanho de cada "pacote" adicional (e-commerce: de 10 em 10 produtos). */
  step: number;
  /** Valor inicial do slider ao escolher o serviço. */
  def: number;
  /** Prazo base em dias úteis e dias a mais por pacote adicional. */
  days: number;
  daysPer: number;
  /** Extras permitidos neste serviço (na ordem em que aparecem). */
  extras: ExtraId[];
  /** true = serviço mensal (o total vira "/mês"). */
  monthly?: boolean;
};

/** Regras de cada serviço (iguais em todas as regiões). */
export const SERVICES: Record<ServiceId, ServiceRule> = {
  landing:    { incl: 5,  min: 1,  max: 15,  step: 1,  def: 5,  days: 7,  daysPer: 1,   extras: ["lang", "seo", "copy", "cms", "integrations", "urgency", "care"] },
  site:       { incl: 5,  min: 1,  max: 20,  step: 1,  def: 5,  days: 12, daysPer: 1.5, extras: ["lang", "seo", "copy", "cms", "integrations", "urgency", "care"] },
  ecommerce:  { incl: 30, min: 10, max: 500, step: 10, def: 30, days: 25, daysPer: 0.5, extras: ["lang", "seo", "copy", "integrations", "urgency", "care"] },
  system:     { incl: 3,  min: 1,  max: 15,  step: 1,  def: 3,  days: 35, daysPer: 8,   extras: ["lang", "integrations", "urgency", "care"] },
  design:     { incl: 5,  min: 1,  max: 40,  step: 1,  def: 5,  days: 7,  daysPer: 1,   extras: ["copy", "urgency"] },
  consulting: { incl: 0,  min: 1,  max: 20,  step: 1,  def: 2,  days: 2,  daysPer: 0,   extras: [] },
  security:   { incl: 1,  min: 1,  max: 10,  step: 1,  def: 1,  days: 1,  daysPer: 0.5, extras: ["urgency", "care"] },
  care:       { incl: 1,  min: 1,  max: 20,  step: 1,  def: 1,  days: 1,  daysPer: 0,   extras: [], monthly: true },
};

/** Código de stack exibido em cada card de serviço. */
export const STACK: Record<ServiceId, string> = {
  landing: "Next.js · Tailwind · SEO",
  site: "Next.js · WordPress · CMS",
  ecommerce: "WooCommerce · Nuvemshop",
  system: "Laravel · React · PostgreSQL",
  // TODO(Lucas): confirmar "Figma" no card de Design.
  design: "Figma · Design System",
  consulting: "Architecture · Performance",
  security: "OWASP · SSL · Backups",
  care: "Uptime · Updates · Backups",
};

/** Regras gerais da calculadora. */
export const RULES = {
  /** +20% por idioma extra, sobre (base + unidades). */
  langExtraPct: 0.2,
  /** Máximo de idiomas extras. */
  langExtraMax: 4,
  /** Dias úteis a mais por idioma extra. */
  langExtraDays: 2,
  /** Entrega expressa: +30% sobre o subtotal… */
  urgencyPct: 0.3,
  /** …e prazo multiplicado por 0,6. */
  urgencyDays: 0.6,
  /** O total é arredondado de 10 em 10. */
  roundTo: 10,
};

/** Serviço selecionado quando a página abre. */
export const DEFAULT_SERVICE: ServiceId = "landing";
