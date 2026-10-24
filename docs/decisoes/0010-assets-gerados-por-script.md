# ADR-0010 — Ícones, OG e imagens gerados por script e versionados

- **Status:** Aceita
- **Data:** 2026-10-23

## Contexto
Precisávamos de favicon e ícones a partir do símbolo da marca, imagem OG 1200×630 e prints em WebP.
Renderizar texto em imagem depende das fontes instaladas na máquina.

## Decisão
`scripts/generate-assets.mjs` (sharp + opentype.js) converte os textos em vetor com as fontes reais
da marca (via `@fontsource`) e gera tudo. É rodado à mão (`npm run assets`), e os resultados vão para o Git.

## Consequências
- Resultado idêntico em qualquer máquina; o build e o deploy não dependem do script.
- Uma imagem OG por idioma (com o título do hero).
- O opentype.js 2.0 tem dois bugs contornados no script (GSUB da JetBrains Mono e `toPathData` gerando `NaN`).
