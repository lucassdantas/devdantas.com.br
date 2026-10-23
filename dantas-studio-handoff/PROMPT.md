# Prompt para o Claude Code — Site Dantas Studio

> Cole este arquivo inteiro no Claude Code (ou diga: "Leia PROMPT.md e execute").
> A pasta tem: `design/landing.dc.html` (o design aprovado), `design/brand.dc.html` (identidade visual) e `assets/projects/*.jpg` (prints dos cases).

---

## Objetivo

Transformar o design aprovado em `design/landing.dc.html` num site de produção, **fiel ao design pixel a pixel**, para vender serviços de desenvolvimento (sites, landing pages, e-commerce, sistemas, UI/UX, consultoria, segurança e suporte) para clientes do Brasil e do exterior. Hospedagem: **Vercel**. Sem banco de dados, sem backend próprio. Contato por **WhatsApp** e formulário opcional via **Formspree**.

O foco é **conversão**. Não invente seções, não mude textos, não "melhore" o layout por conta própria. Se algo do design for ambíguo, siga o design.

## Como ler o arquivo de design

`landing.dc.html` está num formato de componente de um editor de design. Use-o como **especificação completa** (não como código pronto):

- `<helmet><style>…</style></helmet>` → **todo o CSS** (cores, tokens, tipografia, animações, breakpoints). Porte quase literalmente.
- `{{ algo }}` → valor vindo de `renderVals()` no `<script>` no fim do arquivo.
- `<sc-for list="{{x}}" as="item">` → `.map()`. `<sc-if value="{{cond}}">` → renderização condicional.
- `onClick="{{fn}}"` → handler.
- O `<script type="text/x-dc">` contém **CONFIG**, **I18N** (pt, en, es, fr, de completos), **ICONS**, **STACK**, **WORK** e toda a **lógica** (calculadora, contagem animada do preço, checklist de segurança animado, relógio, spotlight do mouse, reveal on scroll). Porte essa lógica.
- Imagens `/_blob/...` → troque pelos arquivos em `assets/projects/` (mapeamento: `bd59…` = pure-detail, `0033…` = help-baterias, `7960…` = italinea-rio, `20a1…` = parceiros-rubraz).
- Variáveis do editor (`accent`, `startTheme`, `startLang` em `data-props`) → viram constantes no config (`accent: "#1D94E3"`).

## Stack

- **Next.js (App Router) + TypeScript**, `output: "export"` (site 100% estático), deploy na Vercel.
- **CSS**: porte o CSS do design para `src/styles/globals.css` (+ CSS Modules só se ajudar). **Não** reescreva em Tailwind — o risco de perder fidelidade é alto.
- Fontes via `next/font/google`: **Plus Jakarta Sans** (400–800) e **JetBrains Mono** (500).
- Sem bibliotecas de animação: as animações são CSS + IntersectionObserver, mantenha assim.
- `next/image` para os prints dos cases (com `width`/`height` corretos).

## Estrutura de pastas (manutenção fácil é requisito)

```
src/
  config/
    site.ts        // marca, whatsapp, e-mail, formspree, redes, domínio, idioma→região
    pricing.ts     // regiões (moeda, locale, tabela de preços, extras), regras dos serviços
  i18n/
    pt.ts en.ts es.ts fr.ts de.ts   // MESMO formato; tipado por um type `Dictionary` derivado de pt.ts
    index.ts
  lib/
    calc.ts        // função pura calculateQuote(service, units, extras, langs, region, dict) → { total, monthly, lines, days }
    format.ts      // formatação de moeda (Intl.NumberFormat)
    whatsapp.ts    // monta link wa.me com mensagem
  components/
    Nav.tsx Hero.tsx Clients.tsx Pains.tsx Services.tsx Security.tsx Work.tsx
    Calculator.tsx Process.tsx About.tsx Faq.tsx FinalCta.tsx Footer.tsx
    MobileBar.tsx WhatsAppFloat.tsx SplitWords.tsx Reveal.tsx
  app/
    [lang]/page.tsx  [lang]/layout.tsx  page.tsx (redirect)  sitemap.ts  robots.ts
```

Regra de ouro: **trocar preço, texto, número do WhatsApp ou adicionar um idioma deve exigir mexer só em `config/` ou `i18n/`**. Comente esses arquivos em português explicando cada campo (como no CONFIG do design).

`calc.ts` deve ser uma **função pura** com testes unitários (Vitest) cobrindo: unidades inclusas, pacotes de `step` (e-commerce de 10 em 10), consultoria por hora, idiomas extras (+20% cada sobre base+unidades), extras fixos, urgência (+30% sobre o subtotal, prazo ×0,6), plano mensal, arredondamento de 10 em 10.

## Idiomas, regiões e preços

