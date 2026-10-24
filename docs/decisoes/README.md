# Decisões de arquitetura (ADRs)

Cada arquivo registra **uma** decisão: o contexto, o que foi decidido, o que se ganhou e perdeu, e o
que foi descartado. Decisões não são apagadas: quando uma muda, cria-se outra e a antiga fica
marcada como *Substituída*.

| #    | Decisão                                                              | Status     |
| ---- | -------------------------------------------------------------------- | ---------- |
| [0001](0001-site-estatico-nextjs.md) | Site estático com Next.js (`output: "export"`)         | Aceita     |
| [0002](0002-css-portado-sem-tailwind.md) | CSS do design portado, sem Tailwind                | Aceita     |
| [0003](0003-rotas-por-idioma.md) | Uma rota por idioma, dois root layouts e `global-not-found` | Aceita     |
| [0004](0004-regiao-independente-do-idioma.md) | Moeda independente do idioma                  | Aceita     |
| [0005](0005-calculo-funcao-pura.md) | Cálculo do orçamento como função pura com testes        | Aceita     |
| [0006](0006-textos-extraidos-do-design.md) | Textos extraídos do design; `pt.ts` define o formato | Aceita  |
| [0007](0007-estado-com-context.md) | Estado compartilhado com React Context                   | Aceita     |
| [0008](0008-csp-com-hash-por-pagina.md) | CSP: header + `<meta>` com hashes por página        | Aceita     |
| [0009](0009-vercel-estatico-puro.md) | Vercel em modo estático (`framework: null`)            | Aceita     |
| [0010](0010-assets-gerados-por-script.md) | Ícones, OG e imagens gerados por script e versionados | Aceita  |
| [0011](0011-ajustes-intencionais-no-design.md) | Ajustes intencionais em relação ao design    | Aceita     |
| [0012](0012-titulo-google-x-compartilhamento.md) | Título do Google separado do de compartilhamento | Aceita |
| [0013](0013-funcao-turnstile-formspree.md) | E-mail via função + Turnstile + Formspree (substitui o envio direto) | Aceita |
| [0014](0014-turnstile-sob-demanda.md) | Turnstile carregado só ao usar o formulário           | Aceita     |
| [0015](0015-testes-em-quatro-camadas.md) | Testes em quatro camadas + CI                       | Aceita     |
| [0016](0016-css-inline-rejeitado.md) | CSS inline no HTML (rejeitada após medição)             | Rejeitada  |
| [0017](0017-foto-responsiva.md) | Foto em AVIF/WebP responsivo e lazy                          | Aceita     |
| [0018](0018-valores-publicos-no-codigo.md) | Valores públicos no código; variável só para segredo | Aceita |
| [0019](0019-precos-base-em-real.md) | Preços: uma tabela em real, moedas pelo câmbio + 8% | Aceita |

## Modelo

```markdown
# ADR-00XX — Título curto

- **Status:** Proposta | Aceita | Rejeitada | Substituída por ADR-00YY
- **Data:** AAAA-MM-DD

## Contexto
O problema e as restrições (o que estava em jogo).

## Decisão
O que foi decidido, em uma ou poucas frases.

## Consequências
O que melhora, o que piora, o que passa a ser obrigatório.

## Alternativas consideradas
- Opção — por que não.
```
