import Logo from "@/components/Logo";
import { LOCALES, site } from "@/config/site";

/** Visível só sem JavaScript (ou por um instante antes do redirecionamento). */
export default function RootPage() {
  return (
    <main className="wrap" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 28 }}>
      <Logo />
      <nav style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        {LOCALES.map((l) => (
          <a key={l} className="btn btn-s" href={"/" + l} hrefLang={site.htmlLang[l]} lang={site.htmlLang[l]}>{site.langName[l]}</a>
        ))}
      </nav>
    </main>
  );
}
