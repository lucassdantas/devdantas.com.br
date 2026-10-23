import type { Dictionary } from "@/i18n";
import { PAIN_ICONS } from "@/lib/icons";
import { PathIcon } from "./Icons";
import SplitWords from "./SplitWords";

export default function Pains({ t }: { t: Dictionary["pain"] }) {
  return (
    <section className="sec tint">
      <div className="wrap">
        <div className="sechead rv">
          <span className="kicker mono"><b>01</b>{t.kicker}</span>
          <SplitWords text={t.title} />
        </div>
        <div className="g3">
          {t.items.map((p, i) => (
            <article className="pcard rv" key={p.t}>
              <div className="prob">
                <span className="pnum" aria-hidden="true">{"0" + (i + 1)}</span>
                <div className="prow">
                  <span className="picon"><PathIcon d={PAIN_ICONS[i]} /></span>
                  <span className="badge bad">{t.probLabel}</span>
                </div>
                <h3>{p.t}</h3>
                <p>{p.p}</p>
              </div>
              <div className="sol">
                <span className="turn" aria-hidden="true"><PathIcon d="M12 5v14M6 13l6 6 6-6" size={20} width={2.2} /></span>
                <span className="badge good"><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13 2L4 14h7l-1 8 9-12h-7z"></path></svg>{t.solLabel}</span>
                <p>{p.fix}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
