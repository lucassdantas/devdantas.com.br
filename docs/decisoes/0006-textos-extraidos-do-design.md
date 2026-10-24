# ADR-0006 — Textos extraídos do design; `pt.ts` define o formato

- **Status:** Aceita
- **Data:** 2026-10-23

## Contexto
O design tem as traduções completas em 5 idiomas, incluindo textos legais. Redigitar ~60 KB de
texto convida erro.

## Decisão
Um script leu o objeto `I18N` direto do `landing.dc.html` e gerou `src/i18n/*.ts`. O `pt.ts` define o
tipo `Dictionary`, e os outros idiomas são tipados com ele. As chaves novas (SEO, acessibilidade,
estados do e-mail) foram acrescentadas nos 5 idiomas.

## Consequências
- Textos idênticos ao aprovado; o TypeScript trava chaves faltando.
- `tests/unit/i18n.test.ts` também trava listas de tamanhos diferentes e mudança acidental nos
  textos legais.
- Algumas chaves do design não são usadas na página (ex.: `hero.ssl`); foram mantidas para não divergir.
