"use client";

import { formatMoney } from "@/lib/format";
import WaIcon from "./Icons";
import { useDisplay, useQuote } from "./QuoteProvider";

type Props = { total: string; totalMonthly: string; perMonth: string };

/** Barra fixa no celular (≤640px) com o total e o botão de WhatsApp. */
export default function MobileBar({ total, totalMonthly, perMonth }: Props) {
  const { region, quote, waHref } = useQuote();
  const { display } = useDisplay();
  return (
    <div className="mbar">
      <a className="tl" href="#orcamento"><small>{quote.isMonthly ? totalMonthly : total}</small><b>{formatMoney(display, region)}{quote.isMonthly ? perMonth : ""}</b></a>
      <a className="btn btn-wa" href={waHref} target="_blank" rel="noopener noreferrer"><WaIcon size={18} />WhatsApp</a>
    </div>
  );
}
