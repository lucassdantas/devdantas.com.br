import Image, { type StaticImageData } from "next/image";
import helpBaterias from "@/assets/projects/help-baterias.webp";
import italineaRio from "@/assets/projects/italinea-rio.webp";
import parceirosRubraz from "@/assets/projects/parceiros-rubraz.webp";
import pureDetail from "@/assets/projects/pure-detail.webp";
import type { Dictionary } from "@/i18n";
import SplitWords from "./SplitWords";

type WorkKey = keyof Dictionary["work"]["items"];

/** Cases: nome + print. Os textos (tag, país, descrição) ficam em i18n → work.items. */
const WORK: { key: WorkKey; name: string; img: StaticImageData }[] = [
  { key: "pure", name: "Pure Detail", img: pureDetail },
  { key: "help", name: "Help Baterias", img: helpBaterias },
  { key: "ital", name: "Italínea Rio", img: italineaRio },
  { key: "rubraz", name: "Parceiros Rubraz", img: parceirosRubraz },
];

export default function Work({ t }: { t: Dictionary["work"] }) {
  return (
    <section className="sec" id="resultados">
      <div className="wrap">
        <div className="sechead rv">
          <span className="kicker mono"><b>04</b>{t.kicker}</span>
          <SplitWords text={t.title} />
          <p className="lead">{t.sub}</p>
        </div>
        <div className="g2">
          {WORK.map((w) => {
            const item = t.items[w.key];
            return (
              <article className="wcard rv" key={w.key}>
                <div className="wimg"><Image src={w.img} alt={w.name} loading="lazy" sizes="(max-width: 640px) 84vw, 576px" /></div>
                <div className="wbody">
                  <div className="wmeta"><span className="tag">{item.tag}</span><span className="place">{item.place}</span></div>
                  <h3>{w.name}</h3>
                  <p>{item.desc}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
