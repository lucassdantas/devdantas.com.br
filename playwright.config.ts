import { defineConfig, devices } from "@playwright/test";

/*
 * Testes E2E num navegador de verdade, contra o site CONSTRUÍDO (`npm run build` antes).
 * O servidor é o mesmo do `npm start` (scripts/serve.mjs): headers do vercel.json + função.
 * Sem FORMSPREE_FORM_ID, nenhum e-mail real é enviado; o Turnstile e a API são simulados nos testes.
 *
 * Navegador: por padrão o Chromium do Playwright (`npx playwright install chromium`).
 * Para usar o Chrome instalado no computador: PW_CHANNEL=chrome npm run test:e2e
 */
const PORT = 4321;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://localhost:" + PORT,
    channel: process.env.PW_CHANNEL || undefined,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "node scripts/serve.mjs " + PORT,
    url: "http://localhost:" + PORT + "/pt",
    reuseExistingServer: !process.env.CI,
    env: { FORMSPREE_FORM_ID: "", TURNSTILE_SECRET_KEY: "" },
  },
});
