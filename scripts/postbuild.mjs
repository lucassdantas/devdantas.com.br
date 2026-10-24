/* =====================================================================
   Roda depois do `next build` (veja "build" no package.json).
   O Next coloca scripts inline em cada página (dados da hidratação e o
   script de tema). Aqui calculamos o SHA-256 de cada um e gravamos uma
   <meta> CSP por página, permitindo SÓ esses scripts: um script injetado
   (XSS) não roda, mesmo com o 'unsafe-inline' que o header precisa ter
   para funcionar em todas as páginas (veja vercel.json e o README).
   ===================================================================== */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const out = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "out");

function* htmlFiles(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* htmlFiles(p);
    else if (e.name.endsWith(".html")) yield p;
  }
}

const INLINE = /<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/gi;
let pages = 0;

for (const file of htmlFiles(out)) {
  let html = fs.readFileSync(file, "utf8");
  if (html.includes('http-equiv="Content-Security-Policy"')) continue;
  const hashes = new Set();
  for (const m of html.matchAll(INLINE)) {
    hashes.add("'sha256-" + crypto.createHash("sha256").update(m[1], "utf8").digest("base64") + "'");
  }
  const policy = ["script-src 'self' https://challenges.cloudflare.com", ...hashes].join(" ") + "; object-src 'none'; base-uri 'self'";
  const meta = `<meta http-equiv="Content-Security-Policy" content="${policy}"/>`;
  // A <meta> precisa vir antes de qualquer <script>.
  const charset = html.match(/<meta charSet="utf-8"\s*\/?>/i);
  html = charset ? html.replace(charset[0], charset[0] + meta) : html.replace(/<head[^>]*>/i, (h) => h + meta);
  const firstScript = html.search(/<script/i), metaAt = html.indexOf(meta);
  if (firstScript !== -1 && metaAt > firstScript) throw new Error("CSP <meta> ficou depois de um <script> em " + file);
  fs.writeFileSync(file, html);
  pages++;
  console.log("CSP", path.relative(out, file), hashes.size + " scripts inline");
}
console.log("postbuild: CSP em " + pages + " página(s)");
