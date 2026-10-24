# Estilos e animações

## Origem

Todo o CSS está em `src/styles/globals.css` e foi **copiado do design** (`dantas-studio-handoff/design/landing.dc.html`,
bloco `<style>`), com poucas trocas mecânicas. O arquivo tem duas partes:

1. **Portado do design** — não "melhore" por conta própria; o design é a referência.
2. **Ajustes de produção** (no fim, comentados) — cada um tem motivo; veja [ADR-0011](../decisoes/0011-ajustes-intencionais-no-design.md).

Trocas mecânicas em relação ao design:

| Design                              | Produção                                     |
| ----------------------------------- | -------------------------------------------- |
| `font-family: "Plus Jakarta Sans"`  | `var(--font-sans)` (definida pelo `next/font`) |
| `font-family: "JetBrains Mono"`     | `var(--font-mono)`                           |
| `.ds.dark { … }` no wrapper         | `.dark .ds { … }` — `dark` no `<html>`, `ds` no `<body>` |
| `style="--brand: {{accent}}"`       | `style={{ "--brand": site.accent }}` no `<body>` |

## Tokens

Definidos em `.ds` (claro) e `.dark .ds` (escuro): `--bg --bg2 --card --line --ink --ink2 --brandInk --btn --onBtn --soft --shadow`,
mais `--brand` (cor de destaque, `site.accent`). Os cinzas passam no contraste AA — **não clareie**.

## Breakpoints (do design)

| Largura   | O que muda                                                        |
| --------- | ----------------------------------------------------------------- |
| ≤ 1100px  | Calculadora em 1 coluna, serviços em 2 colunas                     |
| ≤ 1080px  | Nav vira hambúrguer; seletores vão para o menu                     |
| ≤ 920px   | Hero, segurança e "Sobre" em 1 coluna                              |
| ≤ 640px   | Cards viram carrossel com scroll-snap; barra fixa (MobileBar) aparece e o botão flutuante some |
| ≤ 400px   | (ajuste) botão de WhatsApp do resumo pode quebrar linha            |

## Animações

Sem biblioteca: CSS + `IntersectionObserver`.

| Efeito                          | Onde                                    | Como                                                     |
| ------------------------------- | --------------------------------------- | -------------------------------------------------------- |
| Entrada do hero                 | `.in`, `.d1…d5`                         | `@keyframes rise` com atrasos                            |
| Título palavra por palavra      | `SplitWords.tsx` + `.split .w`          | Cada palavra num `<span>` com `animation-delay`; texto completo no `aria-label` |
| Print em cortina                | `.shot`, `.wcard .wimg img`             | `@keyframes imgin` (clip-path + escala)                  |
| Reveal ao rolar                 | `.rv` → `.rv.on`                        | `Reveal.tsx` adiciona `js-rv` no `<html>` e `on` quando o bloco entra na tela (uma vez) |
| Stagger dos cards               | `.g3/.g4/.g2/.g4p > .rv.on:nth-child(n)` | atrasos de 0,1 s                                         |
| Spotlight no mouse              | `.scard:before`, `.wcard:before`        | `PageEffects.tsx` atualiza `--mx/--my` (um listener só, delegado) |
| Progresso de rolagem na nav     | `.nav:after`                            | `animation-timeline: scroll()`; fallback em JS (`--sp`) onde não há suporte |
| Contagem do total + pulse       | `.tot b.pa/.pb`                         | `useCountUp` no `QuoteProvider`; a classe alterna para reiniciar o pulse |
| Checklist de segurança          | `ScanBox.tsx`                           | Um passo a cada 850 ms, 10 passos e recomeça             |

### Movimento reduzido

Com `prefers-reduced-motion: reduce`, o CSS desliga animações e transições, o conteúdo do reveal
fica visível, o checklist mostra tudo concluído e a contagem do total pula direto para o valor.

### Sem JavaScript

A classe `js-rv` só existe com JS, então sem JS nada fica com `opacity: 0`. Há teste para isso
(`tests/e2e/site.spec.ts` → "sem JavaScript o conteúdo continua visível").

## Ícones

SVG inline (traço, `viewBox 0 0 24 24`). Os caminhos ficam em `src/lib/icons.ts`; os componentes
em `src/components/Icons.tsx`. Sem fonte de ícones (zero requisições extras).
