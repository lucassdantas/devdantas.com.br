import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";
import { LOCALES, isLocale, site, type Locale } from "@/config/site";
import { getDictionary } from "@/i18n";

/** Política de privacidade (/<idioma>/privacy). Os textos ficam em i18n → privacy. */

type Props = { params: Promise<{ lang: string }> };

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const p = getDictionary(lang).privacy;
  const languages: Record<string, string> = {};
  for (const l of LOCALES) languages[site.htmlLang[l]] = "/" + l + "/privacy";
  languages["x-default"] = "/" + site.defaultLocale + "/privacy";
  return {
    title: p.title + " | " + site.brand,
    description: p.description,
    alternates: { canonical: "/" + lang + "/privacy", languages },
    openGraph: { title: p.title + " | " + site.brand, description: p.description, url: "/" + lang + "/privacy" },
  };
}

/** Troca {email} {owner} {brand} {city} e transforma [texto](url) em link. */
function rich(text: string): ReactNode[] {
  const vars: Record<string, string> = { owner: site.owner, brand: site.brand, city: site.city };
  const out: ReactNode[] = [];
  const re = /\{email\}|\{(owner|brand|city)\}|\[([^\]]+)\]\((https:\/\/[^)]+)\)/g;
  let last = 0;
  for (const m of text.matchAll(re)) {
    out.push(text.slice(last, m.index));
    if (m[0] === "{email}") out.push(<a key={m.index} href={"mailto:" + site.email}>{site.email}</a>);
    else if (m[1]) out.push(vars[m[1]]);
    else out.push(<a key={m.index} href={m[3]} target="_blank" rel="noopener noreferrer">{m[2]}</a>);
    last = m.index! + m[0].length;
  }
  out.push(text.slice(last));
  return out;
}

export default async function PrivacyPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang as Locale);
  const p = t.privacy;
  return (
    <>
      <header className="nav">
        <div className="wrap">
          <div className="navin">
            <Logo href={"/" + lang} />
            <a className="btn btn-s legal-back" href={"/" + lang}>← {p.back}</a>
          </div>
        </div>
      </header>
      <main className="sec legal">
        <div className="wrap">
          <article>
            <span className="kicker mono">{site.brand}</span>
            <h1 className="h2">{p.title}</h1>
            <p className="legal-updated mono">{p.updated}</p>
            <p className="lead">{rich(p.intro)}</p>
            {p.sections.map((s) => (
              <section key={s.h}>
                <h2>{s.h}</h2>
                {s.p.map((para, i) => <p key={i}>{rich(para)}</p>)}
              </section>
            ))}
          </article>
        </div>
      </main>
      <Footer t={t} lang={lang as Locale} home={false} />
    </>
  );
}
