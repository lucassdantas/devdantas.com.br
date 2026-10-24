# ADR-0012 — Título do Google separado do de compartilhamento

- **Status:** Aceita
- **Data:** 2026-10-23

## Contexto
"Dantas Studio — Sites que vendem" funciona muito bem ao compartilhar, mas é fraco para busca
(ninguém pesquisa "sites que vendem dantas").

## Decisão
Em cada idioma, `meta.title` (Google, ≤ 62 caracteres, com o serviço que as pessoas buscam) e
`meta.ogTitle` (WhatsApp/LinkedIn, curto e de marca).

## Consequências
- Mais chance de clique na busca, sem perder a identidade ao compartilhar.
- Os testes limitam o tamanho do título e da descrição.
