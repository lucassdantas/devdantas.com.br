/* =====================================================================
   Gera os assets estáticos (rode `npm run assets` depois de trocar algo):
   - src/assets/projects/*.webp  ← dantas-studio-handoff/assets/projects/*.jpg
   - public/favicon.svg, favicon.ico, icon-16/32/512.png, apple-touch-icon.png
   - public/og/og-<idioma>.png (1200×630, com o título do hero de cada idioma)
   Os textos viram vetores (via opentype.js) para não depender de fontes instaladas.
   ===================================================================== */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import opentype from "opentype.js";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const p = (...s) => path.join(root, ...s);

const sans = opentype.parse(fs.readFileSync(p("node_modules/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-800-normal.woff")).buffer);
const mono = opentype.parse(fs.readFileSync(p("node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff")).buffer);

/** Desenha um texto com letter-spacing (em) e devolve { d, width }. */
function text(font, str, x, baseline, size, spacing = 0) {
  const scale = size / font.unitsPerEm;
  // caractere → glifo sem shaping (o opentype.js não suporta o GSUB da JetBrains Mono)
  const glyphs = Array.from(str.normalize("NFC"), (ch) => font.charToGlyph(ch));
  let cx = x, d = "";
  glyphs.forEach((g, i) => {
    d += pathData(g.getPath(cx, baseline, size));
    cx += g.advanceWidth * scale + spacing * size;
    if (i < glyphs.length - 1) cx += font.getKerningValue(g, glyphs[i + 1]) * scale;
  });
  return { d, width: cx - x };
}
// toPathData() do opentype.js 2.0 às vezes gera "NaN"; serializamos os comandos aqui.
function pathData(path) {
  const n = (v) => +v.toFixed(2);
  return path.commands.map((c) => {
    if (c.type === "M" || c.type === "L") return c.type + n(c.x) + " " + n(c.y);
    if (c.type === "Q") return "Q" + n(c.x1) + " " + n(c.y1) + " " + n(c.x) + " " + n(c.y);
    if (c.type === "C") return "C" + n(c.x1) + " " + n(c.y1) + " " + n(c.x2) + " " + n(c.y2) + " " + n(c.x) + " " + n(c.y);
    return "Z";
  }).join("");
}
const measure = (font, str, size, spacing = 0) => text(font, str, 0, 0, size, spacing).width;

/* ---------- imagens dos cases ---------- */
const srcDir = p("dantas-studio-handoff/assets/projects");
fs.mkdirSync(p("src/assets/projects"), { recursive: true });
for (const f of fs.readdirSync(srcDir).filter((f) => f.endsWith(".jpg"))) {
  const out = p("src/assets/projects", f.replace(/\.jpg$/, ".webp"));
  await sharp(path.join(srcDir, f)).webp({ quality: 82, effort: 6 }).toFile(out);
  console.log("webp", path.basename(out), fs.statSync(out).size);
}

/* ---------- ícone: quadrado azul + "d" branco + ponto azul-claro ---------- */
function iconSvg() {
  const S = 512, size = S * 60 / 96, em = size;
  const scale = size / sans.unitsPerEm;
  const asc = sans.tables.hhea.ascender * scale, desc = -sans.tables.hhea.descender * scale;
  const top = (S - size) / 2;
  const baseline = top + (size - (asc + desc)) / 2 + asc;
  const dAdv = measure(sans, "d", size, -0.06);
  const total = dAdv + 0.04 * em + 0.2 * em;
  const x0 = (S - total) / 2;
  const glyph = text(sans, "d", x0, baseline, size).d;
  const dotX = x0 + dAdv + 0.04 * em, dotB = S - 0.27 * em, dot = 0.2 * em;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}"><rect width="${S}" height="${S}" rx="${(S * 26 / 96).toFixed(1)}" fill="#0B6CB5"/><path d="${glyph}" fill="#FFFFFF"/><rect x="${dotX.toFixed(1)}" y="${(dotB - dot).toFixed(1)}" width="${dot.toFixed(1)}" height="${dot.toFixed(1)}" rx="${(0.03 * em).toFixed(1)}" fill="#5CB8F2"/></svg>`;
}
const icon = iconSvg();
fs.writeFileSync(p("public/favicon.svg"), icon);
const png = (s) => sharp(Buffer.from(icon), { density: 300 }).resize(s, s).png({ compressionLevel: 9 }).toBuffer();
for (const [name, s] of [["icon-16.png", 16], ["icon-32.png", 32], ["apple-touch-icon.png", 180], ["icon-512.png", 512]]) {
  fs.writeFileSync(p("public", name), await png(s));
}
// favicon.ico com PNGs 16, 32 e 48 dentro
{
  const sizes = [16, 32, 48], imgs = await Promise.all(sizes.map(png));
  const head = Buffer.alloc(6 + 16 * sizes.length);
  head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(sizes.length, 4);
  let offset = head.length;
  sizes.forEach((s, i) => {
    const e = 6 + i * 16;
    head.writeUInt8(s, e); head.writeUInt8(s, e + 1); head.writeUInt16LE(1, e + 4); head.writeUInt16LE(32, e + 6);
    head.writeUInt32LE(imgs[i].length, e + 8); head.writeUInt32LE(offset, e + 12);
    offset += imgs[i].length;
  });
  fs.writeFileSync(p("public/favicon.ico"), Buffer.concat([head, ...imgs]));
}
console.log("icons ok");

