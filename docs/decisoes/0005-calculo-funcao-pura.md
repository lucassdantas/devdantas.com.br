# ADR-0005 — Cálculo do orçamento como função pura com testes

- **Status:** Aceita
- **Data:** 2026-10-23

## Contexto
A calculadora é o coração da conversão. Um erro de preço é constrangedor e difícil de perceber só olhando a tela.

## Decisão
`calculateQuote(service, units, extras, langs, region, dict)` em `src/lib/calc.ts`: sem React, sem
`window`, mesma entrada → mesma saída. Toda regra (inclusas, pacotes, hora, idiomas, extras,
urgência, mensal, arredondamento) tem teste unitário.

## Consequências
- Os testes rodam em milissegundos; mudar preço tem rede de segurança.
- O mesmo cálculo serve a tela, a barra mobile, o WhatsApp e o e-mail.
