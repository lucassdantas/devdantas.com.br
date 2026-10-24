# Testes

Objetivo: **nada quebra sem alguém perceber** — nem o cálculo, nem um texto legal, nem o SEO, nem
a segurança, nem o PageSpeed. Quatro camadas, da mais rápida para a mais completa
([ADR-0015](../decisoes/0015-testes-em-quatro-camadas.md)):

| Camada        | Ferramenta                    | Pasta                | Comando                    | Tempo  |
| ------------- | ----------------------------- | -------------------- | -------------------------- | ------ |
| Unitários     | Vitest (Node)                 | `tests/unit`         | `npm test`                 | < 1 s  |
| Componentes   | Vitest + Testing Library + jsdom | `tests/components` | `npm test`                 | ~4 s   |
| Integração    | Vitest (lê `out/`, sobe o servidor) | `tests/integration` | `npm run test:integration` | ~3 s   |
| E2E           | Playwright (Chromium, desktop + celular) | `tests/e2e` | `npm run test:e2e`         | ~50 s  |

Integração e E2E testam o site **construído**: rode `npm run build` antes (ou `npm run test:all`).

## O que cada camada cobre

### Unitários
- `calc.test.ts` — todas as regras de preço: inclusas, pacotes de 10, hora, idiomas (+20%),
  extras, urgência (+30% e prazo × 0,6), mensal, arredondamento, regiões.
- `config.test.ts` — `pricing.ts`/`site.ts` coerentes (preço em todas as regiões, valor inicial
  dentro do passo, moedas válidas, contatos com formato certo, **Formspree fora do código do navegador**).
- `i18n.test.ts` — os 5 idiomas com a mesma estrutura, sem texto vazio, limites do título/descrição
  e **textos legais** ("Sem promessa milagrosa", aviso de valores fictícios) iguais ao aprovado.
- `format-whatsapp.test.ts` — formato de moeda e a mensagem do WhatsApp, linha por linha.
- `seo.test.ts` — redirecionamento de `/` (executa o script de verdade), script de tema, hreflang, JSON-LD.
- `api-orcamento.test.ts` — a função serverless com Cloudflare e Formspree simulados: caminho feliz,
  validação, campo invisível, Turnstile reprovado, Formspree fora, limite por IP, cache.

### Componentes
- `calculator.test.tsx` — cliques reais: escolher serviço, slider, −/+, idiomas, extras, total,
  linhas, prazo, barra mobile, "Simular", aviso e asterisco, região `aria-live`.
- `mail-form.test.tsx` — Turnstile só carrega ao usar o formulário; envio com token; erro do
  servidor; Turnstile falhando (falha rápido e tenta de novo); robô; e-mail inválido.
- `interactions.test.tsx` — FAQ (um aberto por vez, ARIA), checklist (reduzido e em loop),
  moeda salva/restaurada, tema, menu mobile, reveal.

### Integração (site construído)
- `static-site.test.ts` — para cada idioma: `lang`, título, descrição, canonical, hreflang, Open
  Graph (e a imagem existe), JSON-LD, 1 H1, `alt`, todas as seções, textos legais, âncoras internas
  válidas, links externos seguros, WhatsApp com o número da config, **CSP com o hash de cada script
  inline**, nenhum terceiro, **nenhum segredo no HTML/JS**; raiz, 404, sitemap, robots, ícones,
  manifest, **orçamento de JS**, `vercel.json` (headers e função).
- `server.test.ts` — sobe `scripts/serve.mjs`: URLs limpas, redirect de `.html`, 404, headers,
  cache imutável, função sem configuração recusa.

### E2E (navegador de verdade)
- `site.spec.ts` — cada idioma abre **sem erro de console, sem violação de CSP e sem requisição a
  terceiros**; 404; redirecionamento por idioma do navegador; troca de idioma mantém a âncora;
  tema salvo e aplicado antes da pintura; tema do sistema; moeda salva; menu mobile; **sem rolagem
  horizontal em 360/390/900/1440 px**; barra mobile × botão flutuante; sem JavaScript; reveal; FAQ.
- `quote.spec.ts` — "Simular", fluxo completo da calculadora até a mensagem do WhatsApp, inglês em
  dólar, Turnstile só sob demanda, envio com sucesso e com erro (API simulada), função real recusa
  sem configuração.

Toda página E2E falha se houver erro de console, erro de JS ou violação de CSP (`tests/e2e/fixtures.ts`).

## Nenhum e-mail real é enviado nos testes

- Unitários/componentes: `fetch` simulado.
- Integração/E2E: o servidor sobe com `FORMSPREE_FORM_ID` vazio; o Turnstile e a API são
  simulados com `page.route` quando o teste precisa de sucesso.

## Rodando

```bash
npm test                       # rápido, durante o desenvolvimento
npm run build && npm run test:integration
npx playwright install chromium   # uma vez, baixa o navegador do Playwright
npm run test:e2e
PW_CHANNEL=chrome npm run test:e2e   # ou: usa o Chrome já instalado
npx playwright test --ui       # modo visual, para ver o teste rodando
npm run test:all               # tudo
```

Falhou no E2E? O Playwright guarda um *trace* em `test-results/` (`npx playwright show-trace <arquivo>`).

## CI (GitHub Actions)

`.github/workflows/ci.yml` roda tudo a cada push/PR na `main`: tipos → unit/componentes → build →
integração → E2E. Se falhar, sobe o relatório do Playwright como artefato. Para impedir que algo
quebrado vá para o ar, veja [deploy.md](deploy.md#travar-o-deploy-quando-o-ci-falha).

## Escrevendo um teste novo

- Regra de negócio nova → unitário.
- Interação de um componente → componentes (`renderWithQuote` em `tests/components/helpers.tsx`
  monta o mesmo provider da página).
- Algo que só existe no HTML final (meta tag, header, arquivo) → integração.
- Fluxo que depende de CSS real, rolagem, navegação ou do navegador → E2E.
- Mudou um texto legal ou um preço **de propósito**? Atualize o valor esperado no teste — ele existe
  para impedir mudança sem querer.
