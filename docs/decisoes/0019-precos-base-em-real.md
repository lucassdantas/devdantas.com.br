# ADR-0019 — Preços: uma tabela em real, moedas estrangeiras pelo câmbio

- **Status:** Aceita (substitui as tabelas independentes por região do design)
- **Data:** 2026-10-24

## Contexto
O design trazia uma tabela de preços independente por região, e os valores não conversavam entre si:
- a mesma landing page custava **US$ 790** nos EUA e **US$ 490** na América Latina (mesma moeda);
- em real custava R$ 1.800, menos da metade do preço em dólar convertido. Um cliente de fora teria
  motivo para pedir para pagar em real.

## Decisão
- Uma tabela só, **em real** (`PRICES_BRL`, `EXTRAS_BRL` em `src/config/pricing.ts`). O Lucas escolheu
  manter os preços em real e recalcular os outros (alternativas abaixo).
- Dólar, euro e libra = `real ÷ câmbio × 1,08`, arredondados (`fromBRL`).
- Os 8% (`FOREIGN_MARKUP`) cobrem o custo de receber de fora: plataforma e spread (Wise ~1%, PayPal ou
  cartão 4–8%), IOF (zero como exportação de serviço; 0,38% se não for classificado assim) e a
  oscilação do câmbio entre a entrada e a entrega.
- Região "LatAm" removida; espanhol → dólar (região US).
- Câmbio fixo no código (`FX_BRL`, com data), atualizado à mão.

## Consequências
- Coerência por construção: trocar um preço em real atualiza todas as moedas.
- Os preços em moeda estrangeira caíram cerca de 50% em relação ao design (landing: US$ 790 → US$ 380).
- Testes garantem que cada moeda vale o real + a margem e que pagar em real nunca sai mais barato.
- Se o câmbio mudar muito, é preciso atualizar `FX_BRL` (ver `docs/operacao/manutencao.md`).

## Alternativas consideradas
- **Base em dólar** (manter US$ 790): os preços em real mais que dobrariam (landing R$ 3.700).
- **Meio-termo** (landing R$ 2.600 / US$ 560).
- **Câmbio automático (API) no build** — dependência externa no build e preço mudando sozinho;
  descartado por enquanto.
- **Preço regional por poder de compra** (como era o LatAm) — é o que gerou a incoerência.
