import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/*
 * Três grupos de teste (veja docs/operacao/testes.md):
 * - unit:        funções puras e a função serverless (Node, sem navegador);
 * - components:  componentes React em um DOM simulado (jsdom);
 * - integration: o site JÁ CONSTRUÍDO em out/ (rode `npm run build` antes).
 * Os testes de navegador de verdade (E2E) ficam no Playwright: tests/e2e.
 */
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  oxc: { jsx: { runtime: "automatic" } },
  test: {
    projects: [
      { extends: true, test: { name: "unit", environment: "node", include: ["tests/unit/**/*.test.ts"] } },
      {
        extends: true,
        test: { name: "components", environment: "jsdom", include: ["tests/components/**/*.test.tsx"], setupFiles: ["./tests/setup/dom.ts"] },
      },
      { extends: true, test: { name: "integration", environment: "node", include: ["tests/integration/**/*.test.ts"] } },
    ],
  },
});
