import { expect, fakeTurnstile, norm, test, total } from "./fixtures";

test.describe("calculadora", () => {
  test("\"Simular\" seleciona o serviço e rola até a calculadora", async ({ page }) => {
    await page.goto("/pt");
    await page.locator("#servicos .sim").nth(2).click();
    await expect(page).toHaveURL(/#orcamento$/);
    await expect(page.getByRole("button", { name: "E-commerce", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(total(page)).toHaveText(/R\$\s5\.900/);
  });

  test("fluxo completo atualiza total, linhas, prazo, barra mobile e mensagem do WhatsApp", async ({ page }) => {
    await page.goto("/pt#orcamento");
    await page.getByRole("button", { name: "E-commerce", exact: true }).click();
    await page.locator("#units").fill("50");
    await page.getByRole("button", { name: /SEO avançado/ }).click();
    await page.getByRole("button", { name: /Entrega expressa/ }).click();

    await expect(total(page)).toHaveText(/R\$\s9\.230/); // espera a contagem animada terminar
    await expect(page.locator("aside.sum .meta b").first()).toHaveText("~16 dias úteis");
    expect(norm(await page.locator(".mbar b").textContent())).toBe("R$ 9.230");

    const href = await page.locator("aside.sum a.btn-wa").getAttribute("href");
    const msg = norm(decodeURIComponent(href!.split("text=")[1]));
    expect(msg).toContain("• Serviço: E-commerce");
    expect(msg).toContain("• Tamanho: 50 produtos");
    expect(msg).toContain("• Extras: +20 produtos adicionais, SEO avançado, Entrega expressa +30%");
    expect(msg).toContain("• Estimativa: R$ 9.230 (BRL)");
  });

  test("em inglês, a moeda padrão é dólar e a mensagem sai em inglês", async ({ page }) => {
    await page.goto("/en#orcamento");
    await expect(total(page)).toHaveText("$790");
    const href = await page.locator("aside.sum a.btn-wa").getAttribute("href");
    expect(decodeURIComponent(href!)).toContain("Hi Lucas!");
  });
});

test.describe("envio por e-mail", () => {
  test("Turnstile só é baixado quando a pessoa usa o formulário", async ({ page }) => {
    const ts: string[] = [];
    page.on("request", (r) => { if (r.url().includes("challenges.cloudflare.com")) ts.push(r.url()); });
    await page.goto("/pt#orcamento");
    await page.waitForLoadState("networkidle");
    expect(ts, "Turnstile no carregamento da página").toEqual([]);
    await page.locator("#email").focus();
    await expect.poll(() => ts.length).toBeGreaterThan(0);
  });

  test("sucesso: manda e-mail, token e resumo para /api/orcamento", async ({ page }) => {
    await fakeTurnstile(page);
    let body: Record<string, unknown> = {};
    await page.route("**/api/orcamento", async (r) => {
      body = r.request().postDataJSON();
      await r.fulfill({ json: { ok: true } });
    });
    await page.goto("/pt#orcamento");
    await page.locator("#email").fill("cliente@exemplo.com");
    await page.getByRole("button", { name: "Enviar", exact: true }).click();
    await expect(page.getByRole("status")).toHaveText(/Recebido!/);
    expect(body).toMatchObject({ email: "cliente@exemplo.com", token: "tok-e2e", service: "landing", currency: "BRL", lang: "pt" });
    expect(String(body.message)).toContain("Olá, Lucas!");
  });

  test("falha no servidor: mostra o aviso e permite tentar de novo", async ({ page, problems }) => {
    await fakeTurnstile(page);
    await page.route("**/api/orcamento", (r) => r.fulfill({ status: 502, json: { error: "send_failed" } }));
    await page.goto("/pt#orcamento");
    await page.locator("#email").fill("cliente@exemplo.com");
    await page.getByRole("button", { name: "Enviar", exact: true }).click();
    await expect(page.locator(".mailerr")).toHaveText(/Não foi possível enviar/); // (o Next também tem um role="alert" na página)
    await expect(page.getByRole("button", { name: "Enviar", exact: true })).toBeEnabled();
    problems.splice(0); // o 502 simulado aparece no console de propósito
  });

  test("a função de verdade recusa quando não está configurada", async ({ request }) => {
    const res = await request.post("/api/orcamento", { data: { email: "a@b.co", token: "x" } });
    expect(res.status()).toBe(500);
  });
});
