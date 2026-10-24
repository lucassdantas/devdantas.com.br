import { describe, expect, it } from "vitest";
import { SERVICE_IDS } from "@/config/pricing";
import { LOCALES } from "@/config/site";
import { getDictionary } from "@/i18n";
import pt from "@/i18n/pt";

/* Os idiomas precisam ter a mesma estrutura do pt.ts — o TypeScript já cobra as chaves;
   aqui conferimos também tamanho das listas e textos vazios. */

type Json = string | number | boolean | Json[] | { [k: string]: Json };

function shape(v: Json, path = "", out: string[] = []): string[] {
  if (Array.isArray(v)) {
    out.push(path + "[" + v.length + "]");
    v.forEach((x, i) => shape(x, path + "[" + i + "]", out));
  } else if (v && typeof v === "object") {
    for (const k of Object.keys(v).sort()) shape(v[k], path ? path + "." + k : k, out);
  } else out.push(path);
  return out;
}

function strings(v: Json, path = "", out: [string, string][] = []): [string, string][] {
  if (typeof v === "string") out.push([path, v]);
  else if (Array.isArray(v)) v.forEach((x, i) => strings(x, path + "[" + i + "]", out));
  else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) strings(x, path ? path + "." + k : k, out);
  return out;
}

describe("dicionários", () => {
  const base = shape(pt as unknown as Json);

  for (const lang of LOCALES) {
    const d = getDictionary(lang) as unknown as Json;

    it(`${lang}: mesma estrutura do pt (chaves e tamanho das listas)`, () => {
      expect(shape(d)).toEqual(base);
    });

    it(`${lang}: nenhum texto vazio ou com espaço sobrando`, () => {
      for (const [p, s] of strings(d)) {
        expect(s.trim(), `${lang}.${p}`).not.toBe("");
        expect(s, `${lang}.${p}`).toBe(s.trim());
      }
    });

    it(`${lang}: tem textos para todos os serviços`, () => {
      const t = getDictionary(lang);
      expect(Object.keys(t.services.items).sort()).toEqual([...SERVICE_IDS].sort());
    });

    it(`${lang}: título do Google com até 62 caracteres e descrição entre 100 e 160`, () => {
      const t = getDictionary(lang);
      expect(t.meta.title.length).toBeLessThanOrEqual(62);
      expect(t.meta.description.length).toBeGreaterThanOrEqual(100);
      expect(t.meta.description.length).toBeLessThanOrEqual(160);
    });

    it(`${lang}: título do hero e das seções sem espaço duplo (quebra o efeito palavra a palavra)`, () => {
      const t = getDictionary(lang);
      for (const s of [t.hero.t1, t.hero.t2, t.hero.t3, t.pain.title, t.services.title, t.security.title, t.work.title, t.calc.title, t.process.title, t.faq.title, t.final.title]) {
        expect(s).not.toMatch(/\s{2}/);
      }
    });
  }
});

describe("textos de proteção legal/comercial", () => {
  // Se você mudou de propósito, atualize aqui também — o teste existe para impedir mudança sem querer.
  it("\"Sem promessa milagrosa\" (pt) continua igual ao design aprovado", () => {
    expect(pt.security.noteTitle).toBe("Sem promessa milagrosa");
    expect(pt.security.note).toBe(
      "Para recuperar um site eu preciso de acesso à hospedagem, ao código e, de preferência, de backups do código e do banco de dados. Sem backup, faço o que for tecnicamente possível e te aviso disso antes. A melhor proteção é prevenir: backup automático e manutenção mensal.",
    );
  });

  it("aviso de valores fictícios (pt) continua igual", () => {
    expect(pt.calc.disc).toBe(
      "* Valores fictícios e apenas ilustrativos. Não constituem proposta comercial e podem ser bem diferentes do preço real, que só é definido após a análise do seu projeto.",
    );
  });

  it("todo idioma tem o aviso começando com asterisco (casa com o * do total)", () => {
    for (const lang of LOCALES) expect(getDictionary(lang).calc.disc.startsWith("* ")).toBe(true);
  });
});
