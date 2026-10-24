# Manutenção — receitas

Depois de qualquer mudança: `npm test` (e, antes de publicar, `npm run test:all`).

## Trocar um preço
`src/config/pricing.ts` → `REGIONS.<região>.prices.<serviço> = [base, por pacote]` ou `extras`.
Detalhes: [calculadora-e-precos.md](../dominio/calculadora-e-precos.md).

## Trocar um texto
`src/i18n/pt.ts` (e os outros 4 idiomas). Edite só o que está entre aspas.
⚠️ `security.noteTitle/note` e `calc.disc` são proteção legal — os testes travam mudança sem querer.

## Trocar WhatsApp, e-mail, LinkedIn
`site.whatsapp`, `site.email`, `site.linkedin` em `src/config/site.ts`.

## Colocar/trocar a foto
`dantas-studio-handoff/assets/lucas.jpg` → `npm run assets` → `photo: "/lucas"` em `site.ts`.
Detalhes: [conteudo-e-assets.md](../dominio/conteudo-e-assets.md#foto-do-sobre).

## Adicionar um case
[conteudo-e-assets.md](../dominio/conteudo-e-assets.md#novo-case).

## Adicionar um idioma
1. Copie `src/i18n/pt.ts` para `src/i18n/it.ts`; troque o cabeçalho pelo de `en.ts`
   (`import type { Dictionary } from "./pt"; const it: Dictionary = { … }`) e traduza.
2. `src/i18n/index.ts`: importe e inclua em `dictionaries`.
3. `src/config/site.ts`: `"it"` em `LOCALES` e preencha `langToRegion`, `htmlLang`, `ogLocale`,
   `langShort`, `langName` (o TypeScript aponta o que falta).
4. `scripts/generate-assets.mjs`: inclua `"it"` em `LANGS` e rode `npm run assets` (imagem OG).
5. `npm run test:all` — os testes já percorrem `LOCALES`, então cobrem o idioma novo sozinhos.

## Adicionar uma moeda/região
1. `src/config/pricing.ts`: inclua em `REGION_IDS` e em `REGIONS` (moeda, locale, `pay`, rótulos, preços).
2. Se precisar de outra nota de pagamento, crie a chave em `calc.pay` em todos os idiomas.

## Adicionar um serviço
1. `pricing.ts`: `SERVICE_IDS`, `SERVICES`, `STACK` e preço em todas as regiões.
2. `src/lib/icons.ts`: ícone com o mesmo id.
3. Todos os `i18n/*.ts`: `services.items.<id>` com `name`, `desc`, `out`, `unit`.
4. Ajuste os testes que contam 8 serviços (`static-site.test.ts`, `seo.test.ts` usa `SERVICE_IDS`).

## Atualizar dependências
```bash
npm outdated
npm install <pacote>@<versão>   # as versões ficam fixas no package.json
npm run test:all
```
Next.js: leia `node_modules/next/dist/docs/` da versão nova antes (veja `AGENTS.md`); `globalNotFound`
ainda é experimental.

## Registrar uma decisão
Copie o modelo de [decisoes/README.md](../decisoes/README.md), numere em sequência e adicione no índice.
