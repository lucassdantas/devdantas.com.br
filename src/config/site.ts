/* =====================================================================
   CONFIG DO SITE — marca, contato, domínio e idiomas.
   Trocar número, e-mail ou domínio? É só mexer aqui (e no .env).
   ===================================================================== */

import type { RegionId } from "./pricing";

/** Idiomas com rota própria (/pt, /en…). Para adicionar um, veja o README. */
export const LOCALES = ["pt", "en", "es", "fr", "de"] as const;
export type Locale = (typeof LOCALES)[number];

export const site = {
  /** Nome da marca (aparece no título, rodapé e dados estruturados). */
  brand: "Dantas Studio",

  /** Seu nome (seção "Sobre" e mensagens). */
  owner: "Lucas Dantas",

  /** Cidade exibida no hero, no "Sobre" e nos dados estruturados. */
  city: "Rio de Janeiro",

  /** Fuso do relógio do hero. */
  timeZone: "America/Sao_Paulo",
  utcLabel: "UTC−3",

  // TODO(Lucas): domínio final, sem barra no fim. Usado em canonical, sitemap e Open Graph.
  domain: "https://devdantas.com.br",

  // TODO(Lucas): WhatsApp com DDI + DDD + número, só dígitos.
  // Pode ser definido pela variável NEXT_PUBLIC_WHATSAPP (tem prioridade).
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || "5521999999999",

  // TODO(Lucas): e-mail de contato do rodapé.
  email: "contato@dantasstudio.com",

  // ID do Formspree (o final de formspree.io/f/SEU_ID). Não é segredo: aparece no site.
  // A variável NEXT_PUBLIC_FORMSPREE_ID, se definida, tem prioridade.
  formspreeId: process.env.NEXT_PUBLIC_FORMSPREE_ID || "meaaojba",
  /** Assunto do e-mail que você recebe quando alguém pede o orçamento por e-mail. */
  quoteMailSubject: "Novo orçamento pelo site",

  /** Redes sociais (rodapé e dados estruturados). */
  linkedin: "https://www.linkedin.com/in/lucas-de-sousa-dantas",

  // TODO(Lucas): sua foto na seção "Sobre". Coloque o arquivo em public/ (ex.: public/lucas.jpg,
  // proporção 4:5) e escreva "/lucas.jpg" aqui. Com null, aparecem as iniciais.
  photo: null as string | null,
  photoInitials: "LD",

  /** Cor de destaque da marca (a "--brand" do design). */
  accent: "#1D94E3",

  /** Idioma usado quando o navegador não tem um dos idiomas suportados. */
  defaultLocale: "pt" as Locale,

  /** Região/moeda padrão de cada idioma. O visitante pode trocar no seletor. */
  langToRegion: { pt: "BR", en: "US", es: "LATAM", fr: "EU", de: "EU" } satisfies Record<Locale, RegionId>,

  /** Tag BCP 47 de cada idioma (atributo lang, hreflang e Open Graph). */
  htmlLang: { pt: "pt-BR", en: "en", es: "es", fr: "fr", de: "de" } satisfies Record<Locale, string>,
  ogLocale: { pt: "pt_BR", en: "en_US", es: "es_419", fr: "fr_FR", de: "de_DE" } satisfies Record<Locale, string>,

  /** Nome curto (nav) e nome completo (menu mobile) de cada idioma no seletor. */
  langShort: { pt: "PT", en: "EN", es: "ES", fr: "FR", de: "DE" } satisfies Record<Locale, string>,
  langName: { pt: "Português", en: "English", es: "Español", fr: "Français", de: "Deutsch" } satisfies Record<Locale, string>,

  /** Idiomas em que você atende (seção "Sobre" e dados estruturados). */
  workLanguages: "Português · English · Español",
  workLanguageTags: ["pt-BR", "en", "es"],

  /** Tecnologias da seção "Sobre". */
  facts: ["PHP · Laravel", "React · Next.js", "TypeScript", "Node.js", "Python", "WordPress · WooCommerce", "Docker · Linux", "n8n · IA"],

  /** Página 404 (não sabe o idioma do visitante, então mostra PT + EN e os links). */
  notFoundText: "Página não encontrada · Page not found",

  /** Marcas da faixa de clientes. */
  clients: ["Pure Detail", "Help Baterias", "Italínea Rio", "Guaraviton", "Precnet Investidor", "Parceiros Rubraz", "Corpore", "Mirante do Arvrão", "Carneiro & Carballido"],
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
