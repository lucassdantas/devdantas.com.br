"use client";

import { REGIONS, SERVICES, type ServiceId } from "@/config/pricing";
import { formatMoney } from "@/lib/format";
import { useQuote } from "./QuoteProvider";

type Props = { id: ServiceId; from: string; perHour: string; perMonth: string; simulate: string };

/** Preço "a partir de" na moeda atual + botão que seleciona o serviço na calculadora. */
export default function ServiceActions({ id, from, perHour, perMonth, simulate }: Props) {
  const { region, pick } = useQuote();
  const [base, per] = REGIONS[region].prices[id];
  let price = formatMoney(base, region);
  if (base === 0) price = formatMoney(per, region) + perHour;
  else if (SERVICES[id].monthly) price = formatMoney(base, region) + perMonth;

  return (
    <div className="price">
      <div><small>{from}</small><b>{price}</b></div>
      <a className="sim" href="#orcamento" onClick={() => pick(id)}>{simulate} →</a>
    </div>
  );
}
