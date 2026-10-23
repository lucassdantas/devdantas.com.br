import type { Dictionary } from "@/i18n";
import FaqList from "./FaqList";
import SplitWords from "./SplitWords";

export default function Faq({ t }: { t: Dictionary["faq"] }) {
  return (
    <section className="sec" id="faq" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="sechead center rv">
          <span className="kicker mono"><b>08</b>{t.kicker}</span>
          <SplitWords text={t.title} />
        </div>
        <FaqList items={t.items} />
      </div>
    </section>
  );
}
