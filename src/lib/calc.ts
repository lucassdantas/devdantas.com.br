import { REGIONS, RULES, SERVICES, type ExtraId, type FixedExtraId, type RegionId, type ServiceId, type ServiceRule } from "@/config/pricing";
import type { Dictionary } from "@/i18n";

/** Só os textos de que o cálculo precisa (para montar as linhas do resumo). */
export type QuoteStrings = {
  calc: Pick<Dictionary["calc"], "base" | "extra" | "x">;
  services: { items: Dictionary["services"]["items"] };
};

/** Extras ligados/desligados pelo visitante. */
export type ExtrasState = Partial<Record<Exclude<ExtraId, "lang">, boolean>>;

export type QuoteLine = { label: string; value: number };

export type Quote = {
  service: ServiceId;
  rule: ServiceRule;
  /** Unidades já limitadas ao min/max do serviço. */
  units: number;
  /** Unidades além das inclusas no preço base. */
  extraUnits: number;
  /** Idiomas extras efetivamente cobrados (0 se o serviço não permite). */
  langs: number;
  /** Total arredondado (de 10 em 10). Em serviço mensal, é a mensalidade. */
  total: number;
  /** Mensalidade do extra "suporte e backup" (0 se desligado). */
  monthly: number;
  /** Linhas do resumo, com valores sem arredondar. */
  lines: QuoteLine[];
  /** Prazo estimado em dias úteis. */
  days: number;
  isMonthly: boolean;
  urgent: boolean;
  allowLang: boolean;
};

const FIXED_EXTRAS: FixedExtraId[] = ["seo", "copy", "cms", "integrations"];

export function roundTo(value: number, step = RULES.roundTo): number {
  return Math.round(value / step) * step;
}

export function clampUnits(service: ServiceId, units: number | null | undefined): number {
  const rule = SERVICES[service];
  if (units == null || Number.isNaN(units)) return rule.def;
  return Math.min(rule.max, Math.max(rule.min, units));
}

/** Calcula o orçamento. Função pura: mesmos argumentos → mesmo resultado. */
export function calculateQuote(
  service: ServiceId,
  unitsInput: number | null | undefined,
  extras: ExtrasState,
  langsInput: number,
  region: RegionId,
  dict: QuoteStrings,
): Quote {
  const rule = SERVICES[service];
  const R = REGIONS[region];
  const tx = dict.services.items[service];
  const [base, per] = R.prices[service];
  const allowed = rule.extras;

  const units = clampUnits(service, unitsInput);
  const extraUnits = Math.max(0, units - rule.incl);
  const packs = extraUnits / rule.step;
  const unitsCost = packs * per;

  const lines: QuoteLine[] = [];
  if (base > 0) {
    lines.push({ label: dict.calc.base + " · " + tx.name + (rule.incl ? " (" + rule.incl + " " + tx.unit + ")" : ""), value: base });
  }
  if (unitsCost > 0) {
    lines.push({ label: (rule.incl ? "+" : "") + extraUnits + " " + tx.unit + (rule.incl ? " " + dict.calc.extra : ""), value: unitsCost });
  }

  let sub = base + unitsCost;

  const allowLang = allowed.includes("lang");
  const langs = allowLang ? Math.min(RULES.langExtraMax, Math.max(0, Math.floor(langsInput))) : 0;
  if (langs > 0) {
    const v = (base + unitsCost) * RULES.langExtraPct * langs;
    lines.push({ label: dict.calc.x.lang.t + " ×" + langs, value: v });
    sub += v;
  }

  for (const k of FIXED_EXTRAS) {
    if (allowed.includes(k) && extras[k]) {
      lines.push({ label: dict.calc.x[k].t, value: R.extras[k] });
      sub += R.extras[k];
    }
  }

  const urgent = allowed.includes("urgency") && !!extras.urgency;
  if (urgent) {
    const v = sub * RULES.urgencyPct;
    lines.push({ label: dict.calc.x.urgency.t + " +" + Math.round(RULES.urgencyPct * 100) + "%", value: v });
    sub += v;
  }

  const careOn = allowed.includes("care") && !!extras.care;
  const monthly = careOn ? R.prices.care[0] : 0;

  const days = Math.ceil((rule.days + packs * rule.daysPer + langs * RULES.langExtraDays) * (urgent ? RULES.urgencyDays : 1));

  return {
    service, rule, units, extraUnits, langs,
    total: roundTo(sub),
    monthly, lines, days,
    isMonthly: !!rule.monthly, urgent, allowLang,
  };
}
