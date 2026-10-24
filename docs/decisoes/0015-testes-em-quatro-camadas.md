# ADR-0015 — Testes em quatro camadas + CI

- **Status:** Aceita
- **Data:** 2026-10-23

## Contexto
Pedido: "garantir que nada vai quebrar" — cálculo, textos legais, SEO, segurança, layout e performance.

## Decisão
| Camada | Ferramenta | Por quê |
| ------ | ---------- | ------- |
| Unitários | Vitest | Regras de negócio e config, rápidas |
| Componentes | Vitest + Testing Library + jsdom | Interação sem navegador |
| Integração | Vitest sobre `out/` + servidor local | O que só existe no HTML final (meta tags, CSP, segredos, headers) |
| E2E | Playwright, desktop + celular | CSS real, rolagem, navegação, console/CSP |

O GitHub Actions roda tudo a cada push. Nenhum teste envia e-mail de verdade.

## Consequências
- ~220 testes; `npm test` em segundos, `npm run test:all` em 1–2 min.
- O E2E precisa do navegador do Playwright (`npx playwright install chromium`) ou do Chrome local.

## Alternativas consideradas
- **Só E2E** — lento e ruim para apontar a causa de uma falha.
- **Lighthouse no CI** — muito variável em máquina compartilhada; as guardas de performance são
  determinísticas (orçamento de JS, nada de terceiros no carregamento).
