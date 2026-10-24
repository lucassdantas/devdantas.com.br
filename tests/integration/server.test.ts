import { spawn, type ChildProcess } from "node:child_process";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/* Sobe o servidor local (scripts/serve.mjs, o mesmo do `npm start` e do E2E)
   e confere rotas, headers e a função /api/orcamento sem configuração. */

const ROOT = path.resolve(__dirname, "../..");
const PORT = 4300 + Math.floor(Math.random() * 500);
const BASE = "http://localhost:" + PORT;
let server: ChildProcess;

beforeAll(async () => {
  // Sem FORMSPREE_FORM_ID: a função nunca envia e-mail neste teste.
  const env = { ...process.env, FORMSPREE_FORM_ID: "", TURNSTILE_SECRET_KEY: "" };
  server = spawn(process.execPath, ["scripts/serve.mjs", String(PORT)], { cwd: ROOT, env, stdio: "pipe" });
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("servidor não subiu")), 15_000);
    server.stdout!.on("data", (d) => { if (String(d).includes("localhost")) { clearTimeout(timer); resolve(); } });
    server.on("exit", (code) => reject(new Error("servidor saiu: " + code)));
  });
}, 20_000);

afterAll(() => { server?.kill(); });

describe("servidor local (imita a Vercel)", () => {
  it("URLs limpas, redirect de .html e 404", async () => {
    expect((await fetch(BASE + "/pt")).status).toBe(200);
    const r = await fetch(BASE + "/pt.html", { redirect: "manual" });
    expect(r.status).toBe(308);
    expect(r.headers.get("location")).toBe("/pt");
    expect((await fetch(BASE + "/nao-existe")).status).toBe(404);
  });

  it("aplica os headers do vercel.json", async () => {
    const r = await fetch(BASE + "/en");
    expect(r.headers.get("content-security-policy")).toContain("frame-ancestors 'none'");
    expect(r.headers.get("strict-transport-security")).toContain("max-age=");
    expect(r.headers.get("x-frame-options")).toBe("DENY");
  });

  it("assets do Next com cache imutável", async () => {
    const html = await (await fetch(BASE + "/pt")).text();
    const js = html.match(/src="(\/_next\/static\/[^"]+\.js)"/)![1];
    const r = await fetch(BASE + js);
    expect(r.status).toBe(200);
    expect(r.headers.get("cache-control")).toContain("immutable");
  });

  it("/api/orcamento sem configuração recusa (e não envia nada)", async () => {
    const r = await fetch(BASE + "/api/orcamento", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: "a@b.co", token: "x" }) });
    expect(r.status).toBe(500);
    // o servidor local usa o segredo de teste do Turnstile; só o Formspree fica faltando
    expect(await r.json()).toEqual({ error: "not_configured", missing: ["FORMSPREE_FORM_ID"] });
  });
});
