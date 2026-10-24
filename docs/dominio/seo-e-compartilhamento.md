# SEO e compartilhamento

Arquivos: `src/app/[lang]/layout.tsx` (metadata) · `src/lib/seo.ts` · `src/lib/jsonld.ts` ·
`src/app/sitemap.ts` · `src/app/robots.ts` · `src/app/manifest.ts`.

## Por página de idioma

| Item                     | Origem                                    |
| ------------------------ | ----------------------------------------- |
| `<html lang>`            | `site.htmlLang` (`pt-BR`, `en`, …)        |
| `<title>`                | `meta.title` — para o Google, ≤ 62 caracteres, com palavra-chave |
| `meta description`       | `meta.description` — 100 a 160 caracteres |
| `canonical`              | `<domínio>/<idioma>`                      |
| `hreflang`               | os 5 idiomas + `x-default` → `/pt`        |
| Open Graph / Twitter     | `meta.ogTitle` (título curto para compartilhar), descrição, `og/og-<idioma>.png` 1200×630 |
| `robots`                 | index, follow, `max-image-preview: large` |
| JSON-LD                  | ver abaixo                                |

`title` × `ogTitle`: no Google vale o título com o que as pessoas pesquisam ("Criação de sites,
landing pages e e-commerce | Dantas Studio"); ao compartilhar no WhatsApp/LinkedIn vale o título
curto da marca ("Dantas Studio — Sites que vendem") — [ADR-0012](../decisoes/0012-titulo-google-x-compartilhamento.md).

## Dados estruturados (JSON-LD)

Um `@graph` por página (`buildJsonLd`):

- `WebSite` — o site, com os idiomas.
- `WebPage` — a página do idioma.
- `ProfessionalService` — o Dantas Studio: contato, cidade, área atendida, idiomas de atendimento
  e catálogo dos 8 serviços (nome + descrição).
- `Person` — você, com cargo e LinkedIn.
- `FAQPage` — as 6 perguntas e respostas que estão visíveis na página.

**Sem preços e sem avaliações**: os valores são ilustrativos e o Google pune nota inventada.
Teste: `tests/unit/seo.test.ts`.

## Sitemap, robots, raiz

- `sitemap.xml`: as 5 URLs, cada uma com os alternates de idioma.
- `robots.txt`: libera tudo e aponta o sitemap.
- `/` tem `noindex, follow` (só redireciona). A 404 também é `noindex`.

## Depois do deploy

1. [Rich Results Test](https://search.google.com/test/rich-results) com `/pt`.
2. Prévia de link: [opengraph.xyz](https://www.opengraph.xyz) ou mandar o link no WhatsApp.
3. Google Search Console: adicionar o domínio e enviar `https://devdantas.com.br/sitemap.xml`.

Os testes de integração (`tests/integration/static-site.test.ts`) conferem todos esses itens no
HTML construído, em todos os idiomas.
