# Desenvolvimento

Requisitos: Node.js 20.9+ (o CI usa 24), npm.

```bash
npm install
cp .env.example .env.local   # opcional (veja abaixo)
```

## Comandos

| Comando                    | O que faz                                                             |
| -------------------------- | --------------------------------------------------------------------- |
| `npm run dev`              | Servidor de desenvolvimento em http://localhost:3000 (recarrega ao salvar) |
| `npm run build`            | Gera o site em `out/` + CSP com hashes (`scripts/postbuild.mjs`)      |
| `npm start`                | Serve `out/` como a Vercel faria (headers, URLs limpas, brotli) **e roda a função** `/api/orcamento` — http://localhost:4173 |
| `npm run typecheck`        | Confere os tipos                                                      |
| `npm test`                 | Testes unitários + de componentes (segundos)                          |
| `npm run test:watch`       | Idem, rodando de novo a cada alteração                                |
| `npm run test:integration` | Confere o site construído (precisa de `npm run build` antes)          |
| `npm run test:e2e`         | Navegador de verdade (precisa de `npm run build` antes)               |
| `npm run test:all`         | Tudo, na ordem certa (tipos → testes → build → integração → E2E)      |
| `npm run assets`           | Regenera ícones, imagens OG, WebP/AVIF ([conteudo-e-assets.md](../dominio/conteudo-e-assets.md)) |

## `npm run dev` × `npm start`

- **`dev`**: para mexer em layout e texto. A função `/api/orcamento` **não roda** aqui (o Next em
  modo export não executa a pasta `api/`), então o envio por e-mail mostra erro — normal.
- **`start`** (depois do `build`): o site exatamente como vai para o ar, com a função. Use para
  testar o e-mail de ponta a ponta.

## Variáveis no computador (`.env.local`)

| Variável                         | Sem ela…                                                         |
| -------------------------------- | ---------------------------------------------------------------- |
| `NEXT_PUBLIC_WHATSAPP`           | usa o número de `site.ts`                                        |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | usa a chave de teste da Cloudflare (sempre passa, invisível)     |
| `TURNSTILE_SECRET_KEY`           | o `npm start` usa o segredo de teste da Cloudflare               |
| `FORMSPREE_FORM_ID`              | a função responde `not_configured` — **nenhum e-mail sai**        |

Para testar um envio real no computador: coloque `FORMSPREE_FORM_ID` no `.env.local`, rode
`npm run build && npm start`, abra http://localhost:4173/pt e envie pelo formulário (com as chaves
de teste do Turnstile o desafio passa sozinho).

> Variáveis `NEXT_PUBLIC_*` entram no código **na hora do build**: mudou, rode o build de novo.

## Estrutura e convenções

- Arquitetura: [arquitetura/visao-geral.md](../arquitetura/visao-geral.md).
- Comentários em português, nomes de código em inglês, como no resto do projeto.
- Componente novo: servidor por padrão; `"use client"` só para o pedaço que precisa de interação.
- Não leia `localStorage`/`window` durante o render (só em `useEffect`) — [renderizacao-e-estado.md](../arquitetura/renderizacao-e-estado.md#hidratação-o-html-estático-ganha-vida).
- Textos novos: no `pt.ts` **e** nos outros 4 idiomas.
- O `next dev` cria/atualiza o `AGENTS.md` (regras para assistentes de IA). Ele é versionado.
