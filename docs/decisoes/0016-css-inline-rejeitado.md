# ADR-0016 — CSS inline no HTML

- **Status:** Rejeitada
- **Data:** 2026-10-23

## Contexto
No Lighthouse mobile, o CSS aparecia como recurso bloqueante (~170 ms simulados), e a nota caiu de
100 para 99 depois das mudanças de SEO e do Turnstile.

## Decisão
`experimental.inlineCss: true` foi testado e **revertido**.

## Medição
| | Nota | TBT | LCP |
|-|------|-----|-----|
| CSS em arquivo | 99 | 35–50 ms | ~1,85 s |
| CSS inline     | 91–96 | 220–275 ms | 1,7–2,6 s |

O Next coloca o CSS também dentro do payload do React: o HTML cresce e o navegador processa o CSS
duas vezes.

## Consequências
O CSS continua em arquivo (9 KB comprimido, cacheável).
