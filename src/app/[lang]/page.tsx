import { notFound } from "next/navigation";
import { isLocale } from "@/config/site";
import { getDictionary } from "@/i18n";
import { buildJsonLd } from "@/lib/jsonld";
import About from "@/components/About";
import Calculator from "@/components/Calculator";
import Clients from "@/components/Clients";
import Faq from "@/components/Faq";
import FinalCta from "@/components/FinalCta";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import MobileBar from "@/components/MobileBar";
import Nav from "@/components/Nav";
import PageEffects from "@/components/PageEffects";
import Pains from "@/components/Pains";
import Process from "@/components/Process";
import QuoteProvider from "@/components/QuoteProvider";
import Reveal from "@/components/Reveal";
import Security from "@/components/Security";
import Services from "@/components/Services";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import Work from "@/components/Work";

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);

  // Só os textos de que o estado da calculadora precisa (o resto é renderizado no build).
  const strings = {
    calc: { base: t.calc.base, extra: t.calc.extra, x: t.calc.x, perMonth: t.calc.perMonth, days: t.calc.days },
    services: { items: t.services.items },
    wa: t.wa,
  };

  const jsonLd = buildJsonLd(lang, t);

  return (
    <QuoteProvider lang={lang} strings={strings}>
      <Nav t={{ nav: t.nav, ui: t.ui }} />
      <main>
        <Hero t={t} />
        <Clients label={t.clients} />
        <Pains t={t.pain} />
        <Services t={t.services} />
        <Security t={t.security} waText={t.wa.security} />
        <Work t={t.work} />
        <Calculator t={t} />
        <Process t={t.process} guar={t.guar} />
        <About t={t.about} />
        <Faq t={t.faq} />
        <FinalCta t={t.final} waText={t.wa.direct} />
      </main>
      <Footer t={t} lang={lang} />
      <MobileBar total={t.calc.total} totalMonthly={t.calc.totalMonthly} perMonth={t.calc.perMonth} />
      <WhatsAppFloat label={t.ui.float} waText={t.wa.direct} />
      <Reveal />
      <PageEffects />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </QuoteProvider>
  );
}
