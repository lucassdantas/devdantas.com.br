# ADR-0008 — CSP: header + `<meta>` com hashes por página

- **Status:** Aceita
- **Data:** 2026-10-23

## Contexto
O site vende segurança. Uma CSP forte bloqueia scripts injetados (XSS). Mas o Next coloca scripts
inline diferentes em cada página e a cada build; num site estático não dá para usar *nonce*, e o
`vercel.json` aplica o mesmo header a todas as páginas.

## Decisão
- Header (`vercel.json`) com a política completa, incluindo `script-src 'self' 'unsafe-inline'`.
- `scripts/postbuild.mjs` grava em cada HTML uma `<meta>` CSP com o SHA-256 de cada script inline.
- O navegador aplica as duas: na prática, só os scripts do build executam.

## Consequências
- Proteção real contra XSS; um teste de integração confere que todo script inline tem hash.
- Scanners que leem só o header (securityheaders.com) apontam o `'unsafe-inline'`.
- `frame-ancestors` e afins só funcionam no header (por isso a política está nos dois).

## Alternativas consideradas
- **Só `'unsafe-inline'`** — fraco.
- **Build Output API da Vercel com header por rota** — gerar `.vercel/output/config.json` com os
  hashes no header. Nota melhor nos scanners, mas mais complexo e não testável localmente; pode ser
  feito no futuro.
- **Nonce** — exige renderização a cada requisição (servidor).
