import type { Dictionary } from "@/i18n";
import { waLink } from "@/lib/whatsapp";
import SplitWords from "./SplitWords";

export default function FinalCta({ t, waText }: { t: Dictionary["final"]; waText: string }) {
  return (
    <section style={{ padding: "0 16px" }}>
      <div className="wrap" style={{ padding: 0 }}>
        <div className="final rv">
          <SplitWords text={t.title} className="split" base={0.1} />
          <p>{t.sub}</p>
          <div className="ctas">
            <a className="btn btn-inv" href={waLink(waText)} target="_blank" rel="noopener noreferrer">{t.cta1}</a>
            <a className="btn btn-gh" href="#orcamento">{t.cta2}</a>
          </div>
        </div>
      </div>
    </section>
  );
}
