/* =====================================================================
   Função serverless da Vercel: POST /api/orcamento
   Recebe o pedido de orçamento por e-mail, confere o Cloudflare Turnstile
   (prova de que é uma pessoa) e repassa ao Formspree.
   O ID do Formspree e a chave secreta do Turnstile ficam só aqui no servidor
   (variáveis de ambiente), nunca no navegador.

   Variáveis (Vercel → Settings → Environment Variables):
   - FORMSPREE_FORM_ID       final de https://formspree.io/f/SEU_ID
   - TURNSTILE_SECRET_KEY    Cloudflare → Turnstile → seu widget → Secret Key

   Este arquivo não importa nada do projeto de propósito: assim roda igual
   na Vercel, nos testes e no servidor local (scripts/serve.mjs).
   ===================================================================== */

export const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
export const FORMSPREE_URL = "https://formspree.io/f/";

/** Tamanho máximo do corpo da requisição (o resumo do orçamento tem ~1 KB). */
const MAX_BODY = 8_000;
/** Limite por IP: 5 envios a cada 10 minutos (por instância da função; é uma 2ª barreira, a 1ª é o Turnstile). */
const WINDOW_MS = 10 * 60_000;
const MAX_PER_WINDOW = 5;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Env = Record<string, string | undefined>;
type Fetch = typeof fetch;

const hits = new Map<string, number[]>();

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

/** Texto limpo e com tamanho máximo (ou "" se não for texto). */
function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function num(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0].trim() : "") || req.headers.get("x-real-ip") || "";
}

export function isRateLimited(ip: string, now = Date.now()): boolean {
  if (!ip) return false;
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5_000) hits.clear(); // não deixa a memória crescer sem limite
  return recent.length > MAX_PER_WINDOW;
}

/** Só para os testes. */
export function resetRateLimit(): void {
  hits.clear();
}

export async function handleQuote(req: Request, env: Env = process.env, fetchImpl: Fetch = fetch): Promise<Response> {
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  const secret = env.TURNSTILE_SECRET_KEY;
  const formId = env.FORMSPREE_FORM_ID;
  if (!secret || !formId) {
    console.error("api/orcamento: defina TURNSTILE_SECRET_KEY e FORMSPREE_FORM_ID");
    return json(500, { error: "not_configured" });
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY) return json(413, { error: "too_large" });

  let data: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("not an object");
    data = parsed as Record<string, unknown>;
  } catch {
    return json(400, { error: "invalid_json" });
  }

  // Campo invisível preenchido = robô. Responde "ok" para ele não tentar de novo, mas não envia nada.
  if (text(data._gotcha, 200)) return json(200, { ok: true });

  const email = text(data.email, 254);
  if (!EMAIL_RE.test(email)) return json(400, { error: "invalid_email" });

  const token = text(data.token, 4096);
  if (!token) return json(400, { error: "captcha_required" });

  const ip = clientIp(req);
  if (isRateLimited(ip)) return json(429, { error: "rate_limited" });

  // 1) Turnstile: o token é de uma pessoa, gerado para o nosso site, e ainda não foi usado?
  const verifyBody = new URLSearchParams({ secret, response: token });
  if (ip) verifyBody.set("remoteip", ip);
  let human = false;
  try {
    const res = await fetchImpl(TURNSTILE_VERIFY_URL, { method: "POST", body: verifyBody });
    const out = (await res.json()) as { success?: boolean };
    human = out.success === true;
  } catch {
    return json(502, { error: "captcha_unavailable" });
  }
  if (!human) return json(403, { error: "captcha_failed" });

  // 2) Formspree: envia o e-mail para você (Responder = responde ao visitante).
  const payload = {
    email,
    _replyto: email,
    _subject: text(data.subject, 200) || "Novo orçamento pelo site",
    message: text(data.message, 4000),
    service: text(data.service, 40),
    units: num(data.units),
    total: num(data.total),
    monthly: num(data.monthly),
    currency: text(data.currency, 8),
    region: text(data.region, 8),
    lang: text(data.lang, 8),
  };
  try {
    const res = await fetchImpl(FORMSPREE_URL + encodeURIComponent(formId), {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error("api/orcamento: Formspree respondeu", res.status, await res.text().catch(() => ""));
      return json(502, { error: "send_failed" });
    }
  } catch {
    return json(502, { error: "send_failed" });
  }

  return json(200, { ok: true });
}

/** Ponto de entrada da Vercel (assinatura Web padrão: Request → Response). */
export function POST(request: Request): Promise<Response> {
  return handleQuote(request);
}
