import type { Dictionary } from "@/i18n";
import CalculatorWidget from "./CalculatorWidget";
import SplitWords from "./SplitWords";

export default function Calculator({ t }: { t: Dictionary }) {
  return (
    <section className="sec calcsec" id="orcamento">
      <div className="wrap">
        <div className="sechead center rv">
          <span className="kicker mono"><b>05</b>{t.calc.kicker}</span>
          <SplitWords text={t.calc.title} />
          <p className="lead">{t.calc.sub}</p>
        </div>
        <CalculatorWidget t={{ calc: t.calc, items: t.services.items, ui: { less: t.ui.less, more: t.ui.more } }} />
      </div>
    </section>
  );
}
