import type { Locale } from "@/config/site";
import de from "./de";
import en from "./en";
import es from "./es";
import fr from "./fr";
import pt, { type Dictionary } from "./pt";

export type { Dictionary };

/** Para adicionar um idioma: crie o arquivo (copiando pt.ts), importe aqui e inclua em LOCALES (config/site.ts). */
const dictionaries: Record<Locale, Dictionary> = { pt, en, es, fr, de };

export function getDictionary(lang: Locale): Dictionary {
  return dictionaries[lang];
}
