# Dantas Studio — site

Landing page de vendas em 5 idiomas (pt, en, es, fr, de), com calculadora de orçamento,
WhatsApp e formulário por e-mail. Next.js + TypeScript, **100% estático** (sem banco, sem backend),
hospedado na Vercel.

O design aprovado está em `dantas-studio-handoff/design/landing.dc.html` e é a referência visual.

## Rodar no computador

Precisa do Node.js 20.9 ou mais novo.

```bash
npm install
npm run dev        # http://localhost:3000 (redireciona para /pt, /en… conforme o navegador)
npm test           # testes da calculadora (src/lib/calc.test.ts)
npm run build      # gera o site estático em out/
npm start          # serve a pasta out/ para conferir o build
```

Para testar o envio por e-mail no computador, copie `.env.example` para `.env.local` e preencha.

## Onde mexer (o dia a dia)

Regra: **preço, texto, WhatsApp e idiomas se mudam só em `src/config/` e `src/i18n/`.**
Os componentes não precisam ser tocados.

| Quero trocar…                         | Arquivo                                   |
| ------------------------------------- | ----------------------------------------- |
| WhatsApp, e-mail, domínio, LinkedIn   | `src/config/site.ts` (ou variáveis na Vercel) |
| Foto da seção "Sobre"                 | `src/config/site.ts` → `photo`            |
| Preços, moedas, extras, prazos        | `src/config/pricing.ts`                   |
| Qualquer texto do site                | `src/i18n/pt.ts`, `en.ts`, `es.ts`, `fr.ts`, `de.ts` |
| Marcas da faixa, tecnologias do "Sobre" | `src/config/site.ts` → `clients`, `facts` |
| Prints dos cases                      | `dantas-studio-handoff/assets/projects/*.jpg` + `npm run assets` |

### Trocar um preço
1. Abra `src/config/pricing.ts`.
2. Em `REGIONS`, cada serviço tem `[preço base, preço por pacote adicional]` — por região/moeda.
3. Salve. A calculadora, o "a partir de" dos cards e a mensagem do WhatsApp mudam juntos.
4. Rode `npm test`: alguns testes conferem valores do Brasil; se você mudou um preço BR de propósito,
   ajuste o número esperado em `src/lib/calc.test.ts`.

### Trocar um texto
1. Abra `src/i18n/pt.ts` (os comentários explicam cada bloco).
2. Edite só o texto entre aspas. Faça o mesmo nos outros idiomas.
3. Se faltar ou sobrar uma chave em algum idioma, o `npm run build` acusa o erro.

**SEO:** em cada idioma, `meta.title` é o título no Google (até ~60 caracteres, com o que as
pessoas pesquisam), `meta.ogTitle` é o título curto que aparece ao compartilhar o link
(WhatsApp, LinkedIn) e `meta.description` é o resumo do Google (~155 caracteres).
Os dados estruturados (serviços, FAQ, você) saem desses mesmos textos — `src/lib/jsonld.ts`.

> ⚠️ `security.noteTitle` / `security.note` ("Sem promessa milagrosa") e `calc.disc`
> (aviso de valores fictícios) são proteção legal/comercial. Mude com cuidado.

### Trocar o WhatsApp
Na Vercel, defina `NEXT_PUBLIC_WHATSAPP` (DDI + DDD + número, só dígitos, ex.: `5521999999999`)
e faça um novo deploy. Sem a variável, vale o número em `src/config/site.ts`.

### Adicionar um idioma (ex.: italiano)
1. Copie `src/i18n/pt.ts` para `src/i18n/it.ts`, troque a primeira linha por
   `import type { Dictionary } from "./pt";` + `const it: Dictionary = { … }` (veja `en.ts`) e traduza.
2. Em `src/i18n/index.ts`, importe e adicione `it` em `dictionaries`.
3. Em `src/config/site.ts`, inclua `"it"` em `LOCALES` e preencha `langToRegion`, `htmlLang`,
   `ogLocale`, `langShort` e `langName` (o TypeScript aponta o que falta).
4. Rode `npm run assets` para gerar a imagem de compartilhamento `public/og/og-it.png`.

