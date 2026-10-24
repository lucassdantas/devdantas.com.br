# ADR-0017 — Foto em AVIF/WebP responsivo e lazy

- **Status:** Aceita
- **Data:** 2026-10-23

## Contexto
A seção "Sobre" mostra a foto do Lucas. A original tem ~2,5 MB; sem otimização, pesaria no site.

## Decisão
`npm run assets` gera versões de 400 e 800 px em AVIF e WebP, no corte 4:5 e sem metadados. A página
usa `<picture>` + `srcset`/`sizes` + `loading="lazy"`, e `site.photoFocus` define o ponto que fica
visível no corte horizontal do celular.

## Consequências
~23 KB no celular e ~63 KB no desktop retina, baixados só quando a seção se aproxima. Sem efeito no
PageSpeed (medido com uma foto de teste: 99–100).