- Rotas por idioma: `/pt`, `/en`, `/es`, `/fr`, `/de` (gerar estaticamente com `generateStaticParams`). `/` redireciona com base em `navigator.language` (client) ou cai em `/pt`.
- `<html lang>` correto por rota, `hreflang` alternates, `metadata` (title/description/OG) traduzidos.
- Região/moeda é **independente** do idioma: o idioma define a região padrão (`pt→BR, en→US, es→LATAM, fr→EU, de→EU`), o usuário troca no seletor. Persistir a escolha em `localStorage` (com try/catch).
- Trocar idioma no seletor navega para a rota do idioma mantendo a âncora (#orcamento etc.).

## Comportamentos que precisam funcionar exatamente como no design

1. **Nav** sticky com blur; grupo [idioma | moeda | tema]; vira hambúrguer ≤1080px; barra fina de progresso de rolagem embaixo (CSS `animation-timeline: scroll()` com fallback JS opcional).
2. **Tema claro/escuro**: respeitar `prefers-color-scheme` na primeira visita, salvar a escolha; evitar flash (script inline no `<head>` setando a classe antes da hidratação).
3. **Hero**: título com reveal palavra por palavra (`SplitWords`), print do Pure Detail com reveal em cortina, frame com marcas de corte, régua "1280 × 800 · responsive", etiqueta `<Landing />`, card flutuante de notificação, linha de status com **relógio real de America/Sao_Paulo** (atualiza a cada minuto).
4. **Reveal on scroll** (`Reveal`): IntersectionObserver adiciona `.on`; títulos de seção palavra a palavra; cards com stagger; imagens dos cases com cortina + zoom-out. Só anima uma vez. Respeitar `prefers-reduced-motion`. **Sem JS, o conteúdo deve continuar visível** (classe `js-rv` só é adicionada no client).
5. **Cards problema → solução**: bandeja azul inferior, seta, hover invertendo para azul cheio.
6. **Serviços**: código S/0X, linha de stack em mono, preço "a partir de" calculado da região atual, spotlight que segue o mouse, botão "Simular" que seleciona o serviço na calculadora e rola até ela. No mobile: carrossel com scroll-snap.
7. **Segurança**: checklist animado item a item (spinner → check com pop), barra e contador sincronizados, selo final, loop. Quadro "Sem promessa milagrosa" — **manter o texto exatamente como está** (é proteção legal/comercial).
8. **Calculadora**: chips de serviço, slider + stepper, idiomas extras com stepper, extras toggláveis (só os permitidos por serviço), total com **contagem animada** e pulse, linhas do breakdown, prazo, nota de pagamento por região, botão **"Enviar orçamento no WhatsApp"** com a mensagem montada no idioma atual, e-mail via **Formspree** (POST real para `NEXT_PUBLIC_FORMSPREE_ID`, com estado de loading/sucesso/erro e honeypot anti-spam; enviar também o resumo do orçamento). Manter o asterisco no total e o **aviso de valores fictícios**.
9. **Barra fixa no mobile** (≤640px) com o total e botão de WhatsApp; esconde o botão flutuante no mobile.
10. **FAQ** acordeão acessível (`aria-expanded`, um aberto por vez).

## Acessibilidade e qualidade

- HTML semântico como no design (botões reais, labels nos inputs/selects, `aria-label` em ícones).
- Contraste AA (os tokens do design já passam — não clareie cinzas).
- Alvos de toque ≥ 44px. Sem scroll horizontal em 360px.
- Lighthouse mobile: meta **≥ 95** em Performance, Acessibilidade, Boas práticas e SEO. Imagens otimizadas, fontes com `display: swap`, nada de JS desnecessário no first load.
- JSON-LD `ProfessionalService` (nome, área atendida, idiomas, contato) — sem avaliações/notas inventadas.
- `sitemap.xml`, `robots.txt`, favicon e ícones a partir do símbolo do `brand.dc.html` (quadrado azul #0B6CB5 com "d" branco + ponto azul-claro). Gere SVG e PNGs (16, 32, 180, 512) e OG image 1200×630 com o wordmark.

## Segurança (o site vende segurança, então tem que ser exemplar)

- Headers via `vercel.json`: `Content-Security-Policy` (liberar só self, Google Fonts se usado via CDN — prefira `next/font` que hospeda localmente —, formspree.io no `connect-src`/`form-action`), `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` restritiva, `X-Frame-Options: DENY`.
- Links externos com `rel="noopener noreferrer"`.
- Nenhum segredo no repositório; `.env.example` com `NEXT_PUBLIC_FORMSPREE_ID` e `NEXT_PUBLIC_WHATSAPP`.

## Placeholders que EU (Lucas) vou preencher — deixe centralizados e marcados com `// TODO`

- Número do WhatsApp (`5521999999999` no design).
- E-mail (`contato@dantasstudio.com`) e domínio final.
- ID do Formspree.
- Foto minha na seção "Sobre" (hoje mostra as iniciais "LD" — deixe um `<Image>` opcional que cai nas iniciais se não houver foto).
- Preços em `pricing.ts` (os valores atuais são estimativas).
- Revisar: "100% das entregas no prazo", "30 dias de ajustes", condições de pagamento, stack "Figma" no card de Design.

## Entregáveis

1. Projeto Next.js rodando com `npm run dev`, build estático com `npm run build` sem erros/warnings de tipo.
2. Testes de `calc.ts` passando (`npm test`).
3. `README.md` em português: como rodar, **como trocar preços/textos/WhatsApp/idiomas** (passo a passo curto), como fazer deploy na Vercel (importar repo, variáveis de ambiente, domínio).
4. Commits pequenos e descritivos.

## Ordem de trabalho sugerida

1. Ler `design/landing.dc.html` inteiro e listar as seções/estados antes de codar.
2. Setup Next.js + fontes + globals.css portado + config/i18n tipados.
3. `calc.ts` + testes.
4. Componentes na ordem da página, comparando com o design a cada seção (desktop 1440, tablet 900, mobile 390).
5. Animações e reveal.
6. SEO, ícones, headers, README.
7. Rodar build e Lighthouse; corrigir até bater as metas.
