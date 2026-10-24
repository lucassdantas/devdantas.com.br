# ADR-0018 — Valores públicos no código; variável só para segredo

- **Status:** Aceita (substitui o uso de `NEXT_PUBLIC_WHATSAPP` e `NEXT_PUBLIC_TURNSTILE_SITE_KEY`)
- **Data:** 2026-10-23

## Contexto
O WhatsApp e a Site Key do Turnstile eram variáveis de ambiente (`NEXT_PUBLIC_*`), mas os dois
aparecem no site para qualquer visitante. Variável a mais na Vercel é passo a mais, e um esquecimento
faz o site ir ao ar com valor de exemplo.

## Decisão
- Valores públicos ficam em `src/config/site.ts` (`whatsapp`, `turnstileSiteKey`), versionados.
- Variável de ambiente só para **segredo**, lido só pela função: `TURNSTILE_SECRET_KEY` e `FORMSPREE_FORM_ID`.

## Consequências
- Na Vercel ficam 2 variáveis em vez de 4; trocar o número é um commit.
- Regra simples: se aparece no navegador, não é segredo e pode ficar no código.
