# ADR-0013 — E-mail via função + Turnstile + Formspree

- **Status:** Aceita (substitui o envio direto do navegador ao Formspree, da versão inicial)
- **Data:** 2026-10-23

## Contexto
Na primeira versão, o navegador postava direto em `formspree.io/f/<ID>`. Qualquer pessoa podia ver o
ID (F12) e mandar spam direto ao Formspree, sem passar pelo site. O domínio já está na Cloudflare.

## Decisão
- O navegador envia para `/api/orcamento` (função Vercel, `api/orcamento.ts`).
- A função valida a requisição, aplica limite por IP, confere o token do **Cloudflare Turnstile** e
  só então repassa ao Formspree. `FORMSPREE_FORM_ID` e `TURNSTILE_SECRET_KEY` ficam só no servidor.
- Turnstile invisível (`appearance: interaction-only`).

## Consequências
- ID escondido e spam automatizado barrado por verificação humana.
- Passa a existir um backend (uma função, sem estado). O `npm run dev` não roda a função; use
  `npm start` para testar o fluxo completo.
- Três variáveis novas na Vercel; sem elas, a função recusa (falha fechada).
- O limite por IP é por instância (memória): uma barreira extra, não absoluta.

## Alternativas consideradas
- **Manter o envio direto ao Formspree** — mais simples, mas sem proteção e com o ID exposto.
- **Função sem captcha** — esconde o ID, mas o spam só muda de endereço.
- **Trocar o Formspree por envio próprio (ex.: Resend)** — possível depois; o Formspree já estava configurado.
