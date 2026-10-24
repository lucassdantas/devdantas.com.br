import { LOCALES } from "../../src/config/site";
import { expect, norm, test } from "./fixtures";

test.describe("páginas", () => {
  for (const lang of LOCALES) {
    test(`/${lang} carrega sem erros, sem violação de CSP e sem terceiros`, async ({ page, problems }) => {
      const external: string[] = [];
      page.on("request", (r) => { if (!r.url().startsWith("http://localhost")) external.push(r.url()); });
      await page.goto("/" + lang);
      await page.waitForLoadState("networkidle");
      await expect(page.locator("h1")).toBeVisible();
      expect(await page.locator("html").getAttribute("lang")).toMatch(new RegExp("^" + lang));
      expect(external, "requisições a outros domínios no carregamento").toEqual([]);
      expect(problems).toEqual([]);
    });
  }

  test("404 tem a marca e links para os idiomas", async ({ page }) => {
    const res = await page.goto("/pagina-que-nao-existe");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("link", { name: "Português" })).toBeVisible();
  });
});

test.describe("navegação e preferências", () => {
  test("raiz redireciona pelo idioma do navegador", async ({ browser }) => {
    for (const [locale, expected] of [["en-US", "/en"], ["fr-FR", "/fr"], ["ja-JP", "/pt"]]) {
      const ctx = await browser.newContext({ locale });
      const page = await ctx.newPage();
      await page.goto("/");
      await page.waitForURL("**" + expected);
      expect(new URL(page.url()).pathname).toBe(expected);
      await ctx.close();
    }
  });

  test("trocar o idioma mantém a âncora e salva a escolha", async ({ page, isMobile }) => {
    test.skip(isMobile, "o seletor da nav fica no menu no celular");
    await page.goto("/pt#orcamento");
    await Promise.all([page.waitForURL("**/de#orcamento"), page.locator("#lang").selectOption("de")]);
    await expect(page.locator("html")).toHaveAttribute("lang", "de");
    await page.goto("/");
    await page.waitForURL("**/de");
  });

  test("tema escuro fica salvo e aplica antes da primeira pintura", async ({ page }) => {
    await page.goto("/pt");
    await page.getByRole("button", { name: "Alternar tema" }).click();
    await expect(page.locator("html")).toHaveClass(/dark/);
    // na próxima visita, a classe já está lá quando o HTML termina de ser lido
    await page.addInitScript(() => {
      document.addEventListener("DOMContentLoaded", () => { (window as unknown as { __darkAtDCL: boolean }).__darkAtDCL = document.documentElement.classList.contains("dark"); });
    });
    await page.reload();
    expect(await page.evaluate(() => (window as unknown as { __darkAtDCL: boolean }).__darkAtDCL)).toBe(true);
  });

  test("primeira visita respeita o tema do sistema", async ({ browser }) => {
    const ctx = await browser.newContext({ colorScheme: "dark" });
    const page = await ctx.newPage();
    await page.goto("/pt");
    await expect(page.locator("html")).toHaveClass(/dark/);
    await ctx.close();
  });

  test("moeda escolhida fica salva", async ({ page, isMobile }) => {
    test.skip(isMobile, "o seletor da nav fica no menu no celular");
    await page.goto("/pt");
    await page.locator("#region").selectOption("EU");
    await expect(page.locator(".scard .price b").first()).toHaveText(/340\s€/);
    await page.reload();
    await expect(page.locator("#region")).toHaveValue("EU");
    await expect(page.locator(".scard .price b").first()).toHaveText(/340\s€/);
  });

  test("menu mobile: abre, troca a moeda e fecha ao navegar", async ({ page, isMobile }) => {
    test.skip(!isMobile, "só no celular");
    await page.goto("/pt");
    await page.getByRole("button", { name: "Abrir menu" }).click();
    const menu = page.locator("#mmenu");
    await menu.getByLabel("Moeda").selectOption("UK");
    await menu.getByRole("link", { name: "FAQ" }).click();
    await expect(menu).toBeHidden();
    await expect(page.locator(".mbar b")).toHaveText("£290");
  });
});

test.describe("layout e acessibilidade básica", () => {
  for (const width of [360, 390, 900, 1440]) {
    test(`sem rolagem horizontal em ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/pt");
      const sw = await page.evaluate(() => document.scrollingElement!.scrollWidth);
      expect(sw).toBeLessThanOrEqual(width);
    });
  }

  test("celular: barra fixa com total e sem botão flutuante", async ({ page, isMobile }) => {
    test.skip(!isMobile, "só no celular");
    await page.goto("/pt");
    await expect(page.locator(".mbar")).toBeVisible();
    await expect(page.locator(".wa-float")).toBeHidden();
    expect(norm(await page.locator(".mbar b").textContent())).toBe("R$ 1.800");
    // o campo de e-mail não pode ficar achatado no formulário em coluna
    const box = await page.locator("#email").boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(48);
  });

  test("desktop: botão flutuante do WhatsApp visível", async ({ page, isMobile }) => {
    test.skip(isMobile, "só no desktop");
    await page.goto("/pt");
    await expect(page.locator(".wa-float")).toBeVisible();
    await expect(page.locator(".mbar")).toBeHidden();
  });

  test("sem JavaScript o conteúdo continua visível", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto("/pt");
    const hidden = await page.$$eval(".rv", (els) => els.filter((e) => getComputedStyle(e).opacity !== "1").length);
    expect(hidden).toBe(0);
    await expect(page.locator(".note")).toBeVisible();
    await ctx.close();
  });

  test("seções aparecem ao rolar (reveal) e o FAQ é acessível", async ({ page }) => {
    await page.goto("/pt");
    const card = page.locator(".pcard").first();
    await card.scrollIntoViewIfNeeded();
    await expect(card).toHaveClass(/\bon\b/);
    const q = page.locator(".qbtn").nth(1);
    await q.scrollIntoViewIfNeeded();
    await q.click();
    await expect(q).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator(".qbtn").first()).toHaveAttribute("aria-expanded", "false");
  });
});

test.describe("política de privacidade", () => {
  test("abre pelo rodapé, sem erros, e volta para o site", async ({ page }) => {
    await page.goto("/pt");
    await page.locator("footer").getByRole("link", { name: "Política de privacidade" }).click();
    await expect(page).toHaveURL(/\/pt\/privacy$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Política de privacidade");
    await page.getByRole("link", { name: /Voltar ao site/ }).click();
    await expect(page).toHaveURL(/\/pt$/);
  });

  test("extras: o ✓ só aparece quando o item está marcado", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/pt#orcamento");
    const card = page.locator(".xcard").first();
    const check = card.locator(".box svg");
    await expect(check).toHaveCSS("opacity", "0");
    await card.click();
    await expect(check).toHaveCSS("opacity", "1");
  });
});
