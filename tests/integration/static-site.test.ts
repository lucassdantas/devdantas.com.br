import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { JSDOM } from "jsdom";
import { beforeAll, describe, expect, it } from "vitest";
import { LOCALES, site } from "@/config/site";
import { getDictionary } from "@/i18n";

/* Confere o site JÁ CONSTRUÍDO (out/). Rode `npm run build` antes. */

const OUT = path.resolve(__dirname, "../../out");
const read = (f: string) => fs.readFileSync(path.join(OUT, f), "utf8");
const exists = (f: string) => fs.existsSync(path.join(OUT, f.replace(/^\//, "")));

beforeAll(() => {
  if (!fs.existsSync(path.join(OUT, "pt.html"))) throw new Error("out/ não encontrado — rode `npm run build` antes dos testes de integração.");
});

function load(file: string) {
  const html = read(file);
  return { html, doc: new JSDOM(html).window.document };
}
const meta = (doc: Document, key: string) =>
  doc.querySelector(`meta[property="${key}"], meta[name="${key}"]`)?.getAttribute("content") ?? null;

describe.each(LOCALES)("página /%s", (lang) => {
  const t = getDictionary(lang);
  let doc: Document;
  let html: string;
  beforeAll(() => ({ doc, html } = load(lang + ".html")));

  it("idioma, título e descrição", () => {
    expect(doc.documentElement.lang).toBe(site.htmlLang[lang]);
    expect(doc.title).toBe(t.meta.title);
    expect(meta(doc, "description")).toBe(t.meta.description);
  });

  it("canonical e hreflang para todos os idiomas", () => {
    expect(doc.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(site.domain + "/" + lang);
    const alts = [...doc.querySelectorAll('link[rel="alternate"][hreflang]')].map((l) => [l.getAttribute("hreflang"), l.getAttribute("href")]);
    for (const l of LOCALES) expect(alts).toContainEqual([site.htmlLang[l], site.domain + "/" + l]);
    expect(alts).toContainEqual(["x-default", site.domain + "/" + site.defaultLocale]);
  });

  it("Open Graph e Twitter completos, com imagem que existe", () => {
    expect(meta(doc, "og:title")).toBe(t.meta.ogTitle);
    expect(meta(doc, "og:type")).toBe("website");
    expect(meta(doc, "og:locale")).toBe(site.ogLocale[lang]);
    expect(meta(doc, "og:url")).toBe(site.domain + "/" + lang);
    const img = meta(doc, "og:image")!;
    expect(img).toBe(site.domain + "/og/og-" + lang + ".png");
    expect(exists(new URL(img).pathname)).toBe(true);
    expect(meta(doc, "og:image:width")).toBe("1200");
    expect(meta(doc, "og:image:height")).toBe("630");
    expect(meta(doc, "twitter:card")).toBe("summary_large_image");
  });

  it("JSON-LD válido", () => {
    const blocks = [...doc.querySelectorAll('script[type="application/ld+json"]')];
    expect(blocks).toHaveLength(1);
    const ld = JSON.parse(blocks[0].textContent!);
    expect(ld["@graph"].map((n: { "@type": string }) => n["@type"])).toContain("ProfessionalService");
  });

  it("um H1, imagens com alt e todas as seções do design", () => {
    expect(doc.querySelectorAll("h1")).toHaveLength(1);
    for (const img of doc.querySelectorAll("img")) expect(img.hasAttribute("alt")).toBe(true);
    for (const id of ["top", "servicos", "seguranca", "resultados", "orcamento", "faq"]) expect(doc.getElementById(id), id).not.toBeNull();
    expect(doc.querySelectorAll(".pcard")).toHaveLength(3);
    expect(doc.querySelectorAll(".scard")).toHaveLength(8);
    expect(doc.querySelectorAll(".wcard")).toHaveLength(4);
    expect(doc.querySelectorAll(".qa")).toHaveLength(t.faq.items.length);
  });

  it("textos legais estão na página", () => {
    expect(doc.querySelector(".tsnote a")?.getAttribute("href")).toBe(t.calc.captchaUrl);
    expect(t.calc.captchaUrl).toMatch(/^https:\/\/www\.cloudflare\.com\/([a-z]{2}-[a-z]{2}\/)?turnstile-privacy-policy\/$/);
    expect(doc.querySelector(".note b")?.textContent).toBe(t.security.noteTitle);
    expect(doc.querySelector(".note p")?.textContent).toBe(t.security.note);
    expect(doc.querySelector(".disc:not(.tsnote)")?.textContent).toBe(t.calc.disc);
  });

  it("toda âncora interna aponta para um elemento existente", () => {
    for (const a of doc.querySelectorAll('a[href^="#"]')) {
      const id = a.getAttribute("href")!.slice(1);
      expect(doc.getElementById(id), "#" + id).not.toBeNull();
    }
  });

  it("links externos abrem com segurança; WhatsApp usa o número da config", () => {
    for (const a of doc.querySelectorAll('a[target="_blank"]')) {
      expect(a.getAttribute("rel"), a.getAttribute("href")!).toContain("noopener");
      expect(a.getAttribute("rel")).toContain("noreferrer");
    }
    const wa = [...doc.querySelectorAll('a[href^="https://wa.me/"]')];
    expect(wa.length).toBeGreaterThanOrEqual(5);
    for (const a of wa) expect(a.getAttribute("href")).toMatch(new RegExp("^https://wa\\.me/" + site.whatsapp + "\\?text="));
  });

  it("CSP <meta> antes de qualquer script, com o hash de cada script inline", () => {
    const cspAt = html.indexOf('http-equiv="Content-Security-Policy"');
    expect(cspAt).toBeGreaterThan(-1);
    expect(cspAt).toBeLessThan(html.indexOf("<script"));
    const policy = doc.querySelector('meta[http-equiv="Content-Security-Policy"]')!.getAttribute("content")!;
    expect(policy).not.toContain("unsafe-inline");
    expect(policy).toContain("object-src 'none'");
    for (const m of html.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/gi)) {
      const hash = crypto.createHash("sha256").update(m[1], "utf8").digest("base64");
      expect(policy).toContain("'sha256-" + hash + "'");
    }
  });

  it("scripts externos só do próprio site (nada de terceiros no carregamento)", () => {
    for (const s of doc.querySelectorAll("script[src]")) expect(s.getAttribute("src")).toMatch(/^\/_next\//);
    expect(html).not.toContain("challenges.cloudflare.com/turnstile"); // só carrega ao usar o formulário
    expect(html).not.toMatch(/fonts\.googleapis|fonts\.gstatic/);
  });

  it("nenhum segredo vazou para o HTML ou para o JS", () => {
    const js = fs.readdirSync(path.join(OUT, "_next/static/chunks")).filter((f) => f.endsWith(".js")).map((f) => read("_next/static/chunks/" + f)).join("\n");
    for (const text of [html, js]) {
      expect(text).not.toMatch(/formspree\.io\/f\//);
      expect(text).not.toMatch(/TURNSTILE_SECRET|FORMSPREE_FORM_ID/);
    }
  });
});

describe("arquivos do site", () => {
  it("raiz redireciona e não é indexada", () => {
    const { doc, html } = load("index.html");
    expect(meta(doc, "robots")).toContain("noindex");
    expect(html).toContain("location.replace");
    for (const l of LOCALES) expect(doc.querySelector(`a[href="/${l}"]`)).not.toBeNull();
  });

  it("404 com a marca e sem indexação", () => {
    const { doc } = load("404.html");
    expect(doc.title).toContain(site.brand);
    expect(meta(doc, "robots")).toContain("noindex");
  });

  it("sitemap com todos os idiomas e alternates", () => {
    const xml = read("sitemap.xml");
    for (const l of LOCALES) expect(xml).toContain(`<loc>${site.domain}/${l}</loc>`);
    expect(xml.match(/hreflang="x-default"/g)).toHaveLength(LOCALES.length);
  });

  it("robots.txt libera tudo e aponta o sitemap", () => {
    const txt = read("robots.txt");
    expect(txt).toMatch(/Allow: \//);
    expect(txt).toContain(site.domain + "/sitemap.xml");
  });

  it("ícones, manifest e imagens OG existem", () => {
    for (const f of ["favicon.ico", "favicon.svg", "icon-16.png", "icon-32.png", "icon-512.png", "apple-touch-icon.png", "manifest.webmanifest"]) expect(exists(f), f).toBe(true);
    for (const l of LOCALES) expect(exists(`og/og-${l}.png`)).toBe(true);
    const mf = JSON.parse(read("manifest.webmanifest"));
    expect(mf.name).toBe(site.brand);
  });

  it("orçamento de JavaScript: o que a página baixa no carregamento continua leve", () => {
    const { doc } = load("pt.html");
    const files = new Set([...doc.querySelectorAll("script[src]")].map((s) => s.getAttribute("src")!));
    const bytes = [...files].reduce((n, src) => n + fs.statSync(path.join(OUT, src)).size, 0);
    // Hoje ~600 KB sem compressão (~160 KB com brotli). Se passar disso, o PageSpeed corre risco.
    expect(bytes).toBeLessThan(750 * 1024);
  });
});

describe("vercel.json", () => {
  const cfg = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../vercel.json"), "utf8"));
  const headers = Object.fromEntries(cfg.headers[0].headers.map((h: { key: string; value: string }) => [h.key, h.value]));

  it("publica out/ como site estático com a função", () => {
    expect(cfg.outputDirectory).toBe("out");
    expect(cfg.buildCommand).toBe("npm run build");
    expect(cfg.functions).toHaveProperty(["api/orcamento.ts"]);
    expect(fs.existsSync(path.resolve(__dirname, "../../api/orcamento.ts"))).toBe(true);
  });

  it("headers de segurança presentes", () => {
    expect(headers["Strict-Transport-Security"]).toMatch(/max-age=\d{8}/);
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["X-Frame-Options"]).toBe("DENY");
    expect(headers["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["Permissions-Policy"]).toContain("camera=()");
    const csp = headers["Content-Security-Policy"];
    for (const d of ["default-src 'self'", "frame-ancestors 'none'", "object-src 'none'", "base-uri 'self'", "connect-src 'self'", "frame-src https://challenges.cloudflare.com"]) {
      expect(csp).toContain(d);
    }
    expect(csp).not.toContain("formspree"); // o navegador não fala com o Formspree
  });
});

describe.each(LOCALES)("política de privacidade /%s/privacy", (lang) => {
  const t = getDictionary(lang);
  let doc: Document;
  let html: string;
  beforeAll(() => ({ doc, html } = load(lang + "/privacy.html")));

  it("existe, no idioma certo, com título, canonical e hreflang", () => {
    expect(doc.documentElement.lang).toBe(site.htmlLang[lang]);
    expect(doc.querySelector("h1")?.textContent).toBe(t.privacy.title);
    expect(doc.title).toContain(t.privacy.title);
    expect(doc.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(site.domain + "/" + lang + "/privacy");
    expect(doc.querySelectorAll('link[rel="alternate"][hreflang]').length).toBe(LOCALES.length + 1);
  });

  it("todas as seções, sem placeholder sobrando e com o e-mail de contato", () => {
    expect(doc.querySelectorAll("article section")).toHaveLength(t.privacy.sections.length);
    const text = doc.querySelector("article")!.textContent!;
    expect(text).not.toMatch(/\{(email|owner|brand|city)\}|\]\(/);
    expect(doc.querySelector(`article a[href="mailto:${site.email}"]`)).not.toBeNull();
    expect(text).toContain("Formspree");
    expect(text).toContain("Turnstile");
  });

  it("links do rodapé voltam para a página do idioma (não para âncoras locais)", () => {
    for (const a of doc.querySelectorAll('footer a[href*="#"]')) expect(a.getAttribute("href")).toMatch(new RegExp("^/" + lang + "#"));
  });

  it("tem CSP com hash", () => {
    expect(html).toContain('http-equiv="Content-Security-Policy"');
  });
});

describe("links pessoais e da política na página principal", () => {
  it.each(LOCALES)("/%s tem LinkedIn, GitHub e o link da política no rodapé", (lang) => {
    const { doc } = load(lang + ".html");
    expect(doc.querySelectorAll(`a[href="${site.linkedin}"]`).length).toBeGreaterThanOrEqual(2);
    expect(doc.querySelectorAll(`a[href="${site.github}"]`).length).toBeGreaterThanOrEqual(2);
    expect(doc.querySelector(`footer a[href="/${lang}/privacy"]`)?.textContent).toBe(getDictionary(lang).footer.privacy);
  });

  it("sitemap inclui as políticas", () => {
    const xml = read("sitemap.xml");
    for (const l of LOCALES) expect(xml).toContain(`<loc>${site.domain}/${l}/privacy</loc>`);
  });
});
