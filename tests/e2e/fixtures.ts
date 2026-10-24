import { test as base, expect, type Page } from "@playwright/test";

/**
 * Toda página de teste:
 * - registra erros de console, erros de JS e violações de CSP — e falha o teste se houver;
 * - bloqueia o Cloudflare de verdade (um teste pode trocar por um Turnstile falso).
 */
export const test = base.extend<{ problems: string[] }>({
  problems: async ({ page }, use) => {
    const problems: string[] = [];
    await page.addInitScript(() => {
      document.addEventListener("securitypolicyviolation", (e) => console.error("CSP " + e.violatedDirective + " " + e.blockedURI));
    });
    page.on("console", (m) => { if (m.type() === "error") problems.push("console: " + m.text()); });
    page.on("pageerror", (e) => problems.push("pageerror: " + e.message));
    await page.route("https://challenges.cloudflare.com/**", (r) => r.abort());
    await use(problems);
    expect(problems, "erros no navegador").toEqual([]);
  },
});

export { expect };

/** Troca espaços especiais do Intl ("R$ 1.800"). */
export const norm = (s: string | null) => (s ?? "").replace(/\s/g, " ").trim();

/** Turnstile falso servido no lugar do script da Cloudflare: entrega um token na hora. */
export async function fakeTurnstile(page: Page) {
  await page.unroute("https://challenges.cloudflare.com/**");
  await page.route("https://challenges.cloudflare.com/turnstile/**", (r) =>
    r.fulfill({
      contentType: "text/javascript",
      body: "window.turnstile={render:function(el,o){setTimeout(function(){o.callback('tok-e2e')},10);return 'w'},reset:function(){},remove:function(){}};",
    }),
  );
}

export const total = (page: Page) => page.locator("aside.sum .tot b");
