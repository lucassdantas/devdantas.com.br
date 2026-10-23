import { REGIONS, type RegionId } from "@/config/pricing";

const cache = new Map<RegionId, Intl.NumberFormat>();

/** Formata um valor na moeda da região, sem centavos (ex.: R$ 1.800, 1.190 €). */
export function formatMoney(value: number, region: RegionId): string {
  const r = REGIONS[region];
  try {
    let f = cache.get(region);
    if (!f) {
      f = new Intl.NumberFormat(r.locale, { style: "currency", currency: r.currency, maximumFractionDigits: 0 });
      cache.set(region, f);
    }
    return f.format(value);
  } catch {
    return r.currency + " " + Math.round(value);
  }
}
