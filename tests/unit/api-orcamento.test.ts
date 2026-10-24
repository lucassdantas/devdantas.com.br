import { beforeEach, describe, expect, it, vi } from "vitest";
import { FORMSPREE_URL, TURNSTILE_VERIFY_URL, handleQuote, resetRateLimit } from "../../api/orcamento";

/* A função serverless, com Cloudflare e Formspree simulados (nenhum e-mail é enviado). */

const ENV = { TURNSTILE_SECRET_KEY: "segredo-ts", FORMSPREE_FORM_ID: "abc123" };
const VALID = { email: "cliente@exemplo.com", token: "tok-ok", message: "Resumo", subject: "Assunto", service: "landing", total: 1800, units: 5, currency: "BRL", region: "BR", lang: "pt", _gotcha: "" };

function req(body: unknown, { method = "POST", ip = "203.0.113.7" } = {}) {
  return new Request("https://devdantas.com.br/api/orcamento", {
    method,
    headers: { "content-type": "application/json", "x-forwarded-for": ip + ", 10.0.0.1" },
    body: method === "GET" ? undefined : typeof body === "string" ? body : JSON.stringify(body),
  });
}

/** fetch falso: responde como Cloudflare e Formspree e guarda o que recebeu. */
function upstream({ human = true, formspreeStatus = 200 } = {}) {
  const calls: { url: string; init: RequestInit }[] = [];
  const fn = vi.fn(async (url: string | URL | Request, init: RequestInit = {}) => {
    calls.push({ url: String(url), init });
    if (String(url) === TURNSTILE_VERIFY_URL) return Response.json({ success: human });
    return new Response("{}", { status: formspreeStatus });
  });
  return { fn: fn as unknown as typeof fetch, calls };
}

beforeEach(() => resetRateLimit());

describe("POST /api/orcamento", () => {
  it("caminho feliz: confere o Turnstile e envia ao Formspree", async () => {
    const up = upstream();
    const res = await handleQuote(req(VALID), ENV, up.fn);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });

    const [verify, send] = up.calls;
    expect(verify.url).toBe(TURNSTILE_VERIFY_URL);
    const form = verify.init.body as URLSearchParams;
    expect(form.get("secret")).toBe("segredo-ts");
    expect(form.get("response")).toBe("tok-ok");
    expect(form.get("remoteip")).toBe("203.0.113.7");

    expect(send.url).toBe(FORMSPREE_URL + "abc123");
    const payload = JSON.parse(send.init.body as string);
    expect(payload).toMatchObject({ email: "cliente@exemplo.com", _replyto: "cliente@exemplo.com", _subject: "Assunto", message: "Resumo", total: 1800 });
    expect(payload).not.toHaveProperty("token");
  });

  it("recusa sem configuração (não envia nada) e diz qual variável falta", async () => {
    const up = upstream();
    const res = await handleQuote(req(VALID), { FORMSPREE_FORM_ID: "abc" }, up.fn);
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "not_configured", missing: ["TURNSTILE_SECRET_KEY"] });
    expect(up.calls).toHaveLength(0);
  });

  it("ignora espaços e quebras de linha coladas junto com os valores", async () => {
    const up = upstream();
    const res = await handleQuote(req(VALID), { TURNSTILE_SECRET_KEY: "  segredo-ts\n", FORMSPREE_FORM_ID: " abc123 " }, up.fn);
    expect(res.status).toBe(200);
    expect((up.calls[0].init.body as URLSearchParams).get("secret")).toBe("segredo-ts");
    expect(up.calls[1].url).toBe(FORMSPREE_URL + "abc123");
  });

  it("só aceita POST", async () => {
    expect((await handleQuote(req(null, { method: "GET" }), ENV, upstream().fn)).status).toBe(405);
  });

  it("valida JSON, e-mail e token antes de chamar alguém", async () => {
    const up = upstream();
    expect((await handleQuote(req("{nao é json"), ENV, up.fn)).status).toBe(400);
    expect((await handleQuote(req([1, 2]), ENV, up.fn)).status).toBe(400);
    expect((await handleQuote(req({ ...VALID, email: "sem-arroba" }), ENV, up.fn)).status).toBe(400);
    expect((await handleQuote(req({ ...VALID, token: "" }), ENV, up.fn)).status).toBe(400);
    expect(up.calls).toHaveLength(0);
  });

  it("recusa corpo grande demais", async () => {
    const res = await handleQuote(req({ ...VALID, message: "x".repeat(9000) }), ENV, upstream().fn);
    expect(res.status).toBe(413);
  });

  it("campo invisível preenchido: finge sucesso e não envia", async () => {
    const up = upstream();
    const res = await handleQuote(req({ ...VALID, _gotcha: "http://spam" }), ENV, up.fn);
    expect(res.status).toBe(200);
    expect(up.calls).toHaveLength(0);
  });

  it("Turnstile reprovado: 403 e nada vai para o Formspree", async () => {
    const up = upstream({ human: false });
    const res = await handleQuote(req(VALID), ENV, up.fn);
    expect(res.status).toBe(403);
    expect(up.calls.map((c) => c.url)).toEqual([TURNSTILE_VERIFY_URL]);
  });

  it("erro no Formspree vira 502", async () => {
    const res = await handleQuote(req(VALID), ENV, upstream({ formspreeStatus: 422 }).fn);
    expect(res.status).toBe(502);
  });

  it("limita a 5 envios por IP a cada 10 minutos", async () => {
    const up = upstream();
    for (let i = 0; i < 5; i++) expect((await handleQuote(req(VALID), ENV, up.fn)).status).toBe(200);
    expect((await handleQuote(req(VALID), ENV, up.fn)).status).toBe(429);
    expect((await handleQuote(req(VALID, { ip: "198.51.100.2" }), ENV, up.fn)).status).toBe(200);
  });

  it("corta campos longos e ignora números inválidos", async () => {
    const up = upstream();
    await handleQuote(req({ ...VALID, subject: "a".repeat(500), total: "1800" }), ENV, up.fn);
    const payload = JSON.parse(up.calls[1].init.body as string);
    expect(payload._subject).toHaveLength(200);
    expect(payload.total).toBeUndefined();
  });

  it("resposta nunca é cacheada", async () => {
    const res = await handleQuote(req(VALID), ENV, upstream().fn);
    expect(res.headers.get("cache-control")).toBe("no-store");
  });
});
