/* =====================================================================
   Servidor local que imita a Vercel (usado por `npm start` e pelos testes E2E):
   - serve a pasta out/ com cleanUrls (/pt → pt.html) e 404.html;
   - aplica os mesmos headers do vercel.json;
   - comprime com brotli (como a Vercel);
   - roda a função api/orcamento.ts em POST /api/orcamento.
   Variáveis: lê .env.local se existir. Sem TURNSTILE_SECRET_KEY, usa a chave
   de TESTE da Cloudflare (sempre passa). Sem FORMSPREE_FORM_ID, a função
   responde "not_configured" — nenhum e-mail é enviado.
   uso: node scripts/serve.mjs [porta]
   ===================================================================== */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "out");
const port = Number(process.argv[2] || process.env.PORT || 4173);

try { process.loadEnvFile(path.join(root, ".env.local")); } catch {}
process.env.TURNSTILE_SECRET_KEY ||= "1x0000000000000000000000000000000AA";

if (!fs.existsSync(out)) {
  console.error("Pasta out/ não existe. Rode `npm run build` antes.");
  process.exit(1);
}

const { handleQuote } = await import("../api/orcamento.ts");
const cfg = JSON.parse(fs.readFileSync(path.join(root, "vercel.json"), "utf8"));
const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8", ".xml": "application/xml", ".json": "application/json", ".webmanifest": "application/manifest+json",
};

function headersFor(url) {
  const h = {};
  for (const rule of cfg.headers) {
    const re = new RegExp("^" + rule.source.replace(/\(\.\*\)/g, ".*") + "$");
    if (re.test(url)) for (const { key, value } of rule.headers) h[key] = value;
  }
  return h;
}

async function api(req, res, url) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const request = new Request("http://localhost" + url, {
    method: req.method,
    headers: { "content-type": req.headers["content-type"] || "", "x-forwarded-for": req.socket.remoteAddress || "" },
    body: ["GET", "HEAD"].includes(req.method) ? undefined : Buffer.concat(chunks),
  });
  const response = await handleQuote(request);
  res.writeHead(response.status, { ...Object.fromEntries(response.headers), ...headersFor(url) });
  res.end(Buffer.from(await response.arrayBuffer()));
}

http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);
  if (url === "/api/orcamento") return void api(req, res, url).catch((e) => { console.error(e); res.writeHead(500).end(); });
  if (url.endsWith(".html")) { res.writeHead(308, { Location: url.slice(0, -5) }); return res.end(); }
  let file = url === "/" ? path.join(out, "index.html") : path.join(out, url);
  if (!file.startsWith(out)) { res.writeHead(400); return res.end(); }
  if (url !== "/" && !path.extname(url) && fs.existsSync(file + ".html")) file += ".html";
  let status = 200;
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) { file = path.join(out, "404.html"); status = 404; }
  const type = TYPES[path.extname(file)] || "application/octet-stream";
  const br = /text|javascript|json|xml|svg|manifest/.test(type) && /\bbr\b/.test(req.headers["accept-encoding"] || "");
  res.writeHead(status, { "Content-Type": type, ...(br ? { "Content-Encoding": "br" } : {}), ...headersFor(url) });
  const rs = fs.createReadStream(file);
  (br ? rs.pipe(zlib.createBrotliCompress()) : rs).pipe(res);
}).listen(port, () => console.log("Site em http://localhost:" + port));
