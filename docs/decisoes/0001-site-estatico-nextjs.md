# ADR-0001 — Site estático com Next.js (`output: "export"`)

- **Status:** Aceita
- **Data:** 2026-10-23

## Contexto
Landing page de vendas em 5 idiomas, foco em conversão e PageSpeed ~100, sem banco nem backend
próprio, hospedada na Vercel. Precisa de componentes reutilizáveis, tipagem e interação rica
(calculadora, animações), com o HTML pronto para o Google.

## Decisão
Next.js (App Router) + TypeScript com `output: "export"`: cada idioma vira um HTML estático no
build (`generateStaticParams`), e o React só hidrata as partes interativas.

## Consequências
- HTML completo para SEO e primeira pintura rápida; hospedagem em CDN, custo quase zero.
- Sem recursos de servidor do Next (middleware, rotas de API do Next, otimização de imagem em tempo
  real): as imagens são otimizadas antes (ADR-0010) e o único backend é uma função Vercel (ADR-0013).
- `next/image` com `unoptimized: true`.

## Alternativas consideradas
- **Next com servidor (SSR)** — desnecessário para conteúdo estático, mais caro e mais lento.
- **HTML/JS puro** — o design já é componentizado; perderíamos tipagem e reutilização.
- **Astro** — boa opção para site estático, mas o briefing pediu Next.js.
