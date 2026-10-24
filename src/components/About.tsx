import { site } from "@/config/site";
import type { Dictionary } from "@/i18n";

/** Foto responsiva: AVIF (menor) com WebP de reserva, 400 ou 800 px conforme a tela. Gerada por `npm run assets`. */
function Photo({ base }: { base: string }) {
  const set = (ext: string) => `${base}-400.${ext} 400w, ${base}-800.${ext} 800w`;
  const sizes = "(max-width: 640px) calc(100vw - 32px), (max-width: 920px) 360px, 440px";
  return (
    <picture>
      <source type="image/avif" srcSet={set("avif")} sizes={sizes} />
      <source type="image/webp" srcSet={set("webp")} sizes={sizes} />
      <img src={`${base}-800.webp`} alt={site.owner} width={800} height={1000} loading="lazy" decoding="async" style={{ objectPosition: site.photoFocus }} />
    </picture>
  );
}

export default function About({ t }: { t: Dictionary["about"] }) {
  const [first, ...rest] = site.owner.split(" ");
  return (
    <section className="sec" style={{ paddingTop: 0 }}>
      <div className="wrap about">
        <div className={site.photo ? "ph rv has-photo" : "ph rv"}>
          {/* Sem foto (site.photo = null), mostra as iniciais. */}
          {site.photo ? <Photo base={site.photo} /> : <b>{site.photoInitials}</b>}
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
