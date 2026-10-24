import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import QuoteProvider from "@/components/QuoteProvider";
import type { Locale } from "@/config/site";
import { getDictionary } from "@/i18n";

/** Renderiza dentro do mesmo provider da página (src/app/[lang]/page.tsx). */
export function renderWithQuote(ui: ReactElement, lang: Locale = "pt") {
  const t = getDictionary(lang);
  const strings = {
    calc: { base: t.calc.base, extra: t.calc.extra, x: t.calc.x, perMonth: t.calc.perMonth, days: t.calc.days },
    services: { items: t.services.items },
    wa: t.wa,
  };
  return render(<QuoteProvider lang={lang} strings={strings}>{ui}</QuoteProvider>);
}

export const calcStrings = (lang: Locale = "pt") => {
  const t = getDictionary(lang);
  return { calc: t.calc, items: t.services.items, ui: { less: t.ui.less, more: t.ui.more } };
};

/** Troca espaços especiais (o Intl usa espaço não separável em "R$ 1.800"). */
export const norm = (s: string | null | undefined) => (s ?? "").replace(/\s/g, " ").trim();
