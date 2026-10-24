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
          <div className="social">
            <a href={site.linkedin} target="_blank" rel="noopener noreferrer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.75h4v11.25H3zM9.75 9.75h3.83v1.54h.05c.53-1 1.84-2.06 3.79-2.06 4.05 0 4.8 2.67 4.8 6.13V21h-4v-4.98c0-1.19-.02-2.72-1.66-2.72-1.66 0-1.91 1.3-1.91 2.63V21h-4z"></path></svg>
              LinkedIn
            </a>
            <a href={site.github} target="_blank" rel="noopener noreferrer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.7 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z"></path></svg>
              GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
