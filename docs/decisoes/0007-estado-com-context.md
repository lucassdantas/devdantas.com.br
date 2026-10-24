# ADR-0007 — Estado compartilhado com React Context

- **Status:** Aceita
- **Data:** 2026-10-23

## Contexto
Nav (moeda), cards de serviço ("Simular"), calculadora, e-mail e barra mobile precisam do mesmo
estado. Há também uma contagem animada a 60 fps.

## Decisão
Um `QuoteProvider` com dois Contexts: um para o estado e o orçamento e, separado, outro para o número
exibido durante a contagem (`useDisplay`), para que a animação não re-renderize a página toda.

## Consequências
- Zero dependências; ~100 linhas.
- Quem precisa do número animado consome `useDisplay`; o resto usa `useQuote`.

## Alternativas consideradas
- **Zustand/Redux** — dependência e JavaScript a mais para um estado pequeno.
