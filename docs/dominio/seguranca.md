# Segurança

O site vende segurança, então precisa ser exemplar. Superfície de ataque pequena por desenho:
HTML estático, sem banco, sem login, uma função só.

## Headers (`vercel.json`, todas as rotas)

| Header                       | Valor (resumo)                                                  |
| ---------------------------- | --------------------------------------------------------------- |
| `Content-Security-Policy`    | `default-src 'self'`; scripts do site + `challenges.cloudflare.com`; `connect-src 'self'`; `frame-src` só Cloudflare; `frame-ancestors 'none'`; `object-src 'none'`; `base-uri 'self'`; `upgrade-insecure-requests` |
| `Strict-Transport-Security`  | 2 anos, `includeSubDomains; preload`                            |
| `X-Content-Type-Options`     | `nosniff`                                                       |
| `X-Frame-Options`            | `DENY`                                                          |
| `Referrer-Policy`            | `strict-origin-when-cross-origin`                               |
| `Permissions-Policy`         | câmera, microfone, localização, pagamento, USB… desligados      |
| `Cross-Origin-Opener-Policy` | `same-origin`                                                   |
| `Cross-Origin-Resource-Policy` | `same-origin`                                                 |

## CSP em duas camadas

O Next coloca scripts **inline** em cada página (dados da hidratação), diferentes por página e
por build. Como o `vercel.json` é igual para todas as páginas, o header precisa de
`'unsafe-inline'`. Para compensar:

- `scripts/postbuild.mjs` calcula o **SHA-256 de cada script inline** de cada HTML e grava uma
  `<meta http-equiv="Content-Security-Policy">` com esses hashes, antes de qualquer `<script>`.
- O navegador aplica **as duas políticas**. Resultado: só rodam os scripts gerados no build;
  um script injetado (XSS) é bloqueado.

Limitação conhecida: scanners que leem só o header (ex.: securityheaders.com) ainda apontam o
`'unsafe-inline'` — [ADR-0008](../decisoes/0008-csp-com-hash-por-pagina.md).

## Segredos

- Nenhum segredo no repositório. As variáveis secretas (`FORMSPREE_FORM_ID`, `TURNSTILE_SECRET_KEY`)
  só existem na Vercel e só a função lê.
- O teste `tests/integration/static-site.test.ts` → "nenhum segredo vazou" procura o Formspree e os
  nomes das variáveis no HTML e em todo o JavaScript gerado.
- `.env.local` está no `.gitignore`.

> ⚠️ O ID antigo do Formspree (`cfc67b7`) ficou no histórico do Git. Se o repositório for público,
> crie um formulário novo no Formspree e use só o ID novo na Vercel.

## Formulário

Ver [contato-e-leads.md](contato-e-leads.md#proteções-contra-spam-em-camadas): Turnstile, campo
invisível, limite por IP, validação e tamanho máximo, ID escondido.

## Terceiros

| Serviço     | Quando                         | Dados                      |
| ----------- | ------------------------------ | -------------------------- |
| Cloudflare Turnstile | ao usar o formulário de e-mail | sinais do navegador para o desafio |
| Formspree   | ao enviar (pelo servidor)      | e-mail do visitante + resumo |
| WhatsApp    | ao clicar (link)               | o que o visitante enviar    |

Nenhum script de terceiro é carregado ao abrir a página (sem analytics, sem fontes externas).
Teste: E2E "carrega sem erros, sem violação de CSP e sem terceiros".

## Links externos

Todos com `target="_blank" rel="noopener noreferrer"` (conferido nos testes de integração).

## Checklist depois do deploy

- [securityheaders.com](https://securityheaders.com) e [Mozilla Observatory](https://developer.mozilla.org/en-US/observatory).
- Abrir o site com o console aberto: nenhum aviso de CSP.
- Testar o formulário (um envio).
- Opcional: incluir o domínio na lista de [HSTS preload](https://hstspreload.org) (só depois de ter
  certeza de que todos os subdomínios usam HTTPS).
