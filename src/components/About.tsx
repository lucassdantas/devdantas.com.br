import Image from "next/image";
import { site } from "@/config/site";
import type { Dictionary } from "@/i18n";

export default function About({ t }: { t: Dictionary["about"] }) {
  const [first, ...rest] = site.owner.split(" ");
  return (
    <section className="sec" style={{ paddingTop: 0 }}>
      <div className="wrap about">
        <div className={site.photo ? "ph rv has-photo" : "ph rv"}>
          {/* Sem foto (site.photo = null), mostra as iniciais. */}
          {site.photo
            ? <Image src={site.photo} alt={site.owner} width={720} height={900} loading="lazy" sizes="(max-width: 920px) 100vw, 440px" />
            : <b>{site.photoInitials}</b>}
          <span className="mono">{site.owner} · {site.city}</span>
        </div>
        <div className="rv">
          <span className="kicker mono full"><b>07</b>{t.kicker}</span>
          <h2 className="h2 split" aria-label={site.owner}>
            <span className="w" aria-hidden="true"><span>{first}</span></span>
            <span className="w" aria-hidden="true"><span style={{ animationDelay: ".07s" }}>{rest.join(" ")}</span></span>
          </h2>
          <p className="role">{t.role}</p>
          <p className="lead">{t.p}</p>
          <div className="langs"><small>{t.langsLabel}</small><span>{site.workLanguages}</span></div>
          <div className="facts">
            {site.facts.map((f) => <span key={f}>{f}</span>)}
          </div>
        </div>
      </div>
    </section>
  );
}
