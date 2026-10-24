# Performance

**Meta:** PageSpeed Insights 100 (ou o mais perto possível) no celular e no desktop, **sem perder
visual nem animações**.

## Medições (Lighthouse 13, servidor local que imita a Vercel, com brotli)

| Data       | Celular | Desktop | LCP (cel.) | TBT    | CLS | Observação |
| ---------- | ------- | ------- | ---------- | ------ | --- | ---------- |
| 2026-10-23 | 100     | 100     | 1,7–1,8 s  | 30–40 ms | 0 | primeira versão |
| 2026-10-23 | 99      | 100     | 1,85 s     | 35–50 ms | 0 | após SEO e Turnstile; LCP no limite da nota 100 |

Acessibilidade, Boas práticas e SEO: 100 em todas as medições.

Medição local oscila 1–2 pontos (TBT varia com a carga da máquina). O número oficial é o do
[PageSpeed Insights](https://pagespeed.web.dev) depois do deploy.

## O que mantém o site rápido

- **HTML estático na CDN**: sem servidor calculando a página.
- **Fontes no próprio site** (`next/font`), com `display: swap` e ajuste de fallback (CLS 0).
- **Imagens**: WebP/AVIF já otimizados pelo `npm run assets`; dimensões no HTML; os cases e a foto
  com `loading="lazy"`; só o print do hero é prioritário (`preload` + `fetchPriority="high"`).
- **Nenhum terceiro no carregamento**. O Turnstile só é baixado quando a pessoa foca no campo de
  e-mail ([ADR-0014](../decisoes/0014-turnstile-sob-demanda.md)).
- **Animações em CSS** (transform/opacity/clip-path) + um `IntersectionObserver`; sem biblioteca.
- **JS mínimo**: seções sem interação são só HTML; componentes cliente recebem só os textos que usam.

## O que foi testado e não funcionou

| Tentativa                              | Resultado                                         |
| -------------------------------------- | ------------------------------------------------- |
| `experimental.inlineCss` (CSS no HTML) | Pior: TBT 40 → 220 ms (o CSS vai duplicado no payload do React). Revertido — [ADR-0016](../decisoes/0016-css-inline-rejeitado.md). |
| Tirar o preload da fonte mono          | Sem ganho mensurável (dentro do ruído). Revertido. |

O LCP no celular é o **logo** "dantas" (os textos do hero entram animados, então o Lighthouse
escolhe o primeiro texto visível). Ele depende da fonte principal carregar.

## Guardas automáticas

- Integração: "orçamento de JavaScript" (os scripts da página < 750 KB sem compressão; hoje ~600 KB,
  ~160 KB com brotli) e "nenhum script de terceiro no HTML".
- E2E: "Turnstile só é baixado quando a pessoa usa o formulário" e "sem terceiros no carregamento".

## Antes de adicionar algo pesado

Analytics, chat, pixel, vídeo, mapa: cada um custa pontos. Prefira carregar sob demanda (no clique
ou ao rolar até a seção), como foi feito com o Turnstile, e meça antes e depois.
