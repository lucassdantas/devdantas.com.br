# ADR-0004 — Moeda independente do idioma

- **Status:** Aceita
- **Data:** 2026-10-23

## Contexto
Clientes no Brasil e no exterior; o idioma não determina onde a pessoa está nem a moeda em que quer pagar.

## Decisão
O idioma define só a moeda **padrão** (`pt→BR, en→US, es→LATAM, fr/de→EU`); o visitante troca no
seletor e a escolha fica no `localStorage` (`ds-region`). Trocar o idioma volta para a moeda padrão
do novo idioma (comportamento do design).

## Consequências
- O HTML estático sai com a moeda padrão; a escolha salva aparece logo após a hidratação.
- Tabela de preços própria por região em `pricing.ts` (não é conversão de câmbio).

## Alternativas consideradas
- **Moeda pela geolocalização (IP)** — exige servidor a cada requisição; erra com VPN e viajantes.
- **Conversão automática por câmbio** — preço "quebrado" e variável; o design usa tabelas próprias.