### Assets (ícones, imagem de compartilhamento, prints)
`npm run assets` regenera `public/favicon.*`, `public/icon-*.png`, `public/apple-touch-icon.png`,
`public/og/og-<idioma>.png` (título do hero de cada idioma) e os `.webp` dos cases.
Rode depois de trocar o título do hero ou um print. Os arquivos gerados vão para o Git.

## Formulário por e-mail (Formspree)

1. Crie uma conta em [formspree.io](https://formspree.io) e um formulário novo.
2. Copie o ID (o final de `https://formspree.io/f/SEU_ID`).
3. Coloque o ID em `formspreeId` (`src/config/site.ts`) — ou na variável `NEXT_PUBLIC_FORMSPREE_ID` na Vercel, que tem prioridade.

Você recebe o e-mail do visitante (dá para responder direto) com o resumo do orçamento.
Há um campo invisível (`_gotcha`) contra robôs. Sem o ID configurado, o site mostra uma mensagem
de erro sugerindo o WhatsApp.

## Deploy na Vercel

1. Suba este projeto para um repositório no GitHub.
2. Na Vercel: **Add New → Project → Import** o repositório. As configurações já vêm do
   `vercel.json` (build `npm run build`, saída `out/`) — não precisa mudar nada.
3. (Opcional) Em **Settings → Environment Variables**, adicione `NEXT_PUBLIC_WHATSAPP` e/ou
   `NEXT_PUBLIC_FORMSPREE_ID` para sobrescrever o que está em `site.ts`. Depois, **Redeploy**.
4. Em **Settings → Domains**, adicione o domínio e siga as instruções de DNS.
5. Atualize `domain` em `src/config/site.ts` com o domínio final (usado em canonical,
   sitemap e Open Graph) e faça commit.

Depois do primeiro deploy, confira em [securityheaders.com](https://securityheaders.com)
e no PageSpeed Insights.

## Segurança

- Headers em `vercel.json`: CSP, HSTS (com `preload`), `X-Content-Type-Options`,
  `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, COOP e CORP.
- **CSP com hash por página:** o Next coloca scripts inline em cada página. O header precisa
  aceitar `'unsafe-inline'` (é igual para todas as páginas), mas o `scripts/postbuild.mjs` grava em
  cada HTML uma `<meta>` CSP com o SHA-256 exato de cada script inline. O navegador aplica as duas
  políticas, então **só os scripts do build rodam** — um script injetado é bloqueado.
  Scanners que só leem o header (ex.: securityheaders.com) ainda vão apontar o `'unsafe-inline'`.
- Fontes hospedadas localmente (`next/font`): nenhuma requisição a terceiros além do Formspree.
- Links externos com `rel="noopener noreferrer"`. Nenhum segredo no repositório
  (as duas variáveis são públicas por natureza: aparecem no site).

## Estrutura

```
src/
  config/     site.ts (marca, contato, idiomas) · pricing.ts (preços e regras)
  i18n/       pt.ts (define o formato) · en/es/fr/de.ts · index.ts
  lib/        calc.ts (cálculo puro + testes) · format.ts · whatsapp.ts · seo.ts · icons.ts
  components/ uma seção por arquivo (Hero, Services, Calculator…) + QuoteProvider (estado)
  app/        [lang]/ (páginas por idioma) · (root)/ (redireciona "/") · sitemap · robots · 404
  styles/     globals.css (CSS do design portado)
scripts/      generate-assets.mjs · postbuild.mjs (CSP)
```

## Pendências (TODO do Lucas)

Procure por `TODO(Lucas)` no código:

- [ ] WhatsApp real (`NEXT_PUBLIC_WHATSAPP` ou `site.ts`)
- [ ] E-mail e domínio final (`site.ts`)
- [x] ID do Formspree (`meaaojba`, em `site.ts`)
- [ ] Foto na seção "Sobre" (`site.ts` → `photo`)
- [ ] Revisar preços (`pricing.ts`)
- [ ] Revisar "100% das entregas no prazo", "30 dias de ajustes", condições de pagamento
      e "Figma" no card de Design (`i18n/*.ts`, `pricing.ts` → `STACK`)
