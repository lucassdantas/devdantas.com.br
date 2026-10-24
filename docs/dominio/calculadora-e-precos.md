# Calculadora e preços

Arquivos: `src/config/pricing.ts` (dados) · `src/lib/calc.ts` (cálculo) · `src/components/CalculatorWidget.tsx` (tela)
· testes em `tests/unit/calc.test.ts` e `tests/components/calculator.test.tsx`.

> Os valores são **ilustrativos** (há aviso com asterisco no total). O preço real sai da proposta.

## Dados

### Por região (`REGIONS`)

Cada região tem moeda, locale de formatação, tipo de nota de pagamento e:

- `prices[serviço] = [base, por pacote]`
- `extras = { seo, copy, cms, integrations }` (valores fixos)

| Região | Moeda | Formato      | Pagamento |
| ------ | ----- | ------------ | --------- |
| BR     | BRL   | `R$ 1.800`   | Pix ou cartão |
| US     | USD   | `$790`       | Wise, PayPal ou cartão |
| EU     | EUR   | `750 €`      | idem |
| UK     | GBP   | `£650`       | idem |
| LATAM  | USD   | `USD 490`    | idem |

### Por serviço (`SERVICES`, igual em todas as regiões)

| Serviço    | Inclusas | Slider (min–max, passo) | Prazo base + por pacote | Extras permitidos |
| ---------- | -------- | ----------------------- | ----------------------- | ----------------- |
| landing    | 5 seções  | 1–15, 1    | 7 + 1      | idiomas, seo, copy, cms, integrações, urgência, suporte |
| site       | 5 páginas | 1–20, 1    | 12 + 1,5   | idem |
| ecommerce  | 30 produtos | 10–500, 10 | 25 + 0,5 | idiomas, seo, copy, integrações, urgência, suporte |
| system     | 3 módulos | 1–15, 1    | 35 + 8     | idiomas, integrações, urgência, suporte |
| design     | 5 telas   | 1–40, 1    | 7 + 1      | copy, urgência |
| consulting | 0 (por hora) | 1–20, 1 | 2 + 0     | — |
| security   | 1 site    | 1–10, 1    | 1 + 0,5    | urgência, suporte |
| care       | 1 site (mensal) | 1–20, 1 | —      | — |

## Fórmula (`calculateQuote`)

```
pacotes      = max(0, unidades − inclusas) / passo
unidades$    = pacotes × preço_por_pacote
subtotal     = base + unidades$
+ idiomas    = (base + unidades$) × 20% × n_idiomas      (só se o serviço permite; máx. 4)
+ extras     = soma dos extras fixos ligados e permitidos
+ urgência   = subtotal × 30%                             (sobre tudo acima)
total        = arredondado de 10 em 10
mensal       = mensalidade do "suporte" se o extra estiver ligado (não entra no total)
prazo        = ⌈(dias_base + pacotes × dias_por_pacote + 2 × n_idiomas) × (urgência ? 0,6 : 1)⌉
```

- **Consultoria** (base 0): cobra todas as horas; não existe linha "Base".
- **Suporte** (`monthly: true`): o total vira "/mês" e o prazo mostra "Início imediato".
- A função é **pura** (mesma entrada → mesma saída), sem React e sem acesso a `window`: dá para
  testar todos os casos rápido — [ADR-0005](../decisoes/0005-calculo-funcao-pura.md).

### Exemplo (BR)

E-commerce, 50 produtos, SEO + urgência:

```
base            5.900
+20 produtos      600   (2 pacotes × 300)
SEO               600
subtotal        7.100
urgência +30%   2.130
total           9.230   prazo ⌈(25 + 2×0,5) × 0,6⌉ = 16 dias úteis
```

## Na tela

- Chips do serviço, slider + botões −/+, idiomas extras (stepper), extras (só os permitidos).
- Resumo: total com contagem animada e pulse, linhas, prazo, nota de pagamento da região,
  botão do WhatsApp com a mensagem pronta, e-mail, aviso de valores fictícios.
- "Simular" nos cards de serviço seleciona o serviço e rola até a calculadora.
- Leitores de tela ouvem só o valor final (região `aria-live` escondida), não cada passo da contagem.

## Diferença em relação ao design

No design, idiomas extras escolhidos antes continuavam somando **dias** mesmo depois de trocar
para um serviço que não aceita idiomas. Corrigido: só contam se o serviço permite
([ADR-0011](../decisoes/0011-ajustes-intencionais-no-design.md)).

## Mudar preços

Só `pricing.ts`. Depois rode `npm test`: os testes conferem alguns valores do Brasil; se você
mudou de propósito, atualize o número esperado em `tests/unit/calc.test.ts`. O teste
`tests/unit/config.test.ts` pega erros como valor inicial fora do passo ou região sem preço.
