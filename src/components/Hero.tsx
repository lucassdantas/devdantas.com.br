import Image from "next/image";
import pureDetail from "@/assets/projects/pure-detail.webp";
import type { Dictionary } from "@/i18n";
import { waLink } from "@/lib/whatsapp";
import Clock from "./Clock";
import WaIcon, { ArrowIcon, CheckIcon } from "./Icons";
import { Words, splitWords } from "./SplitWords";

export default function Hero({ t }: { t: Dictionary }) {
  const h = t.hero;
  const a = splitWords(h.t1, "w", 0, 0.15, 0.07);
  const b = splitWords(h.t2, "w ac", a.length, 0.15, 0.07);
  const c = splitWords(h.t3, "w mut", a.length + b.length, 0.15, 0.07);

  return (
    <section className="hero" id="top">
      <div className="wrap herogrid">
        <div>
          <span className="pill in">{h.eyebrow}</span>
          <h1 className="h1 split" aria-label={h.t1 + " " + h.t2 + " " + h.t3}>
            <Words words={a} /><Words words={b} /><br /><Words words={c} />
          </h1>
          <p className="herosub in d2">{h.sub}</p>
          <div className="ctas in d3">
            <a className="btn btn-p" href="#orcamento">{h.cta1}<ArrowIcon /></a>
            <a className="btn btn-s" href={waLink(t.wa.direct)} target="_blank" rel="noopener noreferrer"><WaIcon full stroke="#16A34A" />{h.cta2}</a>
          </div>
          <div className="trust in d4">
            {h.trust.map((x) => <span key={x}><CheckIcon />{x}</span>)}
          </div>
          <div className="status in d5"><span className="live"></span><span>{h.status}</span><span className="dotsep"></span><Clock /></div>
        </div>
        <div className="mock" aria-hidden="true">
          <div className="frame">
            <span className="ftag">&lt;Landing /&gt;</span>
            <span className="cross tl"></span><span className="cross tr"></span><span className="cross bl"></span><span className="cross br"></span>
            <div className="browser">
              <div className="bbar"><i></i><i></i><i></i><span className="url"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.6" strokeLinecap="round"><rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 8 0v4"></path></svg>puredetail.co.nz</span></div>
              <Image className="shot" src={pureDetail} alt="" preload fetchPriority="high" sizes="(max-width: 920px) 100vw, 560px" />
            </div>
            <span className="dim"><i></i><em>1280 × 800 · responsive</em><i></i></span>
          </div>
          <div className="float f1"><span className="ico g"><WaIcon /></span><span>{h.notif}<small>{h.notifSub}</small></span></div>
        </div>
      </div>
    </section>
  );
}
