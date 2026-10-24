# ADR-0009 — Vercel em modo estático (`framework: null`)

- **Status:** Aceita
- **Data:** 2026-10-23

## Contexto
O build gera `out/`, e o `postbuild` altera os HTML (CSP). Era preciso garantir que a Vercel
publique exatamente esses arquivos.

## Decisão
`vercel.json` com `framework: null`, `buildCommand: "npm run build"`, `outputDirectory: "out"` e
`cleanUrls: true`. A função em `api/` é detectada à parte (`functions` declara `api/orcamento.ts`).

## Consequências
- Deploy previsível: o que o `npm run build` gera é o que vai ao ar (inclusive a CSP).
- `scripts/serve.mjs` reproduz isso localmente (headers, URLs limpas, função) para os testes.
