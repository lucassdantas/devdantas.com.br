# ADR-0002 — CSS do design portado, sem Tailwind

- **Status:** Aceita
- **Data:** 2026-10-23

## Contexto
O design aprovado (`landing.dc.html`) traz ~450 linhas de CSS com tokens, animações e breakpoints
finos. Exigência: fidelidade pixel a pixel.

## Decisão
Copiar o CSS para `src/styles/globals.css` quase literalmente (trocas mecânicas: fontes do
`next/font` e o tema escuro no `<html>`). Os ajustes de produção ficam separados, no fim do arquivo.

## Consequências
- Fidelidade máxima e comparação fácil com o design.
- CSS global (sem escopo por componente): os nomes de classe do design precisam continuar únicos.

## Alternativas consideradas
- **Tailwind** — reescrever tudo em utilitários tem alto risco de perder detalhes.
- **CSS Modules por componente** — dividir o CSS sem ganho real para uma página só.
