import { SERVICE_IDS, STACK } from "@/config/pricing";
import type { Dictionary } from "@/i18n";
import { ICONS } from "@/lib/icons";
import { PathIcon } from "./Icons";
import ServiceActions from "./ServiceActions";
import SplitWords from "./SplitWords";

export default function Services({ t }: { t: Dictionary["services"] }) {
  return (
    <section className="sec" id="servicos">
      <div className="wrap">
        <div className="sechead rv">
          <span className="kicker mono"><b>02</b>{t.kicker}</span>
          <SplitWords text={t.title} />
          <p className="lead">{t.sub}</p>
        </div>
        <div className="g4">
          {SERVICE_IDS.map((id, i) => {
            const s = t.items[id];
            return (
              <article className="scard rv" key={id}>
                <span className="ico b"><PathIcon d={ICONS[id]} /></span>
                <span className="code">{"S/0" + (i + 1)}</span>
                <h3>{s.name}</h3>
                <p>{s.desc}</p>
                <span className="stack">{STACK[id]}</span>
                <span className="tag">{s.out}</span>
                <ServiceActions id={id} from={t.from} perHour={t.perHour} perMonth={t.perMonth} simulate={t.simulate} />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
