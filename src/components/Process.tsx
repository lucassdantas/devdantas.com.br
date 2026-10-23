import type { Dictionary } from "@/i18n";
import { GUARANTEE_ICONS } from "@/lib/icons";
import { PathIcon } from "./Icons";
import SplitWords from "./SplitWords";

export default function Process({ t, guar }: { t: Dictionary["process"]; guar: Dictionary["guar"] }) {
  return (
    <section className="sec">
      <div className="wrap">
        <div className="sechead rv">
          <span className="kicker mono"><b>06</b>{t.kicker}</span>
          <SplitWords text={t.title} />
        </div>
        <div className="g4p">
          {t.steps.map((s, i) => (
            <div className="ps rv" key={s.t}><span className="n">{i + 1}</span><h3>{s.t}</h3><p>{s.p}</p></div>
          ))}
        </div>
        <div className="gbox rv">
          {guar.map((g, i) => (
            <div className="gi" key={g.t}><PathIcon d={GUARANTEE_ICONS[i]} size={26} /><b>{g.t}</b><p>{g.p}</p></div>
          ))}
        </div>
      </div>
    </section>
  );
}
