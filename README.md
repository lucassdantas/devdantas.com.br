# Dantas Studio — site

Landing page de vendas em 5 idiomas (pt, en, es, fr, de), com calculadora de orçamento,
WhatsApp e envio de orçamento por e-mail. Next.js + TypeScript, **estático** (sem banco),
hospedado na Vercel, com uma única função serverless para o e-mail (protegida pelo Cloudflare Turnstile).

- Design aprovado (referência visual): `dantas-studio-handoff/design/landing.dc.html`
- **Documentação completa: [docs/](docs/README.md)** — arquitetura, domínios, operação e decisões (ADRs)

## Rodar no computador

Node.js 20.9+.

```bash
npm install
npm run dev          # http://localhost:3000 — para mexer em layout e texto
npm test             # testes unitários e de componentes (segundos)

npm run build        # gera o site em out/
npm start            # http://localhost:4173 — o site como na Vercel, com a função de e-mail
npm run test:all     # tudo: tipos, testes, build, integração e E2E
```

O E2E usa o navegador do Playwright (`npx playwright install chromium`, uma vez) ou o Chrome
instalado (`PW_CHANNEL=chrome npm run test:e2e`). Mais em [docs/operacao/testes.md](docs/operacao/testes.md).

## Onde mexer no dia a dia

Regra: **preço, texto, WhatsApp e idiomas mudam só em `src/config/` e `src/i18n/`.**

| Quero trocar…                           | Arquivo                                                  |
| --------------------------------------- | -------------------------------------------------------- |
| Preços, moedas, extras, prazos          | `src/config/pricing.ts`                                  |
| Qualquer texto (e títulos do Google)    | `src/i18n/pt.ts` + `en.ts`, `es.ts`, `fr.ts`, `de.ts`    |
| WhatsApp, e-mail, LinkedIn, domínio     | `src/config/site.ts`                                     |
| Foto do "Sobre"                         | `dantas-studio-handoff/assets/lucas.jpg` → `npm run assets` → `site.photo = "/lucas"` |
| Prints dos cases, ícones, imagens OG    | `npm run assets`                                         |

Receitas passo a passo (idioma novo, case novo, serviço novo…): [docs/operacao/manutencao.md](docs/operacao/manutencao.md).

> ⚠️ `security.noteTitle` / `security.note` ("Sem promessa milagrosa") e `calc.disc` (aviso de
> valores fictícios) são proteção legal/comercial. Os testes travam mudança sem querer.

## Variáveis de ambiente

Só os **segredos** ficam em variável (veja `.env.example`). Valores públicos — WhatsApp e a Site Key
do Turnstile — ficam em `src/config/site.ts`. Na Vercel: **Settings → Environment Variables**, depois
**Redeploy** (passo a passo em [docs/operacao/deploy.md](docs/operacao/deploy.md#4-vercel)).

| Variável               | Para quê                                    |
| ---------------------- | ------------------------------------------- |
| `TURNSTILE_SECRET_KEY` | Secret Key do Turnstile (só a função lê)    |
| `FORMSPREE_FORM_ID`    | ID do formulário Formspree (só a função lê) |

## Deploy

Passo a passo (Turnstile na Cloudflare, Formspree, Vercel, domínio com DNS "DNS only", checklist):
[docs/operacao/deploy.md](docs/operacao/deploy.md).

## Pendências

Procure por `TODO(Lucas)` no código:

- [x] Foto na seção "Sobre"
- [ ] WhatsApp real (`site.ts`)
- [x] Turnstile: Site Key em `site.ts`
- [ ] Turnstile: gerar nova Secret Key (a atual foi exposta) e cadastrar na Vercel
- [ ] Formspree: **ID novo** (o primeiro ficou no histórico do Git) na Vercel
- [ ] E-mail de contato (`site.ts`)
- [ ] Revisar preços (`pricing.ts`)
- [ ] Revisar "100% das entregas no prazo", "30 dias de ajustes", condições de pagamento
      e "Figma" no card de Design (`i18n/*.ts`, `pricing.ts` → `STACK`)