/* ---------- Open Graph 1200×630 por idioma ---------- */
const LANGS = ["pt", "en", "es", "fr", "de"];
fs.mkdirSync(p("public/og"), { recursive: true });
for (const lang of LANGS) {
  const t = (await import(pathToUrl(p("src/i18n", lang + ".ts")))).default;
  const W = 1200, H = 630, X = 80;
  // wordmark: "dantas" + ponto + | STUDIO
  const wmSize = 56, wm = text(sans, "dantas", X, 136, wmSize, -0.055);
  const dot = 0.22 * wmSize, dotX = X + wm.width + 0.05 * wmSize;
  const lineX = dotX + dot + 22;
  const studio = text(mono, "STUDIO", lineX + 20, 128, 17, 0.16);
  // título: t1 (branco) + t2 (azul), reduz a fonte se não couber
  let hs = 80;
  while (Math.max(measure(sans, t.hero.t1, hs, -0.045), measure(sans, t.hero.t2, hs, -0.045)) > W - 2 * X && hs > 40) hs -= 2;
  const l1 = text(sans, t.hero.t1, X, 340, hs, -0.045);
  const l2 = text(sans, t.hero.t2, X, 340 + hs * 1.08, hs, -0.045);
  let es = 18;
  const eyebrow = t.hero.eyebrow.toUpperCase();
  while (measure(mono, eyebrow, es, 0.08) > W - 2 * X - 24 && es > 12) es -= 1;
  const eb = text(mono, eyebrow, X + 24, 556, es, 0.08);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<rect width="${W}" height="${H}" fill="#16233A"/>
<circle cx="1080" cy="60" r="480" fill="#5CB8F2" fill-opacity=".03"/>
<circle cx="1080" cy="60" r="400" fill="#5CB8F2" fill-opacity=".04"/>
<circle cx="1080" cy="60" r="320" fill="#16233A" stroke="#5CB8F2" stroke-opacity=".18" stroke-width="1.5"/>
<path d="${wm.d}" fill="#E8EEF6"/>
<rect x="${dotX.toFixed(1)}" y="${(136 - dot).toFixed(1)}" width="${dot.toFixed(1)}" height="${dot.toFixed(1)}" rx="3" fill="#1D94E3"/>
<rect x="${lineX.toFixed(1)}" y="106" width="1.5" height="30" fill="#2B3F5C"/>
<path d="${studio.d}" fill="#9AABC2"/>
<path d="${l1.d}" fill="#E8EEF6"/>
<path d="${l2.d}" fill="#5CB8F2"/>
<circle cx="${X + 6}" cy="${556 - es * 0.36}" r="6" fill="#22C55E"/>
<path d="${eb.d}" fill="#A9B7CB"/>
</svg>`;
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(p("public/og", `og-${lang}.png`));
  console.log("og", lang, hs);
}

function pathToUrl(file) {
  return "file:///" + file.replace(/\\/g, "/").replace(/^\//, "");
}
