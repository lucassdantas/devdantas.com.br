# ADR-0014 — Turnstile carregado só ao usar o formulário

- **Status:** Aceita
- **Data:** 2026-10-23

## Contexto
Meta de PageSpeed ~100. O script do Turnstile (de terceiro) no carregamento custaria tempo de rede e
de CPU, e só uma fração dos visitantes usa o e-mail.

## Decisão
`loadTurnstile()` injeta o script no primeiro foco ou hover do formulário; o token é gerado em segundo
plano enquanto a pessoa digita. A CSP libera só `challenges.cloudflare.com`.

## Consequências
- Zero impacto no PageSpeed (garantido por testes E2E e de integração).
- Se a pessoa enviar muito rápido, espera o token (até 20 s). Se o Turnstile falhar, o erro aparece
  na hora e um novo desafio é gerado.
