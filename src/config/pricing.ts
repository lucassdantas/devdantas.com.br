/* =====================================================================
   PREÇOS — regiões, moedas e regras dos serviços.
   Trocar um preço? Mexa só neste arquivo. A calculadora, os cards de
   serviço ("a partir de") e a mensagem do WhatsApp se atualizam sozinhos.
   ===================================================================== */

export const SERVICE_IDS = ["landing", "site", "ecommerce", "system", "design", "consulting", "security", "care"] as const;
export type ServiceId = (typeof SERVICE_IDS)[number];

export const REGION_IDS = ["BR", "US", "EU", "UK", "LATAM"] as const;
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

// TODO(Lucas): os valores abaixo são estimativas — revise antes de publicar.
export const REGIONS: Record<RegionId, Region> = {
  BR: {
    currency: "BRL", locale: "pt-BR", pay: "br", short: "R$ BRL", long: "Brasil · R$",
    prices: { landing: [1800, 250], site: [2900, 350], ecommerce: [5900, 300], system: [9900, 1800], design: [2400, 300], consulting: [0, 250], security: [690, 450], care: [290, 90] },
    extras: { seo: 600, copy: 800, cms: 900, integrations: 1200 },
  },
  US: {
    currency: "USD", locale: "en-US", pay: "intl", short: "$ USD", long: "USA · US$",
    prices: { landing: [790, 90], site: [1290, 150], ecommerce: [2690, 150], system: [4500, 800], design: [990, 120], consulting: [0, 60], security: [290, 190], care: [99, 35] },
    extras: { seo: 250, copy: 350, cms: 390, integrations: 490 },
  },
  EU: {
    currency: "EUR", locale: "de-DE", pay: "intl", short: "€ EUR", long: "Europe · €",
    prices: { landing: [750, 85], site: [1190, 140], ecommerce: [2490, 140], system: [4200, 750], design: [920, 110], consulting: [0, 55], security: [270, 180], care: [95, 32] },
    extras: { seo: 230, copy: 320, cms: 360, integrations: 450 },
  },
  UK: {
    currency: "GBP", locale: "en-GB", pay: "intl", short: "£ GBP", long: "UK · £",
    prices: { landing: [650, 75], site: [1050, 120], ecommerce: [2190, 120], system: [3700, 650], design: [800, 95], consulting: [0, 48], security: [240, 160], care: [85, 28] },
    extras: { seo: 200, copy: 280, cms: 310, integrations: 390 },
  },
  LATAM: {
    currency: "USD", locale: "es-419", pay: "intl", short: "$ LatAm", long: "LatAm · US$",
    prices: { landing: [490, 60], site: [790, 90], ecommerce: [1590, 90], system: [2900, 500], design: [590, 70], consulting: [0, 35], security: [190, 120], care: [59, 20] },
    extras: { seo: 150, copy: 200, cms: 240, integrations: 300 },
  },
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
